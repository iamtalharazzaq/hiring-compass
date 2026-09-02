import { motion, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "./motion";
import { Briefcase, FileSpreadsheet, Mail, Calendar, MessageSquare, CheckCircle2 } from "lucide-react";

export function ProblemSection() {
  const reduced = useReducedMotion();

  return (
    <section className="hc2-problem" id="product">
      <div className="hc2-problem-inner">
        {/* Top Header Block */}
        <div className="hc2-problem-header-block">
          <ScrollReveal>
            <div className="hc2-hand-badge">The hiring problem</div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="hc2-problem-h2">
              Hiring today is<br />fragmented.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="hc2-problem-subtext">
            <p>
              Recruiters move between job boards, spreadsheets, inboxes, calendars and disconnected hiring tools just to move one candidate through the process.
            </p>
            <p style={{ fontWeight: 600, color: "var(--hc2-dark)" }}>
              Every handoff creates another place for context to disappear.
            </p>
          </ScrollReveal>
        </div>

        {/* Visual Composition: 6 Fragmented Tool Cards + Disconnected Connector Lines */}
        <div className="hc2-fragments-stage">
          {/* Subtle SVG connector lines with intentionally disconnected gaps */}
          <svg className="hc2-connector-svg" viewBox="0 0 1180 380" fill="none">
            <path
              d="M 260 40 L 400 90 M 460 110 L 680 50"
              stroke="#d4d2c9"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 490 200 L 640 210 M 740 220 L 920 280"
              stroke="#d4d2c9"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 180 310 L 320 230"
              stroke="#d4d2c9"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Floating Problem Tags */}
          <span className="hc2-problem-tag hc2-ptag-1">Disconnected context</span>
          <span className="hc2-problem-tag hc2-ptag-2">Manual handoffs</span>
          <span className="hc2-problem-tag hc2-ptag-3">Repeated data entry</span>
          <span className="hc2-problem-tag hc2-ptag-4">Scattered feedback</span>
          <span className="hc2-problem-tag hc2-ptag-5">Status uncertainty</span>

          {/* Card 1: Job Posting */}
          <motion.div
            className="hc2-fragment-card hc2-frag-job"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="hc2-frag-header">
              <Briefcase size={14} /> Job Posting
            </div>
            <div className="hc2-frag-title">Senior Backend Engineer</div>
            <div className="hc2-frag-meta">LinkedIn • Active</div>
            <div className="hc2-frag-badge">24 applications</div>
          </motion.div>

          {/* Card 2: Candidate Tracking Spreadsheet */}
          <motion.div
            className="hc2-fragment-card hc2-frag-sheet"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="hc2-frag-header">
              <FileSpreadsheet size={14} /> Spreadsheet Tracker
            </div>
            <div className="hc2-frag-title">candidate-tracking.xlsx</div>
            <div className="hc2-frag-meta">Sarah Mitchell • David Chen • Emily Parker</div>
            <div className="hc2-frag-badge" style={{ background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" }}>
              Last edit: 3 days ago
            </div>
          </motion.div>

          {/* Card 3: Email Feedback */}
          <motion.div
            className="hc2-fragment-card hc2-frag-email"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="hc2-frag-header">
              <Mail size={14} /> Inbox Thread
            </div>
            <div className="hc2-frag-title">FW: Technical Interview Feedback</div>
            <div className="hc2-frag-meta">“Sarah performed well technically, but need to confirm systems design...”</div>
          </motion.div>

          {/* Card 4: Calendar Interview */}
          <motion.div
            className="hc2-fragment-card hc2-frag-calendar"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="hc2-frag-header">
              <Calendar size={14} /> Calendar Invites
            </div>
            <div className="hc2-frag-title">Technical Deep Dive</div>
            <div className="hc2-frag-meta">Tuesday • 10:30 AM (Google Meet)</div>
          </motion.div>

          {/* Card 5: Chat / Notes */}
          <motion.div
            className="hc2-fragment-card hc2-frag-chat"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="hc2-frag-header">
              <MessageSquare size={14} /> Slack Message
            </div>
            <div className="hc2-frag-title">#hiring-backend</div>
            <div className="hc2-frag-meta">“Did we already send the candidate feedback?”</div>
          </motion.div>

          {/* Card 6: Decision Status */}
          <motion.div
            className="hc2-fragment-card hc2-frag-decision"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="hc2-frag-header">
              <CheckCircle2 size={14} /> Hiring Decision
            </div>
            <div className="hc2-frag-title">Candidate status</div>
            <div className="hc2-frag-badge" style={{ background: "#fffbebe6", color: "#92400e", borderColor: "#fef3c7" }}>
              Waiting for review
            </div>
          </motion.div>
        </div>

        {/* Bottom Insight Transition Statement */}
        <ScrollReveal delay={0.2} className="hc2-problem-bottom-insight">
          <p className="hc2-insight-text">
            The problem isn't another missing recruiting tool.{" "}
            <span>It's that the existing tools don't work as one hiring system.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
