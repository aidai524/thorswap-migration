"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionStatus } from "@/components/ui/transaction-status"
import { mockStats } from "@/lib/mock-data"
import { ArrowRight, DollarSign, Loader2, RefreshCw, Coins } from "lucide-react"

export function ClaimRewards() {
  const { wallet, txStatus, setTxStatus } = useWallet()
  const [isClaimingAll, setIsClaimingAll] = useState(false)
  const [isAutocompounding, setIsAutocompounding] = useState(false)

  const handleClaimAll = async () => {
    setIsClaimingAll(true)
    setTxStatus({ status: "pending", message: "Claiming all rewards..." })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setTxStatus({
      status: "confirmed",
      hash: "0x" + Math.random().toString(16).slice(2, 66),
      message: `Successfully claimed $${mockStats.claimableUSDC} USDC`,
    })
    setIsClaimingAll(false)
  }

  const handleAutocompound = async () => {
    setIsAutocompounding(true)
    setTxStatus({
      status: "pending",
      message: "Converting USDC to METRO and staking...",
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    setTxStatus({
      status: "confirmed",
      hash: "0x" + Math.random().toString(16).slice(2, 66),
      message: "Successfully autocompounded rewards into METRO stake",
    })
    setIsAutocompounding(false)
  }

  if (!wallet.connected) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Connect your wallet to view and claim rewards</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Claim All */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Claim Rewards
          </CardTitle>
          <CardDescription>Withdraw your earned USDC rewards to your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-secondary/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">Available to Claim</p>
            <p className="mt-2 text-4xl font-bold text-success">${mockStats.claimableUSDC}</p>
            <p className="mt-1 text-sm text-muted-foreground">USDC</p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleClaimAll}
            disabled={isClaimingAll || Number(mockStats.claimableUSDC) === 0}
          >
            {isClaimingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim All Rewards"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">Rewards are paid in USDC on Base network</p>
        </CardContent>
      </Card>

      {/* Autocompound */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Autocompound
          </CardTitle>
          <CardDescription>Reinvest your rewards to maximize returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Flow Visualization */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <p className="mt-2 text-sm font-medium">USDC</p>
              <p className="text-xs text-muted-foreground">${mockStats.claimableUSDC}</p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-2 text-sm font-medium">METRO</p>
              <p className="text-xs text-muted-foreground">~{(Number(mockStats.claimableUSDC) * 10).toFixed(0)}</p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                <RefreshCw className="h-6 w-6 text-warning" />
              </div>
              <p className="mt-2 text-sm font-medium">Stake</p>
              <p className="text-xs text-muted-foreground">Flexible</p>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={handleAutocompound}
            disabled={isAutocompounding || Number(mockStats.claimableUSDC) === 0}
          >
            {isAutocompounding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compounding...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Autocompound Rewards
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Swaps USDC for METRO and stakes as a flexible position
          </p>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {txStatus.status !== "idle" && (
        <div className="lg:col-span-2">
          <TransactionStatus status={txStatus} network="base" onClose={() => setTxStatus({ status: "idle" })} />
        </div>
      )}
    </div>
  )
}
