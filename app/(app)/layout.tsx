"use client";

import type React from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import WalletProvider from "@/contexts/wallet";
import useUserInfo from "@/hooks/use-user-info";
import { Toaster } from "@/components/ui/toaster";
import RPCSpeedIndicator from "@/sections/rpc";
import { ScrollToTop } from "@/components/scroll-to-top";

const Content = ({ children }: { children: React.ReactNode }) => {
  useUserInfo();
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <ScrollToTop />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <MobileNav />
      <Toaster />
      <RPCSpeedIndicator />
    </div>
  );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <Content>{children}</Content>
    </WalletProvider>
  );
}
