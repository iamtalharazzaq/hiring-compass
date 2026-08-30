import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
const ThreeScene = lazy(() => import("./MarketingScene"));

const links = [
  ["Product", "#product"],
  ["How it works", "#how-it-works"],
  ["AI approach", "#ai-approach"],
  ["Pricing", "#pricing"],
  ["About", "#about"],
  ["Contact", "#contact"],
] as const;
function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} | Hiring Compass`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [title, description]);
  return null;
}

function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .16 }} transition={{ duration: .52, ease: "easeOut" }}>{children}</motion.div>;
}

function Mark() {
  return (
    <span className="hc-mark">
      <Compass size={19} aria-hidden="true" />
    </span>
  );
}
function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const { user } = useAuth();
  const location = useLocation();
  const workspace = user ? "Open workspace" : "Get started";
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(`#${entry.target.id}`); }), { rootMargin: "-30% 0px -60%", threshold: .01 });
    links.forEach(([, hash]) => document.getElementById(hash.slice(1)) && observer.observe(document.getElementById(hash.slice(1))!));
    return () => observer.disconnect();
  }, []);
  return (
    <header className="hc-header">
      <Link className="hc-brand" to="/">
        <Mark />
        Hiring Compass
      </Link>
      <nav className="hc-nav" aria-label="Primary navigation">
        {links.map(([name, path]) => (
          <a className={active === path || location.hash === path ? "active" : ""} href={path} key={path}>
            {name}
          </a>
        ))}
      </nav>
      <div className="hc-nav-actions">
        <Link
          className="hc-button hc-button-small"
          to={user ? "/app" : "/auth?mode=signup"}
        >
          {workspace}
          <ArrowRight size={15} />
        </Link>
      </div>
      <button
        className="hc-menu"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <div className="hc-drawer">
          <nav aria-label="Mobile navigation">
            {links.map(([name, path]) => (
              <a onClick={() => setOpen(false)} href={path} key={path}>
                {name}
              </a>
            ))}
            <Link
              className="hc-button"
              onClick={() => setOpen(false)}
              to={user ? "/app" : "/auth?mode=signup"}
            >
              {workspace}
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function ObjectScene({ compact = false, global = false }: { compact?: boolean; global?: boolean }) {
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebgl(
        Boolean(
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl"),
        ),
      );
    } catch {
      setWebgl(false);
    }
  }, []);
  if (!webgl || reduced)
    return (
      <div className="hc-scene-fallback" aria-hidden="true">
        <span className="hc-orb a" />
        <span className="hc-orb b" />
        <span className="hc-orb c" />
        <div className="hc-fallback-core">
          <Compass size={compact ? 33 : 50} />
        </div>
      </div>
    );
  return (
    <div className="hc-canvas" aria-hidden="true">
      <Suspense fallback={<div className="hc-scene-fallback" />}>
        <ThreeScene compact={compact} global={global} />
      </Suspense>
    </div>
  );
}

function GlobalReach() {
  return (
    <div className="hc-global-reach" aria-hidden="true">
      <span className="hc-globe-ring ring-one" />
      <span className="hc-globe-ring ring-two" />
      <span className="hc-globe-line line-one" />
      <span className="hc-globe-line line-two" />
      <strong>Opportunity, without borders</strong>
    </div>
  );
}

function Hero() {
  const { user } = useAuth();
  return (
    <section className="hc-hero">
      <div className="hc-hero-copy">
        <p className="hc-eyebrow">
          <Sparkles size={15} />
          The thoughtful hiring platform
        </p>
        <h1>
          From first match
          <br />
          to confident hire.
        </h1>
        <p className="hc-lede">
          Hiring Compass connects people with relevant opportunities and helps hiring teams move from role definition to confident hiring decisions.
        </p>
        <div className="hc-cta-row">
          <Link className="hc-button" to="/signup">
            Find matching opportunities <ArrowRight size={16} />
          </Link>
          <Link
            className="hc-button hc-button-quiet"
            to={user ? "/app" : "/signup"}
          >
            Build your hiring workspace
          </Link>
        </div>
        <p className="hc-hero-note">AI-assisted. Human-controlled.</p>
      </div>
        <div className="hc-hero-art">
        <ObjectScene global />
        <div className="hc-float-card profile">
          <span>Resume</span><strong>Profile extracted</strong>
        </div>
        <div className="hc-float-card role">
          <span>Recruiter approval</span><strong>Decision recorded</strong>
        </div>
        <div className="hc-float-card match"><span>Job match · 87%</span><strong>Why it fits</strong></div>
        <div className="hc-float-card apply"><span>Application</span><strong>Under review</strong></div>
      </div>
    </section>
  );
}

function Product() {
  return (
    <>
      <section className="hc-section hc-intro" id="product">
        <p className="hc-eyebrow">One product, two entry points</p>
        <h1>The hiring journey, made clearer for everyone.</h1>
        <p>
          Start with the experience you need today. The same connected record
          follows the work from opportunity through a final decision.
        </p>
      </section>
      <section className="hc-duo">
        <article>
          <span className="hc-kicker">
            For candidates <em>Planned</em>
          </span>
          <h2>Find matching opportunities.</h2>
          <ul>
            {[
              "Upload your resume",
              "Discover roles that fit your experience",
              "Understand why they match — planned",
              "Apply with confidence",
              "Track your progress",
            ].map((x) => (
              <li key={x}>
                <Check size={16} />
                {x}
              </li>
            ))}
          </ul>
          <Link to="/signup">
            Find matching opportunities <ArrowRight size={16} />
          </Link>
        </article>
        <article>
          <span className="hc-kicker">For recruiters <em>Available now</em></span>
          <h2>Build your hiring workspace.</h2>
          <ul>
            {[
              "Define the role and requirements",
              "Approve the job description",
              "Review applicants and manage the pipeline",
              "Conduct interviews and collect feedback",
              "Make the final decision",
            ].map((x) => (
              <li key={x}>
                <Check size={16} />
                {x}
              </li>
            ))}
          </ul>
          <Link to="/signup">
            Build your hiring workspace <ArrowRight size={16} />
          </Link>
        </article>
      </section>
      <AiApproach />
    </>
  );
}
function How() {
  const steps = ["Candidate experience", "Recruiter experience", "AI assistance", "Human approval"];
  return (
    <>
      <section className="hc-section hc-intro" id="how-it-works">
        <p className="hc-eyebrow">How it works</p>
        <h1>How Hiring Compass works.</h1>
        <p>
          One connected story gives candidates clarity and hiring teams a
          durable record of the work behind every decision.
        </p>
      </section>
      <ol className="hc-journey">
        {steps.map((step, i) => (
          <li key={step}>
            <span>0{i + 1}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
      <section className="hc-story">
        <div>
          <p className="hc-eyebrow">Global opportunity · shared context</p>
          <h2>Find the right connection, wherever it is.</h2>
          <p>
            Candidates can discover relevant work across borders. Recruiters
            can build global teams while keeping every review and decision in context.
          </p>
        </div>
        <GlobalReach />
      </section>
    </>
  );
}
const recruiterStages = [
  ["Define the role", "Set requirements and ownership.", "Spot missing requirements", "Current"],
  ["Approve the JD", "Review the job description.", "Draft from requirements", "Current"],
  ["Organize candidates", "Keep profiles and applications together.", "Extract resume context", "Current"],
  ["Review applications", "Move applicants through the pipeline.", "Explain potential fit", "Planned"],
  ["Conduct interviews", "Capture feedback beside the application.", "Summarize feedback", "Planned"],
  ["Make the decision", "Record the accountable decision.", "Prepare decision context", "Planned"],
  ["Send communication", "Send an approved candidate update.", "Draft editable communication", "Planned"],
] as const;
function RecruiterWorkflow() { return <section className="hc-workflow" id="recruiter-workflow"><div className="hc-workflow-heading"><p className="hc-eyebrow">Recruiter experience</p><h2>A visual hiring timeline, not a wall of process.</h2><p>Each stage keeps one clear owner, a short action, and only the assistance that helps the team move forward.</p></div><div className="hc-workflow-table">{recruiterStages.map(([stage, description, ai, status], index) => <article className="hc-workflow-row" key={stage}><b>0{index + 1}</b><div><h3>{stage}</h3><p>{description}</p></div><div><span>AI assistance</span><p>{ai}</p></div><em className={status === "Current" ? "available" : "planned"}>{status}</em></article>)}</div></section>; }
function CandidateWorkflow() { const steps = ["Upload resume", "Extract profile", "Discover relevant jobs", "See match explanation", "Apply", "Track application"]; return <section className="hc-candidate-flow"><p className="hc-eyebrow">Candidate experience · Planned</p><h2>Your resume should not disappear into a database.</h2><p>It should help you understand which opportunities are worth pursuing.</p><ol>{steps.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>)}</ol><aside>Your profile stays understandable: see why a job is relevant, choose whether to apply, and track what happens next.</aside></section>; }
function Architecture() { return <section className="hc-architecture"><div><p className="hc-eyebrow">Connected hiring context</p><h2>The records behind a sound decision belong together.</h2><p>Hiring Compass connects the role, its requirements, the resume, the application, the interview, the feedback, and the final communication.</p></div><div className="hc-architecture-flow">{["Role", "Requirements", "Resume", "Application", "Interview", "Feedback", "Decision"].map((item, i) => <span key={item}>{item}{i < 6 && <ArrowRight size={14} />}</span>)}</div></section>; }
function FinalCta() { return <section className="hc-final"><p>Bring clarity to the next step—whether you are pursuing an opportunity or building a team.</p><div><article><span>For candidates</span><Link to="/signup">Find matching opportunities <ArrowRight size={16} /></Link></article><article><span>For recruiters</span><Link to="/signup">Build your hiring workspace <ArrowRight size={16} /></Link></article></div></section>; }
function Pricing() {
  return (
    <>
      <section className="hc-section hc-intro" id="pricing">
        <p className="hc-eyebrow">Pricing</p>
        <h1>Built for an evolving platform.</h1>
        <p>
          There’s no payment flow today. These plans describe the direction of
          Hiring Compass as the platform grows.
        </p>
      </section>
      <section className="hc-pricing">
        {[
          [
            "Early access",
            "Core Hiring Compass workspace",
            [
              "Jobs and candidates",
              "Requirements and applications",
              "Suitable for product exploration",
            ],
          ],
          [
            "Team",
            "Collaborative hiring workflows",
            [
              "Advanced collaboration — coming soon",
              "Interviews and approvals — coming soon",
              "Team workflows",
            ],
          ],
          [
            "Candidate matching",
            "Resume-to-job recommendations",
            [
              "Explainable recommendations — planned",
              "No AI screening or automatic decisions",
              "Human approval remains required",
            ],
          ],
        ].map(([name, sub, items]) => (
          <article key={name as string}>
            <p>{name}</p><b className={name === "Early access" ? "available" : "planned"}>{name === "Early access" ? "Available now" : name === "Team" ? "Coming soon" : "Planned"}</b>
            <h2>{sub}</h2>
            <ul>
              {(items as string[]).map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup">
              {name === "Early access" ? "Build your hiring workspace" : "Learn what’s planned"} <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
function AiApproach() {
  return (
    <section className="hc-ai" id="ai-approach">
      <div className="hc-ai-intro">
        <p className="hc-eyebrow"><Sparkles size={15} />AI philosophy</p>
        <h2>AI-assisted. Human-controlled.</h2>
        <p>AI can prepare and explain context around hiring. Recruiters review every suggestion, and people remain accountable for decisions that affect candidates.</p>
        <span className="hc-ai-status">In development</span>
      </div>
      <div className="hc-ai-grid">
        <article><span>AI suggests</span><h3>Useful context, clearly explained.</h3><p>Prepare a draft, summarize material, or point to relevant evidence.</p><b>Planned</b></article>
        <article><span>Recruiter reviews</span><h3>Judgment stays visible.</h3><p>Every suggestion is editable, reviewable, and easy to challenge.</p><b>Product principle</b></article>
        <article><span>Human approves</span><h3>Decisions remain human.</h3><p>The approved outcome and the context behind it become part of the record.</p><b>Required</b></article>
      </div>
      <div className="hc-ai-flow" aria-label="AI approval workflow"><span>AI suggests</span><ArrowRight size={17} /><span>Recruiter reviews</span><ArrowRight size={17} /><span>Human approves</span><ArrowRight size={17} /><span>System records the decision</span></div>
    </section>
  );
}
function About() {
  return (
    <section className="hc-section hc-prose" id="about">
      <p className="hc-eyebrow">About Hiring Compass</p>
      <h1>Hiring has too many places for context to disappear.</h1>
      <p>
        Hiring Compass connects the records that shape a hiring decision: the
        role, its requirements, the resume, the application, the interview,
        the feedback, and the final communication.
      </p>
      <p>
        Candidates should be able to see meaningful opportunities and understand
        their progress. Hiring teams should be able to review the full context
        without chasing it across disconnected tools.
      </p>
    </section>
  );
}
function Contact() {
  const email = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
  return (
    <section className="hc-section hc-prose" id="contact">
      <p className="hc-eyebrow">Contact</p>
      <h1>Let’s keep the conversation open.</h1>
      <p>{email ? "For product questions or early access, write to our team." : "We are opening conversations with candidates and hiring teams. There is no contact form here yet, so nothing is sent or stored from this page."}</p>
      {email && (
        <a className="hc-button" href={`mailto:${email}`}>
          Email Hiring Compass <ArrowRight size={16} />
        </a>
      )}
      <div className="hc-contact-options">
        <article><span>For candidates</span><strong>See how meaningful opportunity discovery is taking shape.</strong><Link to="/signup">Find matching opportunities <ArrowRight size={15} /></Link></article>
        <article><span>For hiring teams</span><strong>Create a workspace for your jobs, candidates, and applications.</strong><Link to="/signup">Build your hiring workspace <ArrowRight size={15} /></Link></article>
        <article><span>For product updates</span><strong>Contact details are being prepared—check back for a direct channel.</strong><em>Coming soon</em></article>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="hc-footer">
      <Link className="hc-brand" to="/">
        <Mark />
        Hiring Compass
      </Link>
      <p>Thoughtful tools for people making important hiring decisions.</p>
      <Link className="hc-footer-workspace" to="/app">Open workspace <ArrowRight size={14} /></Link>
      <small>© {new Date().getFullYear()} Hiring Compass</small>
    </footer>
  );
}

export function MarketingPage() {
  return (
    <div className="hc-site">
      <Meta
        title="Thoughtful hiring"
        description="A clearer path from opportunities to thoughtful hiring decisions."
      />
      <Nav />
      <main>
            <Hero />
            <Reveal><Product /></Reveal>
            <Reveal><How /></Reveal>
            <Reveal><RecruiterWorkflow /></Reveal>
            <Reveal><CandidateWorkflow /></Reveal>
            <Reveal><Architecture /></Reveal>
            <Reveal><Pricing /></Reveal>
            <Reveal><About /></Reveal>
            <Reveal><Contact /></Reveal>
            <Reveal><FinalCta /></Reveal>
      </main>
      <Footer />
    </div>
  );
}
