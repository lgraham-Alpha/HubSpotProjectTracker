import { Client } from '@hubspot/api-client'

let hubspotClient: Client | null = null

export function getHubSpotClient(accessToken?: string): Client {
  if (accessToken) {
    return new Client({ accessToken })
  }

  // For server-side: Private App token (HubSpot expects accessToken, not apiKey)
  const token = process.env.HUBSPOT_DEVELOPER_API_KEY
  if (token) {
    return new Client({ accessToken: token })
  }

  throw new Error('HubSpot client not configured. Need either accessToken or HUBSPOT_DEVELOPER_API_KEY')
}

export async function getHubSpotDeal(dealId: string, accessToken?: string) {
  const client = getHubSpotClient(accessToken)
  try {
    const deal = await client.crm.deals.basicApi.getById(dealId, [
      'dealname',
      'dealstage',
      'amount',
      'closedate',
      'hubspot_owner_id',
      'project_id',
      'project_status',
    ])
    return deal
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

export async function getHubSpotContact(contactId: string, accessToken?: string) {
  const client = getHubSpotClient(accessToken)
  try {
    const contact = await client.crm.contacts.basicApi.getById(contactId, [
      'email',
      'firstname',
      'lastname',
      'project_tracking_link',
    ])
    return contact
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

export async function updateHubSpotDeal(
  dealId: string,
  properties: Record<string, string>,
  accessToken?: string
) {
  const client = getHubSpotClient(accessToken)
  return await client.crm.deals.basicApi.update(dealId, { properties })
}

export async function updateHubSpotContact(
  contactId: string,
  properties: Record<string, string>,
  accessToken?: string
) {
  const client = getHubSpotClient(accessToken)
  return await client.crm.contacts.basicApi.update(contactId, { properties })
}
