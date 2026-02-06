"use client";

import { redirect } from "next/navigation";

export default function LockedMetrosPage() {
  return redirect("/locked-metros/lock");
}
