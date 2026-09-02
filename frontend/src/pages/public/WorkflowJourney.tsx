import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, CheckCircle, UserPlus, Filter, CalendarDays, BarChart2, Gift, Handshake } from "lucide-react";
import { ScrollReveal } from "./motion";

const stages = [
  {
    num: "01",
    icon: BriefcaseBusiness,
    title: "Create a Job",
    desc: "Define the role, requirements, team, location, and work setup.",
    chip: "Draft → Approval",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Review & Approve",
    desc: "Hiring managers review and formally approve each opening.",
    chip: "Job Approved ✓",
  },
  {
    num: "03",
    icon: UserPlus,
    title: "Add Candidates",
    desc: "Bring candidate profiles together with applications and resumes.",
    chip: "12 Candidates Added",
  },
  {
    num: "04",
    icon: Filter,
    title: "Screen & Shortlist",
    desc: "AI-assisted screening surfaces the strongest matches first.",
    chip: "6 Shortlisted",
  },
  {
    num: "05",
    icon: CalendarDays,
    title: "Schedule Interviews",
    desc: "Coordinate interviews with structured stages and clear ownership.",
    chip: "3 Interviews Scheduled",
  },
  {
    num: "06",
    icon: BarChart2,
    title: "Evaluate",
    desc: "Capture structured feedback and scorecards alongside the record.",
    chip: "Scorecard Submitted",
  },
  {
    num: "07",
    icon: Gift,
    title: "Make an Offer",
    desc: "Move a confident decision forward with the full context at hand.",
    chip: "Offer Sent",
  },
  {
    num: "08",
    icon: Handshake,
    title: "Onboard",
    desc: "Hand off everything needed without losing the context behind it.",
    chip: "Onboarded ✓",
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
          <h2 className="hc2-section-h2 mb-4">From job opening<br />to onboarding.</h2>
          <p className="hc2-section-sub">
            Move every hire forward without losing the context that makes each decision clear.
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
                    initial={reduced ? undefined : { opacity: 0, y: 18 }}
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
