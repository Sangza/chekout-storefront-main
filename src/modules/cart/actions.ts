"use server"

import { LineItem } from "@medusajs/medusa"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import {
  addItem,
  createCart,
  getCart,
  getProductsById,
  getRegion,
  removeItem,
  updateCart,
  updateItem,
} from "@lib/data"
import chekoutRequestJSON from "@modules/services/request"
import { add_items_from_tag_to_cart } from "routes/server"

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 * const cart = await getOrSetCart()
 */
export async function getOrSetCart(countryCode: string) {
  const cartId = cookies().get("_medusa_cart_id")?.value
  let cart

  if (cartId) {
    cart = await getCart(cartId).then((cart) => cart)
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const region_id = region.id

  if (!cart) {
    cart = await createCart({ region_id }).then((res) => res)
    cart &&
      cookies().set("_medusa_cart_id", cart.id, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region_id) {
    await updateCart(cart.id, { region_id })
    revalidateTag("cart")
  }

  return cart
}

export async function retrieveCart() {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return null
  }

  try {
    const cart = await getCart(cartId).then((cart) => cart)
    return cart
  } catch (e) {
    console.log(e)
    return null
  }
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  const cart = await getOrSetCart(countryCode).then((cart) => cart)

  if (!cart) {
    return "Missing cart ID"
  }

  if (!variantId) {
    return "Missing product variant ID"
  }

  try {
    await addItem({ cartId: cart.id, variantId, quantity })
    revalidateTag("cart")
  } catch (e) {
    return "Error adding item to cart"
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return "Missing cart ID"
  }

  if (!lineId) {
    return "Missing lineItem ID"
  }

  if (!cartId) {
    return "Missing cart ID"
  }

  try {
    await updateItem({ cartId, lineId, quantity })
    revalidateTag("cart")
  } catch (e: any) {
    return e.toString()
  }
}

export async function deleteLineItem(lineId: string) {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return "Missing cart ID"
  }

  if (!lineId) {
    return "Missing lineItem ID"
  }

  if (!cartId) {
    return "Missing cart ID"
  }

  try {
    await removeItem({ cartId, lineId })
    revalidateTag("cart")
  } catch (e) {
    return "Error deleting line item"
  }
}

export async function enrichLineItems(
  lineItems: LineItem[],
  regionId: string
): Promise<
  | Omit<LineItem, "beforeInsert" | "beforeUpdate" | "afterUpdateOrLoad">[]
  | undefined
> {
  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.variant.product_id),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)

  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information

  const enrichedItems = lineItems.map((item) => {
    // @ts-ignore
    const store = item.variant.product.store

    const product = products.find((p) => p.id === item.variant.product_id)
    const variant = product?.variants.find((v) => v.id === item.variant_id)

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit({ ...product, store }, "variants"),
      },
    }
  }) as LineItem[]

  return enrichedItems
}

export async function addLineItemsFromTagToCart(
  country_code: string,
  items: LineItem[]
) {
  const cart = await getOrSetCart(country_code)
  if (!cart) return null

  if (!cart) {
    return "Missing cart ID"
  }

  if (items.length === 0) {
    return "Missing line items"
  }
  const { status } = await chekoutRequestJSON(
    "POST",
    add_items_from_tag_to_cart,
    {
      cart_id: cart.id,
      items,
    }
  )

  if (status !== 201) return false

  revalidateTag("cart")
  return true
}
