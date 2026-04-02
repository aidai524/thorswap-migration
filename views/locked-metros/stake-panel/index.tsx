"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/contexts/wallet";
import { ButtonWithApprove } from "@/components/button-with-approve";
import { ChevronRight, Loader2 } from "lucide-react";
import { ThorToken, MetroToken } from "@/config/tokens";
import useMigrationStore from "@/stores/use-migration";
import useMigrate from "@/hooks/use-migrate";
import useContractConfig from "@/hooks/use-migrate-contract-config";
import { ThorMigrationEscrow } from "@/config/contracts";
import { ThorPhaseConfig } from "@/config/migration";
import { formatNumber } from "@/utils/format-number";
import Big from "big.js";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TokenAmountPanel } from "@/components/common/token-amount-panel";
import { MigrateConfirmDialog } from "@/views/locked-metros/migrate-confirm-dialog";

export function StakePanel() {
  const { amount, thorPhase, set } = useMigrationStore();
  const { account } = useWallet();
  const {
    config,
    isLoading: isConfigLoading,
    refetch: refetchConfig
  } = useContractConfig();
  const [migrateConfirmOpen, setMigrateConfirmOpen] = useState(false);

  const {
    migrate,
    isLoading,
    tokenBalance,
    selectedToken,
    amountError,
    migrationError,
    isTokenBalanceLoading
  } = useMigrate(config, () => {
    refetchConfig();
    setMigrateConfirmOpen(false);
  });

  const handleMaxMigrateAmount = () => {
    set({ amount: tokenBalance || "" });
  };

  const handleMigratePercentage = (percentage: number) => {
    if (!tokenBalance) return;
    const next = Big(tokenBalance)
      .mul(percentage)
      .div(100)
      .toFixed(18)
      .replace(/\.?0+$/, "");
    set({ amount: next });
  };

  // Fix token to THOR
  useEffect(() => {
    set({ token: "THOR" });
  }, [set]);

  const isWrongNetwork =
    account?.address && account.chainId !== ThorToken.chainId;

  const receiveAmount = useMemo(() => {
    if (!amount || !config) return "0";
    return Big(amount)
      .mul(thorPhase === "10M" ? config.ratio10M : config.ratio3M)
      .toString();
  }, [amount, thorPhase, config]);

  const overTime = !config?.isStarted;
  const is10MAvailable = useMemo(() => {
    if (!config || !amount) return false;
    const isNotExpired = !config.is10MExpired;
    const hasEnoughCap = Big(config.available10M || "0").gte(amount);
    return isNotExpired && hasEnoughCap;
  }, [config, amount]);

  // Auto switch to 10M if available
  useEffect(() => {
    if (is10MAvailable && thorPhase === "3M") {
      set({ thorPhase: "10M" });
    }
  }, [is10MAvailable, thorPhase, set]);

  const [displayedErrorMessage, setDisplayedErrorMessage] = useState<
    string | null
  >(null);
  const currentError = amountError || migrationError;

  useEffect(() => {
    if (currentError && !isConfigLoading) {
      const timer = setTimeout(() => {
        setDisplayedErrorMessage(currentError);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setDisplayedErrorMessage(null);
    }
  }, [currentError, isConfigLoading]);

  const openMigratePreview = async () => {
    await refetchConfig();
    setMigrateConfirmOpen(true);
  };

  const confirmMigrate = async () => {
    await refetchConfig();
    await migrate();
  };

  const unlockDateLabel = useMemo(() => {
    const months = thorPhase === "10M" ? 10 : 3;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(d);
  }, [thorPhase]);

  const conversionRateLabel = useMemo(() => {
    const r = thorPhase === "10M" ? config?.ratio10M : config?.ratio3M;
    if (!r) return "—";
    return `${formatNumber(r, 2, true)}× multiplier — starts immediately`;
  }, [thorPhase, config]);

  const migrationSteps = [
    `Approve and submit your THOR tokens on ${MetroToken.chainName}`,
    `Your tokens are burned on ${ThorToken.chainName} and METRO is minted on ${MetroToken.chainName}`,
    `METRO is automatically staked with the appropriate lock period`,
    `Start earning USDC rewards immediately`
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
      <div className="w-[654px] p-[30px] pt-[20px] bg-white shadow-[0px_4px_0px_0px_#111414_inset]">
        <div className="flex justify-between items-center mb-[20px]">
          <div className="text-[30px] font-[600]">Migrate → METRO</div>
          <Link
            href="/rewards"
            className={cn(
              buttonVariants({ variant: "migrationSecondary" }),
              "h-auto bg-white shrink-0 gap-1 px-[14px] py-[11px] text-base font-semibold leading-[18px] tracking-[0.48px] no-underline"
            )}
          >
            Claim Rewards
            <ChevronRight
              className="size-4 shrink-0 text-[#111414]/55"
              aria-hidden
            />
          </Link>
        </div>
        <TokenAmountPanel
          id="migrate-amount"
          balanceLabel="Balance"
          balanceValue={
            isTokenBalanceLoading ? (
              <Loader2 className="inline h-4 w-4 animate-spin" />
            ) : (
              formatNumber(tokenBalance || 0, 2, true)
            )
          }
          amountValue={amount ?? ""}
          onAmountChange={(e) => set({ amount: e.target.value })}
          onMaxClick={handleMaxMigrateAmount}
          onPercentageClick={handleMigratePercentage}
          maxDisabled={isTokenBalanceLoading || !tokenBalance}
          token={selectedToken}
          helper={<>$1,234</>}
        />
        <TokenAmountPanel
          id="migrate-receive-amount"
          readonly
          label="You'll receive"
          balanceLabel=""
          balanceValue={`${thorPhase === "10M" ? config?.ratio10M : config?.ratio3M}× Multiplier (${thorPhase === "10M" ? "10 Month" : "3 Month"} Lock)`}
          amountValue={`~${formatNumber(receiveAmount || 0, 2, true)}`}
          token={MetroToken}
          helper="~ $Estimated Value"
          className="mt-[20px]"
        />
        <div className="my-[20px]">
          <div className="text-[24px] font-[600]">Lock Period:</div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {Object.values(ThorPhaseConfig).map((phase) => {
              const isDisabled =
                overTime ||
                (phase.key === "10M" && config?.is10MExpired) ||
                (phase.key === "3M" && (config?.is3MExpired || is10MAvailable));

              const isSelected = !isDisabled && phase.key === thorPhase;

              return (
                <div
                  key={phase.key}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  className={cn(
                    "relative flex flex-col gap-[14px] rounded-[8px] p-[24px] transition-[box-shadow,opacity,border-color]",
                    isDisabled && "cursor-not-allowed opacity-50",
                    isSelected &&
                      "cursor-pointer border-2 border-[#111414] bg-[linear-gradient(0deg,rgba(210,_197,_185,_0.10)_0%,rgba(210,_197,_185,_0.10)_100%),#FFF] shadow-[0_4px_0_0_#111414]",
                    !isDisabled &&
                      !isSelected &&
                      "cursor-pointer border-2 border-transparent hover:shadow-[inset_0_0_0_1px_rgba(118,121,122,0.35)]"
                  )}
                  onClick={() => {
                    if (isDisabled) return;
                    set({ thorPhase: phase.key });
                  }}
                  onKeyDown={(e) => {
                    if (isDisabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      set({ thorPhase: phase.key });
                    }
                  }}
                >
                  {(isDisabled || !isSelected) && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[#D2C5B9]/10"
                    />
                  )}
                  <svg
                    className={cn(
                      "absolute right-6 top-6 z-[1] size-6 shrink-0 text-[#111414]",
                      !isSelected && "hidden"
                    )}
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_1_8518)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M24.0625 12C24.0625 18.6274 18.6899 24 12.0625 24C5.43508 24 0.0625 18.6274 0.0625 12C0.0625 5.37258 5.43508 0 12.0625 0C18.6899 0 24.0625 5.37258 24.0625 12ZM12.1232 17.0607L20.1232 9.06066L18.0018 6.93934L11.0625 13.8787L7.62316 10.4393L5.50184 12.5607L10.0018 17.0607C10.5876 17.6464 11.5374 17.6464 12.1232 17.0607Z"
                        fill="#111414"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_8518">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <div
                    className={cn(
                      "relative z-[1] pr-8 text-[#111414]",
                      !isDisabled && !isSelected && "opacity-50"
                    )}
                  >
                    <p className="text-[20px] font-bold leading-[1.5]">
                      {phase.lockDuration}
                    </p>
                    <p className="mt-0 text-[14.8px] font-normal leading-[1.4]">
                      {phase.description}
                    </p>
                    <p className="mt-4 text-[16px] leading-[1.4] font-[700]">
                      {phase.key === "10M" ? config?.ratio10M : config?.ratio3M}
                      × Multiplier
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {displayedErrorMessage && (
          <div className="my-[20px] rounded-[8px] text-sm text-[#C63058]">
            {displayedErrorMessage}
          </div>
        )}
        <ButtonWithApprove
          token={selectedToken}
          chainId={selectedToken.chainId}
          amount={amount || "0.000001"}
          spender={ThorMigrationEscrow}
          onAction={openMigratePreview}
          actionLoading={isLoading || isConfigLoading}
          actionDisabled={
            isWrongNetwork || isLoading || !!(amountError || migrationError)
          }
          actionText="Migrate"
        />
        <MigrateConfirmDialog
          open={migrateConfirmOpen}
          onOpenChange={setMigrateConfirmOpen}
          thorAmountLabel={formatNumber(amount || 0, 2, true)}
          metroAmountLabel={formatNumber(receiveAmount || 0, 2, true)}
          thorPhase={thorPhase}
          conversionRateLabel={conversionRateLabel}
          unlockDateLabel={unlockDateLabel}
          burnChainId={ThorToken.chainId}
          burnChainName={ThorToken.chainName}
          receiveChainId={MetroToken.chainId}
          receiveChainName={MetroToken.chainName}
          onConfirm={confirmMigrate}
          confirming={isLoading}
        />
      </div>

      <div className="w-[650px] bg-white px-[38px] pt-[20px] pb-[40px]">
        <div className="text-[32px] font-[700] w-[420px] leading-[110%]">
          Migrate your THOR tokens to METRO on {MetroToken.chainName}
        </div>
        <div className="text-[18px] font-[600] mt-4">How Migration Works</div>
        <ul className="text-[16px] mt-2 flex flex-col gap-2">
          {migrationSteps.map((step, index) => (
            <li key={index}>
              {index + 1}. {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
