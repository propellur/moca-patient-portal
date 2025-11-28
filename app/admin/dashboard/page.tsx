"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Admin Dashboard Component
 * 
 * Phase 2: Admin order management dashboard as specified in plan.txt
 * 
 * Features implemented:
 * - Load orders from localStorage "allOrders"
 * - Display orders in table format with required columns
 * - Order status management buttons
 * - Simple clean layout, no complex filtering
 * 
 * Table Columns (as per plan.txt):
 * - Order ID
 * - Patient Email  
 * - Date Created
 * - Total Amount
 * - Status (awaiting_payment/processing/shipped)
 * - Actions (buttons)
 * 
 * Design decisions:
 * - Responsive table layout
 * - Status badges with color coding
 * - Action buttons based on current status
 * - Auth guard for admin access
 * - Clean admin interface
 * 
 * Phase 3 will add the actual status update functionality
 */

interface OrderItem {
  prescription: {
    id: string
    name: string
    strength: string
    quantity: number
    price: number
    interval: string
  }
  quantitySelected: number
}

interface Order {
  id: string
  patientEmail: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  status: string // "awaiting_payment"|"processing"|"shipped"
  createdAt: string
  paymentMethod: string
  trackingNumber: string | null
}

export default function AdminDashboardPage() {
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const router = useRouter()

  /**
   * Check admin authentication and load orders on mount
   */
  useEffect(() => {
    // Check admin authentication as specified in plan.txt
    const adminAuth = localStorage.getItem("isAdminAuthenticated")
    if (adminAuth !== "true") {
      router.push("/admin/login")
      return
    }
    
    setIsAuthenticated(true)
    loadOrders()
  }, [router])

  /**
   * Load all orders from localStorage "allOrders" as specified in plan.txt
   */
  const loadOrders = () => {
    try {
      const allOrders = localStorage.getItem("allOrders")
      if (allOrders) {
        const parsedOrders = JSON.parse(allOrders) as Order[]
        // Sort orders by creation date (newest first)
        const sortedOrders = parsedOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sortedOrders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      setOrders([])
    }
    setIsLoading(false)
  }

  /**
   * Handle admin logout
   */
  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated")
    localStorage.removeItem("adminEmail")
    router.push("/admin/login")
  }

  /**
   * Get status badge styling based on order status
   */
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium"
    
    switch (status) {
      case "awaiting_payment":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "processing":
        return `${baseClasses} bg-blue-100 text-blue-800`
      case "shipped":
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  /**
   * Format status text for display
   */
  const formatStatus = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return "Awaiting Payment"
      case "processing":
        return "Processing"
      case "shipped":
        return "Shipped"
      default:
        return status
    }
  }

  /**
   * Phase 3: Order Status Management Functions
   * 
   * Updates order status and persists changes to localStorage "allOrders"
   * Generates tracking numbers when marking orders as shipped
   */

  /**
   * Generate tracking number in format ST12345678 (as per plan.txt)
   */
  const generateTrackingNumber = (): string => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000)
    return `ST${randomDigits}`
  }

  /**
   * Update order status to "processing"
   * Status flow: awaiting_payment → processing
   */
  const markAsProcessing = (orderId: string) => {
    try {
      const allOrders = localStorage.getItem("allOrders")
      if (!allOrders) return

      const orders = JSON.parse(allOrders) as Order[]
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: "processing"
          }
        }
        return order
      })

      // Save updated orders back to localStorage
      localStorage.setItem("allOrders", JSON.stringify(updatedOrders))
      
      // Refresh the orders display
      setOrders(updatedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))

      alert(`Order ${orderId} marked as processing`)
      
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error updating order status")
    }
  }

  /**
   * Update order status to "shipped" and generate tracking number
   * Status flow: processing → shipped + auto-generate tracking
   */
  const markAsShipped = (orderId: string) => {
    try {
      const allOrders = localStorage.getItem("allOrders")
      if (!allOrders) return

      const orders = JSON.parse(allOrders) as Order[]
      const trackingNumber = generateTrackingNumber()
      
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: "shipped",
            trackingNumber: trackingNumber
          }
        }
        return order
      })

      // Save updated orders back to localStorage
      localStorage.setItem("allOrders", JSON.stringify(updatedOrders))
      
      // Refresh the orders display
      setOrders(updatedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))

      alert(`Order ${orderId} marked as shipped with tracking number: ${trackingNumber}`)
      
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error updating order status")
    }
  }

  /**
   * Get available actions based on order status
   */
  const getOrderActions = (order: Order) => {
    switch (order.status) {
      case "awaiting_payment":
        return (
          <Button 
            size="sm" 
            onClick={() => markAsProcessing(order.id)}
            className="mr-2"
          >
            Mark as Processing
          </Button>
        )
      case "processing":
        return (
          <Button 
            size="sm" 
            onClick={() => markAsShipped(order.id)}
            className="mr-2"
          >
            Mark as Shipped
          </Button>
        )
      case "shipped":
        return (
          <span className="text-sm text-gray-500">
            {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Shipped"}
          </span>
        )
      default:
        return null
    }
  }

  // Show loading while checking auth
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage patient orders and pharmacy operations</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Orders</CardTitle>
            <CardDescription>
              All orders from patients requiring pharmacy processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Orders will appear here when patients complete their purchases
                </p>
              </div>
            ) : (
              /* Orders Table - Responsive Design */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium">Patient Email</th>
                      <th className="text-left py-3 px-4 font-medium">Date Created</th>
                      <th className="text-left py-3 px-4 font-medium">Total Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        {/* Order ID */}
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm">{order.id}</span>
                        </td>
                        
                        {/* Patient Email */}
                        <td className="py-4 px-4">
                          <span className="text-sm">{order.patientEmail}</span>
                        </td>
                        
                        {/* Date Created */}
                        <td className="py-4 px-4">
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        
                        {/* Total Amount */}
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                        </td>
                        
                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={getStatusBadge(order.status)}>
                            {formatStatus(order.status)}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="py-4 px-4">
                          {getOrderActions(order)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phase Development Notice */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800">
              <strong>Phase 3 Complete:</strong> Order status management is now functional. 
              Admin can mark orders as "processing" or "shipped" with auto-generated tracking numbers.
              Phase 4 will add patient order history to their dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}