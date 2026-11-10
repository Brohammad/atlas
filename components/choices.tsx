import type { Question } from "@/lib/lesson";

export function Choices({
  name,
  question,
  value,
  onChange,
  revealed,
  disabled = false,
}: {
  name: string;
  question: Question;
  value: string | null;
  onChange: (id: string) => void;
  revealed: boolean;
  disabled?: boolean;
}) {
  return (
    <fieldset className="space-y-2" disabled={disabled || revealed}>
      <legend className="mb-3 font-serif text-2xl leading-snug">{question.prompt}</legend>
      {question.options.map((option) => {
        const selected = value === option.id;
        const isAnswer = option.id === question.answer;
        return (
          <label
            key={option.id}
            className={`flex gap-3 border px-3 py-3 ${
              revealed && isAnswer
                ? "atlas-stamp border-good bg-plate"
                : revealed && selected
                  ? "border-bad bg-plate"
                  : selected
                    ? "border-ink bg-plate"
                    : "border-line bg-paper"
            }`}
          >
            <input
              className="mt-1 accent-ink"
              type="radio"
              name={name}
              value={option.id}
              checked={selected}
              onChange={() => onChange(option.id)}
            />
            <span>
              <span className="block text-[15px] leading-6">{option.text}</span>
              {revealed && selected && !isAnswer && (
                <span className="mt-1 block text-sm text-bad">Your choice. Miss.</span>
              )}
              {revealed && isAnswer && <span className="mt-1 block text-sm text-good">Cleared.</span>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function Verdict({ right, idea }: { right: boolean; idea: string }) {
  return (
    <div className="atlas-stamp border-t border-line pt-4" role="status">
      <p className={`text-xs tracking-[0.14em] uppercase ${right ? "text-good" : "text-bad"}`}>
        {right ? "Cleared" : "Miss"}
      </p>
      <p className="mt-2 font-serif text-xl leading-snug">{idea}</p>
    </div>
  );
}
