"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Order Success Page Component
 * 
 * This page shows after successful payment and provides:
 * 1. Order confirmation with order ID
 * 2. Summary of purchased items
 * 3. Next steps information
 * 4. Link to track order status
 * 
 * Design decisions:
 * - Order data from localStorage (Phase 1A)
 * - Mock order statuses and tracking
 * - Simple success message with clear next steps
 * - Link back to dashboard for continued shopping
 * 
 * Phase 1B enhancements:
 * - Email confirmation sent
 * - Real order tracking integration
 * - Letter of Attestation download prompt
 * - SMS notifications setup
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
  status: string
  createdAt: string
  paymentMethod: string
  shippingAddress: string
  trackingNumber: string | null
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /**
   * Load order data on component mount
   * In Phase 1B, this will come from URL params or API call
   */
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load order data from localStorage
    const currentOrder = localStorage.getItem("currentOrder")
    if (currentOrder) {
      try {
        const parsedOrder = JSON.parse(currentOrder) as Order
        setOrder(parsedOrder)
        
        // Keep order data available for page refreshes
      } catch (error) {
        console.error("Error parsing order data:", error)
        router.push("/dashboard")
      }
    } else {
      // No order data found, redirect to dashboard
      router.push("/dashboard")
    }
    
    setIsLoading(false)
  }, [router])

  /**
   * Navigate to dashboard for more shopping
   */
  const continueShopping = () => {
    router.push("/dashboard")
  }

  /**
   * Mock function to view order status
   * In Phase 1B, this will navigate to order tracking page
   */
  const viewOrderStatus = () => {
    // For Phase 1A, just show an alert with order status
    alert(`Order Status: Processing\n\nYour order ${order?.id} is being prepared by our pharmacy team. You will receive an email with tracking information once it ships.`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p>Order not found. Please try placing your order again.</p>
            <Button onClick={continueShopping} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your medication order has been successfully placed
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Order ID: <span className="font-mono font-medium">{order.id}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Ordered Items */}
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.prescription.name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.prescription.strength} • Quantity: {item.quantitySelected}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.prescription.interval}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.prescription.price * item.quantitySelected).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Totals */}
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${order.shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <span>Total Paid:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
                <CardDescription>Your order processing timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-600">Order Received</h4>
                      <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-600">Processing</h4>
                      <p className="text-sm text-gray-600">Our pharmacy team is preparing your medication</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-600">Shipped</h4>
                      <p className="text-sm text-gray-600">You'll receive tracking information via email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-600">Delivered</h4>
                      <p className="text-sm text-gray-600">Your medication will be delivered to your address</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>
                    📧 <strong>Email Confirmation:</strong> A detailed order confirmation has been sent to {order.patientEmail}
                  </p>
                  <p>
                    📄 <strong>Letter of Attestation:</strong> Your letter will be available for download once the order is processed
                  </p>
                  <p>
                    📱 <strong>Order Updates:</strong> You'll receive email notifications for each status change
                  </p>
                  <p>
                    🚚 <strong>Shipping:</strong> Standard shipping typically takes 3-5 business days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={viewOrderStatus} className="w-full" variant="outline">
                View Order Status
              </Button>
              <Button onClick={continueShopping} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Phase 1A Notice */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              <strong>Phase 1A Notice:</strong> This is a demonstration order. No real medication will be shipped, 
              and no real payment was processed. In the full system, you would receive actual email confirmations 
              and tracking information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}