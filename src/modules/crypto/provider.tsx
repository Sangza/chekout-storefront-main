'use client'
import React, { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { arbitrum, mainnet, baseSepolia, base} from '@reown/appkit/networks'

// 1. Get projectId
const projectId = '2da8da64fa328ae1fd5aaf4abfe54e7f';



// 3. Create a metadata object - optional
const metadata = {
  name: 'chekout',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks:[arbitrum, mainnet, baseSepolia, base],
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

// Define the props type
interface Web3ModalProps {
  children: ReactNode
}

export function Web3Modal({ children }: Web3ModalProps) {
  return <>{children}</>
}