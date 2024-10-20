import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import getCurrentStoreInformation from "@modules/store/components/current-store/get-current-store"
import { use } from "react"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
  params: {
    countryCode: string
    store: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page } = searchParams
  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
