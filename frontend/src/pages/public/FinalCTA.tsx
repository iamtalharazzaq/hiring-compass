import { ArrowRight, Check } from "lucide-react";
import { ScrollReveal } from "./motion";

export function FinalCTA() {
  return (
    <section className="hc2-final-cta">
      <div className="hc2-final-cta-inner">
        <div className="hc2-final-art" aria-label="Hiring workflow progress">
          <span className="hc2-final-art-label">Your hiring workflow</span>
          <div className="hc2-final-progress">
            <div className="hc2-final-art-card"><Check size={15} /><span>Role Approved</span></div>
            <div className="hc2-final-art-line" aria-hidden="true" />
            <div className="hc2-final-art-card"><Check size={15} /><span>Shortlist Reviewed</span></div>
            <div className="hc2-final-art-line" aria-hidden="true" />
            <div className="hc2-final-art-card"><Check size={15} /><span>Offer Accepted</span></div>
          </div>
        </div>

        <ScrollReveal className="hc2-final-copy">
          <p className="hc2-final-eyebrow">READY TO HIRE WITH CLARITY?</p>
          <h2 className="hc2-final-h2">Hiring should feel clear.</h2>
          <p className="hc2-final-sub">Bring roles, candidates, interviews, decisions, offers, and onboarding into one connected workspace.</p>
          <div className="hc2-final-actions">
            <a href="#pricing" className="hc2-cta-btn hc2-cta-lg">
              View Pricing
            </a>
            <a href="#contact" className="hc2-text-link hc2-text-link--light">
              Talk to Us <ArrowRight size={15} />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
