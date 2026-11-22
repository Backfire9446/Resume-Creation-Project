import { useRef, useState } from "react";
import api from "../api";

interface Props {
  onDone: (uploaded: boolean) => void;
}

export default function ResumeUploadModal({ onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await api.post("/chat/resume", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Upload failed. Try a different file.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg rounded-xl bg-sheet p-6 shadow-[0_12px_40px_-12px_rgba(30,42,71,0.35)]">
        <p className="mb-1 text-xs text-slate">Step 1 of 3</p>
        <h2 className="mb-1 font-serif text-xl text-ink">
          Upload your current resume
        </h2>
        <p className="mb-5 text-[15px] text-slate">
          Have an existing resume? Upload it and the interview will build on
          what you already have. Supports PDF, DOCX, and TXT.
        </p>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-rule px-6 py-10 text-center hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFile}
          />
          {file ? (
            <p className="text-[15px] font-semibold text-ink">{file.name}</p>
          ) : (
            <>
              <p className="text-[15px] font-medium text-ink">
                Click to choose a file
              </p>
              <p className="mt-1 text-xs text-slate">PDF, DOCX, or TXT</p>
            </>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={() => onDone(false)}
            className="rounded-lg px-4 py-2 text-sm text-slate hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Skip for now
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Upload resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
