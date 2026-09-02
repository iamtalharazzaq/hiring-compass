import { Check } from "lucide-react";
import { ScrollReveal } from "./motion";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";

const recruiterBenefits = [
  "Manage every approved job from one workspace",
  "Review and shortlist candidates with full context",
  "Schedule and track interviews with structured stages",
  "Capture decisions and move offers forward confidently",
];

const candidateBenefits = [
  "View your application progress at any stage",
  "Keep your profile and information current",
  "Receive clear updates throughout the hiring process",
  "Move through onboarding with full transparency",
];

export function PersonaSection() {
  return (
    <section className="hc2-personas" id="recruiters">
      {/* For Recruiters */}
      <ScrollReveal className="hc2-persona hc2-persona--recruiter">
        <div className="hc2-persona-inner">
          <p className="hc2-persona-label">For Recruiters</p>
          <h2 className="hc2-persona-h2">Organize every hiring decision from one workspace.</h2>
          <ul className="hc2-persona-list">
            {recruiterBenefits.map((b) => (
              <li key={b}>
                <Check size={15} strokeWidth={2.5} />
                {b}
              </li>
            ))}
          </ul>
          <Link to={portalUrl("/signup")} className="hc2-cta-btn hc2-cta-outline">Start free</Link>
        </div>
      </ScrollReveal>

      {/* For Candidates */}
      <div id="candidates">
        <ScrollReveal delay={0.1} className="hc2-persona hc2-persona--candidate">
          <div className="hc2-persona-inner">
            <p className="hc2-persona-label hc2-persona-label--light">For Candidates</p>
            <h2 className="hc2-persona-h2 hc2-persona-h2--light">Move through hiring with clarity and confidence.</h2>
            <ul className="hc2-persona-list hc2-persona-list--light">
              {candidateBenefits.map((b) => (
                <li key={b}>
                  <Check size={15} strokeWidth={2.5} />
                  {b}
                </li>
              ))}
            </ul>
            <a href="mailto:hello@hiringcompass.com" className="hc2-text-link">Learn more →</a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
