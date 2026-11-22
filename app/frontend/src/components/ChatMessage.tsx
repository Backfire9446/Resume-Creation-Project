import ReactMarkdown from "react-markdown";

interface Props {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isNew?: boolean;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  isNew = false,
}: Props) {
  const isUser = role === "user";
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto mb-7 max-w-[68ch]">
      {isUser ? (
        <div className="ml-8 sm:ml-16">
          <div className="rounded-lg border border-l-[3px] border-rule border-l-ink bg-sheet px-4 py-3 font-sans text-[15px] leading-relaxed">
            <div className="md">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
          <p className="mt-1.5 text-right text-xs text-slate">{time}</p>
        </div>
      ) : (
        <div>
          <div className="font-serif text-[17px] leading-relaxed text-ink">
            <div className={`md md-voice${isNew ? " is-new" : ""}`}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-slate">{time}</p>
        </div>
      )}
    </div>
  );
}
