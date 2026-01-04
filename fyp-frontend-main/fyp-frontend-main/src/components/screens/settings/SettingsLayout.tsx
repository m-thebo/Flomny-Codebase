"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import Logo from "@/assets/logosaas.png"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SettingsSidebar from "./SettingsSidebar"
import ProfileSettings from "./ProfileSettings"
import BillingSettings from "./BillingSettings"
import SecuritySettings from "./SecuritySettings"

export default function SettingsLayout() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings user={user} />
      case "billing":
        return <BillingSettings />
      case "security":
        return <SecuritySettings />
      default:
        return <ProfileSettings user={user} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#D2DCFF]">
      {/* Adjusted Header */}
      <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b border-gray-200 z-20 transition-all duration-300">
        <div className="container py-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-4 text-[#001e80]">
              <ArrowLeft className="h-5 w-5" />
              <Image
                src={Logo || "/placeholder.svg"}
                alt="Saas Logo"
                height={32}
                width={32}
                className="cursor-pointer"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container pb-20 py-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden pb-20 ">
          <div className="flex flex-col md:flex-row">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 p-6 md:p-8">{renderContent()}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#BCBCBC] text-sm py-6 text-center mt-auto">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
            <Image src={Logo || "/placeholder.svg"} height={30} width={30} alt="SaaS logo" className="relative" />
          </div>
          <p className="mt-4">&copy; 2024 Flomny.com, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

