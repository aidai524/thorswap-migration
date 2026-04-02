import useCountDown, { getTimePeriods } from "@/hooks/use-count-down";
import { OperationItem } from "./types";
import dayjs from "@/lib/dayjs";

export default function Time({
  data,
  timestamp
}: {
  data: OperationItem;
  timestamp: number;
}) {
  if (
    data.type === "unstakeRequest" ||
    data.type === "thorLock3m" ||
    data.type === "thorLock10m"
  ) {
    if (timestamp <= Date.now()) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.4417 1.33333H8.44174V2.69959C9.64947 2.8195 10.7625 3.26175 11.6933 3.93908L12.5037 3.12873L11.5752 2.20026C12.3752 1.40026 13.6418 1.40026 14.3751 2.20026C15.1751 3.00026 15.1751 4.26689 14.3751 5.00023L13.4465 4.07155L12.6895 4.82853C13.7776 6.01495 14.4417 7.5966 14.4417 9.33333C14.4417 13.0152 11.4569 16 7.77507 16C4.09316 16 1.1084 13.0152 1.1084 9.33333C1.1084 5.87643 3.73952 3.03407 7.10841 2.69959V1.33333H5.1084V0H10.4417V1.33333ZM7.10841 5.33333V9.33333C7.10841 9.70153 7.40687 10 7.77507 10H10.4417V8.66667H8.44174V5.33333H7.10841Z"
            fill="#111414"
          />
        </svg>
        <CountdownTimer endTime={timestamp} />
      </div>
    );
  }
  return <span>{dayjs(timestamp).format("MM/DD/YYYY HH:mm:ss")}</span>;
}

const CountdownTimer = ({ endTime }: { endTime: number }) => {
  const { secondsRemaining } = useCountDown(endTime / 1000);
  const timePeriods = getTimePeriods(secondsRemaining);
  const isWithinOneHour = secondsRemaining <= 60 * 60;

  if (!isWithinOneHour) {
    if (timePeriods.days > 0) {
      return <span>{timePeriods.days}d Left</span>;
    }
    if (timePeriods.hours > 0) {
      return <span>{timePeriods.hours}h Left</span>;
    }
    return <span>{Math.max(timePeriods.minutes, 1)}m Left</span>;
  }

  return (
    <span>
      {timePeriods.days > 0 ? `${timePeriods.days}d ` : ""}
      {timePeriods.hours > 0 ? `${timePeriods.hours}h ` : ""}
      {timePeriods.minutes > 0 ? `${timePeriods.minutes}m ` : ""}
      {timePeriods.seconds}s
    </span>
  );
};
