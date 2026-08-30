# Manual recruiter workflow

The supported recruiter path is:

`Create Job → Requirements → JD approval → Add Candidate → Resume → Application → Interview → Feedback → Hiring Decision → Communication approval → Manual SMTP send`.

Application statuses are stored as lowercase values (`new`, `shortlisted`, `interviewing`, `decision_pending`, `offer_approved`, `on_hold`, `rejected`) and displayed in Title Case. Backend policies reject invalid transitions and enforce organization membership, reviewer permissions, and creator separation.

Local email verification uses Mailpit (`SMTP_HOST=mailpit`, port `1025`, UI port `8025`). Configure SMTP values through environment variables only; never commit credentials. Candidate resumes, feedback, decisions, communication bodies, and delivery records remain private organization-scoped resources.

Known limitations: candidate portal, AI assistance, automated tests, and production deployment are future phases. Manual sending is synchronous and requires explicit confirmation; failed attempts require an explicit retry.
