export default function insertQuery(store_id: string, query: string = "") {
  const absoluteQuery = "chekout_" + store_id + "|" + query
  return absoluteQuery
}
