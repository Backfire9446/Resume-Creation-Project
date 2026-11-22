const PHASES = [
  "Profile",
  "Review",
  "Interview",
  "Resume",
  "Prep",
  "Skills",
  "Score",
];

interface Props {
  currentPhase: number;
}

const HIGHLIGHT = {
  backgroundImage:
    "linear-gradient(transparent 55%, #FFE36E 55%, #FFE36E 92%, transparent 92%)",
  padding: "0 0.15em",
} as const;

export default function PhaseIndicator({ currentPhase }: Props) {
  const idx = Math.min(Math.max(currentPhase, 0), PHASES.length - 1);
  const pct = ((idx + 1) / PHASES.length) * 100;

  return (
    <nav aria-label="Interview progress" className="border-b border-rule bg-sheet">
      {/* Mobile */}
      <div className="px-4 py-2.5 sm:hidden">
        <p className="text-sm text-ink">
          Step {idx + 1} of {PHASES.length}:{" "}
          <span className="font-semibold">{PHASES[idx]}</span>
        </p>
        <div className="mt-2 h-[3px] w-full bg-rule">
          <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center justify-center gap-0 px-4 py-3 sm:flex">
        {PHASES.map((name, i) => {
          const isActive = i === currentPhase;
          const isDone = i < currentPhase;
          return (
            <li
              key={name}
              className="flex items-center text-sm"
              aria-current={isActive ? "step" : undefined}
            >
              {i > 0 && <span className="mx-3 h-px w-8 bg-rule" aria-hidden="true" />}
              {isActive ? (
                <span className="font-semibold text-ink" style={HIGHLIGHT}>
                  {name}
                </span>
              ) : isDone ? (
                <span className="flex items-center gap-1 text-slate">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 text-done"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 8.5l3.2 3L13 4.5" />
                  </svg>
                  {name}
                </span>
              ) : (
                <span className="text-slate/60">{name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
