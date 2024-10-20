export const get_store_info = (store_name: string) =>
  "/store/info/" + store_name
export const validate_share_tag = (tag: string, store: string) =>
  "/store/cart/share/verify/" + store + "/" + tag
export const get_items_in_share_tag = (tag: string, store: string) =>
  "/store/cart/share/items/" + store + "/" + tag
export const add_items_from_tag_to_cart = "/store/cart/share/add"
