import { MigrationForm } from "@/components/migrate/migration-form"

export default function MigratePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">THOR → METRO Migration</h1>
        <p className="mt-2 text-muted-foreground">Migrate your THOR or yTHOR tokens from Ethereum to METRO on Base</p>
      </div>

      <MigrationForm />
    </div>
  )
}
