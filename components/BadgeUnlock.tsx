"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Badge } from "@/lib/badges";

interface BadgeUnlockProps {
  badge: Badge | null;
  onDismiss: () => void;
}

const colorMap: Record<string, string> = {
  gold: "from-amber-400 to-yellow-300 border-amber-500",
  blue: "from-blue-500 to-blue-400 border-blue-600",
  red: "from-red-500 to-rose-400 border-red-600",
  green: "from-green-500 to-emerald-400 border-green-600",
};

export default function BadgeUnlock({ badge, onDismiss }: BadgeUnlockProps) {
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key={badge.id}
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" }}
        >
          <motion.div
            className={`bg-gradient-to-br ${colorMap[badge.color] ?? colorMap.blue} border-4 rounded-3xl p-8 flex flex-col items-center gap-3 shadow-2xl max-w-xs mx-4`}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: [0.75, 1.08, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl">{badge.emoji}</div>
            <div className="text-white font-bold text-2xl text-center" style={{ fontFamily: "var(--font-fredoka, Fredoka, sans-serif)" }}>
              {badge.name}
            </div>
            <div className="text-white/90 text-sm text-center">{badge.description}</div>
            <div className="text-white/70 text-xs mt-1">Tap to dismiss</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
