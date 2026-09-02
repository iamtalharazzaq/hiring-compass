import React from "react";
import { portalUrl } from "../../lib/hosts";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./motion";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    bullets: [
      "For small teams building a clearer hiring process.",
      "Role and candidate management",
      "Interview scheduling",
      "Hiring workflow visibility",
    ],
    cta: "Get Started",
    href: portalUrl("/signup"),
    featured: false,
  },
  {
    id: "professional",
    name: "Professional",
    bullets: [
      "For teams managing multiple roles and structured hiring workflows.",
      "Everything in Starter",
      "Advanced workflow management",
      "Team collaboration",
      "Candidate and interview context",
    ],
    cta: "Choose Professional",
    href: "#contact",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    bullets: [
      "For organizations with complex hiring operations and custom requirements.",
      "Custom workflows",
      "Organization-level controls",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Talk to Us",
    href: "#contact",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section className="hc2-pricing" id="pricing">
      {/* Background wireframe loop decoration */}
      <div className="hc2-pricing-loop-art" aria-hidden="true">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 50,250 C 100,50 350,50 320,200 C 300,300 150,350 200,180 C 250,50 380,100 350,300"
            stroke="#d9f99d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="hc2-pricing-inner">
        <ScrollReveal className="hc2-pricing-head">
          <div className="hc2-hand-badge">Pricing</div>
          <h2 className="hc2-pricing-h2">
            Plans for the way you hire.
          </h2>
          <p className="hc2-section-sub">Start with the essentials and choose the workspace that fits your hiring process.</p>
        </ScrollReveal>

        <StaggerGroup className="hc2-pricing-grid">
          {tiers.map((t) => (
            <StaggerItem key={t.id}>
              <div className={`hc2-tabela-pricing-card${t.featured ? " is-pro" : ""}`}>
                {/* Top content */}
                <div className="hc2-tpc-top">
                  <h3 className="hc2-tpc-title">{t.name}</h3>
                  <ul className="hc2-tpc-bullets">
                    {t.bullets.map((b, i) => (
                      <li key={i}>
                        <span className="hc2-diamond">✦</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom content */}
                <div className="hc2-tpc-bottom">
                  {t.cta && (
                    <a
                      href={t.href}
                      className={`hc2-tpc-cta ${t.id === "enterprise" ? "is-outline" : t.id === "professional" ? "is-solid-pro" : "is-solid"}`}
                    >
                      {t.cta}
                    </a>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
