import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, CheckCircle, UserPlus, Filter, CalendarDays, BarChart2, Gift, Handshake } from "lucide-react";
import { ScrollReveal } from "./motion";

const stages = [
  {
    num: "01",
    icon: BriefcaseBusiness,
    title: "Create the Role",
    desc: "Start with the hiring need, team context, and desired outcome.",
    chip: "Role Draft",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Build the Job",
    desc: "AI creates a structured job description and role requirements.",
    chip: "Job Built",
  },
  {
    num: "03",
    icon: UserPlus,
    title: "Approve the Role",
    desc: "Review and approve the role before it becomes active.",
    chip: "Role Approved",
  },
  {
    num: "04",
    icon: Filter,
    title: "Match Candidates",
    desc: "AI understands candidate profiles and compares them with the role.",
    chip: "Matches Ready",
  },
  {
    num: "05",
    icon: CalendarDays,
    title: "Review the Shortlist",
    desc: "Review recommended candidates and decide who moves forward.",
    chip: "Shortlist Reviewed",
  },
  {
    num: "06",
    icon: BarChart2,
    title: "Schedule Interviews",
    desc: "AI coordinates availability and keeps the interview plan organized.",
    chip: "Interview Scheduled",
  },
  {
    num: "07",
    icon: Gift,
    title: "Approve the Offer",
    desc: "Review feedback, confirm the decision, and approve the offer.",
    chip: "Offer Approved",
  },
  {
    num: "08",
    icon: Handshake,
    title: "Start Onboarding",
    desc: "Move the selected candidate into the onboarding workflow.",
    chip: "Onboarding Started",
  },
];

export function WorkflowJourney() {
  const reduced = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    const observers = stageRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStage(i); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [reduced]);

  return (
    <section className="hc2-workflow" id="how-it-works">
      <div className="hc2-workflow-inner">
        <ScrollReveal className="hc2-workflow-head">
          <div className="hc2-hand-badge">How it works</div>
          <h2 className="hc2-section-h2 mb-4">From hiring request<br />to onboarding.</h2>
          <p className="hc2-section-sub">
            Hiring Compass connects every stage of recruitment in one guided workflow. AI moves the work forward, while recruiters approve the decisions that matter.
          </p>
        </ScrollReveal>

        <div className="hc2-workflow-panel">
          <div className="hc2-workflow-panel-head">
            <p>Every step, connected.</p>
            <span>{String(activeStage + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}</span>
          </div>
          <ol className="hc2-workflow-steps">
            {stages.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.num}
                  ref={(el) => { stageRefs.current[i] = el; }}
                  className={`hc2-wf-step${i === activeStage ? " is-active" : ""}`}
                >
                  <motion.div
                    className="hc2-wf-step-inner"
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="hc2-wf-left">
                      <span className="hc2-wf-num">{s.num}</span>
                      <div className="hc2-wf-icon-wrap">
                        <Icon size={16} strokeWidth={2} />
                      </div>
                    </div>
                    <div className="hc2-wf-content">
                      <strong className="hc2-wf-title">{s.title}</strong>
                      <p className="hc2-wf-desc">{s.desc}</p>
                      <span className="hc2-wf-chip">{s.chip}</span>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
