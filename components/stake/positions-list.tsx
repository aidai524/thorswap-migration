"use client"

import { useState } from "react"
import { mockPositions, mockUnstakeRequests } from "@/lib/mock-data"
import { PositionCard } from "./position-card"
import { UnstakeQueue } from "./unstake-queue"
import { useWallet } from "@/contexts/wallet-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PositionsList() {
  const { wallet, setTxStatus } = useWallet()
  const [positions] = useState(mockPositions)
  const [unstakeRequests] = useState(mockUnstakeRequests)

  const handleClaimRewards = (id: string) => {
    setTxStatus({ status: "pending", message: "Claiming rewards..." })
    setTimeout(() => {
      setTxStatus({
        status: "confirmed",
        hash: "0x" + Math.random().toString(16).slice(2, 66),
        message: "Rewards claimed successfully",
      })
    }, 2000)
  }

  const handleAutocompound = (id: string) => {
    setTxStatus({ status: "pending", message: "Enabling autocompound..." })
    setTimeout(() => {
      setTxStatus({
        status: "confirmed",
        hash: "0x" + Math.random().toString(16).slice(2, 66),
        message: "Autocompound enabled",
      })
    }, 2000)
  }

  const handleRequestUnstake = (id: string) => {
    setTxStatus({ status: "pending", message: "Requesting unstake..." })
    setTimeout(() => {
      setTxStatus({
        status: "confirmed",
        hash: "0x" + Math.random().toString(16).slice(2, 66),
        message: "Unstake request submitted. 14-day cooldown started.",
      })
    }, 2000)
  }

  const handleWithdraw = (id: string) => {
    setTxStatus({ status: "pending", message: "Withdrawing METRO..." })
    setTimeout(() => {
      setTxStatus({
        status: "confirmed",
        hash: "0x" + Math.random().toString(16).slice(2, 66),
        message: "METRO withdrawn successfully",
      })
    }, 2000)
  }

  if (!wallet.connected) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Connect your wallet to view your staking positions</p>
      </div>
    )
  }

  const lockedPositions = positions.filter((p) => p.type === "locked")
  const vestingPositions = positions.filter((p) => p.type === "vesting")
  const flexiblePositions = positions.filter((p) => p.type === "flexible")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Positions ({positions.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedPositions.length})</TabsTrigger>
          <TabsTrigger value="vesting">Vesting ({vestingPositions.length})</TabsTrigger>
          <TabsTrigger value="flexible">Flexible ({flexiblePositions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onClaimRewards={handleClaimRewards}
                onAutocompound={handleAutocompound}
                onRequestUnstake={handleRequestUnstake}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedPositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onClaimRewards={handleClaimRewards}
                onAutocompound={handleAutocompound}
                onRequestUnstake={handleRequestUnstake}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vesting" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vestingPositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onClaimRewards={handleClaimRewards}
                onAutocompound={handleAutocompound}
                onRequestUnstake={handleRequestUnstake}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flexible" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flexiblePositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onClaimRewards={handleClaimRewards}
                onAutocompound={handleAutocompound}
                onRequestUnstake={handleRequestUnstake}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Unstake Queue */}
      <UnstakeQueue requests={unstakeRequests} onWithdraw={handleWithdraw} />
    </div>
  )
}
