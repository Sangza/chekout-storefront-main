"use client"

import { useState } from "react"
import { Cart, PaymentSession } from "@medusajs/medusa"
import { placeOrder } from "@modules/checkout/actions"
import { PaystackButton } from "react-paystack"

const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY
if (!publicKey) throw new Error("Paystack public key is required.")

const PaystackPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_session as PaymentSession

  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  if (notReady || !cart.total) return null

  return (
    <PaystackButton
      amount={cart.total}
      email={cart.email}
      reference={String(session.data.paystackTxRef)}
      currency={cart.region.currency_code.toUpperCase()}
      publicKey={publicKey}
      onSuccess={onPaymentCompleted}
      className="w-full uppercase flex items-center justify-center min-h-[50px] pt-5 text-sm border transition-colors"
    >
      Pay with Paystack
    </PaystackButton>
  )
}

export default PaystackPaymentButton
