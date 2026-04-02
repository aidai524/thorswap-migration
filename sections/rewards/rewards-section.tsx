"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonWithAuth } from "@/components/button-with-auth";
import { xMetroToken } from "@/config/tokens";
import useClaimRewards from "@/hooks/use-claim-rewards";
import useRewardsBreakdown from "@/hooks/use-rewards-breakdown";
import { formatNumber } from "@/utils/format-number";
import { AutocompoundDialog } from "@/views/reward/autocompound-dialog";
import { AutoCompoundSection } from "@/sections/auto-compound";
import { cn } from "@/lib/utils";
import Big from "big.js";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, RefreshCw } from "lucide-react";

type Variant = "stake" | "rewards";

function LockBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(118,121,122,0.2)] bg-white px-2 py-0.5 text-xs leading-[1.4] text-[#111414]">
      {label}
    </span>
  );
}

function MetroLoader() {
  return <Loader2 className="size-4 animate-spin text-[rgba(17,20,20,0.35)]" />;
}

export function RewardsSection({
  variant,
  className
}: {
  variant: Variant;
  className?: string;
}) {
  const router = useRouter();
  const {
    claiming,
    claimableAmount,
    isLoadingClaimable,
    claimRewards,
    refreshClaimable
  } = useClaimRewards();
  const {
    stakedMetro,
    locked10m,
    locked3m,
    vestedMetro,
    isLoading: breakdownLoading,
    refresh: refreshBreakdown
  } = useRewardsBreakdown();

  const [showAutocompoundDialog, setShowAutocompoundDialog] = useState(false);

  const claimDisabled =
    claiming ||
    isLoadingClaimable ||
    !claimableAmount ||
    Big(claimableAmount || "0").lte(0);

  const handleClaimSuccess = async () => {
    await refreshClaimable();
    await refreshBreakdown();
  };

  const amountDisplay = isLoadingClaimable ? (
    <Loader2 className="size-10 animate-spin text-[#111414]" />
  ) : (
    formatNumber(claimableAmount || 0, 2, true)
  );

  const subtitle =
    variant === "stake"
      ? "Withdraw or compound your USDC rewards"
      : "Withdraw or re-invest your USDC rewards";

  const shellClass =
    variant === "stake"
      ? "w-full max-w-[530px] shrink-0 lg:w-[530px]"
      : "w-full max-w-[655px]";

  return (
    <>
      <section
        className={cn(
          "bg-white text-[#111414] shadow-[0px_4px_0px_0px_#111414,inset_0px_0px_0px_2px_#111414]",
          shellClass,
          className
        )}
      >
        {variant === "stake" ? (
          <div className="px-[30px] pb-6 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1 pr-2">
                <h2 className="text-2xl font-semibold leading-[1.3] tracking-tight text-[#111414]">
                  Your Rewards
                </h2>
                <p className="text-base leading-normal text-[rgba(17,20,20,0.6)]">
                  {subtitle}
                </p>
              </div>
              <Button
                type="button"
                variant="migrationSecondary"
                size="icon"
                className="size-12 shrink-0 rounded-[4px] border-0"
                aria-label="Open rewards history"
                onClick={() => {
                  router.push("/rewards");
                }}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <p className="mt-6 text-sm leading-[1.4] text-[#111414]">
              Available to claim
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[64px] font-semibold leading-[1.1] tracking-tight text-[#111414]">
                {amountDisplay}
              </span>
              <span className="text-[32px] font-light leading-[1.1] text-[#111414]">
                USDC
              </span>
            </div>

            <div className="mt-6 border-t border-[rgba(17,20,20,0.12)] pt-4">
              <div className="flex justify-between gap-4 text-xs uppercase tracking-[0.36px] text-[#111414]">
                <span>Type</span>
                <span>METRO</span>
              </div>
              <div className="mt-4 space-y-3 text-base">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[rgba(17,20,20,0.6)]">Staked</span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(stakedMetro, 2, true)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2 text-[rgba(17,20,20,0.6)]">
                    Locked <LockBadge label="10 Months" />
                  </span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(locked10m, 2, true)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2 text-[rgba(17,20,20,0.6)]">
                    Locked <LockBadge label="3 Months" />
                  </span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(locked3m, 2, true)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[rgba(17,20,20,0.6)]">Vested</span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(vestedMetro, 2, true)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <ButtonWithAuth
                chainId={xMetroToken.chainId}
                className="h-12 w-full rounded-[4px] px-4"
                onClick={claimRewards}
                loading={claiming}
                disabled={claimDisabled}
              >
                {claiming ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Claim Reward"
                )}
              </ButtonWithAuth>
              <Button
                type="button"
                variant="migrationSecondary"
                className="h-12 w-full rounded-[4px] px-4 tracking-[0.03em]"
                onClick={() => setShowAutocompoundDialog(true)}
              >
                Compound Reward
              </Button>
            </div>

            <p className="mt-4 text-center text-xs leading-[1.4] text-[#111414]">
              Rewards are paid in USDC on Base network
            </p>
          </div>
        ) : (
          <>
            <div className="px-[30px] pb-6 pt-5">
              <h2 className="text-2xl font-semibold leading-[1.3] tracking-tight text-[#111414]">
                Your Rewards
              </h2>
              <p className="mt-2 text-base leading-normal text-[rgba(17,20,20,0.6)]">
                {subtitle}
              </p>

              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm leading-[1.4] text-[#111414]">
                    Available to claim
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-[64px] font-semibold leading-[1.1] tracking-tight text-[#111414]">
                      {amountDisplay}
                    </span>
                    <span className="text-[32px] font-light leading-[1.1] text-[#111414]">
                      USDC
                    </span>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[205px]">
                  <ButtonWithAuth
                    chainId={xMetroToken.chainId}
                    variant="outline"
                    className="h-12 w-full rounded-[4px] border-2 border-[#111414] bg-transparent px-4 text-[#111414] shadow-none hover:bg-[rgba(17,20,20,0.04)]"
                    onClick={claimRewards}
                    loading={claiming}
                    disabled={claimDisabled}
                  >
                    {claiming ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Claim Reward"
                    )}
                  </ButtonWithAuth>
                  <Button
                    type="button"
                    variant="migrationSecondary"
                    className="h-12 w-full rounded-[4px] px-4 tracking-[0.03em]"
                    onClick={() => setShowAutocompoundDialog(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <g clipPath="url(#clip0_62_415)">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.4068 10.7072C13.0163 11.0976 12.3831 11.0976 11.9926 10.7072L9.3579 8.07244L10.7721 6.65823L11.7081 7.59424V4.33337C11.7081 3.78109 11.2604 3.33337 10.7081 3.33337H4.70809V1.33337H10.7081C12.365 1.33337 13.7081 2.67652 13.7081 4.33337V7.57744L14.6273 6.65823L16.0415 8.07244L13.4068 10.7072ZM2.6762 5.29293C3.06673 4.90241 3.6999 4.90241 4.09042 5.29293L6.7251 7.92764L5.31091 9.34184L4.37491 8.40584V11.6667C4.37491 12.219 4.82263 12.6667 5.37491 12.6667H11.3749V14.6667H5.37491C3.71806 14.6667 2.37491 13.3236 2.37491 11.6667V8.42264L1.45572 9.34184L0.0415039 7.92764L2.6762 5.29293Z"
                          fill="#111414"
                          fillOpacity="0.6"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_62_415">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-[rgba(17,20,20,0.6)]">Compound</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(17,20,20,0.12)] bg-[rgba(210,197,185,0.1)] px-[30px] py-4">
              <div className="space-y-2 text-base">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[rgba(17,20,20,0.6)]">
                    Staked METRO
                  </span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(stakedMetro, 2, true)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2 text-[rgba(17,20,20,0.6)]">
                    Locked METRO <LockBadge label="10 Months" />
                  </span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(locked10m, 2, true)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2 text-[rgba(17,20,20,0.6)]">
                    Locked METRO <LockBadge label="3 Months" />
                  </span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(locked3m, 2, true)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[rgba(17,20,20,0.6)]">
                    Vested METRO
                  </span>
                  <span className="font-bold text-[#111414]">
                    {breakdownLoading ? (
                      <MetroLoader />
                    ) : (
                      formatNumber(vestedMetro, 2, true)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <AutocompoundDialog
        open={showAutocompoundDialog}
        onOpenChange={setShowAutocompoundDialog}
        claimableAmount={claimableAmount}
        onSuccess={handleClaimSuccess}
      />
    </>
  );
}

export function RewardsPageBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("grid gap-6 lg:grid-cols-2 lg:items-stretch", className)}
    >
      <AutoCompoundSection
        variant="rewards"
        className="h-full justify-self-end lg:max-w-[655px]"
      />
      <RewardsSection variant="rewards" className="h-full" />
    </div>
  );
}
