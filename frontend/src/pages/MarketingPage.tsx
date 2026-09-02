import { PublicHeader } from "./public/PublicHeader";
import { HeroSection } from "./public/HeroSection";
import { TrustSection } from "./public/TrustSection";
import { ProblemSection } from "./public/ProblemSection";
import { WorkflowJourney } from "./public/WorkflowJourney";
import { ProductShowcase } from "./public/ProductShowcase";
import { AISection } from "./public/AISection";
import { PricingSection } from "./public/PricingSection";
import { FinalCTA } from "./public/FinalCTA";
import { PublicFooter } from "./public/PublicFooter";

export function MarketingPage() {
  return (
    <div className="hc2-site">
      <PublicHeader />
      <main>
        <div className="hc2-home-viewport">
          <HeroSection />
          <TrustSection />
        </div>
        <ProblemSection />
        <WorkflowJourney />
        <ProductShowcase />
        <AISection />
        <PricingSection />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
