import React, { useState, useEffect, useRef } from "react";
import { Compass, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { portalUrl } from "../../lib/hosts";

const navLinks = [
  { label: "Problem", href: "#hiring-problem" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "AI Capabilities", href: "#ai-capabilities" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function PublicHeader() {
  const [stuck, setStuck] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isNavClickScroll = useRef(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Force browser to scroll to top on fresh reload/refresh
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setStuck(scrollY > 20);

      if (isNavClickScroll.current) {
        setVisible(true);
      } else if (scrollY > 80 && scrollY > lastScrollY.current + 5) {
        setVisible(false);
      } else if (scrollY < lastScrollY.current - 5 || scrollY <= 20) {
        setVisible(true);
      }
      lastScrollY.current = scrollY;

      const problemElem = document.getElementById("hiring-problem");
      const problemTop = problemElem ? problemElem.offsetTop - 180 : 400;

      if (scrollY < problemTop) {
        setActiveTab(null);
        return;
      }

      // Detect active section on scroll
      const scrollPosition = scrollY + 140;
      let matchedTab: string | null = null;

      for (let i = navLinks.length - 1; i >= 0; i--) {
        const link = navLinks[i];
        const targetId = link.href.replace("#", "");
        const element = document.getElementById(targetId);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top - 80) {
            matchedTab = link.label;
            break;
          }
        }
      }

      setActiveTab(matchedTab);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setActiveTab(label);
    setVisible(true);
    isNavClickScroll.current = true;

    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setMenuOpen(false);
    setTimeout(() => { isNavClickScroll.current = false; }, 800);

  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(null);
    setVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`hc2-header${stuck ? " is-stuck" : ""}${!visible ? " is-hidden" : ""}`}
      role="banner"
    >
      <div className="hc2-header-inner">
        {/* Logo — Clicking scrolls to top and clears selection */}
        <a href="#" onClick={scrollToTop} className="hc2-brand" aria-label="Hiring Compass home">
          <span className="hc2-logomark" aria-hidden="true">
            <Compass size={20} strokeWidth={2.5} />
          </span>
          <span className="hc2-brand-text">Hiring Compass</span>
        </a>

        {/* Desktop navbar */}
        <nav className="hc2-nav" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isActive = activeTab === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`hc2-nav-link${isActive ? " is-active" : ""}`}
                onClick={(e) => handleNavClick(e, link.href, link.label)}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action — Dark Pill 'Get Started' Button */}
        <div className="hc2-header-cta-wrap">
          <Link to={portalUrl("/auth?mode=signup")} className="hc2-nav-get-started">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="hc2-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="hc2-mobile-drawer" role="dialog" aria-label="Mobile navigation" aria-modal="true">
          <nav>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hc2-drawer-link"
                onClick={(e) => handleNavClick(e, link.href, link.label)}
              >
                {link.label}
              </a>
            ))}
            <Link to={portalUrl("/auth?mode=signup")} className="hc2-drawer-get-started">
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
