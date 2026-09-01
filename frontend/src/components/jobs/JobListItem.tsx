import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Job } from "../../features/jobs/types";
import { JobStatusBadge } from "./JobStatusBadge";
const format = (value: string | null) => value?.replaceAll("_", " ");
export function JobListItem({ job }: { job: Job }) {
  const salary =
    job.salary_min || job.salary_max
      ? `${job.salary_currency ?? ""} ${job.salary_min ?? "—"} – ${job.salary_max ?? "—"}`
      : null;
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="hc-job-list-item border-b border-[var(--color-border)] last:border-0"
    >
      <Link
        to={`/jobs/${job.id}`}
        className="block px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{job.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {[
                job.location,
                format(job.employment_type),
                format(job.workplace_type),
              ]
                .filter(Boolean)
                .join(" · ") || "Details to be added"}
            </p>
          </div>
          <JobStatusBadge status={job.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--color-muted)]">
          <span>Updated {new Date(job.updated_at).toLocaleDateString()}</span>
          {salary && <span>{salary}</span>}
        </div>
      </Link>
    </motion.article>
  );
}
