"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertTriangle, ChevronDown } from "lucide-react"
import type { Network } from "@/lib/types"

const networks: { id: Network; name: string; icon: string }[] = [
  { id: "ethereum", name: "Ethereum", icon: "⟠" },
  { id: "base", name: "Base", icon: "🔵" },
]

export function NetworkIndicator() {
  const { wallet, switchNetwork } = useWallet()

  if (!wallet.connected) return null

  const currentNetwork = networks.find((n) => n.id === wallet.network)

  if (!currentNetwork) {
    return (
      <Button variant="destructive" size="sm" className="gap-2">
        <AlertTriangle className="h-4 w-4" />
        Wrong Network
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <span className="text-base">{currentNetwork.icon}</span>
          <span className="hidden sm:inline">{currentNetwork.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {networks.map((network) => (
          <DropdownMenuItem key={network.id} onClick={() => switchNetwork(network.id)} className="gap-2">
            <span className="text-base">{network.icon}</span>
            {network.name}
            {network.id === wallet.network && <span className="ml-auto text-xs text-primary">Connected</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
