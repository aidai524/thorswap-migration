"use client";

import { useWallet } from "@/contexts/wallet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, ChevronDown } from "lucide-react";
import chains from "@/config/chains";

export function NetworkIndicator() {
  const { account, switchChain } = useWallet();

  if (!account?.address) return null;

  const currentNetwork = chains.find(
    (chain: any) => chain.id === account.chainId
  );

  if (!currentNetwork) {
    return (
      <Button variant="destructive" size="sm" className="gap-2">
        <AlertTriangle className="h-4 w-4" />
        Wrong Network
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {/* <span className="text-base">{currentNetwork.icon}</span> */}
          <span className="hidden sm:inline">{currentNetwork.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {chains.map((chain: any) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => switchChain?.(chain.id)}
            className="gap-2"
          >
            <span className="text-base">{chain.icon}</span>
            {chain.name}
            {chain.id === account.chainId && (
              <span className="ml-auto text-xs text-primary">Connected</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
