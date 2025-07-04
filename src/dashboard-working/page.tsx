"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const { isSignedIn, userId, isLoaded } = useAuth()
  const [timeOfDay, setTimeOfDay] = useState("")
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in")
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) setTimeOfDay("morning")
    else if (hours < 17) setTimeOfDay("afternoon")
    else setTimeOfDay("evening")
  }, [])

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      </div>
      
      <div className="relative z-10">
        <div className="bg-gray-900/30 backdrop-blur-2xl border-b border-gray-800/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-white">
                  Good {timeOfDay}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link 
              href="/design/advanced"
              className="group bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-xl rounded-xl border border-purple-600/30 p-6 hover:border-purple-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Create New Design</h3>
                  <p className="text-sm text-gray-400">Start a lighting project</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/vertical-farming-suite"
              className="group bg-gradient-to-r from-emerald-600/20 to-teal-700/20 backdrop-blur-xl rounded-xl border border-emerald-600/30 p-6 hover:border-emerald-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Vertical Farming</h3>
                  <p className="text-sm text-gray-400">Design & optimize</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/cultivation"
              className="group bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-xl rounded-xl border border-green-600/30 p-6 hover:border-green-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Cultivation Hub</h3>
                  <p className="text-sm text-gray-400">Monitor & control</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/analytics"
              className="group bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-xl rounded-xl border border-blue-600/30 p-6 hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">View Analytics</h3>
                  <p className="text-sm text-gray-400">Performance insights</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}