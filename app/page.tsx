"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Home Page Component
 * 
 * This is the landing page for MOCA Patient Portal.
 * For Phase 1A, it simply redirects users to the appropriate page:
 * - If authenticated: redirect to dashboard
 * - If not authenticated: redirect to login
 * 
 * Design decision: 
 * - Keep it simple for MVP - no marketing page needed yet
 * - Auto-redirect provides seamless user experience
 * - In Phase 2, we might add a proper landing page with portal info
 */
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check authentication status from localStorage (Phase 1A approach)
    // In Phase 1B, this will be replaced with proper auth token validation
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    
    if (isAuthenticated) {
      // User is logged in - redirect to dashboard
      router.push("/dashboard")
    } else {
      // User not logged in - redirect to login
      router.push("/login")
    }
  }, [router])

  // Show loading state while redirect is happening
  // This prevents flash of content before redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">MOCA Patient Portal</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
