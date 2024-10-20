import { getRegion } from "@lib/data"
import getStoreInformation from "@lib/util/get-store-information"
import { LineItem } from "@medusajs/medusa"
import TaggedCartTemplate from "@modules/cart/templates/share-tag"
import chekoutRequestJSON from "@modules/services/request"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { get_items_in_share_tag, validate_share_tag } from "routes/server"

export default async function StoreShareTag({
  params: { tag_share_id, countryCode },
}: {
  params: { tag_share_id: string; countryCode: string }
}) {
  // Call api to verify that the tag belongs to the designated store
  // If correct, ask user if they will like to add the following cart to theirs
  const headerData = headers()
  const store = getStoreInformation(headerData)
  const { status: validateStatus } = await chekoutRequestJSON(
    "GET",
    validate_share_tag(tag_share_id, store.id)
  )

  if (validateStatus === 404) notFound()

  const { status, data } = await chekoutRequestJSON(
    "GET",
    get_items_in_share_tag(tag_share_id, store.id)
  )

  let items: LineItem[] = data.cartTag.items

  // Get user cart or create one (Execute in server action)
  const region: any = await getRegion(countryCode)

  return (
    <TaggedCartTemplate
      items={items}
      region={region}
      country_code={countryCode}
    />
  )
}
