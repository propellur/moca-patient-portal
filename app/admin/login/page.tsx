"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

/**
 * Admin Login Page Component
 * 
 * Phase 1: Simple admin login form as specified in plan.txt
 * 
 * Features implemented:
 * - Mock credentials: admin@moca.com / password123
 * - localStorage-based auth check  
 * - No role-based access (single admin only)
 * - Redirect to admin dashboard on success
 * 
 * Design decisions:
 * - Simple email/password form (no 2FA for Phase 1A)
 * - Hardcoded credentials for testing
 * - localStorage auth state management
 * - Clean UI consistent with patient login
 * - Form validation and loading states
 * 
 * Phase 1B will replace with:
 * - Real admin authentication
 * - Database user management  
 * - Proper session handling
 * - 2FA as mentioned in user stories
 */
export default function AdminLoginPage() {
  // Form state management
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()

  /**
   * Mock admin credentials as specified in plan.txt
   * In Phase 1B, this will be replaced with real authentication
   */
  const ADMIN_CREDENTIALS = {
    email: "admin@moca.com",
    password: "password123"
  }

  /**
   * Handle admin login form submission
   * 
   * Validates against hardcoded credentials and sets auth state
   * Redirects to admin dashboard on success
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Validate credentials against mock data
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Set admin authentication state in localStorage
      // Using separate key from patient auth as specified in plan.txt
      localStorage.setItem("isAdminAuthenticated", "true")
      localStorage.setItem("adminEmail", email)
      
      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } else {
      // Show error for invalid credentials
      setError("Invalid email or password")
    }
    
    setIsLoading(false)
  }

  /**
   * Navigate back to main patient portal
   */
  const goToPatientPortal = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>MOCA Admin Portal</CardTitle>
          <CardDescription>
            Admin login to manage patient orders and pharmacy operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@moca.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Back to Patient Portal */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={goToPatientPortal}
              disabled={isLoading}
            >
              Back to Patient Portal
            </Button>
          </form>

          {/* Development Helper */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800">
              <strong>Phase 1A Test Credentials:</strong><br />
              Email: admin@moca.com<br />
              Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}