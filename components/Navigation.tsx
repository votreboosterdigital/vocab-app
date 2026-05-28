import Link from "next/link";

interface NavigationProps {
  showBack?: boolean;
  title?: string;
}

export default function Navigation({ showBack = true, title }: NavigationProps) {
  return (
    <nav className="flex items-center gap-4 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
      {showBack && (
        <Link
          href="/"
          className="flex items-center gap-1 text-primary font-semibold text-sm hover:opacity-70 transition-opacity"
        >
          ← Accueil
        </Link>
      )}
      {title && (
        <h1 className="font-display text-lg text-gray-800 font-semibold flex-1 text-center">
          {title}
        </h1>
      )}
      {showBack && <div className="w-16" />}
    </nav>
  );
}
