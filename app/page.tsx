import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/brand/gorilla-mark.png"
          alt="Gorilla Enterprises"
          width={172}
          height={154}
          priority
          className="h-24 w-auto sm:h-28"
        />
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-4xl font-bold leading-none tracking-[-0.045em] text-ink-primary sm:text-5xl">
            Gorilla
          </span>
          <span className="font-body text-[13px] font-semibold uppercase tracking-[0.32em] text-ink-secondary">
            Enterprises
          </span>
        </div>
      </div>

      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
        July 2027 <span aria-hidden="true">·</span> Rwanda
      </span>
    </main>
  );
}
