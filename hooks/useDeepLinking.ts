import { supabase } from "@/utils/supabase"
import * as QueryParams from "expo-auth-session/build/QueryParams"
import * as Linking from "expo-linking"
import { useEffect, useRef } from "react"
import { toast } from "sonner-native"

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url)

  if (errorCode) {
    console.error("Deep link error", errorCode)
    throw new Error(errorCode)
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code)
    if (error) {
      console.error("PKCE exchange error", error)
      throw error
    }
    return data.session
  }

  const access_token = params.access_token
  const refresh_token = params.refresh_token

  if (!access_token || !refresh_token) {
    return
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
    } catch (error) {
      handledRef.current.delete(incoming)
      console.log("Error creating session from URL:", error)
      toast.error("Failed to sign in. Please try again")
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