import { useEffect, useState } from "react";
import api from "../api";

interface Profile {
  slug: string;
  name: string;
  industry: string;
  target_roles: string;
}

interface Props {
  onSelect: (slug: string) => void;
  onSkip: () => void;
}

export default function ProfilePickerModal({ onSelect, onSkip }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/chat/profiles")
      .then((res) => setProfiles(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch("/chat/profile", { profile_slug: selected });
      onSelect(selected);
    } catch {
      // fall through to skip if it fails
      onSkip();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-xl bg-sheet shadow-[0_12px_40px_-12px_rgba(30,42,71,0.35)]">
        <div className="border-b border-rule px-6 py-5">
          <p className="mb-1 text-xs text-slate">Step 2 of 3</p>
          <h2 className="font-serif text-xl text-ink">
            What role are you targeting?
          </h2>
          <p className="mt-1 text-[15px] text-slate">
            Choose the closest match — or skip and describe your role in the
            chat.
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto px-6 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-ink border-t-transparent" />
            </div>
          ) : profiles.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate">
              No profiles available — your interviewer will help identify your
              role.
            </p>
          ) : (
            <div className="divide-y divide-rule">
              {profiles.map((p) => (
                <button
                  key={p.slug}
                  onClick={() =>
                    setSelected(selected === p.slug ? null : p.slug)
                  }
                  aria-pressed={selected === p.slug}
                  className={`w-full border-l-[3px] px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    selected === p.slug
                      ? "!border-l-ink bg-paper"
                      : "!border-l-transparent hover:bg-paper"
                  }`}
                >
                  <p className="font-serif text-[17px] text-ink">{p.name}</p>
                  {p.industry && (
                    <p className="mt-0.5 text-sm text-slate">{p.industry}</p>
                  )}
                  {p.target_roles && (
                    <p className="mt-0.5 text-sm text-slate/70 line-clamp-1">
                      {p.target_roles}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-rule px-6 py-4">
          <button
            onClick={onSkip}
            className="rounded-lg px-4 py-2 text-sm text-slate hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            My role isn&apos;t listed
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || saving}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            {saving ? "Saving…" : "Use this profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
