"use client"

import { cn } from "@/lib/utils"
import type { TokenSymbol } from "@/lib/types"

interface TokenSelectorProps {
  selected: TokenSymbol
  onSelect: (token: TokenSymbol) => void
  tokens: Array<{ symbol: TokenSymbol; name: string; balance: string }>
}

export function TokenSelector({ selected, onSelect, tokens }: TokenSelectorProps) {
  return (
    <div className="flex gap-2">
      {tokens.map((token) => (
        <button
          key={token.symbol}
          onClick={() => onSelect(token.symbol)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-xl border p-4 transition-all",
            selected === token.symbol
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-primary/50 hover:bg-secondary",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg font-bold">
            {token.symbol.charAt(0)}
          </div>
          <span className="font-medium">{token.symbol}</span>
          <span className="text-xs text-muted-foreground">Balance: {Number(token.balance).toLocaleString()}</span>
        </button>
      ))}
    </div>
  )
}
