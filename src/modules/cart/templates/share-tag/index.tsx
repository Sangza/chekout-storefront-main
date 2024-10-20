"use client"

import { Button, Heading } from "@medusajs/ui"
import ProductCard from "./product-card"
import { LineItem, Region } from "@medusajs/medusa"
import { formatAmount } from "@lib/util/prices"
import { useState } from "react"
import { addLineItemsFromTagToCart, getOrSetCart } from "@modules/cart/actions"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { BrowserProvider, Contract, parseUnits } from "ethers"
import { USDTAbi, USDTAddress } from "@modules/crypto/index.t"

export default function TaggedCartTemplate({
  items,
  region,
  country_code,
}: {
  items: LineItem[]
  region: Region
  country_code: string
}) {
  const [lineItems, setLineItems] = useState<Array<LineItem>>(items)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const removeItem = (id: string) =>
    setLineItems((items) => items.filter((item) => item.id != id))
  const revertChanges = () => setLineItems(items)

  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("eip155")

  let ethersProvider: BrowserProvider

  if (walletProvider) {
    // @ts-ignore
    ethersProvider = new ethers.BrowserProvider(walletProvider)
  }

  async function transfer(valuee: string) {
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
  }

  return (
    <div className="w-full flex items-center flex-col py-10 gap-5 max-sm:px-2">
      <Heading className="text-2xl mb-7">
        Below are the products attributed to this cart tag.
      </Heading>
      {lineItems.map((item) => (
        <ProductCard
          key={item.id}
          title={item.title}
          unit_price={item.unit_price}
          thumbnail={item.thumbnail}
          region={region}
          id={item.id}
          removeItem={removeItem}
        />
      ))}

      <div>
        <Heading>
          Total in tagged cart:{" "}
          {formatAmount({
            amount: lineItems.reduce(
              (prev, current) => prev + current.unit_price,
              0
            ),
            region,
          })}
        </Heading>
      </div>
      <div className="max-w-xs w-4/5 mx-auto flex flex-col items-center max-sm:px-2 md:px-6">
        <Button
          variant="secondary"
          className="mt-5 w-full"
          onClick={() => revertChanges()}
        >
          Revert Changes
        </Button>
        <Button
          isLoading={isLoading}
          className="mt-5 w-full"
          onClick={async () => {
            setIsLoading(true)

            const isSucessful = await addLineItemsFromTagToCart(
              country_code,
              lineItems
            )

            //! Toast to show error
            // if (status !== 201)
            //   toast.info({
            //     title: "Unable to add to cart",
            //     description:
            //       "Something went wrong while adding to cart, please try agan",
            //   })

            //* Toast to show success

            setIsLoading(false)
          }}
        >
          Add these products to my cart.
        </Button>
        <div className="w-full mt-5">
          {!isConnected && <w3m-button />}
          {
            <Button
              className="w-full bg-blue-400 hover:bg-blue-600 active:bg-blue-800 !border-blue-400"
              onClick={() => {
                const amount =
                  (lineItems.reduce(
                    (prev, current) => prev + current.unit_price,
                    0
                  ) /
                    100) *
                  1700

                transfer(String(amount))
              }}
            >
              Pay for products with USDT
            </Button>
          }
        </div>
      </div>
    </div>
  )
}
