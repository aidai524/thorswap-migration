export default function UnstakeHints() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex text-black h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-500">
        !
      </div>
      <p className="text-sm leading-relaxed text-amber-400">
        Unstaking takes 7 days, you will not receive rewards during this time.
      </p>
    </div>
  );
}
