import type React from "react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { WalletProvider } from "@/contexts/wallet-context"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider>
      <div className="min-h-screen pb-20 md:pb-0">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
        <MobileNav />
      </div>
    </WalletProvider>
  )
}
