import { useCallback, useEffect, useRef, useState } from "react";

import useIsWindowVisible from "./use-is-window-visible";

const getSecondsRemainingToNow = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  return Number.isFinite(timestamp) && timestamp > now ? timestamp - now : 0;
};

const accurateTimer = (callback: VoidFunction, time = 1000) => {
  let nextAt: number;
  let timeout: any;
  nextAt = Date.now() + time;
  const wrapper = () => {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - Date.now());
    callback?.();
  };
  const cancel = () => clearTimeout(timeout);
  timeout = setTimeout(wrapper, nextAt - Date.now());
  return { cancel };
};

/**
 * Consider this moving up to the global level
 */
const useCountdown = (timestamp: number) => {
  const timerCancelRef = useRef<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getSecondsRemainingToNow(timestamp)
  );
  const [isPaused, setIsPaused] = useState(false);
  const isWindowVisible = useIsWindowVisible();

  const pause = useCallback(() => setIsPaused(true), [setIsPaused]);
  const unpause = useCallback(() => setIsPaused(false), [setIsPaused]);

  useEffect(() => {
    let cancel: VoidFunction;
    if (!isPaused) {
      const { cancel: timerCancel } = accurateTimer(() => {
        setSecondsRemaining((prevSecondsRemaining) => {
          if (prevSecondsRemaining) {
            return prevSecondsRemaining - 1;
          }
          timerCancelRef.current?.();
          return prevSecondsRemaining;
        });
      });
      cancel = timerCancel;
      timerCancelRef.current = timerCancel;
    }

    return () => {
      cancel?.();
    };
  }, [isPaused, timestamp, setSecondsRemaining]);

  // Pause the timer if the tab becomes inactive to avoid it becoming out of sync
  useEffect(() => {
    if (isWindowVisible) {
      setSecondsRemaining(getSecondsRemainingToNow(timestamp));
      unpause();
    } else {
      pause();
    }
  }, [pause, unpause, timestamp, setSecondsRemaining, isWindowVisible]);

  return { secondsRemaining, pause, unpause };
};

export default useCountdown;

export const toTwo = (n: number) => (n < 10 ? "0" + n : String(n));
export const getTimePeriods = (seconds: number) => {
  const MINUTE_IN_SECONDS = 60;
  const HOUR_IN_SECONDS = 3600;
  const DAY_IN_SECONDS = 86400;
  let delta = Math.abs(seconds);
  const timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if (delta >= DAY_IN_SECONDS) {
    timeLeft.days = Math.floor(delta / DAY_IN_SECONDS);
    delta -= timeLeft.days * DAY_IN_SECONDS;
  }

  if (delta >= HOUR_IN_SECONDS) {
    timeLeft.hours = Math.floor(delta / HOUR_IN_SECONDS);
    delta -= timeLeft.hours * HOUR_IN_SECONDS;
  }

  if (delta >= MINUTE_IN_SECONDS) {
    timeLeft.minutes = Math.floor(delta / MINUTE_IN_SECONDS);
    delta -= timeLeft.minutes * MINUTE_IN_SECONDS;
  }

  timeLeft.seconds = Math.ceil(delta);

  return timeLeft;
};
