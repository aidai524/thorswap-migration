import { ButtonWithAuth } from "@/components/button-with-auth";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import useWithdraw from "@/views/stake/use-withdraw";
import HistoryRecord from "@/sections/history-record";
import { OperationItem } from "@/sections/history-record/types";
import { xMetroToken } from "@/config/tokens";
import { formatNumber } from "@/utils/format-number";
import Big from "big.js";

export default function UnstakeHistory({
  unstakeRequests,
  isLoading,
  error,
  refresh,
  withdrawableAmount
}: {
  unstakeRequests: OperationItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  withdrawableAmount: string;
}) {
  const { handleWithdraw, loading: isWithdrawing } = useWithdraw(() => {
    refresh();
  });
  const isDisabled =
    isLoading || !withdrawableAmount || Big(withdrawableAmount).lte(0);

  return (
    <div className="p-[30px] border-t border-[#242424]/20">
      <div className="flex items-center justify-between">
        <div className="text-[24px] font-[600] text-[#111414] leading-[24px]">
          History({unstakeRequests.length})
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Redeemable: {formatNumber(withdrawableAmount, 2, true)} METRO
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refresh()}
            disabled={isLoading}
            className="bg-[#D2C5B9]/25 rounded-[4px] border-none"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <div className="w-[90px]">
            <ButtonWithAuth
              chainId={xMetroToken.chainId}
              onClick={() => handleWithdraw()}
              loading={isLoading || isWithdrawing}
              disabled={isDisabled}
              variant="migrationSecondary"
              className="h-[36px] text-[#111414] shadow-none disabled:border-[#8D8D8D] disabled:bg-transparent disabled:text-[#8D8D8D]"
            >
              Claim
            </ButtonWithAuth>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8 ">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <div className="py-8 text-center text-destructive">Error: {error}</div>
      ) : unstakeRequests.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No unstake history found
        </div>
      ) : (
        <div className="flex flex-col gap-2 pb-2 mt-4">
          {unstakeRequests.map((item, index) => {
            return <HistoryRecord key={`${item.type}-${index}`} data={item} />;
          })}
        </div>
      )}
    </div>
  );
}
