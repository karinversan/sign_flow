import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 pb-8 pt-8">
      <div className="container rounded-2xl border border-white/10 bg-black/45 px-6 py-6 backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>
            <p className="font-accent text-sm tracking-[0.14em] text-foreground">SIGNFLOW</p>
            <p className="mt-1">Sign language translation interface prototype.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link className="hover:text-foreground" href="/about">
              About
            </Link>
            <Link className="hover:text-foreground" href="/docs">
              Docs
            </Link>
            <Link className="hover:text-foreground" href="/history">
              History
            </Link>
            <Link className="hover:text-foreground" href="/live">
              Realtime
            </Link>
            <Link className="hover:text-foreground" href="/upload">
              Video
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4 text-xs text-muted-foreground">
          © 2026 SignFlow.
        </div>
      </div>
    </footer>
  );
}
