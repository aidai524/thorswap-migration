"use client";

import { useWallet } from "@/contexts/wallet";
import useAutocompound from "@/hooks/use-autocompound";
import useAutocompoundGas from "@/hooks/use-autocompound-gas";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "stake" | "rewards";

export function AutoCompoundSection({
  variant,
  className
}: {
  variant: Variant;
  className?: string;
}) {
  const { account } = useWallet();
  const { refreshBalance, isAutocompoundEnabled, setIsAutocompoundEnabled } =
    useAutocompoundGas();

  const { isEnabling, isDisabling, enableAutocompound, disableAutocompound } =
    useAutocompound(async (enabled: boolean) => {
      await refreshBalance();
      setIsAutocompoundEnabled(enabled);
    });

  const busy = isEnabling || isDisabling;
  const switchDisabled = !account || busy;

  const handleToggle = (checked: boolean) => {
    if (checked) void enableAutocompound();
    else void disableAutocompound();
  };

  return (
    <section
      className={cn(
        "bg-white text-[#111414] flex flex-col",
        variant === "stake" && "w-full max-w-[530px] shrink-0 lg:w-[530px]",
        variant === "rewards" &&
          "w-full max-w-[655px] shadow-[inset_0px_4px_0px_0px_#111414]",
        className
      )}
    >
      <div
        className={cn(
          "px-[30px]",
          variant === "rewards" && "pt-8 pb-8",
          variant === "stake" && "pt-6 pb-4"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2 pr-2">
            <h2 className="text-2xl font-semibold leading-[1.3] tracking-tight text-[#111414]">
              Auto Compounding
            </h2>
            <p className="max-w-[335px] text-[16px] leading-normal text-[rgba(17,20,20,0.6)]">
              Restake your rewards to earn more METRO
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 pt-1">
            {busy ? (
              <Loader2 className="size-5 animate-spin text-[rgba(17,20,20,0.5)]" />
            ) : null}
            <Switch
              checked={isAutocompoundEnabled}
              onCheckedChange={handleToggle}
              disabled={switchDisabled}
              className={cn(
                "cursor-pointer shrink-0 rounded-[12px] border-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-[#111414]/20",
                "data-[state=unchecked]:bg-[rgba(17,20,20,0.3)]",
                "data-[state=checked]:bg-[#24a148]",
                "h-6 w-12 p-[3px] [&_[data-slot=switch-thumb]]:size-[18px] [&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:ring-0 [&_[data-slot=switch-thumb]]:data-[state=checked]:!translate-x-[1.5rem] [&_[data-slot=switch-thumb]]:data-[state=unchecked]:!translate-x-0"
              )}
            />
            <span className="min-w-[4.5rem] pt-0.5 text-sm leading-[18px] tracking-[0.16px] text-[#161616]">
              {isAutocompoundEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "px-[30px] pb-8 pt-6 border-t border-[rgba(17,20,20,0.12)] flex-1 flex flex-col items-center justify-center"
        )}
      >
        <img src="/auto-compound.png" />
      </div>
    </section>
  );
}
