"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { TokenSelector } from "./token-selector"
import { AmountInput } from "./amount-input"
import { VestingInfoPanel } from "./vesting-info-panel"
import { TransactionStatus } from "@/components/ui/transaction-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react"
import type { TokenSymbol } from "@/lib/types"

export function MigrationForm() {
  const { wallet, txStatus, setTxStatus } = useWallet()
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>("THOR")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tokens = [
    { symbol: "THOR" as TokenSymbol, name: "THORSwap Token", balance: wallet.balance.THOR },
    { symbol: "yTHOR" as TokenSymbol, name: "Vesting THOR", balance: wallet.balance.yTHOR },
  ]

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken)!
  const isValidAmount = Number(amount) > 0 && Number(amount) <= Number(selectedTokenData.balance)
  const isWrongNetwork = wallet.connected && wallet.network !== "ethereum"

  const handleMigrate = async () => {
    if (!isValidAmount || isWrongNetwork) return

    setIsSubmitting(true)
    setTxStatus({ status: "pending", message: "Confirm the transaction in your wallet..." })

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setTxStatus({
      status: "confirmed",
      hash: "0x" + Math.random().toString(16).slice(2, 66),
      message: `Successfully migrated ${amount} ${selectedToken} to METRO`,
    })

    setIsSubmitting(false)
    setAmount("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Migrate</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-primary">METRO</span>
          </CardTitle>
          <CardDescription>Convert your THOR or yTHOR tokens to METRO on Base chain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Wrong Network</p>
                <p className="text-sm text-muted-foreground">Please switch to Ethereum to migrate</p>
              </div>
            </div>
          )}

          {/* Token Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Token</label>
            <TokenSelector selected={selectedToken} onSelect={setSelectedToken} tokens={tokens} />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              maxAmount={selectedTokenData.balance}
              tokenSymbol={selectedToken}
              disabled={!wallet.connected || isWrongNetwork}
            />
          </div>

          {/* Migration Preview */}
          {Number(amount) > 0 && (
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium text-primary">~{Number(amount).toLocaleString()} METRO</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium">Base Network</span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-muted-foreground">
              Migration is <span className="text-foreground font-semibold">irreversible</span>. Once confirmed, you
              cannot convert METRO back to THOR.
            </p>
          </div>

          {/* Submit Button */}
          {!wallet.connected ? (
            <Button className="w-full" size="lg" disabled>
              Connect Wallet to Migrate
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleMigrate}
              disabled={!isValidAmount || isWrongNetwork || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                "Migrate & Stake"
              )}
            </Button>
          )}

          {/* Transaction Status */}
          {txStatus.status !== "idle" && (
            <TransactionStatus status={txStatus} network="ethereum" onClose={() => setTxStatus({ status: "idle" })} />
          )}
        </CardContent>
      </Card>

      {/* Right: Vesting Info */}
      <div className="space-y-6">
        <VestingInfoPanel token={selectedToken} />

        {/* Additional Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">How Migration Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                1
              </div>
              <p>Approve and submit your THOR/yTHOR tokens on Ethereum</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                2
              </div>
              <p>Your tokens are burned on Ethereum and METRO is minted on Base</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                3
              </div>
              <p>METRO is automatically staked with the appropriate lock period</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                4
              </div>
              <p>Start earning USDC rewards immediately</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
