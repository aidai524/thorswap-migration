"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { ButtonWithApprove } from "@/components/button-with-approve";
import { TokenAmountPanel } from "@/components/common/token-amount-panel";
import { useWallet } from "@/contexts/wallet";
import useMigrationStore from "@/stores/use-migration";
import useMigrate from "@/hooks/use-migrate";
import useContractConfig from "@/hooks/use-migrate-contract-config";
import { ThorMigrationEscrow } from "@/config/contracts";
import { YThorPhaseConfig } from "@/config/migration";
import { formatNumber } from "@/utils/format-number";
import { YThorToken, MetroToken } from "@/config/tokens";
import Big from "big.js";
import { YThorMigrateConfirmDialog } from "@/views/vesting/ythor-migrate/ythor-migrate-confirm-dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Lock panel component for yTHOR vesting
 * Allows users to migrate yTHOR tokens to METRO
 */
export default function YThorLockPanel() {
  const { amount, yThorPhase, set } = useMigrationStore();
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

  // Fix token to yTHOR
  useEffect(() => {
    set({ token: "yTHOR" });
  }, [set]);

  const isWrongNetwork =
    account?.address && account.chainId !== YThorToken.chainId;

  const receiveAmount = useMemo(() => {
    if (!amount || !config) return "0";
    return Big(amount).mul(config.ratioYThor).toString();
  }, [amount, config]);

  const unlockDateLabel = useMemo(() => {
    const d = new Date();
    if (yThorPhase === "4Y") {
      d.setFullYear(d.getFullYear() + 4);
    }
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(d);
  }, [yThorPhase]);

  const conversionRateLabel = useMemo(() => {
    const r = config?.ratioYThor;
    if (!r) return "—";
    return `${formatNumber(r, 2, true)}× multiplier — 4-year cliff`;
  }, [config]);

  const openMigratePreview = async () => {
    await refetchConfig();
    setMigrateConfirmOpen(true);
  };

  const confirmMigrate = async () => {
    await refetchConfig();
    await migrate();
  };

  const errorMessage = amountError || migrationError;

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

  const lockPeriodLabel = yThorPhase
    ? YThorPhaseConfig[yThorPhase].lockDuration
    : "—";

  const vestingSteps = [
    `Your $METRO is locked for a 4-year cliff period`,
    `After the cliff, tokens unlock linearly over the following 3 years`,
    `Throughout the full period, your locked share earns yield you can harvest as USDC rewards`
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
      <div className="w-full max-w-[654px] p-[30px] pt-[20px] bg-white shadow-[0px_4px_0px_0px_#111414_inset] lg:w-[654px]">
        <div className="mb-[20px] flex items-center justify-between">
          <div className="text-[30px] font-[600]">yTHOR Migration</div>
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
          id="ythor-migrate-amount"
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
          id="ythor-migrate-receive"
          readonly
          label="You'll receive"
          balanceLabel=""
          balanceValue={`${config?.ratioYThor ?? "—"}× Multiplier (${lockPeriodLabel} lock)`}
          amountValue={`~${formatNumber(receiveAmount || 0, 2, true)}`}
          token={MetroToken}
          helper="~ $Estimated Value"
          className="mt-[20px]"
        />

        <div className="mt-[20px] flex items-center gap-3 rounded-[8px] py-4 text-sm">
          <div className="w-[55px] h-[55px] flex items-center justify-center shrink-0 rounded-full bg-[#F9F7F4]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0625 3C10.869 3 9.72443 3.47411 8.88052 4.31802C8.03661 5.16193 7.5625 6.30653 7.5625 7.5V10H16.5625V7.5C16.5625 6.30653 16.0884 5.16193 15.2445 4.31802C14.4006 3.47411 13.256 3 12.0625 3ZM4.5625 7.5V10H3.0625C2.51022 10 2.0625 10.4477 2.0625 11V23C2.0625 23.5523 2.51022 24 3.0625 24H21.0625C21.6148 24 22.0625 23.5523 22.0625 23V11C22.0625 10.4477 21.6148 10 21.0625 10H19.5625V7.5C19.5625 5.51088 18.7723 3.60322 17.3658 2.1967C15.9593 0.790176 14.0516 0 12.0625 0C10.0734 0 8.16572 0.790176 6.7592 2.1967C5.35268 3.60322 4.5625 5.51088 4.5625 7.5ZM14.0625 17C14.0625 18.1046 13.1671 19 12.0625 19C10.9579 19 10.0625 18.1046 10.0625 17C10.0625 15.8954 10.9579 15 12.0625 15C13.1671 15 14.0625 15.8954 14.0625 17Z"
                fill="#111414"
              />
            </svg>
          </div>
          <p className="leading-[1.5] text-[#111414]/80">
            Your METRO will be locked for{" "}
            <span className="font-semibold text-[#111414]">
              {lockPeriodLabel}
            </span>{" "}
            after migration. Rewards can still be claimed during this period.
          </p>
        </div>

        {errorMessage && (
          <div className="my-[20px] rounded-[8px] text-sm text-[#C63058]">
            {errorMessage}
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
            isWrongNetwork || isLoading || isConfigLoading || !!errorMessage
          }
          actionText="Vest"
        />
        <YThorMigrateConfirmDialog
          open={migrateConfirmOpen}
          onOpenChange={setMigrateConfirmOpen}
          ythorAmountLabel={formatNumber(amount || 0, 2, true)}
          metroAmountLabel={formatNumber(receiveAmount || 0, 2, true)}
          ythorPhase={yThorPhase}
          conversionRateLabel={conversionRateLabel}
          unlockDateLabel={unlockDateLabel}
          burnChainId={YThorToken.chainId}
          burnChainName={YThorToken.chainName}
          receiveChainId={MetroToken.chainId}
          receiveChainName={MetroToken.chainName}
          onConfirm={confirmMigrate}
          confirming={isLoading}
        />
      </div>

      <div className="w-full max-w-[650px] bg-white px-[38px] pb-[40px] pt-[20px] lg:w-[650px]">
        <div className="text-[32px] font-[700] leading-[110%]">
          Vesting converts your yTHOR into a locked share of $METRO.
        </div>
        <div className="mt-4 text-[18px] font-[600]">How vesting works</div>
        <ul className="mt-2 flex flex-col gap-1 text-[16px] text-[#111414]">
          {vestingSteps.map((step, index) => (
            <li key={index}>
              {index + 1}. {step}
            </li>
          ))}
        </ul>
        <div className="text-[16px] text-[#111414] mt-4">
          This migration is irreversible — once vested, you cannot return to
          yTHOR.
        </div>
      </div>
    </div>
  );
}
