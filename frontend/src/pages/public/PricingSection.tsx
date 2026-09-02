import React from "react";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./motion";

const tiers = [
  {
    id: "basic",
    name: "Basic Plan",
    bullets: [
      "Ideal for small teams & early startups",
      "Core candidate and job management features",
      "Get started immediately with zero upfront cost",
    ],
    price: "$0",
    period: "/Free",
    cta: "Get Started Free",
    href: portalUrl("/signup"),
    featured: false,
  },
  {
    id: "pro",
    name: "Professional Plan",
    bullets: [
      "Designed for growing recruitment teams",
      "Advanced functionalities, including AI Screening & Pipeline",
      "Unlock full automation to optimize hiring",
    ],
    price: "$29.99",
    period: "/Month",
    cta: "Start Free Trial",
    href: portalUrl("/signup"),
    featured: true,
    popularText: "Most popular!",
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    bullets: [
      "Tailored for large-scale enterprise operations",
      "Comprehensive suite of tools & dedicated support",
      "Elevate your organization with custom integrations",
    ],
    price: "Custom Pricing",
    period: "",
    cta: "Contact Us",
    href: "mailto:hello@hiringcompass.com",
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
            Discover Plans To Cater<br />To Your Unique Needs
          </h2>
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
                  {t.featured ? (
                    <div className="hc2-tpc-price-wrapper">
                      <span className="hc2-popular-annotation">{t.popularText}</span>
                      <div className="hc2-price-circle-highlight">
                        <span className="hc2-tpc-price">{t.price}</span>
                        {t.period && <span className="hc2-tpc-period">{t.period}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="hc2-tpc-price-wrapper">
                      <span className="hc2-tpc-price">{t.price}</span>
                      {t.period && <span className="hc2-tpc-period">{t.period}</span>}
                    </div>
                  )}

                  {t.cta && (
                    <Link
                      to={t.href}
                      className={`hc2-tpc-cta ${t.id === "enterprise" ? "is-outline" : t.id === "pro" ? "is-solid-pro" : "is-solid"}`}
                    >
                      {t.cta}
                    </Link>
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
