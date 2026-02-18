import { Client } from '@hubspot/api-client'

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI

export function getHubSpotOAuthUrl(state?: string): string {
  if (!HUBSPOT_CLIENT_ID || !HUBSPOT_REDIRECT_URI) {
    throw new Error('HubSpot OAuth not configured. Missing HUBSPOT_CLIENT_ID or HUBSPOT_REDIRECT_URI')
  }

  const params = new URLSearchParams({
    client_id: HUBSPOT_CLIENT_ID,
    redirect_uri: HUBSPOT_REDIRECT_URI,
    scope: 'crm.objects.deals.read crm.objects.deals.write crm.objects.contacts.read crm.objects.contacts.write',
  })

  if (state) {
    params.append('state', state)
  }

  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  if (!HUBSPOT_CLIENT_ID || !HUBSPOT_CLIENT_SECRET || !HUBSPOT_REDIRECT_URI) {
    throw new Error('HubSpot OAuth not configured')
  }

  const client = new Client()

  const tokenResponse = await client.oauth.tokensApi.create(
    'authorization_code',
    code,
    HUBSPOT_REDIRECT_URI,
    HUBSPOT_CLIENT_ID,
    HUBSPOT_CLIENT_SECRET
  )

  return {
    accessToken: tokenResponse.accessToken!,
    refreshToken: tokenResponse.refreshToken!,
    expiresIn: tokenResponse.expiresIn || 21600, // Default 6 hours
  }
}
