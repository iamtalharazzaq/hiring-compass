import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";
import { FloatIdle } from "./motion";

/* ─── Mock UI: main dashboard panel ───────────────────────────────────── */
function DashboardPanel() {
  const candidates = [
    { initials: "SM", name: "Sarah Mitchell", role: "Sr. Backend Engineer", stage: "Shortlisted", match: 92 },
    { initials: "JC", name: "James Chen", role: "Backend Engineer", stage: "Applied", match: 78 },
    { initials: "AP", name: "Amara Patel", role: "Lead Engineer", stage: "Interviewing", match: 85 },
  ];
  const stages = ["Applied", "Screening", "Shortlisted", "Interviewing", "Offer"];
  const stageCount = [12, 7, 6, 3, 1];

  return (
    <div className="hc2-dashboard">
      {/* Title bar */}
      <div className="hc2-dashboard-bar">
        <div className="hc2-dashboard-dots">
          <span /><span /><span />
        </div>
        <span className="hc2-dashboard-title">Recruitment Pipeline</span>
      </div>

      {/* Job header */}
      <div className="hc2-dashboard-job">
        <div className="hc2-job-badge">JOB</div>
        <div>
          <p className="hc2-dashboard-job-title">Software Engineer</p>
          <p className="hc2-dashboard-job-sub">Berlin, Germany · Full Time · Hybrid</p>
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
            <span className="hc2-match-pct">{c.match}%</span>
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
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hc2-hand-badge" variants={itemVariants}>
            AI-powered recruitment
          </motion.div>

          <motion.h1 className="hc2-hero-h1 mb-2!" variants={itemVariants}>
            Hire with<br />clarity.
          </motion.h1>

          <motion.p className="hc2-hero-lede" variants={itemVariants}>
            Hiring Compass brings jobs, candidates, screening, interviews and hiring
            decisions into one intelligent recruitment workspace.
          </motion.p>

          <motion.div className="hc2-hero-actions mt-4!" variants={itemVariants}>
            <Link to={portalUrl("/signup")} className="hc2-cta-btn">
              Start Hiring
            </Link>
            <a href="#how-it-works" className="hc2-text-link">
              Explore the platform <ArrowRight size={15} />
            </a>
          </motion.div>
        </motion.div>

        {/* RIGHT — product composition */}
        <motion.div
          className="hc2-hero-composition"
          initial={reduced ? undefined : { opacity: 0, scale: 0.96 }}
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
              <span className="hc2-fc-label">Candidate Profile</span>
              <strong className="hc2-fc-name">Sarah Mitchell</strong>
              <p className="hc2-fc-sub">Sr. Backend Engineer</p>
              <div className="hc2-fc-match">
                <span className="hc2-match-badge">92% Match</span>
              </div>
            </Card>
          </FloatIdle>

          <FloatIdle amplitude={6} duration={4.4} delay={0.5} className="hc2-comp-card hc2-comp-card--tr">
            <Card className="">
              <span className="hc2-fc-label">AI Screening</span>
              <strong className="hc2-fc-value">Strong Match</strong>
              <div className="hc2-fc-bar">
                <div className="hc2-fc-bar-fill" style={{ width: "87%" }} />
              </div>
              <span className="hc2-fc-pct">87%</span>
            </Card>
          </FloatIdle>

          <FloatIdle amplitude={4} duration={5.1} delay={1} className="hc2-comp-card hc2-comp-card--br">
            <Card className="">
              <span className="hc2-fc-label">Interview</span>
              <strong className="hc2-fc-value">Sep 18 · 10:30 AM</strong>
              <p className="hc2-fc-sub">Technical Interview</p>
              <span className="hc2-status-dot confirmed">· Confirmed</span>
            </Card>
          </FloatIdle>

          <FloatIdle amplitude={5} duration={3.5} delay={0.7} className="hc2-comp-card hc2-comp-card--bl">
            <Card className="">
              <span className="hc2-fc-label">Job Status</span>
              <strong className="hc2-fc-value">Sr. AI Engineer</strong>
              <span className="hc2-status-pill approved">Approved</span>
            </Card>
          </FloatIdle>
        </motion.div>
      </div>
    </section>
  );
}
