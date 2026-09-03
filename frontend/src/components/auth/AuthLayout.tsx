import { Compass } from "lucide-react";
import type { ReactNode } from "react";
import { publicUrl } from "../../lib/hosts";

export function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="hc-auth-shell">
      <div aria-hidden="true" className="hc-auth-orbit hc-auth-orbit--one" />
      <div aria-hidden="true" className="hc-auth-orbit hc-auth-orbit--two" />
      <section className="hc-auth-story" aria-label="Hiring Compass introduction">
        <a href={publicUrl()} className="hc-auth-brand"><span className="hc-auth-mark"><Compass size={18} /></span>Hiring Compass</a>
        <div className="hc-auth-story-copy"><span className="hc-auth-kicker">CONNECTED HIRING</span><h1>Hiring, with clarity.</h1><p>Bring roles, candidates, interviews, and decisions into one thoughtful workflow.</p></div>
        <div className="hc-auth-story-note">AI handles the repetitive work. Your team makes the decisions that matter.</div>
      </section>
      <section className="hc-auth-card">
        <div className="hc-auth-card-head"><a href={publicUrl()} className="hc-auth-brand hc-auth-brand--compact"><span className="hc-auth-mark"><Compass size={18} /></span>Hiring Compass</a><span>Secure workspace</span></div>
        {children}
        <a href={publicUrl()} className="hc-auth-back">← Back to Hiring Compass</a>
      </section>
    </main>
  );
}
