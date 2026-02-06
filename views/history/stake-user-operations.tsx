"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Lock, Clock, TrendingUp } from "lucide-react";
import useUserOperations, {
  type OperationItem
} from "@/hooks/use-user-operations";
import { formatUnits } from "viem";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "@/lib/dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function StakeUserOperations() {
  const { sortedOperations, isLoading, error } = useUserOperations();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="py-8 text-center text-destructive">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedOperations.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No operation history found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 pb-2">
          {sortedOperations.map((item, index) => {
            const isVesting =
              item.type === "yThorVesting" ||
              item.type === "contributorVesting";
            const vestingData = isVesting ? item.data : null;
            return <div />;
            // return <HistoryRecord key={`${item.type}-${index}`} data={item} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
