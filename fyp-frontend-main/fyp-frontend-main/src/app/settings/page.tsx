"use client"

import SettingsLayout from "@/components/screens/settings/SettingsLayout"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>

  return <SettingsLayout />
}

