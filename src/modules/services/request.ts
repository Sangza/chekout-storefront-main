const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

export default async function chekoutRequestJSON(
  method: string,
  path = "",
  payload = {}
) {
  const absolute_path = `${MEDUSA_BACKEND_URL}${path}`
  const response = await fetch(absolute_path, {
    method,
    credentials: "include",
    headers: {
      ...(method.toUpperCase() !== "GET" && {
        "Content-Type": "application/json",
      }),
    },
    ...(method.toUpperCase() !== "GET" && { body: JSON.stringify(payload) }),
  })

  let data = {} as any
  let status

  try {
    status = response.status
    data = await response.json()
  } catch (err) {
    status = response.status
  }

  return { status: response.status, data }
}
