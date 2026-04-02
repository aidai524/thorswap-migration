"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MetroToken, xMetroToken } from "@/config/tokens";
import useAutocompoundGas from "@/hooks/use-autocompound-gas";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export interface StakeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Formatted METRO amount label (no symbol suffix) */
  metroAmountLabel: string;
  /** Formatted xMETRO amount label, or null if unknown */
  xMetroAmountLabel: string | null;
  isEstimatingXMetro: boolean;
  onConfirm: () => void | Promise<void>;
  confirming: boolean;
}

/**
 * Confirmation modal before executing a stake transaction.
 * Layout and styling follow the Staking / Migration Figma spec.
 */
export function StakeConfirmDialog({
  open,
  onOpenChange,
  metroAmountLabel,
  xMetroAmountLabel,
  isEstimatingXMetro,
  onConfirm,
  confirming
}: StakeConfirmDialogProps) {
  const { isAutocompoundEnabled } = useAutocompoundGas();

  const handleOpenChange = (next: boolean) => {
    if (!next && confirming) {
      return;
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          // flex column avoids a grid row hairline showing bg-background under the header
          "flex flex-col gap-0 overflow-hidden rounded-[4px] bg-white p-0",
          "sm:max-w-[550px] sm:rounded-[4px]"
        )}
        showCloseButton={true}
        onInteractOutside={(e) => {
          if (confirming) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader
          className={cn(
            "relative space-y-0 border-b-0 bg-white px-4 pb-2 pt-3 text-left shadow-none"
          )}
        >
          <DialogTitle className="border-b-0 pr-10 text-2xl font-semibold leading-[1.3] tracking-tight text-[#111414] shadow-none">
            Confirm Stake
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white px-6 pb-6 pt-2">
          <div className="flex items-start justify-center gap-4 px-2 pt-4 sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[4.5px]">
                <img
                  src={MetroToken.icon}
                  alt=""
                  className="size-10 object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold leading-[1.3] text-[#111414]">
                  {metroAmountLabel} {MetroToken.symbol}
                </p>
                <p className="text-base leading-normal text-[#111414]">
                  Will be staked
                </p>
              </div>
            </div>

            <ArrowRight className="mt-7 size-6 shrink-0 text-[rgba(17,20,20,0.4)]" />

            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[4.5px]">
                <img
                  src={xMetroToken.icon}
                  alt=""
                  className="size-10 object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="flex min-h-[31px] items-center justify-center text-2xl font-bold leading-[1.3] text-[#111414]">
                  {isEstimatingXMetro ? (
                    <Loader2 className="size-6 animate-spin text-[rgba(17,20,20,0.5)]" />
                  ) : (
                    <>
                      {xMetroAmountLabel ?? "—"} {xMetroToken.symbol}
                    </>
                  )}
                </p>
                <p className="text-base leading-normal text-[#111414]">
                  Staked METRO
                </p>
              </div>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-[rgba(17,20,20,0.12)]" />

          <div className="flex items-center gap-4 py-2">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-lg font-semibold leading-snug text-[#111414]">
                Auto-compound rewards
              </p>
              <p className="text-base leading-normal text-[rgba(17,20,20,0.6)]">
                Restake your rewards to earn more METRO
              </p>
            </div>
            <Switch
              checked={isAutocompoundEnabled}
              disabled
              className={cn(
                "pointer-events-none shrink-0 rounded-[12px] border-0 opacity-100 shadow-none outline-none",
                "data-[state=unchecked]:bg-[rgba(17,20,20,0.3)]",
                "data-[state=checked]:bg-[#24a148]",
                "h-6 w-12 p-[3px] [&_[data-slot=switch-thumb]]:size-[18px] [&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:ring-0 [&_[data-slot=switch-thumb]]:data-[state=checked]:!translate-x-[1.5rem] [&_[data-slot=switch-thumb]]:data-[state=unchecked]:!translate-x-0"
              )}
            />
          </div>

          <div className="mt-2 flex gap-3 rounded border border-[rgba(118,121,122,0.2)] bg-[#fff9e7] p-3.5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="min-w-0 space-y-1 pr-2 text-sm text-black">
              <p className="font-bold leading-snug">Unstaking takes 7 days</p>
              <p className="font-normal leading-normal">
                You will not receive rewards during this time.
              </p>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            className="mt-6 h-12 w-full rounded-[4px] text-base font-semibold tracking-[0.03em]"
            disabled={confirming || isEstimatingXMetro}
            onClick={() => void onConfirm()}
          >
            {confirming ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Confirm Stake
              </>
            ) : (
              "Confirm Stake"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
