"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  noStore = false,
  manualStoreName = "",
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  noStore?: boolean
  manualStoreName?: string
  [x: string]: any
}) => {
  const { countryCode, store } = useParams<ChekoutURLParams>()
  const go_to = `/${countryCode}${
    noStore ? "" : `/${manualStoreName === "" ? store : manualStoreName}`
  }${href}`

  return (
    <Link href={go_to} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
