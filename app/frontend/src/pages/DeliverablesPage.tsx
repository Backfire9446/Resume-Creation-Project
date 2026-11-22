import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth-context";
import DeliverableCard from "../components/DeliverableCard";

interface Deliverable {
  id: string;
  session_id: string;
  type: string;
  filename: string;
  created_at: string;
  candidate_name: string;
  target_role: string;
}

type GroupKey = string; // "Candidate Name — Target Role" or just "Target Role"

export default function DeliverablesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/deliverables")
      .then((res) => setDeliverables(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Targeted deliverable types
  const TARGETED_TYPES = new Set(["resume_targeted_md", "resume_targeted_docx", "cover_letter_md", "cover_letter_docx"]);

  // Extract company from targeted filename e.g. "Bruno_Rubio_Resume_Acme_Corp_NetSuite.md"
  function targetLabel(d: Deliverable): string {
    const match = d.filename.match(/Resume_(.+?)\.(md|docx)$/) ?? d.filename.match(/Cover_Letter_(.+?)\.(md|docx)$/);
    return match?.[1]?.replace(/_/g, " ") ?? "Targeted";
  }

  // Build ordered groups: key → deliverables[]
  const groups = deliverables.reduce<Map<GroupKey, Deliverable[]>>((acc, d) => {
    const baseKey =
      user?.role === "admin"
        ? `${d.candidate_name} — ${d.target_role}`
        : d.target_role;
    const key = TARGETED_TYPES.has(d.type) ? `${baseKey}: tailored for ${targetLabel(d)}` : baseKey;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(d);
    return acc;
  }, new Map());

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule bg-sheet px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="font-serif text-xl text-ink">Resume Chat</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAdmin ? "/admin" : "/chat")}
              className="rounded-lg px-2 py-1.5 text-sm text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {isAdmin ? "Back to admin" : "Back to interview"}
            </button>
            <button
              onClick={logout}
              className="rounded-lg px-1.5 py-1.5 text-sm text-slate hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h2 className="font-serif text-2xl text-ink">
          {isAdmin ? "All documents" : "Your documents"}
        </h2>
        <p className="mb-8 mt-1 text-[15px] text-slate">
          Preview or download your resume and supporting documents.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-ink border-t-transparent" />
          </div>
        ) : groups.size === 0 ? (
          <div className="py-12 text-center">
            <p className="font-serif text-2xl text-ink">No documents yet</p>
            <p className="mb-5 mt-2 text-[15px] text-slate">
              They appear here once your interview is complete.
            </p>
            {!isAdmin && (
              <button
                onClick={() => navigate("/chat")}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Back to interview
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(groups.entries()).map(([groupKey, items]) => (
              <section key={groupKey}>
                <h3 className="mb-3 font-serif text-[1.15rem] text-ink">
                  {groupKey}
                </h3>
                <div className="divide-y divide-rule rounded-xl border border-rule bg-sheet">
                  {items.map((d) => (
                    <DeliverableCard
                      key={d.id}
                      id={d.id}
                      type={d.type}
                      filename={d.filename}
                      created_at={d.created_at}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
