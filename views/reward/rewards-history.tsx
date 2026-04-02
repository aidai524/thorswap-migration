"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, AlertCircle } from "lucide-react";
import useRewardsHistory from "@/hooks/use-rewards-history";
import { formatNumber } from "@/utils/format-number";
import { CURRENT_CHAIN } from "@/config/chains";

/**
 * Format transaction hash for display
 */
function formatTxHash(txHash: string): string {
  if (!txHash) return "";
  if (txHash.length <= 10) return txHash;
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string | number | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Get explorer URL for transaction hash
 */

function getExplorerUrl(txHash: string): string {
  return CURRENT_CHAIN?.blockExplorers?.default
    ? `${CURRENT_CHAIN.blockExplorers.default.url}/tx/${txHash}`
    : "";
}

export function RewardsHistory() {
  const {
    records,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    nextPage
  } = useRewardsHistory(10);
  const [loadedRecords, setLoadedRecords] = useState(records);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentPage <= 1) {
      setLoadedRecords(records);
      return;
    }

    setLoadedRecords((prev) => {
      if (!records.length) return prev;
      const merged = [...prev];
      const existed = new Set(
        prev.map((record, index) => record.id || record._id || `${index}`)
      );

      records.forEach((record, index) => {
        const key = record.id || record._id || `${currentPage}-${index}`;
        if (!existed.has(key)) {
          merged.push(record);
        }
      });

      return merged;
    });
  }, [records, currentPage]);

  const hasMore = useMemo(
    () => currentPage < totalPages && loadedRecords.length < total,
    [currentPage, totalPages, loadedRecords.length, total]
  );

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoading) {
          nextPage();
        }
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, nextPage]);

  return (
    <div className="bg-white p-[30px] mt-[30px]">
      <div className="text-[24px] text-[#111414] font-[600]">
        History({total})
      </div>
      <div className="flex flex-col gap-[8px] mt-3">
        {isLoading && loadedRecords.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Records list */}
        {!error && (
          <>
            <div className="space-y-2">
              {loadedRecords.length > 0
                ? loadedRecords.map((record, index) => {
                    // Map API response fields to display format
                    const txHash =
                      record.txHash || record.tx_hash || record.hash || "";
                    const amount = record.amount || record.reward_amount || "0";
                    const type =
                      record.category === 1
                        ? "claim"
                        : record.category === 2
                          ? "autocompounded"
                          : "compounded";
                    const date = record.tx_time ? record.tx_time * 1000 : "";
                    const typeLabel =
                      type === "claim"
                        ? "Claimed"
                        : type === "compounded"
                          ? "Compounded"
                          : "Autocompounded";
                    const typeBadgeClassName =
                      type === "claim"
                        ? "border-[#12B76A]/20 bg-[#12B76A]/10 text-[#067647]"
                        : type === "autocompounded"
                          ? "border-[#F79009]/20 bg-[#F79009]/10 text-[#B54708]"
                          : "border-[#7F56D9]/20 bg-[#7F56D9]/10 text-[#5925DC]";

                    return (
                      <div
                        key={record.id || record._id || index}
                        className="flex min-h-[68px] items-center justify-between rounded-[12px] border border-[#EAECF0] bg-white px-4 py-3 transition-colors hover:bg-[#F9FAFB]"
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          <img
                            src="/tokens/usdc.png"
                            alt="USDC"
                            className="w-4 h-4"
                          />
                          <p className="text-sm font-semibold text-[#111827]">
                            {formatNumber(amount, 2, true)} USDC
                          </p>
                          <Badge
                            variant="outline"
                            className={`h-6 w-fit rounded-full border px-2.5 text-[11px] font-medium capitalize ${typeBadgeClassName}`}
                          >
                            {typeLabel}
                          </Badge>
                          <p className="text-xs text-[#667085]">
                            {formatDate(date)}
                          </p>
                        </div>

                        <div className="ml-4 flex shrink-0 items-center gap-3">
                          {txHash && (
                            <a
                              href={getExplorerUrl(txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-[#475467] hover:text-primary hover:underline"
                            >
                              {formatTxHash(txHash)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                : !isLoading && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No reward history yet
                    </p>
                  )}
            </div>

            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-5">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Scroll to load more
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
