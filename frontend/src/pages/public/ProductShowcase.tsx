import React, { useState } from "react";
import { ScrollReveal } from "./motion";

/* Feature 1: Candidate Management / Receipt Mock */
function CandidateMock() {
  return (
    <div className="hc2-feat-mock-cand">
      <div className="hc2-feat-sub-pill">
        <span className="hc2-dot-active" /> With AI Matching
      </div>
      <div className="hc2-feat-cand-row">
        <div className="hc2-avatar-circle">CP</div>
        <div>
          <strong className="hc2-cand-name">Candidate profile</strong>
          <p className="hc2-cand-meta">Structured review-ready context</p>
        </div>
      </div>

      <div className="hc2-feat-receipt-card">
        <div className="hc2-receipt-header">
          <span className="hc2-receipt-title">ASSESSMENT SUMMARY</span>
          <span className="hc2-receipt-time">Review ready</span>
        </div>
        <div className="hc2-receipt-body">
          <div className="hc2-receipt-row"><span>Skills alignment</span><strong>Reviewed</strong></div>
          <div className="hc2-receipt-row"><span>Relevant experience</span><strong>Reviewed</strong></div>
          <div className="hc2-receipt-row"><span>Interview context</span><strong>Ready</strong></div>
          <div className="hc2-receipt-row"><span>Recruiter decision</span><strong>Required</strong></div>
        </div>
        <div className="hc2-receipt-total">
          <span>Review status</span>
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
          <span className="hc2-tdc-metric-label">Total Pipeline Activity</span>
          <span className="hc2-tdc-metric-icon">🏷</span>
        </div>
        <div className="hc2-tdc-metric-val-row">
          <strong className="hc2-tdc-metric-val">142 Applicants</strong>
          <span className="hc2-tdc-metric-badge">+3.67%</span>
        </div>
        <div className="hc2-tdc-metric-tabs">
          <span className="active">Weekly</span>
          <span>Monthly</span>
        </div>
      </div>

      {/* Main Bar Chart Card */}
      <div className="hc2-tdc-main-chart">
        <div className="hc2-tdc-chart-title">Applications Per Day</div>
        <div className="hc2-tdc-bars-container">
          <div className="hc2-tdc-y-axis">
            <span>60</span><span>50</span><span>40</span><span>30</span>
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
            <span>Active Roles</span>
            <div className="hc2-tdc-list-pills">
              <span className="active">Weekly</span>
              <span>Monthly</span>
            </div>
          </div>
          <div className="hc2-tdc-list-row">
            <div className="hc2-tdc-role-item">
              <span className="hc2-role-icon">💻</span>
              <div><strong>Senior Backend Engineer</strong></div>
            </div>
            <span>688 applicants</span>
          </div>
          <div className="hc2-tdc-list-row">
            <div className="hc2-tdc-role-item">
              <span className="hc2-role-icon">🎨</span>
              <div><strong>Product Designer</strong></div>
            </div>
            <span>768 applicants</span>
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
        <span className="hc2-dot-active" /> Interview Scheduling
      </div>
      <div className="hc2-res-info">
        <p className="hc2-res-title">Technical Evaluation Panel</p>
        <p className="hc2-res-sub">Thursday, Sep 18 · 10:30 AM CET</p>
        <span className="hc2-status-pill approved">Calendar Synced</span>
      </div>
    </div>
  );
}

const featureTabs = [
  {
    id: "Dashboard",
    label: "Dashboard",
    icon: "✕",
    headline: "Dashboard",
    description: "The dashboard feature in Hiring Compass serves as the central hub for recruitment management, offering a comprehensive and real-time overview of key operations. This user-friendly interface provides at-a-glance insights.",
    mock: <DashboardMock />,
  },
  {
    id: "Reservation",
    label: "Reservation",
    icon: "◯",
    headline: "Interview Booking",
    description: "Eliminate scheduling friction with instant candidate calendar availability, panel syncing, and automated reminder sequences.",
    mock: <ReservationMock />,
  },
  {
    id: "Receipt",
    label: "Receipt",
    icon: "✤",
    headline: "Candidate Brief",
    description: "This feature enables recruiting staff to efficiently generate and provide structured candidate scorecards and AI screening receipts at the conclusion of every stage.",
    mock: <CandidateMock />,
  },
];

export function ProductShowcase() {
  const [activeTabId, setActiveTabId] = useState("Dashboard");

  const currentTab = featureTabs.find((t) => t.id === activeTabId) || featureTabs[0];

  return (
    <section className="hc2-showcase" id="features">
      <div className="hc2-showcase-inner">
        {/* Top Header Row */}
        <div className="hc2-showcase-top">
          <div className="hc2-showcase-title-col">
            <div className="hc2-hand-badge">Features</div>
            <h2 className="hc2-showcase-h2">
              Experience Streamlined<br />Operations
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
