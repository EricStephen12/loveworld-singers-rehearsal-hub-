'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Shield, Star, ChevronRight, X } from 'lucide-react'

export default function SubscriptionPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = {
    monthly: {
      name: 'Monthly Plan',
      price: '1.2 ESPEES',
      nairaPrice: '₦2,460',
      period: 'per month',
      savings: null,
      features: [
        'Access to all rehearsal songs',
        'Download offline content',
        'Priority support',
        'Exclusive updates'
      ]
    },
    yearly: {
      name: 'Yearly Plan',
      price: '12 ESPEES',
      nairaPrice: '₦24,600',
      period: 'per year',
      savings: 'Save 2.4 ESPEES (₦4,920)',
      features: [
        'Access to all rehearsal songs',
        'Download offline content',
        'Priority support',
        'Exclusive updates',
        'Early access to new features',
        'Premium audio quality'
      ]
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate ESPEES payment integration
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save subscription status
      localStorage.setItem('hasSubscribed', 'true')
      console.log('Payment successful!')
      router.push('/success?action=signup')
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Subscription</h1>
        <div className="w-16"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
          <p className="text-gray-600 text-sm">
            Unlock all features of LoveWorld Singers Rehearsal Hub
          </p>
        </div>

        {/* Plan Selection */}
        <div className="space-y-4 mb-8">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedPlan === key
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {selectedPlan === key && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.period}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{plan.price}</div>
                  <div className="text-sm text-gray-600">{plan.nairaPrice}</div>
                </div>
              </div>
              
              {plan.savings && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-block mb-3">
                  {plan.savings}
                </div>
              )}
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{plans[selectedPlan].name}</span>
              <span className="font-medium">{plans[selectedPlan].price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Naira Equivalent</span>
              <span className="font-medium">{plans[selectedPlan].nairaPrice}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{plans[selectedPlan].price} ({plans[selectedPlan].nairaPrice})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay with ESPEES
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Your payment is secure and encrypted</span>
        </div>

        {/* ESPEES Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>ESPEES Currency:</strong> 1 ESPEES = ₦2,050 Naira
          </p>
        </div>
      </div>
    </div>
  )
}
