import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";
import { FloatIdle } from "./motion";

/* ─── Mock UI: main dashboard panel ───────────────────────────────────── */
function DashboardPanel() {
  const candidates = [
    { initials: "CR", name: "Role Requirements", role: "Approved role context", stage: "Ready", match: "" },
    { initials: "CM", name: "Candidate Match", role: "Relevant profile context", stage: "Reviewed", match: "" },
    { initials: "IS", name: "Interview Scheduled", role: "Organized interview plan", stage: "Confirmed", match: "" },
  ];
  const stages = ["Role", "Match", "Interview", "Decision", "Onboarding"];
  const stageCount = ["", "", "", "", ""];

  return (
    <div className="hc2-dashboard">
      {/* Title bar */}
      <div className="hc2-dashboard-bar">
        <div className="hc2-dashboard-dots">
          <span /><span /><span />
        </div>
        <span className="hc2-dashboard-title">Hiring Workflow</span>
      </div>

      {/* Job header */}
      <div className="hc2-dashboard-job">
        <div className="hc2-job-badge">JOB</div>
        <div>
          <p className="hc2-dashboard-job-title">Decision Ready</p>
          <p className="hc2-dashboard-job-sub">Connected hiring workflow</p>
        </div>
        <span className="hc2-status-pill approved">Approved</span>
      </div>

      {/* Pipeline stages summary */}
      <div className="hc2-pipeline-row">
        {stages.map((s, i) => (
          <div key={s} className={`hc2-pipeline-stage${i === 2 ? " active" : ""}`}>
            <span className="hc2-pipeline-count">{stageCount[i]}</span>
            <span className="hc2-pipeline-label">{s}</span>
          </div>
        ))}
      </div>

      {/* Candidate rows */}
      <div className="hc2-candidates">
        {candidates.map((c) => (
          <div key={c.initials} className="hc2-candidate-row">
            <div className="hc2-avatar-sm">{c.initials}</div>
            <div className="hc2-cand-info">
              <strong>{c.name}</strong>
              <span>{c.role}</span>
            </div>
            <span className={`hc2-stage-pill stage-${c.stage.toLowerCase()}`}>{c.stage}</span>
            <span className="hc2-match-pct">{c.match}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Floating UI Cards ────────────────────────────────────────────────── */
function Card({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`hc2-float-card ${className}`}>{children}</div>;
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
export function HeroSection() {
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const itemVariants: any = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
  };

  return (
    <section className="hc2-hero" id="hero">
      <div className="hc2-hero-inner">
        {/* LEFT — copy */}
        <motion.div
          className="hc2-hero-copy"
          variants={containerVariants}
          initial={false}
          animate="visible"
        >
          <motion.div className="hc2-hand-badge" variants={itemVariants}>
            AI-Powered Recruitment
          </motion.div>

          <motion.h1 className="hc2-hero-h1 mb-2!" variants={itemVariants}>
            Hire with<br />clarity.
          </motion.h1>

          <motion.p className="hc2-hero-lede" variants={itemVariants}>
            Hiring Compass connects roles, candidates, interviews, decisions, offers, and onboarding in one guided workspace.
          </motion.p>

          <motion.div className="hc2-hero-actions mt-4!" variants={itemVariants}>
            <Link to={portalUrl("/signup")} className="hc2-cta-btn">
              Get Started
            </Link>
            <a href="#how-it-works" className="hc2-text-link">
              Explore the Workflow <ArrowRight size={15} />
            </a>
          </motion.div>
        </motion.div>

        {/* RIGHT — product composition */}
        <motion.div
          className="hc2-hero-composition"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main dashboard */}
          <div className="hc2-comp-main">
            <DashboardPanel />
          </div>

          {/* Floating cards — staggered entrance + idle float */}
          <FloatIdle amplitude={5} duration={3.8} delay={0} className="hc2-comp-card hc2-comp-card--tl">
            <Card className="">
              <span className="hc2-fc-label">Role Requirements</span>
              <strong className="hc2-fc-name">Candidate Match</strong>
              <p className="hc2-fc-sub">Review-Ready Context</p>
            </Card>
          </FloatIdle>

          <FloatIdle amplitude={6} duration={4.4} delay={0.5} className="hc2-comp-card hc2-comp-card--tr">
            <Card className="">
              <span className="hc2-fc-label">Candidate Match</span>
              <strong className="hc2-fc-value">Review Ready</strong>
              <div className="hc2-fc-bar">
                <div className="hc2-fc-bar-fill" style={{ width: "87%" }} />
              </div>
              <span className="hc2-fc-pct">Ready</span>
            </Card>
          </FloatIdle>

          <FloatIdle amplitude={4} duration={5.1} delay={1} className="hc2-comp-card hc2-comp-card--br">
            <Card className="">
              <span className="hc2-fc-label">Interview Scheduled</span>
              <strong className="hc2-fc-value">Interview Plan</strong>
              <p className="hc2-fc-sub">Availability Confirmed</p>
            </Card>
          </FloatIdle>

          <FloatIdle amplitude={5} duration={3.5} delay={0.7} className="hc2-comp-card hc2-comp-card--bl">
            <Card className="">
              <span className="hc2-fc-label">Hiring Decision</span>
              <strong className="hc2-fc-value">Decision Ready</strong>
              <span className="hc2-status-pill approved">Approved</span>
            </Card>
          </FloatIdle>
        </motion.div>
      </div>
    </section>
  );
}
