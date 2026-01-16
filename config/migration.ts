import type { ThorPhase, YThorPhase } from "@/lib/types";

export const ThorPhaseConfig: Record<
  ThorPhase,
  { key: ThorPhase; lockDuration: string; description: string }
> = {
  "10M": {
    key: "10M",
    lockDuration: "10 months",
    description: "Early migration with extended lock period"
  },
  "3M": {
    key: "3M",
    lockDuration: "3 months",
    description: "Standard migration period"
  }
};

export const YThorPhaseConfig: Record<
  YThorPhase,
  { key: YThorPhase; lockDuration: string; description: string }
> = {
  "4Y": {
    key: "4Y",
    lockDuration: "4 years",
    description: "4-year cliff with linear vesting"
  }
};

export const YThorContributorsConfig: Record<
  YThorPhase,
  { key: YThorPhase; lockDuration: string; description: string }
> = {
  "4Y": {
    key: "4Y",
    lockDuration: "4 years",
    description: "4-year cliff with linear vesting"
  }
};
