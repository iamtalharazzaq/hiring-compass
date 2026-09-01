import { AnimatePresence, motion } from "framer-motion";
import { Select } from "../ui/Select";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Stage } from "../../features/interviews/api";

const pad = (value: number) => String(value).padStart(2, "0");
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const displayTime = (time: string) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(`2000-01-01T${time}`));
const timeParts = (time: string) => { const [hours = "00", minutes = "00"] = time.split(":"); const hour = Number(hours); return { hour: String(hour % 12 || 12), minute: minutes, period: hour >= 12 ? "PM" : "AM" }; };
const timeValue = (hour: string, minute: string, period: string) => `${pad((Number(hour) % 12) + (period === "PM" ? 12 : 0))}:${minute}`;

function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [opensAbove, setOpensAbove] = useState(false);
  const [month, setMonth] = useState(() =>
    value ? new Date(`${value}T12:00`) : new Date(),
  );
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const today = dateKey(new Date());
  const selectedLabel = value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(`${value}T12:00`),
      )
    : "Select a day";
  return (
    <div ref={root} className="relative">
      <label className="text-sm font-medium" htmlFor="interview-date">
        Date
      </label>
      <button
        id="interview-date"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { if (open) return setOpen(false); const rect = root.current?.getBoundingClientRect(); setOpensAbove(Boolean(rect && rect.top > window.innerHeight - rect.bottom)); setOpen(true); }}
        className="mt-1 flex w-full items-center justify-between rounded-xl border bg-[var(--color-surface)] px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
      >
        <span>{selectedLabel}</span>
        <CalendarDays size={16} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose interview date"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border bg-[var(--color-surface)] p-4 shadow-xl ${opensAbove ? "bottom-full mb-2" : "top-full mt-2"}`}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
                className="rounded-lg p-2 hover:bg-[var(--color-canvas)]"
              >
                <ChevronLeft size={18} />
              </button>
              <strong>
                {new Intl.DateTimeFormat(undefined, {
                  month: "long",
                  year: "numeric",
                }).format(month)}
              </strong>
              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
                className="rounded-lg p-2 hover:bg-[var(--color-canvas)]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 text-center text-xs text-[var(--color-muted)]">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index}>
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "narrow",
                  }).format(new Date(2024, 0, index + 7))}
                </span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }, (_, index) => {
                const day = new Date(start);
                day.setDate(start.getDate() + index);
                const key = dateKey(day);
                const disabled = key < today;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    aria-label={new Intl.DateTimeFormat(undefined, {
                      dateStyle: "full",
                    }).format(day)}
                    aria-pressed={key === value}
                    onClick={() => onChange(key)}
                    className={`min-h-9 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${day.getMonth() !== month.getMonth() ? "text-[var(--color-muted)]/50" : ""} ${key === value ? "bg-[var(--color-navy)] text-white" : "hover:bg-[var(--color-canvas)]"} ${key === today ? "ring-1 ring-[var(--color-teal)]" : ""}`}
                  >
                    <span>{day.getDate()}</span>
                    {key === today && <span className="sr-only"> today</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between border-t pt-3">
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm underline"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-[var(--color-navy)] px-3 py-1.5 text-sm text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimePicker({ value, onChange, label, placeholder, min }: { value: string; onChange: (value: string) => void; label: string; placeholder: string; min?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => timeParts(value));
  const [opensAbove, setOpensAbove] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const toggle = () => { if (open) return setOpen(false); const rect = root.current?.getBoundingClientRect(); setDraft(timeParts(value)); setOpensAbove(Boolean(rect && rect.top > window.innerHeight - rect.bottom)); setOpen(true); };
  const choose = (part: "hour" | "minute" | "period", next: string) => setDraft((current) => ({ ...current, [part]: next }));
  const selected = timeValue(draft.hour, draft.minute, draft.period);
  const values = [["Hour", Array.from({ length: 12 }, (_, index) => String(index + 1)), "hour"], ["Minute", ["00", "15", "30", "45"], "minute"], ["AM/PM", ["AM", "PM"], "period"]] as const;
  return <div ref={root} className="relative"><label className="text-sm font-medium">{label}</label><button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={toggle} className="mt-1 flex w-full items-center justify-between rounded-xl border bg-[var(--color-surface)] px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"><span>{value ? displayTime(value) : placeholder}</span><Clock3 size={16} aria-hidden="true" /></button>{open && <div role="dialog" aria-label={`Choose ${label.toLowerCase()}`} className={`absolute z-50 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border bg-[var(--color-surface)] p-4 shadow-xl ${opensAbove ? "bottom-full mb-2" : "top-full mt-2"}`}><strong className="block text-sm">{label}</strong><div className="mt-3 grid grid-cols-3 gap-2">{values.map(([heading, items, part]) => <div key={heading}><p className="mb-1 text-center text-xs font-semibold text-[var(--color-muted)]">{heading}</p><div className="max-h-44 space-y-1 overflow-y-auto">{items.map((item) => <button key={item} type="button" onClick={() => choose(part, item)} className={`block w-full rounded-sm px-1.5 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${draft[part] === item ? "bg-[var(--color-navy)] text-white" : "hover:bg-[var(--color-canvas)]"}`}>{item}</button>)}</div></div>)}</div>{min && selected <= min && <p className="mt-2 text-xs text-[var(--color-red)]">Choose a time after {displayTime(min)}.</p>}<div className="mt-4 flex items-center justify-between border-t pt-3"><button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-sm underline">Clear</button><div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1.5 text-sm">Cancel</button><button type="button" disabled={Boolean(min && selected <= min)} onClick={() => { onChange(selected); setOpen(false); }} className="rounded-lg bg-[var(--color-navy)] px-3 py-1.5 text-sm text-white disabled:opacity-50">Done</button></div></div></div>}</div>;
}

export function ScheduleInterviewForm({
  stages,
  pending,
  onCancel,
  onSchedule,
}: {
  stages: Stage[];
  pending: boolean;
  onCancel: () => void;
  onSchedule: (body: {
    interview_stage_id: string;
    scheduled_at: string;
    duration_minutes: number;
    location_or_meeting_details?: string;
  }) => void;
}) {
  const [stage, setStage] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!stage || !date || !start || !end)
      return setError("Choose a stage, date, start time, and end time.");
    const begins = new Date(`${date}T${start}`);
    const finishes = new Date(`${date}T${end}`);
    const duration = (finishes.getTime() - begins.getTime()) / 60000;
    if (begins <= new Date()) return setError("Choose a future date and time.");
    if (duration <= 0) return setError("End time must be after start time.");
    setError("");
    onSchedule({
      interview_stage_id: stage,
      scheduled_at: begins.toISOString(),
      duration_minutes: duration,
      location_or_meeting_details: details || undefined,
    });
  };
  return (
    <form onSubmit={submit} className="mt-3 space-y-4 border-t pt-4">
      <div>
        <label className="text-sm font-medium" htmlFor="interview-stage">
          Interview stage
        </label>
        <Select
          required
          id="interview-stage"
          value={stage}
          onChange={(event) => setStage(event.target.value)}
          className="mt-1 w-full rounded-xl border bg-[var(--color-surface)] p-2 text-sm"
        >
          <option value="">Select stage</option>
          {stages
            .filter((item) => item.is_active)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker value={date} onChange={setDate} />
        <div className="grid grid-cols-2 gap-2">
          <TimePicker label="Start time" placeholder="Start" value={start} onChange={setStart} />
          <TimePicker label="End time" placeholder="End" value={end} onChange={setEnd} min={start || undefined} />
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Times shown in your local timezone: {timezone}
      </p>
      <label className="block text-sm font-medium">
        Location or meeting details
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          className="mt-1 w-full rounded-xl border bg-[var(--color-surface)] p-2 text-sm"
          rows={2}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          disabled={pending}
          className="rounded-xl bg-[var(--color-navy)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Scheduling…" : "Schedule interview"}
        </button>
      </div>
    </form>
  );
}
