import { useState } from "react";
import api from "../api";

interface GeneratedProfile {
  slug: string;
  name: string;
  industry: string;
  target_roles: string;
}

interface Props {
  onCreated: (profile: GeneratedProfile) => void;
  onClose: () => void;
}

export default function GenerateProfileModal({ onCreated, onClose }: Props) {
  const [roleName, setRoleName] = useState("");
  const [industry, setIndustry] = useState("");
  const [tools, setTools] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!roleName.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post("/admin/profiles/generate", {
        role_name: roleName.trim(),
        industry: industry.trim(),
        must_have_tools: tools.trim(),
      });
      onCreated(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Generation failed. Try again.";
      setError(msg);
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg rounded-xl bg-sheet p-6 shadow-[0_12px_40px_-12px_rgba(30,42,71,0.35)]">
        <h2 className="mb-1 font-serif text-xl text-ink">
          Generate profile
        </h2>
        <p className="mb-5 text-[15px] text-slate">
          Claude will search for current job postings and build a skills profile
          for the target role. This takes 30–60 seconds.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Target role <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              disabled={generating}
              className="w-full rounded-lg border border-rule bg-sheet px-3 py-2 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-paper"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Industry{" "}
              <span className="font-normal text-slate">(optional)</span>
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. SaaS / B2B Technology"
              disabled={generating}
              className="w-full rounded-lg border border-rule bg-sheet px-3 py-2 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-paper"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Must-have tools / certs{" "}
              <span className="font-normal text-slate">(optional)</span>
            </label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="e.g. React, TypeScript, AWS"
              disabled={generating}
              className="w-full rounded-lg border border-rule bg-sheet px-3 py-2 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-paper"
            />
          </div>
        </div>

        {generating && (
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-paper px-4 py-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            <p className="text-sm text-slate">
              Searching job postings and building profile…
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-danger">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={generating}
            className="rounded-lg px-4 py-2 text-sm text-slate hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!roleName.trim() || generating}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            {generating ? "Generating…" : "Generate profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
