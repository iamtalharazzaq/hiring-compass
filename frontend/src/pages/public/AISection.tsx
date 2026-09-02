import { CheckCircle2, Sparkles } from "lucide-react";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./motion";

const capabilities = [
  ["Create Better Job Descriptions", "Turn a hiring request into a clear role with structured responsibilities and requirements.", "AI Assisted"],
  ["Define What Matters", "Translate the role into skills, experience, and evaluation criteria.", "Role Context"],
  ["Understand Candidate Context", "Read resumes and profiles to identify relevant skills, experience, education, and career signals.", "Candidate Context"],
  ["Recommend the Right Shortlist", "Compare candidates with approved requirements and explain why they may be a fit.", "Shortlist Review"],
  ["Coordinate the Interview Process", "Prepare interview questions, coordinate availability, and keep interview progress organized.", "Interview Plan"],
  ["Prepare the Next Decision", "Summarize feedback, prepare the offer, and guide the selected candidate toward onboarding.", "Decision Support"],
] as const;

const workflowStages = [
  ["Hiring request", false], ["Role draft ready", false], ["Requirements defined", true], ["Candidate match found", false],
  ["Interview scheduled", false], ["Feedback summarized", true], ["Offer ready for approval", true], ["Onboarding started", false],
] as const;

const approvals = [
  ["Role Approval", "Recruiters approve the role before it becomes active."],
  ["Shortlist Review", "Recruiters review recommended candidates before interviews."],
  ["Final Hiring Approval", "Recruiters approve the final decision and offer before onboarding begins."],
] as const;

export function AISection() {
  return (
    <section className="hc2-ai" id="ai-capabilities">
      <div className="hc2-ai-inner">
        <div className="hc2-ai-top">
          <ScrollReveal className="hc2-ai-head">
            <div className="hc2-hand-badge hc2-ai-label">AI Capabilities</div>
            <h2 className="hc2-section-h2">AI coordinates the work.<br />You approve the decision.</h2>
            <p className="hc2-section-sub">Hiring Compass uses AI across the recruitment workflow—from creating the job description to preparing onboarding—while keeping important decisions in human hands.</p>
            <p className="hc2-ai-trust-statement">AI handles the repetitive work. Recruiters remain responsible for the decision.</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="hc2-ai-workflow">
            <div className="hc2-ai-workflow-top"><span><Sparkles size={15} /> AI workflow</span><span>Recruiter approval at key decisions</span></div>
            <div className="hc2-ai-workflow-stages">
              {workflowStages.map(([label, approval], index) => (
                <div className={`hc2-ai-workflow-stage${approval ? " is-approval" : ""}`} key={label}>
                  <span className="hc2-ai-stage-number">0{index + 1}</span>
                  <strong>{label}</strong>
                  {approval && <span className="hc2-ai-approval-badge">Recruiter approval</span>}
                </div>
              ))}
            </div>
            <p className="hc2-ai-workflow-note">AI keeps the work connected. Recruiters approve the decisions that move it forward.</p>
          </ScrollReveal>
        </div>

        <StaggerGroup className="hc2-ai-grid">
          {capabilities.map(([title, desc, badge], index) => (
            <StaggerItem key={title}>
              <article className={`hc2-ai-capability${index % 2 ? " is-warm" : ""}`}>
                <span className="hc2-ai-cap-number">0{index + 1}</span>
                <div><strong className="hc2-ai-cap-title">{title}</strong><p className="hc2-ai-cap-desc">{desc}</p><span className="hc2-ai-cap-badge">{badge}</span></div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="hc2-ai-approvals">
          {approvals.map(([title, desc]) => <div key={title}><CheckCircle2 size={18} /><div><strong>{title}</strong><span>{desc}</span></div></div>)}
        </div>

      </div>
    </section>
  );
}
