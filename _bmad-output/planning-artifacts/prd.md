---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['c:/Pojets/ImpactHub/_bmad-output/analysis/brainstorming-session-2026-01-21.md']
workflowType: 'prd'
classification:
  projectType: 'SaaS/Web Platform'
  domain: 'Community/Church Management'
  complexity: 'Medium'
  projectContext: 'Greenfield'
---

# Product Requirements Document - ImpactHub

**Author:** Katakuri
**Date:** 2026-01-22
**Version:** 1.0 (Ready for Review)

## 1. Executive Summary

**ImpactHub** is a connection-first SaaS platform designed for the ICC church network. It solves the fragmentation between "Sunday Service" and "Daily Life" by providing a unified digital space for cell groups, volunteering, and pastoral care.

**The core problem:** Current church management is erratic—spread across WhatsApp groups, Excel sheets, and hallway conversations—leading to lost data and member disengagement.
**The solution:** A **"Phygital" Platform** that balances a "Global" robust architecture (Multi-tenant, Standardized) with a "Local" personal touch (Custom fields, Local branding), allowing members to connect, serve, and grow autonomously.

---

## 2. Success Criteria

### User Success
*   **Autonomy (Self-Service):** The primary goal is that a user can access church information/services *without* needing to go through a human intermediary.
*   **Frictionless Entry:** Registration asks for the "Strict Minimum" only and session remains universally persistent.

### Business Success
*   **100% Identification:** Every user accessing the core platform (Cells, Marketplace) is identified (No "ghost" users).
*   **High Conversion:** The public "Vision Video" successfully convinces 50%+ of visitors to cross the registration gate.

---

## 3. Product Scope & Phased Development

### MVP Strategy (Phase 1)
*   **Approach:** "Experience-First MVP". A Feature-Complete V1 that replaces chaotic manual processes entirely.
*   **Philosophy:** "Low-Code for Non-Core, Custom for Core." We custom build the unique value (Marketplace, Cells) but link out for generic value (Payments).

### MVP Feature Set
*   **Public Zone:** Vision Video (The Hook).
*   **Auth:** "Strict Minimum" registration gate + Persistent Session.
*   **Impact Cells:** Geo-search, filtering, secure contact forms.
*   **Volunteering Marketplace:** Ministry video cards, "One-click try" application.
*   **Smart Feedback:** Automated "Pulse Check" notifications.
*   **Admin Dashboard:** Request delegation and status tracking.

### Future Phases
*   **Phase 2 (Expansion):** Native Mobile Apps (iOS/Android) and Global Network Intelligence (Stats).
*   **Phase 3 (Vision):** Deployment to the entire ICC network.

---

## 4. User Journeys

### Journey 1: Sarah - From Vision to Connection (The Visitor)
**Actor:** Sarah, 28, new in town, seeking spiritual connection but wary of "heavy" commitment.
1.  **The Hook:** Sarah lands on `impacthub.church`. She watches the *Vision Video* (Public). It resonates. She clicks "Find a Group".
2.  **The Gate:** A modal appears: *"Join the family to see where we meet."* She signs up (Name, Email, Password) in 10 seconds.
3.  **The Discovery:** She sees a map of "Impact Cells". She filters by "Young Adults". One is 500m away.
4.  **The Action:** She clicks "Contact Leader". The system sends a notification to the leader (phone numbers hidden).
5.  **Success:** She receives an immediate automated confirmation: *"David has received your message and will contact you shortly."*

### Journey 2: Pastor David - From Chaos to Order (The Local Leader)
**Actor:** David, 45, Pastor, overwhelmed by WhatsApp messages.
1.  **The Trigger:** David's phone buzzes. Notification: *"New Contact Request: Sarah"*.
2.  **The Delegation:** He opens the Admin Dashboard. He sees Sarah's profile. He clicks "Assign to Team Member" and selects "Julie".
3.  **The Tracking:** Two days later, he sees the request status is "Contacted". He sees a note from Julie: *"Met Sarah for coffee."*
4.  **Success:** David feels in control. No one slipped through the cracks.

### Journey 3: Marc - Finding My Place (The Volunteer)
**Actor:** Marc, 35, member for 6 months, wants to serve but is shy.
1.  **The Search:** Marc browses the *Volunteering Marketplace*. He filters by "Technical Skills".
2.  **The Sell:** He clicks "Media Team". He watches a 30s video of the team having fun.
3.  **The Decision:** He sees a button: *"Join the Team - One Sunday Trial"*. He clicks it.
4.  **Success:** He is instantly added to the onboarding flow.

---

## 5. Innovation & Key Differientiators

### Smart Feedback Loop (Interaction Innovation)
*   **Concept:** Proactive "Push" feedback instead of passive "Pull" boxes.
*   **Mechanism:** System triggers a notification (e.g., Sunday 2 PM): *"How was the worship today?"* with a simple emotion selector.
*   **Differentiation:** Shifts feedback from "Complaint Box" to "Pulse Check".

### "Global-Local" Hybrid Architecture (Technical Innovation)
*   **Concept:** A Multi-tenant system that feels like a bespoke Local App.
*   **Mechanism:** "Module Factory" allows local leaders to activate/deactivate modules (Tuiles) and define custom field aliases (`display_name`).
*   **Differentiation:** Solves the classic "Rigid Enterprise vs. Messy Custom" dilemma.

---

## 6. Technical Architecture & Constraints

### SaaS / Multi-Tenancy
*   **Structure:** Shared Database with Discriminator (`tenant_id`).
*   **Isolation Policy:** **STRICT.** Middleware must enforce `tenant_id` on ALL queries. Cross-tenant access is forbidden (except for Global Admin stats).
*   **Permissions (RBAC):** Roles (Local Admin, Leader, Member) are strictly scoped to their Tenant.

### Integration Strategy (V1)
*   **Payment/Donations:** Low-Code/Manual Links to existing HelloAsso/Stripe pages. No deep API integration in V1.
*   **Emailing:** Transactional only (Postmark/Resend). Marketing via external export (Mailchimp).

---

## 7. Functional Requirements

### Authentication & Access
*   **FR1:** Visitor can watch the "Vision Video" without creating an account (Public Access).
*   **FR2:** Visitor must register (Name, Email, Password) to access "Impact Cells" or "Volunteering Marketplace".
*   **FR3:** System maintains user session indefinitely ("Always Logged In").

### Impact Cells (Core)
*   **FR4:** Member can view a map of Impact Cells and sort/filter by distance.
*   **FR5:** Member can filter cells by metadata (e.g., "Young Adults", "Family").
*   **FR6:** Member can contact a Cell Leader via an internal form (phone numbers hidden).

### Volunteering Marketplace
*   **FR7:** Member can browse a list of Service Teams/Departments.
*   **FR8:** Member can play a "Vision Video" embedded in team cards.
*   **FR9:** Member can apply to a team with a single action ("One-click Try").

### Smart Feedback
*   **FR10:** System triggers an automated "Pulse Check" notification after events.
*   **FR11:** Member can respond to feedback using a simple sentiment selector.

### Admin & Delegation
*   **FR12:** Local Leader can view contact requests scoped strictly to their own tenant.
*   **FR13:** Local Leader can assign a request to a specific team member.
*   **FR14:** Local Leader can update request status (New -> Contacted -> Closed).

---

## 8. Non-Functional Requirements

### Security & Compliance
*   **Data Isolation:** Row-Level Security (RLS) must be enforced at the database layer.
*   **GDPR Compliance:** Data hosted in Europe. Support for "Right to be Forgotten".

### Performance & Reliability
*   **Peak Load:** System handles Sunday Morning traffic (08:00 - 14:00) with no degradation.
*   **PWA Speed:** "First Contentful Paint" < 2 seconds on 4G.
*   **Availability:** 99.9% uptime guarantee during Sunday service window.

### Accessibility
*   **Standards:** WCAG 2.1 AA (High contrast for seniors).
*   **Scaling:** UI supports system-level font scaling.

**Author:** Katakuri
**Date:** 2026-01-22

## Strategic Architecture (from ADR 001)

### 1. Multi-Tenancy Strategy
*   **Decision:** Shared Database with Discriminator (`tenant_id`) & Row-Level Security (RLS).
*   **Rationale:** Balances development velocity (V1 speed) with strict data isolation. Allows for efficient "Network" level aggregation (e.g., global stats) which is harder with database-per-tenant.
*   **Extensibility:** Uses `JSONB` columns to handle "Local" custom fields while keeping "Global" core fields structured.

### 2. Modularity Strategy ("Module Factory")
*   **Decision:** Modular Monolith organized by Domain.
*   **Implementation:** Features (Tuiles) are distinct modules within the codebase, enabled/disabled via **Tenant-Specific Feature Flags**.
*   **Rationale:** Avoids the operational complexity of microservices for V1 while maintaining clean code separation. Allows each church to "activate" only the modules they need (e.g., Nursery, Carpool).

## Key Requirements (from Stakeholder Round Table)

### 1. Dual-Layer Taxonomy (Global vs. Local)
*   **Requirement:** The system MUST support user-definable "Display Names" (e.g., "Kingdom Kids") distinct from fixed "System Types" (e.g., "kids_ministry").
*   **Goal:** Solves the tension between Local cultural identity and Global reporting consistency.

### 2. Public-First Access Strategy
*   **Requirement:** Core "Discovery" features (Map, Service Times, Vision Video) MUST be accessible via public web (PWA) without authentication.
*   **Goal:** Reduces friction for new visitors (Sarah persona).

### 3. Progressive Profiling
*   **Requirement:** Defer account creation until a high-value action is taken (e.g., "Join Team", "Message Leader").
*   **Goal:** Maximizes engagement by removing upfront barriers.

## Success Criteria

### User Success
*   **Autonomy (Self-Service):** The primary goal is that a user can access church information/services *without* needing to go through a human intermediary (leader/pastor).
*   **Frictionless Entry:** Registration asks for the "Strict Minimum" only and session remains universally persistent ("Always Logged In").

### Business Success
*   **100% Identification:** "Registration is not an option." Every user accessing the core platform (Cells, Marketplace) is identified.
*   **High Conversion:** The "Vision Video" (Public) successfully convinces the user to cross the registration gate.

### Product Scope

#### MVP (V1 Launch) - "The Full Experience"
*   **Strategic Scope:** Feature-complete V1 (No deferrals to V2).
*   **Public Zone:** Vision Video ONLY.
*   **Gated Zone (Requires Auth):**
    *   **Impact Cells:** Search & Contact.
    *   **Volunteering Marketplace:** Full access to ministry opportunities.
    *   **Smart Feedback:** Proactive feedback loop.
    *   **My Journey:** Spiritual path management.
*   **Auth Strategy:** Strict Minimum Fields + Persistent Session.

#### Vision (Future)
*   **Network Expansion:** Deployment to other ICC churches.
*   **Native Apps:** iOS/Android versions if PWA limits are reached.

## User Journeys

### 1. Sarah - From Vision to Connection (The Visitor)
**Actor:** Sarah, 28, new in town, seeking spiritual connection but wary of "heavy" commitment.
*   **The Hook:** Sarah lands on `impacthub.church`. She watches the *Vision Video* (Public). It resonates. She clicks "Find a Group".
*   **The Gate:** A modal appears: *"Join the family to see where we meet."* Motivated by the video, she signs up (Name, Email, Password). It takes 10 seconds. She is now logged in.
*   **The Discovery:** She sees a map of "Impact Cells". She filters by "Young Adults". One is 500m away.
*   **The Action:** She clicks "Contact Leader". She doesn't need to find a phone number; the system sends a notification to the leader.
*   **Success:** She receives an immediate automated confirmation: *"David has received your message and will contact you shortly."* She feels welcomed, not exposed.

### 2. Pastor David - From Chaos to Order (The Local Leader)
**Actor:** David, 45, Pastor, overwhelmed by WhatsApp messages and disorganized spreadsheets.
*   **The Trigger:** David's phone buzzes. Notification: *"New Contact Request: Sarah"*.
*   **The Delegation:** He opens the Admin Dashboard. He sees Sarah's profile. He knows his schedule is full, so he clicks "Assign to Team Member" and selects "Julie (Welcome Team)".
*   **The Tracking:** Two days later, he checks his dashboard. The request status is "Contacted". He sees a note from Julie: *"Met Sarah for coffee. She's coming this Sunday."*
*   **Success:** David feels in control. No one slipped through the cracks.

### 3. Marc - Finding My Place (The Volunteer)
**Actor:** Marc, 35, member for 6 months, wants to serve but is shy.
*   **The Search:** Marc browses the *Volunteering Marketplace*. He filters by "Technical Skills".
*   **The Sell:** He clicks on the "Media Team" card. Instead of a boring text description, he watches a 30s video of the team having fun behind the cameras.
*   **The Decision:** He sees a button: *"Join the Team - One Sunday Trial"*. Low risk. He clicks it.
*   **Success:** He is instantly added to the "Media Candidates" group and receives the onboarding schedule.

### Journey Requirements Summary
*   **Auth System:** High-conversion "Gate" (Modal style) + Persistent Session.
*   **Map/Search:** Geo-location and filtering for Cells.
*   **Notification Engine:** Real-time alerts (Push/Email) for leaders.
*   **Workflow Engine:** Ability to assign tasks and track status (New -> Assigned -> Done).
*   **Rich Media:** Support for video embedding in "Marketplace" cards.

## Innovation & Novel Patterns

### Detected Innovation Areas

#### 1. Smart Feedback Loop (Interaction Innovation)
*   **Concept:** Proactive "Push" feedback instead of passive "Pull" boxes.
*   **Mechanism:** System triggers a notification (e.g., Sunday 2 PM): *"How was the worship today?"* with a simple emotion selector.
*   **differentiation:** Shifts feedback from "Complaint Box" (only unhappy people) to "Pulse Check" (representative sample).

#### 2. "Global-Local" Hybrid Architecture (Technical Innovation)
*   **Concept:** A Multi-tenant system that feels like a bespoke Local App.
*   **Mechanism:** "Module Factory" allows local leaders to activate/deactivate modules (Tuiles) and define custom field aliases (`display_name`).
*   **Differentiation:** Solves the classic "Rigid Enterprise vs. Messy Custom" dilemma in network organizations.

### Validation Approach
*   **Smart Feedback:** validated by response rate vs. traditional email surveys.
*   **Global-Local:** Validated by deploying to a second church (e.g., ICC Extension) and confirming setup time < 2 hours.

### Risk Mitigation
*   **Feedback Fatigue:** innovative solution relies on frequency management (e.g., max 1 request/month per user).
*   **Complexity:** The "Module Factory" increases backend complexity. Mitigation: Robust integration tests for module interactions.

## SaaS/Web Platform Specific Requirements

### Project-Type Overview
ImpactHub is a **Multi-Tenant SaaS** platform designated for a network of churches. While it shares a common codebase ("The Core"), each church tenant operates in a **Strictly Isolated** environment regarding member data.

### Technical Architecture Considerations

#### 1. Multi-Tenancy Model
*   **Strategy:** Shared Database with Discriminator (`tenant_id`).
*   **Isolation Policy:** **STRICT.**
    *   Middleware must enforce `tenant_id` on ALL queries.
    *   Cross-tenant data access is FORBIDDEN at the application layer.
    *   *Exception:* "Global Admin" (HQ) can view aggregated stats (anonymized if possible).

#### 2. Permission Matrix (RBAC)
*   **Scope Enforcement:** Roles are scoped to a specific Tenant.
    *   `Global Admin`: System-wide access.
    *   `Local Admin (Pastor)`: Full access ONLY to their `tenant_id`.
    *   `Local Leader`: Access ONLY to assigned groups/departments within their `tenant_id`. **Cannot** see/manage other churches.
    *   `Member`: Access own profile + Public/Gated content of their church.

#### 3. Integration Strategy (V1)
*   **Recommendation:** **Low-Code / Manual.**
    *   **Payments/Donations:** Simple external links to existing HelloAsso/Stripe pages. No API integration in V1.
    *   **Emailing:** System sends transactional emails (Postmark/Resend). Marketing newsletters remain in existing tools (Mailchimp) via CSV export if needed.
    *   **Rationale:** "Volunteering Marketplace" and "Impact Cells" are core to V1. Billing/Newsletter integrations add high complexity/risk.

### Implementation Considerations
*   **Compliance:** Strict data isolation simplifies GDPR compliance per church.
*   **Performance:** Indexes must always include `tenant_id`.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
*   **MVP Approach:** "Experience-First MVP". The goal is a Feature-Complete V1 that replaces the current chaotic manual processes entirely.
*   **Philosophy:** "Low-Code for Non-Core, Custom for Core." We custom build the unique value (Marketplace, Cells) but link out for generic value (Payments).

### MVP Feature Set (Phase 1)
**Must-Have Capabilities:**
*   **Public Zone:** Vision Video.
*   **Auth:** "Strict Minimum" registration gate.
*   **Impact Cells:** Geo-search, filtering, contact form.
*   **Volunteering Marketplace:** Ministry video cards, "One-click try" application.
*   **Smart Feedback:** Automated "Pulse Check" notifications.
*   **Admin Dashboard:** Request delegation and status tracking.

### Post-MVP Features

**Phase 2 (Expansion):**
*   **Native Mobile Apps:** iOS/Android versions (if PWA engagement limits are reached).
*   **Network Intelligence:** Aggregated statistics across multiple churches for Global Leadership.

**Phase 3 (Vision):**
*   **Global Deployment:** Rollout to the entire ICC network.

### Risk Mitigation Strategy
*   **Technical Risk:** V1 scope is large. **Mitigation:** Strict "No Deep Integration" rule. We use links for Payments/Events to save development time.
*   **Adoption Risk:** Users might bounce at the Registration Gate. **Mitigation:** The "Vision Video" must be highly compelling (Content Strategy).

## Functional Requirements

### Authentication & Access ("The Gate")
- FR1: Visitor can watch the "Vision Video" without creating an account (Public Access).
- FR2: Visitor must register (Name, Email, Password) to access "Impact Cells" or "Volunteering Marketplace".
- FR3: System maintains user session indefinitely ("Always Logged In") to minimize friction.

### Impact Cells (Core Discovery)
- FR4: Member can view a map of Impact Cells and sort/filter by distance from their location.
- FR5: Member can filter cells by metadata (e.g., "Young Adults", "Family").
- FR6: Member can contact a Cell Leader via an internal form (phone numbers hidden).

### Volunteering Marketplace (Engagement)
- FR7: Member can browse a list of Service Teams/Departments recruiting volunteers.
- FR8: Member can play a "Vision Video" embedded in the team card.
- FR9: Member can apply to a team with a single action ("One-click Try").

### Smart Feedback (Innovation)
- FR10: System triggers an automated "Pulse Check" notification to attendees after scheduled events.
- FR11: Member can respond to feedback requests using a simple sentiment selector (Emoji).

### Admin & Delegation (Management)
- FR12: Local Leader can view contact requests scoped strictly to their own tenant/church.
- FR13: Local Leader can assign a request to a specific team member.
- FR14: Local Leader can update the status of a request (New -> Contacted -> Closed).

## Non-Functional Requirements

### Security & Compliance (Critical)
*   **Data Isolation:** Row-Level Security (RLS) must be enforced at the database layer to physically separate tenant data.
*   **GDPR Compliance:** Data must be hosted in Europe. "Right to be Forgotten" workflows must be supported.

### Performance (Mobile First)
*   **Peak Load:** System must handle "Sunday Morning" traffic spikes (08:00 - 14:00) with no degradation.
*   **PWA Speed:** "First Contentful Paint" must be < 2 seconds on 4G networks to ensure video retention.

### Accessibility (Multi-Generational)
*   **Visual Standards:** Must meet WCAG 2.1 AA (High contrast for seniors).
*   **Responsive Scaling:** UI must support system-level font scaling without breaking layout.

### Reliability
*   **Service Window:** 99.9% Availability guarantee during the critical Sunday window (08:00 - 14:00).
