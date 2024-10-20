"use client"

import { Button, Heading } from "@medusajs/ui"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { CartWithCheckoutStep } from "types/global"
import DiscountCode from "@modules/checkout/components/discount-code"
import { BrowserProvider, Contract, ethers, parseUnits } from "ethers"
import { USDTAddress, USDTAbi } from "../../crypto/index.t"
import { useRef, useState } from "react"
import { Order } from "@medusajs/medusa"
import { useRouter } from "next/navigation"

type SummaryProps = {
  cart: CartWithCheckoutStep
}

const Summary = ({ cart }: SummaryProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("eip155")

  let ethersProvider: BrowserProvider

  if (walletProvider) {
    // @ts-ignore
    ethersProvider = new ethers.BrowserProvider(walletProvider)
  }

  async function transfer(valuee: string) {
    try {
      const signer = await ethersProvider.getSigner()
      const USDTContract = new Contract(USDTAddress, USDTAbi, signer)
      const decimal = await USDTContract.decimals()
      const value = parseUnits(valuee, decimal)
      const UsDTtransfer = await USDTContract.transfer(
        "0x00A5bc2A233567Af1B31038048814aDC34F7102f",
        value
      )
      const receipt = await UsDTtransfer.wait()
      console.log(receipt)
      return receipt
    } catch(err: any) {
      const insufficientBal = (err.message as string).includes("transfer amount exceeds balance")
      if (insufficientBal) return 0
      else return false
    }
  }

  const insufficientBalRef = useRef<any>()
  const error = useRef<any>()

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        {isConnected && <w3m-button balance={"show"} />}
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals data={cart} />
      {/* <LocalizedClientLink
        href={"/checkout?step=" + cart.checkout_step}
        data-testid="checkout-button"
        noStore
      > */}
      {!isConnected && (
        <w3m-button label="Checkout with Base" balance={"hide"} />
      )}
      {isConnected && (
        <Button 
          isLoading={isLoading} 
          onClick={async () => {
            setIsLoading(true)
            const result = await transfer("0")

            if (result === 0) {
              insufficientBalRef.current.classList.remove("hidden")
              setTimeout(() => {insufficientBalRef.current.classList.add("hidden")}, 5000)
            } else if (result === false) {
              error.current.classList.remove("hidden")
              setTimeout(() => {error.current.classList.add("hidden")}, 5000)
            } else {
              // Create order
              const cart_id = cart.id
              const region_id = cart.region_id

              const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/pay`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({cart_id, region_id}),
                credentials: "include"
              })

              const {order}: {order: Order} = await response.json()
              router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/order/confirmed/${order.id}`)
            }
            setIsLoading(false)
          }} 
          className="w-full h-10">
          Pay with USDT
        </Button>
      )}
      <small ref={insufficientBalRef} className="mx-auto text-red-500 hidden">Insufficient balance</small>
      <small ref={error} className="mx-auto text-red-500 hidden">Something went wrong</small>
      {/* <w3m-button balance= {"hide"}/> */}
      {/* </LocalizedClientLink> */}
    </div>
  )
}

export default Summary
