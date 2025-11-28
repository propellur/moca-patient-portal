"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Checkout Page Component
 * 
 * This implements Phase 1A checkout flow:
 * 1. Display cart items and total
 * 2. Mock payment form (no real payment processing)
 * 3. Simulate Power Board payment success
 * 4. Create order and redirect to success page
 * 
 * Design decisions:
 * - Cart data passed via localStorage (temporary for Phase 1A)
 * - Mock payment form with fake card details
 * - Hardcoded success flow
 * - Order ID generation for tracking
 * 
 * Phase 1B will replace with:
 * - Real Power Board integration
 * - Backend order creation
 * - Proper cart state management
 * - Email notifications
 */

interface Prescription {
  id: string
  name: string
  strength: string
  quantity: number
  repeats: number
  prescribedDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'used'
  interval: string
  price: number
}

interface CartItem {
  prescription: Prescription
  quantitySelected: number
}

export default function CheckoutPage() {
  // State management
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  })

  const router = useRouter()

  /**
   * Load cart data from localStorage on component mount
   * In Phase 1B, this will come from context/state management
   */
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load cart data from localStorage
    // Note: This is a temporary approach for Phase 1A
    const savedCart = localStorage.getItem("cartItems")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[]
        setCartItems(parsedCart)
      } catch (error) {
        console.error("Error parsing cart data:", error)
        // If cart data is corrupted, redirect to dashboard
        router.push("/dashboard")
      }
    } else {
      // No cart data, redirect to dashboard
      router.push("/dashboard")
    }
  }, [router])

  /**
   * Calculate cart totals
   */
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.prescription.price * item.quantitySelected), 0
  )
  
  const shippingFee = 33.00 // Configurable flat shipping fee from user stories
  const total = subtotal + shippingFee

  /**
   * Handle payment form input changes
   */
  const handleInputChange = (field: keyof typeof paymentForm, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Process payment (Phase 1A: Mock implementation)
   * 
   * In Phase 1B, this will:
   * - Integrate with Power Board API
   * - Handle real payment processing
   * - Create order in backend
   * - Send confirmation emails
   * - Decrement prescription repeats
   */
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Phase 1A: Mock successful payment
      // Generate mock order ID
      const orderId = `MOCA-${Date.now()}`
      const userEmail = localStorage.getItem("userEmail")

      // Create mock order object (matches what backend will store)
      const order = {
        id: orderId,
        patientEmail: userEmail,
        items: cartItems,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
        status: "awaiting_payment", // Will progress through: awaiting_payment → processing → shipped
        createdAt: new Date().toISOString(),
        paymentMethod: "Power Board", // Phase 1B will have real payment details
        shippingAddress: "Mock Address", // Phase 1B will collect real address
        trackingNumber: null // Will be added when shipped
      }

      // Store order for mock admin system
      const existingOrders = localStorage.getItem("allOrders")
      const orders = existingOrders ? JSON.parse(existingOrders) : []
      orders.push(order)
      localStorage.setItem("allOrders", JSON.stringify(orders))

      // Store current order for success page
      localStorage.setItem("currentOrder", JSON.stringify(order))

      // Clear cart after successful payment
      localStorage.removeItem("cartItems")

      // Redirect to success page
      router.push("/order-success")

    } catch (error) {
      console.error("Payment failed:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigate back to dashboard
   */
  const goBackToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Review your order and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary (Left Column) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your medication order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Cart Items */}
                  {cartItems.map((item, index) => (
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
                        <p className="text-sm text-gray-600">
                          ${item.prescription.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Totals */}
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase 1A Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  <strong>Phase 1A Notice:</strong> This is a mock checkout for testing. 
                  No real payment will be processed. Use any card details to continue.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form (Right Column) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Secure payment via Power Board</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      required
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div className="space-y-2">
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      placeholder="John Doe"
                      value={paymentForm.nameOnCard}
                      onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                      required
                    />
                  </div>

                  {/* Payment Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing Payment..." : `Pay $${total.toFixed(2)}`}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={goBackToDashboard}
                      disabled={isLoading}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-sm text-green-800">
                  🔒 Your payment information is secure and encrypted. 
                  We use Power Board for safe payment processing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}