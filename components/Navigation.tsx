import Link from "next/link";

interface NavigationProps {
  showBack?: boolean;
  title?: string;
}

export default function Navigation({ showBack = true, title }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-60" />
      {showBack && (
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 active:scale-95 transition-all"
        >
          ← Accueil
        </Link>
      )}
      {title && (
        <h1 className="font-display text-xl font-semibold text-gray-800 flex-1 text-center">
          {title}
        </h1>
      )}
      {showBack && <div className="w-20" />}
    </nav>
  );
}
