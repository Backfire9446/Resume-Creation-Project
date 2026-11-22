interface Candidate {
  id: string;
  name: string;
  username: string;
  created_at: string;
  session_id: string | null;
  session_status: string | null;
  session_phase: number | null;
  completed_sets: number;
}

const PHASE_NAMES = [
  "Profile",
  "Review",
  "Interview",
  "Resume",
  "Prep",
  "Skills",
  "Score",
];

interface Props {
  candidates: Candidate[];
  onDelete: (id: string) => void;
  onGenerateDeliverables: (id: string) => void;
  onTarget: (candidate: Candidate) => void;
}

const STATUS: Record<string, { label: string; dot: string }> = {
  active: { label: "Interviewing", dot: "bg-ink" },
  interview_complete: {
    label: "Ready for documents",
    dot: "bg-hl ring-2 ring-ink/20",
  },
  deliverables_generated: { label: "Documents ready", dot: "bg-done" },
};

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default function CandidateList({
  candidates,
  onDelete,
  onGenerateDeliverables,
  onTarget,
}: Props) {
  if (candidates.length === 0) {
    return (
      <p className="py-8 text-center text-slate">
        No candidates yet. Create one to get started.
      </p>
    );
  }

  const phaseOf = (c: Candidate) =>
    c.session_phase != null
      ? PHASE_NAMES[c.session_phase] ?? `Phase ${c.session_phase}`
      : "-";

  const actions = (c: Candidate) => (
    <>
      {c.session_status === "interview_complete" && c.session_id && (
        <button
          onClick={() => onGenerateDeliverables(c.session_id!)}
          className={`rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white hover:bg-ink/90 ${FOCUS}`}
        >
          Generate documents
        </button>
      )}
      {c.session_status === "deliverables_generated" && c.session_id && (
        <button
          onClick={() => onTarget(c)}
          className={`rounded-lg border border-rule px-3 py-1.5 text-sm font-medium text-ink hover:border-ink ${FOCUS}`}
        >
          Tailor to a job
        </button>
      )}
      <button
        onClick={() => onDelete(c.id)}
        aria-label={`Delete ${c.name}`}
        className={`rounded-lg px-2 py-1.5 text-sm text-danger hover:underline ${FOCUS}`}
      >
        Delete
      </button>
    </>
  );

  return (
    <>
      {/* Mobile: stacked rows */}
      <ul className="divide-y divide-rule sm:hidden">
        {candidates.map((c) => (
          <li key={c.id} className="px-4 py-4">
            <p className="font-semibold text-ink">{c.name}</p>
            <p className="text-sm text-slate">{c.username}</p>
            <div className="mt-2 text-[15px]">
              <StatusLabel status={c.session_status} />
              {c.completed_sets > 1 && (
                <p className="mt-0.5 text-xs text-slate">
                  {c.completed_sets} resume sets
                </p>
              )}
            </div>
            <p className="mt-1 text-sm text-slate">Phase: {phaseOf(c)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {actions(c)}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="border-b border-rule text-[13px] font-medium text-slate">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Phase</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-rule last:border-b-0">
                <td className="px-4 py-3 font-semibold text-ink">{c.name}</td>
                <td className="px-4 py-3 text-slate">{c.username}</td>
                <td className="px-4 py-3">{phaseOf(c)}</td>
                <td className="px-4 py-3">
                  <StatusLabel status={c.session_status} />
                  {c.completed_sets > 1 && (
                    <p className="mt-0.5 text-xs text-slate">
                      {c.completed_sets} resume sets
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {actions(c)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusLabel({ status }: { status: string | null }) {
  if (!status) return <span className="text-slate">-</span>;
  const s = STATUS[status] ?? {
    label: status.replace(/_/g, " "),
    dot: "bg-slate",
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}
