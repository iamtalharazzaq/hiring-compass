import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";
import { ScrollReveal } from "./motion";

export function FinalCTA() {
  return (
    <section className="hc2-final-cta">
      <div className="hc2-final-cta-inner">
        <div className="hc2-final-art" aria-label="Hiring workflow progress">
          <span className="hc2-final-art-label">Your hiring workflow</span>
          <div className="hc2-final-progress">
            <div className="hc2-final-art-card"><Check size={15} /><span>Job Approved</span></div>
            <div className="hc2-final-art-line" aria-hidden="true" />
            <div className="hc2-final-art-card"><Check size={15} /><span>Candidate Shortlisted</span></div>
            <div className="hc2-final-art-line" aria-hidden="true" />
            <div className="hc2-final-art-card"><Check size={15} /><span>Offer Accepted</span></div>
          </div>
        </div>

        <ScrollReveal className="hc2-final-copy">
          <p className="hc2-final-eyebrow">Ready to hire with clarity?</p>
          <h2 className="hc2-final-h2">Hiring should feel clear.</h2>
          <p className="hc2-final-sub">Bring roles, candidates, interviews, decisions, offers, and onboarding into one connected workspace.</p>
          <div className="hc2-final-actions">
            <Link to={portalUrl("/signup")} className="hc2-cta-btn hc2-cta-lg">
              Start Hiring
            </Link>
            <a href="mailto:hello@hiringcompass.com" className="hc2-text-link hc2-text-link--light">
              Talk to us <ArrowRight size={15} />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
