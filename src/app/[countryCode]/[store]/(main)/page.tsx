import { cache } from "react"
import { Metadata } from "next"
import { headers } from "next/headers"
import { Product } from "@medusajs/medusa"

import { getCollectionsList, getProductsList, getRegion } from "@lib/data"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { ProductCollectionWithPreviews } from "types/global"
import getCurrentStoreInformation from "@modules/store/components/current-store/get-current-store"
import getStoreInformation from "@lib/util/get-store-information"
import { Toaster } from "@medusajs/ui"
import WalletConnect from "@modules/crypto/wallet-connect"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

const getCollectionsWithProducts = cache(
  async (
    countryCode: string,
    store_id: string
  ): Promise<{
    collections: ProductCollectionWithPreviews[] | null
  }> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections) {
      return { collections: null }
    }

    const collectionIds = collections.map((collection) => collection.id)

    await Promise.all(
      collectionIds.map((id) =>
        getProductsList({
          queryParams: { collection_id: [id] },
          countryCode,
          store_id,
        })
      )
    ).then((responses) =>
      responses.forEach(({ response, queryParams }) => {
        let collection

        if (collections) {
          collection = collections.find(
            (collection) => collection.id === queryParams?.collection_id?.[0]
          )
        }

        if (!collection) {
          return
        }

        collection.products = response.products as unknown as Product[]
      })
    )

    return {
      collections: collections as unknown as ProductCollectionWithPreviews[],
    }
  }
)

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string; store: string }
}) {
  const headersData = headers()
  const store = getStoreInformation(headersData)
  const { collections } = await getCollectionsWithProducts(
    countryCode,
    store.id
  )
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Toaster />
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
