# GOTCHA — Shared Career Intelligence Core

## Vision
Gotcha is a global career operating system, not a job board. The product continuously turns professional identity, market opportunities and outcomes into better next actions.

## Canonical development sequence
1. Foundation — UI, auth, profile, database, jobs, applications, documents.
2. Intelligence — matching, CV Intelligence, Career Coach, company intelligence, market intelligence.
3. Automation — AI Career Agent, Hunt Mode, alerts, follow-ups, application assistance.
4. Global — countries, currencies, salary intelligence, relocation, visa/sponsorship, remote work.
5. Network — referrals, mentors, communities, recruiters.
6. Career Digital Twin — continuously learn from profile, searches, applications, interviews, outcomes and goals.

## Core principle
Every feature writes useful structured signals to the same career intelligence model. Every recommendation reads from that model. UI is an interface to the intelligence, not the intelligence itself.

## Canonical entities
- ProfessionalProfile: identity, experience, skills, achievements, certifications, languages, preferences, privacy.
- CareerGoal: target role, level, industry, markets, compensation, timeline and desired progression.
- Opportunity: normalized job, company, source, location, work model, compensation, skills, freshness, sponsorship and trust signals.
- Match: explainable score plus skill, experience, industry, compensation, location, work-model, mobility and growth dimensions.
- Application: opportunity, stage, documents, contacts, activity, follow-ups, interview events, outcomes and offer details.
- Interview: role, stage, questions, preparation, practice results, feedback and outcome.
- MarketSignal: hiring trend, demand, salary, company expansion, skill demand and geographic signal.
- CareerEvent: profile change, search, save, apply, rejection, interview, offer, learning, referral, mentorship, agent recommendation and user feedback.
- CareerAction: recommended next action, reason, priority, due date, completion and outcome.
- NetworkRelationship: referral, mentor, community and recruiter relationship with consent/visibility state.

## Intelligence services
### 1. Opportunity Matching
Return an explainable 0–100 match, not a black box. Store component scores and gaps.

### 2. Career Readiness
Evaluate profile completeness, evidence quality, skills, CV quality, interview readiness and market competitiveness.

### 3. Application Intelligence
Calculate funnel conversion, response rate, interview rate, offer rate, ageing and follow-up opportunities. Learn which job types and CV variants produce outcomes.

### 4. Global Mobility
Normalize country, city, remote/hybrid/on-site, currency, compensation, work authorization, sponsorship and relocation readiness.

### 5. Trust / Gotcha Shield
Score source quality, employer completeness, suspicious payment language, freshness and other available risk signals. Never present an unverified claim as fact.

### 6. Career Agent
Use the Core to plan and recommend actions. Autonomous actions require explicit user consent; informational recommendations may be automatic.

### 7. Digital Twin
Maintain a current career representation derived from durable user facts and observed career events. Never silently change authoritative profile facts from inferred signals. Clearly distinguish user-provided facts, verified data and AI inference.

## Event loop
`event -> normalize -> intelligence update -> recommendation -> user action -> outcome -> learning signal`

Examples:
- `application.rejected` -> identify repeated skill/role/company patterns -> adjust recommendations.
- `interview.passed` -> increase evidence confidence for relevant role family.
- `application.no_response` -> detect source/channel or CV variant underperformance.
- `profile.skill_added` -> recompute opportunity matches.
- `offer.received` -> update compensation and career trajectory signals.

## Global-first requirements
- Store monetary values with currency, not a bare number.
- Store locations as country/region/city where available.
- Never assume a user's right to work in a country.
- Sponsorship is an opportunity attribute requiring source evidence.
- Remote eligibility is opportunity-specific; do not equate remote with globally employable.
- Time-sensitive market signals require timestamps and freshness.
- User privacy controls must apply across search, recruiter visibility, network and recommendations.

## Quality gates
A capability is not complete until it has:
1. Data model/state.
2. Service/domain logic.
3. UI flow.
4. Persistence.
5. Loading/empty/error states.
6. Permission/privacy behavior.
7. Explainability where AI is involved.
8. Tests/typecheck/lint/build coverage.
9. Outcome/event instrumentation.
10. No fake success state or hard-coded claim presented as live intelligence.

## Product north star
**The Hunt Ends Here.**
Gotcha should proactively answer four questions for every professional:
1. What opportunities should I pursue?
2. How do I become the strongest candidate?
3. What should I do next?
4. How can my next career move be better than my last one?
