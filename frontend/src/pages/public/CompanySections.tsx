import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function CompanySections() {
  const reducedMotion = useReducedMotion();
  const entrance = reducedMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.55 } };

  return (
    <section className="hc2-company-section" id="about">
      <div className="hc2-company-grid">
        <motion.div className="hc2-company-row" {...entrance}>
      <div>
            <p className="hc2-hand-badge">About</p>
        <h2 className="hc2-section-h2">Hiring deserves a clearer path.</h2>
        <p className="hc2-section-sub">Hiring Compass helps teams move from a hiring request to onboarding with less scattered information and more connected decisions.</p>
      </div>
      <p className="hc2-company-detail">We bring job setup, candidate context, interviews, offers, and onboarding into one thoughtful workflow. AI handles repetitive work, while people remain responsible for the decisions that matter.</p>
        </motion.div>

        <motion.div className="hc2-company-row hc2-company-row--contact" id="contact" {...entrance}>
      <div>
        <p className="hc2-hand-badge">CONTACT</p>
        <h2 className="hc2-section-h2">Let’s make hiring easier to move forward.</h2>
        <p className="hc2-section-sub">Have questions about Hiring Compass or want to understand how it fits your team? Start a conversation with us.</p>
      </div>
      <a href="mailto:hello@hiringcompass.com" className="hc2-cta-btn">Talk to Us <ArrowRight size={16} /></a>
        </motion.div>
      </div>
    </section>
  );
}
