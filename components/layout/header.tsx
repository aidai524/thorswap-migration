"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet/wallet-button";
import { NetworkIndicator } from "@/components/wallet/network-indicator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  // { href: "/migrate", label: "Migrate" },
  { href: "/stake", label: "Stake", actives: ["/stake"] },
  {
    href: "/locked-metros",
    label: "Locked METROs",
    actives: [
      "/locked-metros",
      "/locked-metros/migrate",
      "/locked-metros/locked"
    ]
  },
  {
    href: "/vesting",
    label: "Vesting",
    actives: [
      "/vesting",
      "/vesting/team",
      "/vesting/ythor/migrate",
      "/vesting/ythor/schedules"
    ]
  }
  // { href: "/rewards", label: "Rewards" },
  // { href: "/history", label: "History" }
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-[#111414]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="METRO" width={166} height={24} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                item.actives?.includes(pathname)
                  ? "text-[#f6f6f6]"
                  : "text-[#F6F6F6]/50 hover:text-[#f6f6f6]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-2 sm:gap-3 text-[#F6F6F6]">
          <NetworkIndicator />
          <WalletButton />

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <nav className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      item.actives?.includes(pathname)
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
