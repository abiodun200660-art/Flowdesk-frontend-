"use client";

const FREQUENCY_LABELS = {
  daily: { label: "Daily", icon: "🔁" },
  weekly: { label: "Weekly", icon: "📅" },
  monthly: { label: "Monthly", icon: "🗓️" },
  yearly: { label: "Yearly", icon: "📆" },
};

export default function RecurringBadge({ frequency, nextDueDate, size = "sm" }) {
  if (!frequency) return null;

  const config = FREQUENCY_LABELS[frequency] || { label: frequency, icon: "🔁" };

  const formattedDate = nextDueDate
    ? new Date(nextDueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  if (size === "xs") {
    return (
      <span
        title={`Recurring ${config.label}${formattedDate ? ` · Next: ${formattedDate}` : ""}`}
        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {config.label}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
      <svg
        className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <div>
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          Recurring {config.label}
        </span>
        {formattedDate && (
          <span className="text-xs text-indigo-500 dark:text-indigo-400 ml-1.5">
            · Next: {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
}