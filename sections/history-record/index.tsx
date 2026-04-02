import { formatNumber } from "@/utils/format-number";
import { formatDuration } from "@/utils/format-time";
import { getOperationAmount, getOperationIcon } from "./helpers";
import { OperationItem } from "./types";
import HistoryRecordTag from "./tag";
import Time from "./time";
import { MetroToken } from "@/config/tokens";
import { getOperationUnlockTime } from "./helpers";

export default function HistoryRecord({ data }: { data: OperationItem }) {
  const isVesting =
    data.type === "yThorVesting" || data.type === "contributorVesting";
  const vestingData = isVesting ? data : null;
  const timestamp = getOperationUnlockTime(data);

  return (
    <div className="flex min-w-[280px] flex-col gap-2 overflow-hidden rounded-[8px] bg-white p-3 shadow-[inset_0px_0px_0px_1px_rgba(118,121,122,0.2)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={MetroToken.icon} alt="METRO" className="w-4 h-4" />
          <span className="font-semibold">
            {getOperationAmount(data)} METRO
          </span>
          {getOperationIcon(data)}

          <HistoryRecordTag data={data} timestamp={timestamp} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Time data={data} timestamp={timestamp} />
        </div>
      </div>
      {isVesting && vestingData && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Claimed: {formatNumber(vestingData.claimed, 2, true)} METRO
          </span>
          <span>Duration: {formatDuration(vestingData.duration)}</span>
        </div>
      )}
    </div>
  );
}
