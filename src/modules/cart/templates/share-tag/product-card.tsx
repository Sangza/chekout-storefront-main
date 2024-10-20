import { formatAmount } from "@lib/util/prices"
import { Region } from "@medusajs/medusa"
import Image from "next/image"

type Params = {
  title: string
  unit_price: number
  thumbnail: string | null
  region: Region
  removeItem: (id: string) => void
  id: string
}

export default function ProductCard({
  title,
  unit_price,
  thumbnail,
  region,
  removeItem,
  id,
}: Params) {
  return (
    <div className="!visible transition-opacity duration-150 bg-background text-foreground !opacity-100 max-w-lg md:min-w-[400px]">
      <div
        className="rounded-lg border bg-card text-card-foreground shadow-sm"
        data-id="2"
        data-v0-t="card"
      >
        <div className="flex items-center gap-4 p-4" data-id="3">
          <Image
            data-id="4"
            src={thumbnail ? thumbnail : "/placeholder.svg"}
            alt="Thumbnail"
            width="100"
            height="100"
            className="aspect-square object-cover rounded border border-gray-200 overflow-hidden dark:border-gray-800"
          />
          <div className="grid gap-1.5" data-id="5">
            <h3 className="text-sm font-bold leading-none" data-id="6">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-lg" data-id="18">
              <div data-id="20">
                {formatAmount({ amount: unit_price, region })}
              </div>
            </div>
            <div className="text-sm" data-id="13">
              Color: Black
            </div>
            <div className="text-sm" data-id="14">
              Size: M
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ml-auto"
            data-id="15"
            onClick={() => removeItem(id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
