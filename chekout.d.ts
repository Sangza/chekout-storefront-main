type ChekoutURLParams = {
  countryCode: string
  store: string
}

type StoreInfo = {
  user_id: string
  description: string | null
  thumbnail: string | null
  thumbnail_key: string | null
  id: string
  created_at: string | Date
  updated_at: string | Date
  name: string
  default_currency_code: string
  default_sales_channel_id: string
  handle: string
}
