"use client";

import { ChangeEventHandler, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Token } from "@/lib/types";

type TokenAmountPanelBase = {
  id: string;
  label?: string;
  balanceLabel: string;
  balanceValue: ReactNode;
  amountValue: string;
  amountPlaceholder?: string;
  maxDisabled?: boolean;
  token: Token;
  helper: ReactNode;
  className?: string;
};

export type TokenAmountPanelProps =
  | (TokenAmountPanelBase & {
      readonly: true;
    })
  | (TokenAmountPanelBase & {
      readonly?: false;
      onAmountChange: ChangeEventHandler<HTMLInputElement>;
      onMaxClick: () => void;
      onPercentageClick?: (percentage: number) => void;
      /** Label for the primary quick-fill control (default: Max). Hidden when readonly. */
      maxButtonLabel?: string;
    });

export function TokenAmountPanel(props: TokenAmountPanelProps) {
  const {
    id,
    label = "Amount",
    balanceLabel,
    balanceValue,
    amountValue,
    amountPlaceholder = "0.00",
    maxDisabled,
    token,
    helper,
    className
  } = props;

  const readonly = props.readonly === true;
  const onAmountChange = !readonly ? props.onAmountChange : undefined;
  const onMaxClick = !readonly ? props.onMaxClick : undefined;
  const onPercentageClick = !readonly ? props.onPercentageClick : undefined;
  const maxButtonLabel = !readonly
    ? (props.maxButtonLabel ?? "Max")
    : undefined;

  const [showPercentages, setShowPercentages] = useState(false);

  const handleMaxClick = () => {
    onMaxClick?.();
    setShowPercentages(true);
  };

  const displayAmount = amountValue || amountPlaceholder;

  return (
    <div
      className={cn(
        "rounded-[8px] px-[30px] py-[20px]",
        readonly ? "border border-[#111414]/10 bg-[#fff]" : "bg-[#D9D9D9]/20",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-[18px] font-semibold leading-[1.4] text-[#111414]"
        >
          {label}
        </Label>
        <div className="flex items-center gap-4">
          <span className="text-base leading-6 text-[#11141499]">
            {balanceLabel ? `${balanceLabel}:` : ""} {balanceValue}
          </span>
          {!readonly && (
            <div className="flex items-center gap-[6px]">
              <div
                className={cn(
                  "flex items-center gap-[6px] overflow-hidden transition-all duration-300 ease-out",
                  showPercentages
                    ? "translate-x-0 opacity-100"
                    : "max-w-0 translate-x-4 opacity-0 pointer-events-none"
                )}
              >
                {[25, 50, 75].map((percentage) => (
                  <Button
                    key={percentage}
                    variant="migrationSecondary"
                    size="sm"
                    onClick={() => onPercentageClick?.(percentage)}
                    disabled={maxDisabled}
                    className="h-8 px-3 text-base leading-[18px]"
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
              <Button
                variant="migrationSecondary"
                size="sm"
                onClick={handleMaxClick}
                disabled={maxDisabled}
                className="h-8 px-3 text-base leading-[18px]"
              >
                {maxButtonLabel}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        {readonly ? (
          <div
            id={id}
            className="min-w-0 flex-1 text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111414]"
          >
            {displayAmount}
          </div>
        ) : (
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            placeholder={amountPlaceholder}
            value={amountValue}
            onChange={onAmountChange}
            className="h-auto border-0 bg-transparent p-0 text-[48px] font-bold leading-[1.1] text-[#111414] shadow-none focus-visible:ring-0"
          />
        )}

        <div
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-[40px] px-2 py-2 pr-6 bg-[#111414]"
          )}
        >
          <img src={token.icon} alt={token.symbol} width={24} height={24} />
          <span
            className={cn(
              "text-xl font-semibold leading-[1.3] tracking-[0.04em] text-white"
            )}
          >
            {token.symbol}
          </span>
        </div>
      </div>

      <p className="text-base leading-6 text-[#11141499]">{helper}</p>
    </div>
  );
}
