"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Prescription type definition
 * This matches the data structure we'll receive from Halaxy in Phase 1B
 */
interface Prescription {
  id: string
  name: string              // Medication name
  strength: string          // e.g., "10mg"
  quantity: number          // Number of tablets/units
  repeats: number           // How many refills are available
  prescribedDate: string    // When it was prescribed
  expiryDate: string        // When prescription expires
  status: 'active' | 'expired' | 'used'
  interval: string          // How often to take (e.g., "Once daily")
  price: number             // Cost per unit (for cart calculation)
}

/**
 * Cart item type - represents prescription + quantity selected
 */
interface CartItem {
  prescription: Prescription
  quantitySelected: number  // How many units patient wants to order
}

/**
 * Order interfaces for Phase 4 - My Orders Section
 * Matches the data structure from admin system
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

/**
 * Dashboard Component
 * 
 * This is the main patient portal page showing:
 * 1. User welcome message
 * 2. Active prescriptions (Phase 1A: mock data, Phase 1B: from Halaxy)
 * 3. Add to cart functionality
 * 4. Basic cart display
 * 
 * Design decisions:
 * - Mock prescription data for Phase 1A testing
 * - Simple cart state management (will move to context/redux later)
 * - Basic auth check using localStorage (temporary)
 * - Responsive card layout for prescriptions
 */
export default function DashboardPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  
  // Cart state management
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Router for navigation
  const router = useRouter()

  /**
   * Mock prescription data for Phase 1A
   * In Phase 1B, this will be fetched from Halaxy API
   * 
   * Data structure matches what we expect from Halaxy:
   * - Each prescription has repeats available
   * - Status determines if it can be ordered
   * - Price will come from pharmacy pricing tables
   */
  const mockPrescriptions: Prescription[] = [
    {
      id: "rx-001",
      name: "Paracetamol",
      strength: "500mg",
      quantity: 20,
      repeats: 3,
      prescribedDate: "2024-01-15",
      expiryDate: "2024-07-15",
      status: "active",
      interval: "As needed, up to 4 times daily",
      price: 12.50
    },
    {
      id: "rx-002", 
      name: "Ibuprofen",
      strength: "200mg",
      quantity: 30,
      repeats: 2,
      prescribedDate: "2024-02-01",
      expiryDate: "2024-08-01",
      status: "active",
      interval: "Twice daily with food",
      price: 15.80
    },
    {
      id: "rx-003",
      name: "Vitamin D",
      strength: "1000IU",
      quantity: 60,
      repeats: 0, // No repeats left
      prescribedDate: "2023-12-01",
      expiryDate: "2024-06-01",
      status: "used",
      interval: "Once daily",
      price: 8.90
    }
  ]

  /**
   * Check authentication status on component mount
   * This is temporary localStorage-based auth for Phase 1A
   */
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const email = localStorage.getItem("userEmail")
    
    if (authStatus === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
    } else {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [router])

  /**
   * Add prescription to cart
   * 
   * Business logic:
   * - Only allow active prescriptions with repeats > 0
   * - Default quantity is full prescription amount
   * - Prevent duplicate items (update quantity instead)
   */
  const addToCart = (prescription: Prescription) => {
    // Validation: only active prescriptions with repeats can be ordered
    if (prescription.status !== "active" || prescription.repeats === 0) {
      alert("This prescription cannot be ordered")
      return
    }

    // Check if item already in cart
    const existingItem = cart.find(item => item.prescription.id === prescription.id)
    
    if (existingItem) {
      // Update quantity of existing item
      setCart(cart.map(item => 
        item.prescription.id === prescription.id 
          ? { ...item, quantitySelected: item.quantitySelected + prescription.quantity }
          : item
      ))
      alert("Quantity updated in cart")
    } else {
      // Add new item to cart
      const newCartItem: CartItem = {
        prescription,
        quantitySelected: prescription.quantity // Default to full prescription amount
      }
      setCart([...cart, newCartItem])
      alert("Added to cart!")
    }
  }

  /**
   * Calculate total cart value
   */
  const cartTotal = cart.reduce((total, item) => 
    total + (item.prescription.price * item.quantitySelected), 0
  )

  /**
   * Handle logout
   * Clear auth data and redirect to login
   */
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  /**
   * Navigate to checkout page
   * Phase 1A: Save cart to localStorage and navigate to checkout
   * Phase 1B: Will use proper state management (Context/Redux)
   */
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty")
      return
    }
    
    // Save cart data to localStorage for checkout page
    // In Phase 1B, this will be handled by proper state management
    localStorage.setItem("cartItems", JSON.stringify(cart))
    
    // Navigate to checkout page
    router.push("/checkout")
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with user info and logout */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MOCA Patient Portal</h1>
            <p className="text-gray-600">Welcome, {userEmail}</p>
          </div>
          <div className="flex gap-4">
            {/* Cart summary button */}
            <Button 
              variant="outline" 
              onClick={proceedToCheckout}
              className="relative"
            >
              Cart ({cart.length})
              {cart.length > 0 && (
                <span className="ml-2 text-sm text-green-600">
                  ${cartTotal.toFixed(2)}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Prescriptions section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Prescriptions</h2>
          
          {/* Prescription cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{prescription.name}</span>
                    {/* Status indicator */}
                    <span className={`text-xs px-2 py-1 rounded ${
                      prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prescription.status}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {prescription.strength} • {prescription.interval}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Prescription details */}
                    <div className="text-sm space-y-1">
                      <p><strong>Quantity:</strong> {prescription.quantity} units</p>
                      <p><strong>Repeats available:</strong> {prescription.repeats}</p>
                      <p><strong>Prescribed:</strong> {prescription.prescribedDate}</p>
                      <p><strong>Expires:</strong> {prescription.expiryDate}</p>
                      <p><strong>Price:</strong> ${prescription.price.toFixed(2)}</p>
                    </div>
                    
                    {/* Add to cart button */}
                    <Button 
                      onClick={() => addToCart(prescription)}
                      disabled={prescription.status !== 'active' || prescription.repeats === 0}
                      className="w-full"
                      variant={prescription.status === 'active' && prescription.repeats > 0 ? 'default' : 'secondary'}
                    >
                      {prescription.status !== 'active' ? 'Not Available' :
                       prescription.repeats === 0 ? 'No Repeats Left' :
                       'Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart preview section */}
        {cart.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Cart Preview</CardTitle>
                <CardDescription>Items ready for checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span>{item.prescription.name} x{item.quantitySelected}</span>
                      <span>${(item.prescription.price * item.quantitySelected).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-semibold">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={proceedToCheckout} className="w-full mt-4">
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phase 4: My Orders Section - as specified in plan.txt */}
        <MyOrdersSection userEmail={userEmail} />
      </div>
    </div>
  )
}

/**
 * Phase 4: My Orders Section Component
 * 
 * Features as specified in plan.txt:
 * - Load orders for current patient from localStorage "allOrders"
 * - Display patient's orders showing: Order ID, Date, Status, Tracking Number, Total
 * - Show tracking number prominently when status = "shipped"
 * - Added below existing cart preview section
 */
interface MyOrdersSectionProps {
  userEmail: string
}

function MyOrdersSection({ userEmail }: MyOrdersSectionProps) {
  const [patientOrders, setPatientOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Load patient's orders on component mount
   */
  useEffect(() => {
    loadPatientOrders()
  }, [userEmail])

  /**
   * Load orders for current patient from localStorage "allOrders"
   * Filter by patientEmail to show only this patient's orders
   */
  const loadPatientOrders = () => {
    try {
      const allOrders = localStorage.getItem("allOrders")
      if (allOrders) {
        const orders = JSON.parse(allOrders) as Order[]
        // Filter orders for current patient and sort by date (newest first)
        const userOrders = orders
          .filter(order => order.patientEmail === userEmail)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setPatientOrders(userOrders)
      } else {
        setPatientOrders([])
      }
    } catch (error) {
      console.error("Error loading patient orders:", error)
      setPatientOrders([])
    }
    setIsLoading(false)
  }

  /**
   * Get status badge styling for patient view
   */
  const getPatientStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm rounded-full font-medium"
    
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
   * Format status for patient display
   */
  const formatPatientStatus = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return "Payment Processing"
      case "processing":
        return "Being Prepared"
      case "shipped":
        return "Shipped"
      default:
        return status
    }
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Track your medication orders and shipping information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading your orders...</p>
            </div>
          ) : patientOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                Your medication orders will appear here after purchase
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h4 className="font-semibold">Order {order.id}</h4>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <span className={getPatientStatusBadge(order.status)}>
                        {formatPatientStatus(order.status)}
                      </span>
                      <span className="text-lg font-medium">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {item.prescription.name} {item.prescription.strength} × {item.quantitySelected}
                      </div>
                    ))}
                  </div>

                  {/* Tracking Information - Show prominently when shipped */}
                  {order.status === "shipped" && order.trackingNumber && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">Package Shipped!</p>
                          <p className="text-sm text-green-700">
                            Track your package with the number below
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600 uppercase tracking-wide">
                            Tracking Number
                          </p>
                          <p className="font-mono font-bold text-lg text-green-800">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Status Information */}
                  {order.status === "processing" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Your order is being prepared</strong> by our pharmacy team. 
                        You'll receive tracking information once it ships.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}