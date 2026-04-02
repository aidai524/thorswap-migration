"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MetroToken, YThorToken } from "@/config/tokens";
import { getChainIconPath } from "@/config/chain-icons";
import { YThorPhaseConfig } from "@/config/migration";
import type { YThorPhase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

export interface YThorMigrateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ythorAmountLabel: string;
  metroAmountLabel: string;
  ythorPhase: YThorPhase;
  conversionRateLabel: string;
  unlockDateLabel: string;
  burnChainId: number;
  burnChainName: string;
  receiveChainId: number;
  receiveChainName: string;
  onConfirm: () => void | Promise<void>;
  confirming: boolean;
}

/**
 * Preview / confirmation modal before executing yTHOR → locked METRO vesting.
 * Layout mirrors locked-metros MigrateConfirmDialog.
 */
export function YThorMigrateConfirmDialog({
  open,
  onOpenChange,
  ythorAmountLabel,
  metroAmountLabel,
  ythorPhase,
  conversionRateLabel,
  unlockDateLabel,
  burnChainId,
  burnChainName,
  receiveChainId,
  receiveChainName,
  onConfirm,
  confirming
}: YThorMigrateConfirmDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const burnIconSrc = getChainIconPath(burnChainId);
  const receiveIconSrc = getChainIconPath(receiveChainId);

  useEffect(() => {
    if (open) {
      setAcknowledged(false);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next && confirming) {
      return;
    }
    onOpenChange(next);
  };

  const lockLabel = YThorPhaseConfig[ythorPhase].lockDuration;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
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
            Confirm Migration
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white px-6 pb-6 pt-2">
          <div className="flex items-start justify-center gap-4 px-2 pt-4 sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[4.5px]">
                <img
                  src={YThorToken.icon}
                  alt=""
                  className="size-10 object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold leading-[1.3] text-[#111414]">
                  {ythorAmountLabel} {YThorToken.symbol}
                </p>
                <p className="text-base leading-normal text-[#111414]">
                  Will be burned
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-[rgba(118,121,122,0.2)] bg-white px-2 py-2">
                {burnIconSrc ? (
                  <img
                    src={burnIconSrc}
                    alt=""
                    className="size-4 shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <span className="text-xs leading-[1.4] text-[#111414]">
                  {burnChainName}
                </span>
              </div>
            </div>

            <ArrowRight className="mt-7 size-6 shrink-0 text-[rgba(17,20,20,0.4)]" />

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
                  Receive Locked METRO
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-[rgba(118,121,122,0.2)] bg-white px-2 py-2">
                {receiveIconSrc ? (
                  <img
                    src={receiveIconSrc}
                    alt=""
                    className="size-4 shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <span className="text-xs leading-[1.4] text-[#111414]">
                  {receiveChainName}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-[rgba(118,121,122,0.2)]">
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(118,121,122,0.2)] px-4 py-3.5">
              <p className="shrink-0 text-base leading-[1.5] text-[rgba(17,20,20,0.6)]">
                Lock period
              </p>
              <p className="text-base font-bold leading-[1.5] text-[#111414]">
                {lockLabel}
              </p>
            </div>
            <div className="flex items-center justify-between border-b border-[rgba(118,121,122,0.2)] px-4 py-3.5 text-base leading-[1.5]">
              <p className="text-[rgba(17,20,20,0.6)]">Unlocks on</p>
              <p className="font-bold text-[#111414]">{unlockDateLabel}</p>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 text-base leading-[1.5]">
              <p className="shrink-0 text-[rgba(17,20,20,0.6)]">
                Conversion rate
              </p>
              <p className="min-w-0 text-right font-bold text-[#111414]">
                {conversionRateLabel}
              </p>
            </div>
          </div>

          <label
            htmlFor="ythor-migrate-irreversible-ack"
            className="mt-6 flex cursor-pointer items-center gap-3 rounded border border-[#d9d9d9] bg-[#fff9e7] p-3.5"
          >
            <Checkbox
              id="ythor-migrate-irreversible-ack"
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              disabled={confirming}
              className={cn(
                "mt-0.5 size-6 shrink-0 rounded-[4px] border-[rgba(17,20,20,0.35)]",
                "data-[state=checked]:border-[#111414] data-[state=checked]:bg-[#111414]",
                "data-[state=checked]:text-white"
              )}
            />
            <span className="text-sm font-bold leading-snug text-black">
              I understand this migration is irreversible
            </span>
          </label>

          <Button
            variant="default"
            size="lg"
            className="mt-4 h-12 w-full rounded-[4px] bg-[#242424] text-base font-semibold tracking-[0.03em] text-[#f9f7f4] hover:bg-[#242424]/90"
            disabled={confirming || !acknowledged}
            onClick={() => void onConfirm()}
          >
            {confirming ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Vest yTHOR & Confirm
              </>
            ) : (
              "Vest yTHOR & Confirm"
            )}
          </Button>

          <p className="mt-4 px-1 text-center text-sm font-normal leading-[1.4] text-black">
            By confirming, you authorise the burn of {ythorAmountLabel}{" "}
            {YThorToken.symbol} on {burnChainName}.
            <br />
            This transaction is final and cannot be reversed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
