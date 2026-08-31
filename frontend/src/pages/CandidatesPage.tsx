import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchInput } from "../components/ui/SearchInput";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useOrganization } from "../features/organizations/OrganizationProvider";
import { useCandidates } from "../features/candidates/queries";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function CandidatesList() {
  const { organization } = useOrganization();
  const org = organization?.organization.id ?? "";
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const page = Number(params.get("page") ?? 1);
  const { data, isLoading, error, refetch } = useCandidates(
    org,
    page,
    params.get("search") || undefined,
  );
  const canEdit = ["admin", "recruiter"].includes(organization?.role ?? "");

  useEffect(() => setSearch(params.get("search") ?? ""), [params]);
  const apply = (event: FormEvent) => {
    event.preventDefault();
    setParams(
      Object.fromEntries(
        Object.entries({ tab: "candidates", page: "1", search }).filter(
          ([, value]) => value,
        ),
      ),
    );
  };
  const clear = () => {
    setSearch("");
    setParams({ tab: "candidates" });
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-teal)]">
            Hiring workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Candidates</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Keep the people you meet organized before matching them to a role.
          </p>
        </div>
        {canEdit && (
          <Link
            to="/candidates/new"
            className="rounded-xl bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Add Candidate
          </Link>
        )}
      </header>
      <section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
        <form onSubmit={apply} className="flex gap-3">
          <SearchInput value={search} onChange={setSearch} onClear={clear} placeholder="Search by name, title, or location" ariaLabel="Search candidates by name, title, or location" />
          <PrimaryButton type="submit">Search</PrimaryButton>
        </form>
        {isLoading && (
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-[var(--color-canvas)]" />
        )}
        {error && (
          <p className="mt-4 text-sm text-[var(--color-red)]">
            {error.message}{" "}
            <button onClick={() => refetch()} className="underline">
              Retry
            </button>
          </p>
        )}
        {data &&
          (data.items.length ? (
            <div className="mt-4 divide-y">
              {data.items.map((candidate) => (
                <Link
                  key={candidate.id}
                  to={`/candidates/${candidate.id}`}
                  className="flex items-center gap-3 py-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-sage)] font-semibold text-[var(--color-teal)]">
                    {initials(candidate.full_name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block">{candidate.full_name}</strong>
                    <span className="text-sm text-[var(--color-muted)]">
                      {[
                        candidate.current_title,
                        candidate.location,
                        candidate.email,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Candidate profile"}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <h2 className="font-semibold">No candidates found</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Try a different name, title, or location.
              </p>
            </div>
          ))}
      </section>
    </>
  );
}
