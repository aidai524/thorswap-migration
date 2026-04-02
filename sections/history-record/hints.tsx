export default function UnstakeHints() {
  return (
    <div
      className="flex items-start gap-3 rounded border border-[rgba(118,121,122,0.2)] bg-[#fff9e7] p-[14px]"
      role="status"
    >
      <div
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold leading-none text-white"
        aria-hidden
      >
        i
      </div>
      <div className="flex min-h-px min-w-0 flex-1 flex-col gap-1 pr-6">
        <p className="text-[14px] font-bold leading-[1.4] text-black">
          Unstaking takes 7 days, you will not receive rewards during this time.
        </p>
        <p className="text-[14px] font-normal leading-[1.4] text-[#111414]/75">
          Choose 'Claim & Stake' to immediately receive staked METRO (xMETRO)
          and rewards.
        </p>
      </div>
    </div>
  );
}
