import { formatNumber } from "@/utils/format-number";
import { formatDuration } from "@/utils/format-time";
import {
  getOperationAmount,
  getOperationIcon,
  getOperationLabel
} from "./helpers";
import { OperationItem } from "./types";
import Time from "./time";

export default function HistoryRecord({ data }: { data: OperationItem }) {
  const isVesting =
    data.type === "yThorVesting" || data.type === "contributorVesting";
  const vestingData = isVesting ? data : null;
  return (
    <div className="flex min-w-[280px] flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{getOperationAmount(data)}</span>
          {getOperationIcon(data)}
          <span className="text-xs text-muted-foreground">
            {getOperationLabel(data)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Time data={data} />
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
