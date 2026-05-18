import { makeRedirectUri } from 'expo-auth-session'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as Linking from 'expo-linking'

const LAN_IP_PATTERN = /\b\d{1,3}(?:\.\d{1,3}){3}\b/

/** Redirect for Supabase magic link / OAuth (PKCE). Must be allowlisted in Supabase Auth URL settings. */
export function getAuthRedirectUri(): string {
  const override = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI
  if (override) return override

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return Linking.createURL('/')
  }

  return makeRedirectUri({
    scheme: 'lingos',
    path: '/',
    preferLocalhost: false,
  })
}

/** Supabase Auth rejects many exp:// URLs that contain a LAN IP; the email then uses Site URL instead. */
export function warnIfSupabaseMayRejectRedirect(redirectUri: string): void {
  if (!__DEV__ || !LAN_IP_PATTERN.test(redirectUri)) return

  console.warn(
    '[auth] This redirect contains a LAN IP. Supabase often ignores it and uses Site URL (lingos://) in the email.\n' +
      'Fix: run  npx expo start --go --tunnel  then resend the magic link.\n' +
      'Add the new [auth] redirect URL to Supabase → Redirect URLs (and remove stale exp://192.168.* entries).\n' +
      `Current: ${redirectUri}`
  )
}
