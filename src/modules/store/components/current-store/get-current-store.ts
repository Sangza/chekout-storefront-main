import { getStoreInformation } from "@lib/data"
// import { unstable_noStore } from "next/cache"
import { notFound } from "next/navigation"

const getCurrentStoreInformation = async (name: string) => {
  // unstable_noStore()
  const storeInfo = await getStoreInformation({ name })
  if (storeInfo === false) notFound()
  return storeInfo
}

export default getCurrentStoreInformation
