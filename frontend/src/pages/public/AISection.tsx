import { ScrollReveal, StaggerGroup, StaggerItem } from "./motion";

const capabilities = [
  {
    label: "Resume Understanding",
    desc: "Automatically extracts skills, experience, and key signals from uploaded resumes.",
    sample: { summary: "5 years Python & FastAPI. Distributed systems. Led 3-person backend team at DataStream." },
  },
  {
    label: "Candidate-to-Job Matching",
    desc: "Scores each candidate against the job's requirements and surfaces the strongest fits.",
    sample: { match: 91, skills: ["Python", "FastAPI", "PostgreSQL", "AWS"] },
  },
  {
    label: "Screening Assistance",
    desc: "Generates structured screening questions tailored to the role requirements.",
    sample: null,
  },
  {
    label: "Candidate Summaries",
    desc: "Produces concise, readable summaries from a candidate's full profile and application.",
    sample: null,
  },
  {
    label: "Interview Preparation",
    desc: "Suggests evaluation criteria and interview questions based on scorecard and role.",
    sample: null,
  },
  {
    label: "Workflow Assistance",
    desc: "Recommends next steps based on pipeline stage and evaluation signals.",
    sample: null,
  },
];

export function AISection() {
  return (
    <section className="hc2-ai">
      <div className="hc2-ai-inner">
        <ScrollReveal className="hc2-ai-head">
          <p className="hc2-eyebrow"><i />AI capabilities</p>
          <h2 className="hc2-section-h2 mb-4">AI where it actually<br />helps recruiters.</h2>
          <p className="hc2-section-sub">
            Not a magic black box. Practical intelligence woven into the existing workflow — visible, explainable, and controlled by you.
          </p>
        </ScrollReveal>

        {/* Featured AI card */}
        <ScrollReveal delay={0.1}>
          <div className="hc2-ai-featured">
            <div className="hc2-ai-feat-label">AI Candidate Summary</div>
            <p className="hc2-ai-feat-text">
              "Strong Python backend background with experience in distributed systems and API architecture. Previously led a backend team at a series-B startup."
            </p>
            <div className="hc2-ai-feat-meta">
              <div className="hc2-ai-skills">
                {["Python", "FastAPI", "PostgreSQL", "AWS"].map((s) => (
                  <span key={s} className="hc2-skill-tag">{s}</span>
                ))}
              </div>
              <div className="hc2-ai-match-badge">
                <span className="hc2-ai-match-val">91%</span>
                <span className="hc2-ai-match-lbl">Match</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Capability grid */}
        <StaggerGroup className="hc2-ai-grid">
          {capabilities.map((c) => (
            <StaggerItem key={c.label} className="hc2-ai-capability">
              <div className="hc2-ai-cap-dot" />
              <div>
                <strong className="hc2-ai-cap-title">{c.label}</strong>
                <p className="hc2-ai-cap-desc">{c.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <ScrollReveal delay={0.1}>
          <p className="hc2-ai-future">
            <span className="hc2-future-badge">Coming soon</span>
            Agentic AI workflows — autonomous recruiting assistance that works alongside your team.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
