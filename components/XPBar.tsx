"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { getXP } from "@/lib/progress";

interface XPBarProps {
  profile: UserProfile;
}

export default function XPBar({ profile }: XPBarProps) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setXp(getXP(profile));
  }, [profile]);

  return (
    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
      <span className="text-sm">⭐</span>
      <span className="text-sm font-bold text-amber-700">{xp} XP</span>
    </div>
  );
}
