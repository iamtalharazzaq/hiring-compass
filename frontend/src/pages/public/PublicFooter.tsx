import React from "react";
import { Compass } from "lucide-react";

export function PublicFooter() {
  const year = new Date().getFullYear();

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="hc2-tabela-footer" id="contact">
      <div className="hc2-tf-inner">
        {/* Left Brand */}
        <div className="hc2-tf-brand">
          <a href="#" onClick={scrollToTop} className="hc2-tf-logo" aria-label="Hiring Compass home">
            <span className="hc2-tf-logomark">
              <Compass size={18} strokeWidth={2.5} />
            </span>
            <span className="hc2-tf-brandname">HIRING COMPASS</span>
          </a>
        </div>

        {/* Right Copyright */}
        <div className="hc2-tf-copy">
          &copy; {year} Hiring Compass. All rights reserved
        </div>
      </div>
    </footer>
  );
}
