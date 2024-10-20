import { Region } from "@medusajs/medusa"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { get_store_info } from "routes/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, Region>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      next: {
        revalidate: 3600,
        tags: ["regions"],
      },
    }).then((res) => res.json())

    if (!regions) {
      notFound()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: Region) => {
      region.countries.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2, region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, Region | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get("onboarding") === "true"
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const onboardingCookie = request.cookies.get("_medusa_onboarding")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")

  const headers = new Headers(request.headers)
  const excluded_routes = ["cart", "checkout", "order"]

  if (request.nextUrl.pathname) {
    //* Ensure that the requested store exists before proceeding
    //* First is region followed by store name followed by the remaining url path

    const setStoreHeaders = (details: StoreInfo) => {
      headers.set("store", JSON.stringify(details))
    }

    const parsed_pathname = request.nextUrl.pathname.replace(/\//, "")
    const requestUrl = parsed_pathname.split("/")

    const _handle = requestUrl[1]

    // Third refers to the third url value which we check to see if it is included in our exception list
    if (!excluded_routes.includes(_handle)) {
      // Search and see for store and show 404 if store not found
      const response = await fetch(`${BACKEND_URL}${get_store_info(_handle)}`, {
        next: {
          revalidate: 3600,
          tags: ["_handle"],
        },
      })

      if (response.status === 500) throw new Error("Server Error")
      else if (response.status === 200) {
        // Set store details to the headers which will then be gotten by the server functions
        const data = await response.json()
        setStoreHeaders(data.store)
      } else {
        // set store details to null which will cause our component to redirect to a 404 page
        const url = request.nextUrl.clone()
        url.pathname = "/404"
        return NextResponse.rewrite(url)
      }
    }
  }

  const regionMap = await getRegionMap()

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  let response = NextResponse.next({ request: { headers } })
  // check if one of the country codes is in the url
  if (
    urlHasCountryCode &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    return response
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  let redirectUrl = request.nextUrl.href

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
  if (cartId && !checkoutStep) {
    redirectUrl = `${redirectUrl}&step=address`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding) {
    response.cookies.set("_medusa_onboarding", "true", { maxAge: 60 * 60 * 24 })
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
}
