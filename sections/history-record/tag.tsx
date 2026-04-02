import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { OperationItem } from "./types";
import { useMemo } from "react";

function Tag({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-[4px] border border-solid border-[rgba(118,121,122,0.2)] bg-white px-2 py-[3px] text-[12px] font-normal leading-[1.4] tracking-normal text-[#111414] whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default function HistoryRecordTag({
  data,
  timestamp
}: {
  data: OperationItem;
  timestamp: number;
}) {
  const text = useMemo(() => {
    if (data.type === "contributorVesting") {
      return "Vesting in progress";
    }
    if (data.type === "yThorVesting") {
      return "Vesting in progress";
    }
    if (data.type === "unstakeRequest") {
      return data?.widthdrawed
        ? "Staking Complete"
        : timestamp <= Date.now()
          ? "Redeemable"
          : "Staking in progress";
    }
    if (data.type === "thorLock3m" || data.type === "thorLock10m") {
      return data.type === "thorLock3m" ? "3 Month Lock" : "10 Month Lock";
    }
  }, [data, timestamp]);
  return (
    <>
      {timestamp <= Date.now() &&
        (data.type === "thorLock3m" || data.type === "thorLock10m") && (
          <Tag className="flex items-center gap-1">
            <span>{data.widthdrawed ? "Claimed" : "Redeemable"}</span>
          </Tag>
        )}
      <Tag className="flex items-center gap-1">
        {(data.type === "thorLock3m" || data.type === "thorLock10m") &&
          timestamp > Date.now() && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.04167 2C7.246 2 6.48295 2.31607 5.92035 2.87868C5.35774 3.44129 5.04167 4.20435 5.04167 5V6.66667H11.0417V5C11.0417 4.20435 10.7256 3.44129 10.163 2.87868C9.6004 2.31607 8.83733 2 8.04167 2ZM3.04167 5V6.66667H2.04167C1.67348 6.66667 1.375 6.96513 1.375 7.33333V15.3333C1.375 15.7015 1.67348 16 2.04167 16H14.0417C14.4099 16 14.7083 15.7015 14.7083 15.3333V7.33333C14.7083 6.96513 14.4099 6.66667 14.0417 6.66667H13.0417V5C13.0417 3.67392 12.5149 2.40215 11.5772 1.46447C10.6395 0.526784 9.36773 0 8.04167 0C6.7156 0 5.44381 0.526784 4.50613 1.46447C3.56845 2.40215 3.04167 3.67392 3.04167 5ZM9.375 11.3333C9.375 12.0697 8.77807 12.6667 8.04167 12.6667C7.30527 12.6667 6.70833 12.0697 6.70833 11.3333C6.70833 10.5969 7.30527 10 8.04167 10C8.77807 10 9.375 10.5969 9.375 11.3333Z"
                fill="#111414"
                fillOpacity="0.6"
              />
            </svg>
          )}
        {text}
      </Tag>
    </>
  );
}
