import { useState } from "react";
import api from "../api";

interface Props {
  sessionId: string;
  candidateName: string;
  onDone: () => void;
  onClose: () => void;
}

export default function TargetingModal({ sessionId, candidateName, onDone, onClose }: Props) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [postingText, setPostingText] = useState("");
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!company.trim() || !role.trim() || !postingText.trim()) {
      setError("Company, role, and job posting are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/deliverables/target", {
        session_id: sessionId,
        company: company.trim(),
        role: role.trim(),
        posting_text: postingText.trim(),
        include_cover_letter: includeCoverLetter,
      });
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Targeting failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-sheet shadow-[0_12px_40px_-12px_rgba(30,42,71,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule px-6 py-4">
          <div>
            <h2 className="font-serif text-xl text-ink">Tailor to a job</h2>
            <p className="text-sm text-slate">{candidateName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-slate hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-rule bg-sheet px-3 py-2 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="NetSuite Administrator"
                className="w-full rounded-lg border border-rule bg-sheet px-3 py-2 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Job posting <span className="font-normal text-slate">(paste full text)</span>
            </label>
            <textarea
              value={postingText}
              onChange={(e) => setPostingText(e.target.value)}
              rows={12}
              placeholder="Paste the full job posting here"
              className="w-full resize-none rounded-lg border border-rule bg-sheet px-3 py-2 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCoverLetter}
              onChange={(e) => setIncludeCoverLetter(e.target.checked)}
              className="h-4 w-4 rounded border-rule accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
            <span className="text-[15px] text-ink">Also generate a cover letter</span>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="border-t border-rule px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {loading ? "Generating tailored resume…" : "Generate tailored resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
