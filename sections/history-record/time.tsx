import useCountDown, { getTimePeriods } from "@/hooks/use-count-down";
import { Lock } from "lucide-react";
import { OperationItem } from "./types";
import { getOperationUnlockTime } from "./helpers";
import dayjs from "@/lib/dayjs";

export default function Time({ data }: { data: OperationItem }) {
  const timestamp = getOperationUnlockTime(data);

  if (
    data.type === "unstakeRequest" ||
    data.type === "thorLock3m" ||
    data.type === "thorLock10m"
  ) {
    if (timestamp <= Date.now()) {
      return !data.widthdrawed ? (
        <span className="text-green-500">Withdrawable</span>
      ) : (
        <span className="text-red-500">Withdrawed</span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Lock className="h-3 w-3 text-muted-foreground" />
        <CountdownTimer endTime={timestamp} />
      </div>
    );
  }
  return (
    <span>
      {dayjs(getOperationUnlockTime(data)).format("MM/DD/YYYY HH:mm:ss")}
    </span>
  );
}

const CountdownTimer = ({ endTime }: { endTime: number }) => {
  const { secondsRemaining } = useCountDown(endTime / 1000);
  const timePeriods = getTimePeriods(secondsRemaining);
  return (
    <span>
      {timePeriods.days > 0 ? `${timePeriods.days}d ` : ""}
      {timePeriods.hours > 0 ? `${timePeriods.hours}h ` : ""}
      {timePeriods.minutes > 0 ? `${timePeriods.minutes}m ` : ""}
      {timePeriods.seconds}s
    </span>
  );
};
