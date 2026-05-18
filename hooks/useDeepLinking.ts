import { supabase } from "@/utils/supabase"
import type { Session } from "@supabase/supabase-js"
import * as QueryParams from "expo-auth-session/build/QueryParams"
import * as Linking from "expo-linking"
import { router } from "expo-router"
import { useEffect, useRef } from "react"
import { toast } from "sonner-native"

/** Merge expo-auth-session parsing with manual fallback (Hermes / exp:// edge cases). */
function collectAuthParams(url: string): { params: Record<string, string>; errorCode: string | null } {
  let errorCode: string | null = null
  let params: Record<string, string> = {}

  try {
    const parsed = QueryParams.getQueryParams(url)
    errorCode = parsed.errorCode
    Object.assign(params, parsed.params)
  } catch (e) {
    if (__DEV__) console.warn("[deeplink] QueryParams failed, using fallback", e)
  }

  const ingestSearchParams = (raw: string) => {
    const trimmed = raw.startsWith("?") || raw.startsWith("#") ? raw.slice(1) : raw
    if (!trimmed) return
    try {
      new URLSearchParams(trimmed).forEach((value, key) => {
        if (value && params[key] === undefined) params[key] = value
      })
    } catch {
      /* ignore */
    }
  }

  const hashIdx = url.indexOf("#")
  const qIdx = url.indexOf("?")
  if (qIdx >= 0) {
    const end = hashIdx > qIdx ? hashIdx : url.length
    ingestSearchParams(url.slice(qIdx, end))
  }
  if (hashIdx >= 0) {
    ingestSearchParams(url.slice(hashIdx))
  }

  const codeMatch = url.match(/(?:^|[?&#])code=([^&#]+)/)
  if (codeMatch?.[1] && !params.code) {
    try {
      params.code = decodeURIComponent(codeMatch[1])
    } catch {
      params.code = codeMatch[1]
    }
  }

  return { params, errorCode }
}

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = collectAuthParams(url)

  if (__DEV__) {
    console.log("[deeplink] url", url)
    console.log("[deeplink] keys", Object.keys(params))
  }

  if (errorCode) {
    console.error("Deep link error", errorCode)
    throw new Error(errorCode)
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code)
    if (error) {
      console.error("PKCE exchange error", error)
      const msg = String((error as { message?: string }).message ?? error)
      if (msg.includes("code verifier") || (error as { name?: string }).name === "AuthPKCECodeVerifierMissingError") {
        toast.error(
          "Sign-in could not finish: this device is missing the PKCE verifier. Send a new magic link from this device on the same network, and do not clear app data."
        )
      }
      throw error
    }
    let session: Session | null = data.session ?? null
    if (!session) {
      const { data: refreshed } = await supabase.auth.getSession()
      session = refreshed.session ?? null
    }
    return session
  }

  const access_token = params.access_token
  const refresh_token = params.refresh_token

  if (!access_token || !refresh_token) {
    if (__DEV__ && (url.includes("code=") || url.includes("type=magiclink"))) {
      console.warn("[deeplink] expected auth params but got none", url)
    }
    return null
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })

  if (error) {
    console.error("Session error", error)
    throw error
  }

  return data.session
}

export const useDeepLinking = () => {
  const handledRef = useRef(new Set<string>())

  const processUrl = async (incoming: string | null) => {
    if (!incoming) return
    if (handledRef.current.has(incoming)) return
    handledRef.current.add(incoming)
    try {
      const session = await createSessionFromUrl(incoming)
      if (!session) {
        handledRef.current.delete(incoming)
        return
      }
      console.log("Session created from deep link")
      toast.success("Signed in")
      // Defer one tick so AuthProvider's onAuthStateChange can update before navigating.
      queueMicrotask(() => {
        router.replace("/(tabs)/lessons")
      })
    } catch (error) {
      handledRef.current.delete(incoming)
      console.log("Error creating session from URL:", error)
      const name = (error as { name?: string }).name
      const msg = String((error as { message?: string }).message ?? error)
      const alreadyHandledVerifier =
        name === "AuthPKCECodeVerifierMissingError" || msg.toLowerCase().includes("code verifier")
      if (!alreadyHandledVerifier) {
        toast.error("Sign-in failed. Please try again.")
      }
    }
  }

  useEffect(() => {
    void Linking.getInitialURL().then(processUrl)
    const sub = Linking.addEventListener("url", (e) => {
      void processUrl(e.url)
    })
    return () => sub.remove()
  }, [])
}
