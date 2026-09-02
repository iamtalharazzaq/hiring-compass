import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";
import { ScrollReveal } from "./motion";

export function FinalCTA() {
  return (
    <section className="hc2-final-cta">
      <div className="hc2-final-cta-inner">
        {/* Composition — abstract pipeline art */}
        <div className="hc2-final-art" aria-hidden="true">
          <div className="hc2-final-art-card hc2-final-art-card--a">
            <span>Job Approved ✓</span>
          </div>
          <div className="hc2-final-art-card hc2-final-art-card--b">
            <span>6 Shortlisted</span>
          </div>
          <div className="hc2-final-art-card hc2-final-art-card--c">
            <span>Offer Accepted ✓</span>
          </div>
          <div className="hc2-final-art-line hc2-final-art-line--v" />
          <div className="hc2-final-art-line hc2-final-art-line--h" />
        </div>

        {/* Copy */}
        <ScrollReveal className="hc2-final-copy">
          <h2 className="hc2-final-h2">
            Hiring shouldn't feel<br />this complicated.
          </h2>
          <p className="hc2-final-sub">
            Bring your recruitment workflow into one clear, connected workspace.
          </p>
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
