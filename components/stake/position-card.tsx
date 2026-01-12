"use client"

import type { Position } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lock, Clock, Zap, RefreshCw, ArrowUpRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface PositionCardProps {
  position: Position
  onClaimRewards: (id: string) => void
  onAutocompound: (id: string) => void
  onRequestUnstake: (id: string) => void
}

export function PositionCard({ position, onClaimRewards, onAutocompound, onRequestUnstake }: PositionCardProps) {
  const now = new Date()
  const totalDuration = position.endDate.getTime() - position.startDate.getTime()
  const elapsed = now.getTime() - position.startDate.getTime()
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
  const isUnlocked = now >= position.endDate

  const typeConfig = {
    locked: {
      label: "Locked",
      color: "text-warning",
      bgColor: "bg-warning/10",
      icon: Lock,
    },
    vesting: {
      label: "Vesting",
      color: "text-primary",
      bgColor: "bg-primary/10",
      icon: Clock,
    },
    flexible: {
      label: "Flexible",
      color: "text-success",
      bgColor: "bg-success/10",
      icon: Zap,
    },
  }

  const config = typeConfig[position.type]
  const Icon = config.icon

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getRemainingTime = () => {
    if (isUnlocked) return "Unlocked"
    const remaining = position.endDate.getTime() - now.getTime()
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    if (days > 365) {
      const years = Math.floor(days / 365)
      const remainingDays = days % 365
      return `${years}y ${remainingDays}d remaining`
    }
    return `${days} days remaining`
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className={cn("rounded-lg p-2", config.bgColor)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <div>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>
        </div>
        {position.autocompound && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="gap-1 border-primary/50 text-primary">
                  <RefreshCw className="h-3 w-3" />
                  Auto
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Autocompound is enabled for this position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount */}
        <div>
          <p className="text-2xl font-semibold">{Number(position.amount).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">METRO staked</p>
        </div>

        {/* Progress */}
        {position.type !== "flexible" && (
          <div className="space-y-2">
            <ProgressBar
              value={progress}
              variant={isUnlocked ? "success" : "default"}
              label={getRemainingTime()}
              showPercentage={!isUnlocked}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(position.startDate)}</span>
              <span>{formatDate(position.endDate)}</span>
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <div>
            <p className="text-sm text-muted-foreground">Claimable Rewards</p>
            <p className="font-semibold text-success">${position.claimableRewards} USDC</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onClaimRewards(position.id)} className="gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Claim
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!position.autocompound && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => onAutocompound(position.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Autocompound
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable automatic reinvestment of rewards</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {position.type === "flexible" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => onRequestUnstake(position.id)}
            >
              Request Unstake
            </Button>
          )}

          {position.type !== "flexible" && !isUnlocked && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                    <Info className="mr-1 h-3 w-3" />
                    Locked
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Position is locked until {formatDate(position.endDate)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {position.type !== "flexible" && isUnlocked && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => onRequestUnstake(position.id)}
            >
              Request Unstake
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
