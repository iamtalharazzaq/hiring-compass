import React, { useState } from "react";
import { ScrollReveal } from "./motion";

/* Feature 1: Candidate Management / Receipt Mock */
function CandidateMock() {
  return (
    <div className="hc2-feat-mock-cand">
      <div className="hc2-feat-sub-pill">
        <span className="hc2-dot-active" /> Candidate Context
      </div>
      <div className="hc2-feat-cand-row">
        <div className="hc2-avatar-circle">CP</div>
        <div>
          <strong className="hc2-cand-name">Candidate Profile</strong>
          <p className="hc2-cand-meta">Structured, Review-Ready Context</p>
        </div>
      </div>

      <div className="hc2-feat-receipt-card">
        <div className="hc2-receipt-header">
          <span className="hc2-receipt-title">CANDIDATE PROFILE</span>
          <span className="hc2-receipt-time">Review Ready</span>
        </div>
        <div className="hc2-receipt-body">
          <div className="hc2-receipt-row"><span>Role Requirements</span><strong>Reviewed</strong></div>
          <div className="hc2-receipt-row"><span>Candidate Profile</span><strong>Reviewed</strong></div>
          <div className="hc2-receipt-row"><span>Interview Plan</span><strong>Ready</strong></div>
          <div className="hc2-receipt-row"><span>Hiring Decision</span><strong>Required</strong></div>
        </div>
        <div className="hc2-receipt-total">
          <span>Hiring Decision</span>
          <strong>Ready</strong>
        </div>
      </div>
    </div>
  );
}

/* Feature 2: Dashboard Mock — Exact Tabela Overlapping Mockup (Bar chart + Revenue badge overlay + List) */
function DashboardMock() {
  return (
    <div className="hc2-tabela-dash-composition">
      {/* Top Floating Metric Overlay Card */}
      <div className="hc2-tdc-top-card">
        <div className="hc2-tdc-metric-header">
          <span className="hc2-tdc-metric-label">Role Requirements</span>
          <span className="hc2-tdc-metric-icon">🏷</span>
        </div>
        <div className="hc2-tdc-metric-val-row">
          <strong className="hc2-tdc-metric-val">Candidate Profile</strong>
          <span className="hc2-tdc-metric-badge">Reviewed</span>
        </div>
        <div className="hc2-tdc-metric-tabs">
          <span className="active">Weekly</span>
          <span>Monthly</span>
        </div>
      </div>

      {/* Main Bar Chart Card */}
      <div className="hc2-tdc-main-chart">
        <div className="hc2-tdc-chart-title">Interview Plan</div>
        <div className="hc2-tdc-bars-container">
          <div className="hc2-tdc-y-axis">
            <span>Ready</span><span>In Review</span><span>Planned</span><span>New</span>
          </div>
          <div className="hc2-tdc-bars-grid">
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-40" /><span className="hc2-tdc-day">Mon</span></div>
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-70 active-bar" /><span className="hc2-tdc-day">Tue</span></div>
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-30" /><span className="hc2-tdc-day">Wed</span></div>
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-85 active-bar" /><span className="hc2-tdc-day">Thu</span></div>
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-45" /><span className="hc2-tdc-day">Fri</span></div>
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-55" /><span className="hc2-tdc-day">Sat</span></div>
            <div className="hc2-tdc-bar-col"><div className="hc2-tdc-bar h-65" /><span className="hc2-tdc-day">Sun</span></div>
          </div>
        </div>

        {/* Bottom List Table Card */}
        <div className="hc2-tdc-list-card">
          <div className="hc2-tdc-list-head">
            <span>Hiring Decision</span>
            <div className="hc2-tdc-list-pills">
              <span className="active">Weekly</span>
              <span>Monthly</span>
            </div>
          </div>
          <div className="hc2-tdc-list-row">
            <div className="hc2-tdc-role-item">
              <span className="hc2-role-icon">💻</span>
              <div><strong>Role Requirements</strong></div>
            </div>
            <span>Reviewed</span>
          </div>
          <div className="hc2-tdc-list-row">
            <div className="hc2-tdc-role-item">
              <span className="hc2-role-icon">🎨</span>
              <div><strong>Candidate Profile</strong></div>
            </div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Feature 3: Reservation/Scheduling Mock */
function ReservationMock() {
  return (
    <div className="hc2-feat-mock-res">
      <div className="hc2-feat-sub-pill">
        <span className="hc2-dot-active" /> Interview Plan
      </div>
      <div className="hc2-res-info">
        <p className="hc2-res-title">Interview Scheduled</p>
        <p className="hc2-res-sub">Availability Confirmed</p>
        <span className="hc2-status-pill approved">Plan Ready</span>
      </div>
    </div>
  );
}

const featureTabs = [
  {
    id: "Role",
    label: "Role",
    icon: "✕",
    headline: "Keep every hiring decision connected.",
    description: "See the role, candidate context, interview progress, and next action together—without losing the story behind the decision.",
    mock: <DashboardMock />,
  },
  {
    id: "Candidate",
    label: "Candidate",
    icon: "✤",
    headline: "See candidate context clearly.",
    description: "Review approved requirements, candidate context, interview progress, and the hiring decision in one workspace.",
    mock: <CandidateMock />,
  },
  {
    id: "Interview",
    label: "Interview",
    icon: "◯",
    headline: "Keep interviews organized.",
    description: "Keep interview context, availability, and the next action connected to the role and candidate.",
    mock: <ReservationMock />,
  },
];

export function ProductShowcase() {
  const [activeTabId, setActiveTabId] = useState("Role");

  const currentTab = featureTabs.find((t) => t.id === activeTabId) || featureTabs[0];

  return (
    <section className="hc2-showcase" id="product">
      <div className="hc2-showcase-inner">
        {/* Top Header Row */}
        <div className="hc2-showcase-top">
          <div className="hc2-showcase-title-col">
            <div className="hc2-hand-badge">One Connected Workspace</div>
            <h2 className="hc2-showcase-h2">
              Keep every hiring decision<br />connected.
            </h2>
          </div>

          {/* Interactive Top-Right Tabs matching Tabela exact pills (✕ Dashboard, ◯ Reservation, ✤ Receipt) */}
          <div className="hc2-showcase-tabs">
            {featureTabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`hc2-showcase-tab-btn${isActive ? " is-active" : ""}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="hc2-tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Rounded Light Gray Container with Notch Cut side notches (Screenshot 2 match) */}
        <ScrollReveal className="hc2-tabela-feature-card">
          <div className="hc2-tabela-feature-grid">
            {/* Left Mock UI */}
            <div className="hc2-tfc-left">
              {currentTab.mock}
            </div>

            {/* Right Copy */}
            <div className="hc2-tfc-right">
              <div className="hc2-tfc-shapes-decor">
                <span>✕</span> <span>◯</span> <span>❖</span>
              </div>
              <h3 className="hc2-tfc-h3">{currentTab.headline}</h3>
              <p className="hc2-tfc-desc">{currentTab.description}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
