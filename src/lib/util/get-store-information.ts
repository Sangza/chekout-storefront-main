import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export default function getStoreInformation(headers: ReadonlyHeaders) {
  const stringify_store_info = headers.get("store")
  let storeData: StoreInfo

  if (stringify_store_info) {
    storeData = JSON.parse(stringify_store_info)
  } else throw new Error("Something went wrong while getting store data.")

  return storeData
}
