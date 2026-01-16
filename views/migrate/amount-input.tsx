"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  maxAmount: string;
  tokenSymbol: string;
}

export function AmountInput({
  value,
  onChange,
  maxAmount,
  tokenSymbol
}: AmountInputProps) {
  const handleMaxClick = () => {
    onChange(maxAmount);
  };

  const presets = [25, 50, 75, 100];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="number"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 pr-24 text-2xl font-medium"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMaxClick}
            className="cursor-pointer"
          >
            MAX
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {presets.map((percent) => (
          <Button
            key={percent}
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent cursor-pointer"
            onClick={() =>
              onChange(((Number(maxAmount) * percent) / 100).toString())
            }
            disabled={false}
          >
            {percent}%
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Available</span>
        <span className="font-medium">
          {Number(maxAmount).toLocaleString()} {tokenSymbol}
        </span>
      </div>
    </div>
  );
}
