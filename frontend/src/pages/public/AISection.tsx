import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./motion";

const capabilities = [
  ["Job Description Creation", "Turns a hiring request into a clear, structured job description tailored to the role and team context.", "AI Generated"],
  ["Requirement Planning", "Defines skills, experience, responsibilities, workplace details, and evaluation criteria for the role.", "AI Prepared"],
  ["Candidate Understanding", "Reads candidate profiles and resumes to identify experience, skills, education, and relevant career context.", "AI Analyzed"],
  ["Matching and Shortlisting", "Compares candidates with approved requirements, explains the match, and recommends who should move forward.", "Recruiter Review"],
  ["Interview Coordination", "Prepares interview questions, coordinates availability, schedules interviews, and keeps every stage connected.", "AI Coordinated"],
  ["Decision, Offer, and Onboarding", "Summarizes interview feedback, prepares the offer, and guides the selected candidate into onboarding after recruiter approval.", "Human Approval"],
] as const;

const workflowStages = [
  ["Hiring request", false], ["Role draft ready", false], ["Requirements defined", true], ["Candidate match found", false],
  ["Interview scheduled", false], ["Feedback summarized", true], ["Offer ready for approval", true], ["Onboarding started", false],
] as const;

const approvals = [
  ["Job approval", "Recruiter approves the role before it becomes active."],
  ["Shortlist review", "Recruiter reviews recommended candidates before interviews."],
  ["Final hiring approval", "Recruiter approves the final decision and offer before onboarding begins."],
] as const;

export function AISection() {
  return (
    <section className="hc2-ai" id="ai-capabilities">
      <div className="hc2-ai-inner">
        <div className="hc2-ai-top">
          <ScrollReveal className="hc2-ai-head">
            <p className="hc2-ai-label">AI Capabilities</p>
            <h2 className="hc2-section-h2">AI that moves every<br />hire forward.</h2>
            <p className="hc2-section-sub">Hiring Compass turns a hiring request into a structured recruitment workflow. It creates the role, understands candidates, coordinates interviews, prepares decisions, and guides the selected candidate toward onboarding.</p>
            <p className="hc2-ai-trust-statement">Automation handles the work. Recruiters remain in control of every important decision.</p>
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

        <div className="hc2-ai-trust"><div><strong>From the first hiring request to the first day, every action stays connected to the context behind the decision.</strong><span>AI recommendations remain reviewable, explainable, and connected to the original role requirements.</span></div><a href="#how-it-works" className="hc2-ai-workflow-link">See how the workflow works <ArrowRight size={16} /></a></div>
      </div>
    </section>
  );
}
