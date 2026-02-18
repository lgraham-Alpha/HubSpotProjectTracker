import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHubSpotDeal, getHubSpotContact, updateHubSpotDeal, updateHubSpotContact } from '@/lib/hubspot/client'
import { generateSecureToken } from '@/lib/utils/token'
import { logActivity } from '@/lib/utils/activity'

/**
 * HubSpot Custom Workflow Action endpoint
 * This endpoint is called by HubSpot workflows when triggered
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // HubSpot workflow actions send data in a specific format
    // Extract deal/contact info from the request
    const dealId = body.dealId || body.objectId
    const contactId = body.contactId
    const customerEmail = body.customerEmail || body.email

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'customerEmail is required' },
        { status: 400 }
      )
    }

    // Fetch deal data from HubSpot
    let dealData: any = null
    let contactData: any = null

    if (dealId) {
      dealData = await getHubSpotDeal(dealId)
    }

    if (contactId) {
      contactData = await getHubSpotContact(contactId)
      if (contactData?.properties?.email && !customerEmail) {
        body.customerEmail = contactData.properties.email
      }
    }

    const projectName = body.projectName || dealData?.properties?.dealname || `Project for ${customerEmail}`

    // Create project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: body.description || null,
        customerEmail: body.customerEmail,
        status: 'NOT_STARTED',
        hubspotDealId: dealId || null,
        hubspotContactId: contactId || null,
      },
    })

    // Generate tracking token
    const token = generateSecureToken()
    const projectToken = await prisma.projectToken.create({
      data: {
        token,
        projectId: project.id,
        customerEmail: body.customerEmail,
        isActive: true,
      },
    })

    // Build tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const trackingUrl = `${baseUrl}/track/${token}`

    // Update HubSpot deal
    if (dealId) {
      try {
        await updateHubSpotDeal(dealId, {
          project_id: project.id,
          project_status: project.status,
        })
      } catch (error) {
        console.error('Failed to update HubSpot deal:', error)
      }
    }

    // Update HubSpot contact
    if (contactId) {
      try {
        await updateHubSpotContact(contactId, {
          project_tracking_link: trackingUrl,
        })
      } catch (error) {
        console.error('Failed to update HubSpot contact:', error)
      }
    }

    // Log activity
    await logActivity(
      project.id,
      'project_created',
      `Project "${project.name}" was created from HubSpot workflow${dealId ? ` (Deal: ${dealId})` : ''}`
    )

    // Return response in HubSpot workflow action format
    return NextResponse.json({
      projectId: project.id,
      trackingLink: trackingUrl,
      success: true,
    })
  } catch (error: any) {
    console.error('Error in HubSpot workflow action:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    )
  }
}
