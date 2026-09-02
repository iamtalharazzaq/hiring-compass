import { AppShell } from "../components/layout/AppShell";
import { useNavigate } from "react-router-dom";
import { useUpcomingInterviews } from "../features/interviews/queries";
import { useOrganization } from "../features/organizations/OrganizationProvider";

export function InterviewsPage() {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const { data, isLoading, error } = useUpcomingInterviews(
    organization?.organization.id ?? "",
  );
  return (
    <AppShell title="Interviews">
      <h1 className="text-3xl font-semibold">Upcoming interviews</h1>
      {isLoading ? (
        <p className="mt-6">Loading interviews…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error.message}</p>
      ) : !data?.items.length ? (
        <p className="mt-6 rounded-2xl border p-6 text-sm text-[var(--color-muted)]">
          No upcoming interviews are scheduled. {" "}
          Schedule an interview from the candidate pipeline to add it here.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {data.items.map((item) => (
            <article
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/interviews/${item.id}`)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate(`/interviews/${item.id}`); } }}
              className="cursor-pointer rounded-2xl border bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
            >
              <p className="font-semibold">Interview</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {new Date(item.scheduled_at).toLocaleString()} ·{" "}
                {item.duration_minutes} minutes
              </p>
              <p className="mt-1 text-sm">
                {item.location_or_meeting_details || "No meeting details"}
              </p>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
