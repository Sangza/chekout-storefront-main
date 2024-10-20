import { Metadata } from "next"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import {Web3Modal} from "@modules/crypto/provider"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  store: string
}) {
  return (
    <>
    <Web3Modal>
      <Nav />
        {props.children}
      <Footer />
    </Web3Modal>
    </>
  )
}
