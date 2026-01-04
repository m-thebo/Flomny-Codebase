"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { editUser } from "@/services/authService"
import { Camera } from "lucide-react"

interface ProfileSettingsProps {
  user: any
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    password: false,
  })

  const [formData, setFormData] = useState({
    name: user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "",
    email: user?.email || "",
    password: "••••••••••",
    role: user?.role || "Business Owner",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (field: string) => {
    try {
      if (field === "name") {
        const [firstname, ...lastnameParts] = formData.name.split(" ")
        const lastname = lastnameParts.join(" ")
        await editUser({ firstname, lastname, email: formData.email })
      } else if (field === "email") {
        await editUser({ firstname: user.firstname, lastname: user.lastname, email: formData.email })
      } else if (field === "password") {
        // Handle password update
      }

      setIsEditing((prev) => ({ ...prev, [field]: false }))
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Picture */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-[#E9EEFF] border-2 border-[#001e80] flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-4xl font-bold text-[#001e80]">
                {user?.firstname?.charAt(0) || ""}
                {user?.lastname?.charAt(0) || ""}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-[#001e80] text-white p-2 rounded-full shadow-md hover:bg-[#001e80]/90 transition-colors">
            <Camera className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        {/* User Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            User name
          </label>
          <div className="flex gap-4">
            {isEditing.name ? (
              <>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 h-12 text-base"
                />
                <Button
                  onClick={() => handleSave("name")}
                  className="bg-[#001e80] hover:bg-[#001e80]/90 text-white px-6 h-12 text-base"
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Input id="name" value={formData.name} disabled className="flex-1 bg-gray-50 h-12 text-base" />
                <Button
                  variant="outline"
                  onClick={() => setIsEditing((prev) => ({ ...prev, name: true }))}
                  className="border-[#001e80] text-[#001e80] hover:bg-[#E9EEFF] hover:text-[#001e80] px-6 h-12 text-base"
                >
                  Change
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <div className="flex gap-4">
            {isEditing.email ? (
              <>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 h-12 text-base"
                />
                <Button
                  onClick={() => handleSave("email")}
                  className="bg-[#001e80] hover:bg-[#001e80]/90 text-white px-6 h-12 text-base"
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Input id="email" value={formData.email} disabled className="flex-1 bg-gray-50 h-12 text-base" />
                <Button
                  variant="outline"
                  onClick={() => setIsEditing((prev) => ({ ...prev, email: true }))}
                  className="border-[#001e80] text-[#001e80] hover:bg-[#E9EEFF] hover:text-[#001e80] px-6 h-12 text-base"
                >
                  Change
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="flex gap-4">
            {isEditing.password ? (
              <>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 h-12 text-base"
                />
                <Button
                  onClick={() => handleSave("password")}
                  className="bg-[#001e80] hover:bg-[#001e80]/90 text-white px-6 h-12 text-base"
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  disabled
                  className="flex-1 bg-gray-50 h-12 text-base"
                />
                <Button
                  variant="outline"
                  onClick={() => setIsEditing((prev) => ({ ...prev, password: true }))}
                  className="border-[#001e80] text-[#001e80] hover:bg-[#E9EEFF] hover:text-[#001e80] px-6 h-12 text-base"
                >
                  Change
                </Button>
              </>
            )}
          </div>
        </div>

        
      </div>
    </div>
  )
}

