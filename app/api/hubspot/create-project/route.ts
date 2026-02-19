import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHubSpotDeal, getHubSpotContact, updateHubSpotDeal, updateHubSpotContact } from '@/lib/hubspot/client'
import { generateSecureToken } from '@/lib/utils/token'
import { logActivity } from '@/lib/utils/activity'

interface CreateProjectRequest {
  dealId?: string
  contactId?: string
  customerEmail: string
  projectName: string
  description?: string
  accessToken?: string // Optional OAuth token, falls back to API key
}

export async function POST(request: Request) {
  try {
    const body: CreateProjectRequest = await request.json()
    const { dealId, contactId, customerEmail, projectName, description, accessToken } = body

    if (!customerEmail || !projectName) {
      return NextResponse.json(
        { error: 'customerEmail and projectName are required' },
        { status: 400 }
      )
    }

    // Fetch deal/contact data from HubSpot if IDs provided
    let dealData: any = null
    let contactData: any = null

    if (dealId) {
      dealData = await getHubSpotDeal(dealId, accessToken)
      if (!dealData) {
        return NextResponse.json(
          { error: 'Deal not found in HubSpot' },
          { status: 404 }
        )
      }
    }

    if (contactId) {
      contactData = await getHubSpotContact(contactId, accessToken)
      if (!contactData) {
        return NextResponse.json(
          { error: 'Contact not found in HubSpot' },
          { status: 404 }
        )
      }
      // Use email from contact if not provided
      if (!customerEmail && contactData.properties?.email) {
        body.customerEmail = contactData.properties.email
      }
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: description || dealData?.properties?.dealname || null,
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

    // Build tracking URL (use request origin when env not set, e.g. in production)
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    if (!baseUrl) {
      try {
        baseUrl = new URL(request.url).origin
      } catch {
        baseUrl = 'http://localhost:3000'
      }
    }
    const trackingUrl = `${baseUrl}/track/${token}`

    // Update HubSpot deal with project ID and status
    if (dealId && dealData) {
      try {
        await updateHubSpotDeal(
          dealId,
          {
            project_id: project.id,
            project_status: project.status,
          },
          accessToken
        )
      } catch (error) {
        console.error('Failed to update HubSpot deal:', error)
        // Don't fail the request if HubSpot update fails
      }
    }

    // Update HubSpot contact with tracking link
    if (contactId && contactData) {
      try {
        await updateHubSpotContact(
          contactId,
          {
            project_tracking_link: trackingUrl,
          },
          accessToken
        )
      } catch (error) {
        console.error('Failed to update HubSpot contact:', error)
        // Don't fail the request if HubSpot update fails
      }
    }

    // Log activity
    await logActivity(
      project.id,
      'project_created',
      `Project "${project.name}" was created from HubSpot${dealId ? ` (Deal: ${dealId})` : ''}`
    )

    return NextResponse.json(
      {
        project: {
          ...project,
          startDate: project.startDate?.toISOString() || null,
          endDate: project.endDate?.toISOString() || null,
          expectedCompletionDate: project.expectedCompletionDate?.toISOString() || null,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
        token: projectToken.token,
        trackingUrl,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating project from HubSpot:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    )
  }
}
