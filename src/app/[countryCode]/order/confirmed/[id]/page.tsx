import { Metadata } from "next"

import { retrieveOrder } from "@lib/data"
import { Cart, LineItem, Order } from "@medusajs/medusa"
import { enrichLineItems } from "@modules/cart/actions"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { notFound } from "next/navigation"
import { getCart } from "@lib/data"

type Props = {
  params: { id: string }
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return notFound()
  }

  // The items is returning an empty an array, for now, we'll just fetch the line items associated with the cart of this order
  const cart_id = order.cart_id
  const cart = await getCart(cart_id).then(
    (cart) => cart
  )

  const enrichedItems = await enrichLineItems((cart as Cart).items, order.region_id)

  return {
    order: {
      ...order,
      items: enrichedItems as LineItem[]
    } as Order,
  }
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { order } = await getOrder(params.id)

  return <OrderCompletedTemplate order={order} />
}
