# Recruiter guide: from role setup to onboarding handoff

Use this guide to run a hiring process in Hiring Compass. The workspace keeps role, candidate, interview, and approval records together; it does not replace your HRIS or payroll/onboarding system.

## Before you start

- Confirm you belong to the correct organization workspace.
- Recruiters and admins can create jobs, candidates, requirements, interview plans, and schedules.
- A hiring manager or admin must approve a job. The person who proposes a final decision cannot approve that same decision.
- Have the approved job description, candidate contact details, resume PDF, interview plan, and compensation details ready.

## 1. Create and approve the job

1. Open **Hiring** and stay on the **Jobs** tab.
2. Select **Create Job** and enter the role's core details, including a clear title and description. Save the job as a draft.
3. Open the new job and, in **Requirements**, add every required and preferred requirement. Use **Required** for must-haves; at least one required requirement is needed before the job can be submitted.
4. Review the role summary and requirements with the hiring manager.
5. Select **Submit for Approval**.
6. A hiring manager or admin opens the job and either:
   - selects **Approve Job** to open the role for candidates, or
   - selects **Request Changes**, adds an explanation, and returns it to draft.
7. If changes are requested, update the draft and submit it again.

**Checkpoint:** The job must show **Approved** before you can add candidates.

## 2. Set up the interview plan

1. In the approved job, open **Interview plan**.
2. Add the stages candidates will complete, such as recruiter screen, technical interview, hiring manager interview, and final interview.
3. Give each stage a useful name and default duration. Edit or remove a stage as the process changes.

Do this before scheduling, so every candidate follows the same plan.

## 3. Add a candidate and resume

You can build the candidate profile first, or create it while adding the person to a role.

### Create the profile first

1. Open **Hiring** → **Candidates** → **Add candidate**.
2. Enter the candidate's name and the contact and background information you have.
3. Save, then open **Edit candidate**.
4. In **Resume**, upload the current resume as a PDF (maximum 10 MiB).

### Add the candidate to a job

1. Open the approved job.
2. In **Candidates**, select **Add Candidate**.
3. Search for and select an existing profile, or choose **Create New Candidate**.
4. Review the selected profile and select **Add candidate to job**.

**Checkpoint:** The person is now an application in that job's pipeline, initially marked **New**.

## 4. Review and move the application

1. Review the resume, profile, job requirements, interview feedback, and activity history before moving a candidate.
2. On the job's candidate card, use the status selector to record the current outcome:
   - **New** — received and awaiting review.
   - **Shortlisted** — moving forward; this unlocks interview scheduling.
   - **Interviewing** — interview is underway.
   - **On Hold** — paused pending more information or headcount.
   - **Rejected** — not proceeding.
3. Keep the status aligned with what has actually happened; it is the shared view of pipeline progress.

## 5. Schedule and complete interviews

1. Change the application to **Shortlisted**.
2. Select **Schedule interview** on the candidate card.
3. Choose the interview stage, future date and time, duration, and meeting/location details; save the schedule.
4. Open the scheduled interview from the **Interviews** area to assign interviewers and configure the scorecard criteria.
5. Interviewers open their assigned interview, complete the feedback form, and submit feedback. Submitted feedback cannot be edited.
6. A recruiter marks the interview **Completed** after it takes place and reviews the submitted feedback with the hiring team.

Repeat this for each interview stage. Reschedule or cancel only when necessary, because the change is recorded in the candidate's activity timeline.

## 6. Make and approve the hiring decision

1. Gather the evidence: the candidate profile and resume, requirements, completed interviews, and submitted feedback.
2. Record the recommended outcome with a clear rationale: **Proceed to Offer**, **Reject Candidate**, or **Place On Hold**.
3. Submit the recommendation for human review. The application becomes **Decision Pending**.
4. The designated reviewer opens **Approvals** and either:
   - selects **Approve**, which updates the application to **Offer Approved**, **Rejected**, or **On Hold**; or
   - enters review notes and selects **Return for Changes**.
5. If it is returned, revise the rationale and submit it again.

**Important current limitation:** The recruiter-facing screen for creating and submitting the final recommendation is not available yet, even though the approval queue is. Until it is added, use your agreed internal approval process or the API to create the recommendation; do not update a candidate to an offer outcome without the required approval.

## 7. Prepare and send the candidate communication

1. Open the candidate profile and go to **Communications**.
2. Select the relevant application.
3. Choose the communication type: interview follow-up, next steps, offer, rejection, or hold.
4. Write a specific subject and message. For an offer, complete salary, currency, start date, offer expiry, and employment details.
5. Create the communication draft, review it internally, then select **Submit for approval**.

An **offer** can only be prepared after an approved **Proceed to Offer** decision.

**Important current limitation:** The app currently has no recruiter-facing screen to approve and send a submitted communication. Complete the final review and send through your approved company process (or the API) until that screen is delivered. Never send an offer, rejection, or hold message without the required review.

## 8. Handoff to onboarding

After the candidate accepts an approved offer:

1. Confirm acceptance and the agreed start date in your company-approved communication channel.
2. Transfer the approved offer, start date, employment details, and required personal information to your HRIS/onboarding owner.
3. Start your normal onboarding checklist: contract and right-to-work checks, payroll, equipment, manager welcome plan, first-day schedule, and access provisioning.
4. Close or archive the job when hiring is complete, following your team's retention policy.

Hiring Compass does not yet manage offer acceptance, contracts, payroll, provisioning, or employee onboarding. Treat this final stage as a documented handoff to the systems and people that do.

## Quick path

`Create Job → Add Requirements → Submit and Approve Job → Add Candidate and Resume → Add Candidate to Job → Shortlist → Schedule Interviews → Collect Feedback → Propose and Approve Decision → Draft and Approve Communication → Send → HRIS Onboarding Handoff`
