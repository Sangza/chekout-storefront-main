"use client"

import { Text } from "@medusajs/ui"
import Input from "@modules/common/components/input"

export default function EmptyCartInput() {
  return (
    <div className="space-y-2">
      <Text className="text-ui-fg-interactive">
        Start exploring various stores. Enter the name of a store you would like
        to explore
      </Text>
      <Input label="Enter storename" name="store-name" />
      {/* <InteractiveLink href="/store">Explore products</InteractiveLink> */}
    </div>
  )
}
