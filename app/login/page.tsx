"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

/**
 * LoginPage Component
 * 
 * This component implements the Phase 1A mock authentication flow:
 * 1. User enters email
 * 2. System "sends" OTP (mocked - just shows alert)
 * 3. User enters OTP (hardcoded as 123456 for testing)
 * 4. System verifies and redirects to dashboard
 * 
 * Design decisions:
 * - Two-step process using state management (email → OTP)
 * - Client-side localStorage for auth state (will replace with proper auth later)
 * - Hardcoded OTP for Phase 1A testing
 * - Loading states for better UX
 * - Form validation using HTML5 attributes
 */
export default function LoginPage() {
  // State management for the two-step auth process
  const [email, setEmail] = useState("") // User's email address
  const [otp, setOtp] = useState("")     // One-time password entered by user
  const [step, setStep] = useState<"email" | "otp">("email") // Current step in auth flow
  const [isLoading, setIsLoading] = useState(false) // Loading state for form submissions
  
  // Next.js router for navigation after successful auth
  const router = useRouter()

  /**
   * Handle email submission (Step 1)
   * In Phase 1A: Mock sending OTP via alert
   * In Phase 1B: Will integrate with real email service
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission
    setIsLoading(true)  // Show loading state
    
    // Mock API call delay (simulates real email sending)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Move to OTP step
    setStep("otp")
    setIsLoading(false)
    
    // Mock notification (replace with real email in Phase 1B)
    alert("OTP sent to your email! Use code: 123456")
  }

  /**
   * Handle OTP verification (Step 2)
   * In Phase 1A: Hardcoded OTP check
   * In Phase 1B: Will verify against backend
   */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock verification delay (simulates API call)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Hardcoded OTP verification for Phase 1A
    if (otp === "123456") {
      // Store authentication state in localStorage
      // NOTE: This is temporary for Phase 1A. In Phase 1B we'll use:
      // - JWT tokens
      // - HTTP-only cookies
      // - Proper session management
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", email)
      
      // Redirect to dashboard
      router.push("/dashboard")
    } else {
      alert("Invalid OTP")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Main login card - using shadcn Card component for consistent styling */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>MOCA Patient Portal</CardTitle>
          <CardDescription>
            {/* Dynamic description based on current step */}
            {step === "email" ? "Enter your email to receive an OTP" : "Enter the OTP sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Conditional rendering based on current step */}
          {step === "email" ? (
            // STEP 1: Email input form
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"           // HTML5 email validation
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required              // HTML5 required validation
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {/* Dynamic button text based on loading state */}
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            // STEP 2: OTP verification form
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}         // Limit to 6 characters
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
              {/* Back button to return to email step */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setStep("email")}
              >
                Back to Email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}