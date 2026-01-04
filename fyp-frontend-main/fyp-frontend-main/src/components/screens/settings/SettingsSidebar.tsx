"use client"

import { User, CreditCard, Shield } from "lucide-react"

interface SettingsSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  const menuItems = [
    { id: "profile", label: "My profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
<div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 min-h-80">
<div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-colors duration-200 ${
              activeTab === item.id ? "bg-indigo-100 text-indigo-800 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

