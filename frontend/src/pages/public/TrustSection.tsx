import { ScrollReveal, StaggerGroup, StaggerItem } from "./motion";

const teams = ["Technology", "Startups", "Agencies", "Enterprise", "Remote Teams"];

export function TrustSection() {
  return (
    <ScrollReveal>
      <section className="hc2-trust">
        <p className="hc2-trust-label">Built for modern hiring teams</p>
        <div className="hc2-trust-teams">
          {teams.map((t) => (
            <span key={t} className="hc2-trust-team">{t}</span>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
