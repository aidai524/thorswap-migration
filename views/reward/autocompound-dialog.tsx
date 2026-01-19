"use client";

import { Button } from "@/components/ui/button";
import { ButtonWithAuth } from "@/components/button-with-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { xMetroToken } from "@/config/tokens";
import {
  ArrowRight,
  DollarSign,
  Loader2,
  RefreshCw,
  Coins
} from "lucide-react";
import { formatNumber } from "@/lib/format-number";
import useAutocompoundOnce from "@/hooks/use-autocompound-once";
import { useEffect } from "react";
import Big from "big.js";

interface AutocompoundDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  claimableAmount: string;
}

export function AutocompoundDialog({
  open,
  onOpenChange,
  claimableAmount
}: AutocompoundDialogProps) {
  const {
    autocompounding,
    estimatedMetroAmount,
    isEstimatingMetro,
    autocompound,
    estimateMetroAmount
  } = useAutocompoundOnce({
    onSuccess() {
      onOpenChange(false);
    }
  });

  const handleSkip = () => {
    onOpenChange(false);
  };

  // Estimate METRO amount when claimedAmount changes
  useEffect(() => {
    if (Big(claimableAmount || "0").gt(0) && open) {
      estimateMetroAmount();
    }
  }, [claimableAmount, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !autocompounding) {
      handleSkip();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Continue Autocompound?</DialogTitle>
          <DialogDescription>
            Swap claimed USDC rewards to METRO and stake automatically
          </DialogDescription>
        </DialogHeader>

        {/* Flow Visualization */}
        <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <p className="mt-2 text-sm font-medium">USDC</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {claimableAmount ? formatNumber(claimableAmount, 2, true) : "0"}
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-2 text-sm font-medium">METRO</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isEstimatingMetro ? (
                <Loader2 className="mx-auto h-3 w-3 animate-spin" />
              ) : estimatedMetroAmount ? (
                formatNumber(estimatedMetroAmount, 4, true)
              ) : (
                "-"
              )}
            </p>
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

        <DialogFooter className="gap-[20px]">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={autocompounding}
            className="cursor-pointer"
          >
            Later
          </Button>
          <div>
            <ButtonWithAuth
              chainId={xMetroToken.chainId}
              onClick={() => {
                if (estimatedMetroAmount) {
                  autocompound(claimableAmount);
                }
              }}
              loading={autocompounding || isEstimatingMetro}
              disabled={
                autocompounding ||
                isEstimatingMetro ||
                !estimatedMetroAmount ||
                !claimableAmount
              }
            >
              {autocompounding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Autocompound"
              )}
            </ButtonWithAuth>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
