# SASSA ACCESS — implementation plan

**Status:** Architecture and discovery baseline  
**Date:** 10 November 2026  
**Product decision:** Serve all SASSA grant beneficiaries, regardless of their receiving bank. First release must address both account visibility and lost-card support.  
**Code baseline:** `main` at `eb590063807cd4b7af39eff89cee2897f24232d1`.

## Product promise

Help a beneficiary understand the money in their grant-receiving account and take the next safe step when a bank card is lost or stolen. The product is an independent financial-access and assistance layer; it is not SASSA, a bank, a card issuer, or a payment switch.

Never imply that SASSA ACCESS can see an account, freeze a card, replace a card, withdraw cash, or move funds unless the relevant bank or authorised provider has supplied and approved that capability.

## First-release outcomes

1. **Account visibility:** Show verified account balance and bank-supplied transaction activity through an authorised bank/open-finance integration. Clearly label source, last-updated time, pending transactions, and unavailable/stale data. Until a live integration is contracted and tested, use synthetic demo data or an explicitly labelled user-provided statement import; never fabricate live balances.
2. **Lost-card support:** Give a fast, low-literacy guided incident flow: select bank, lost/stolen, immediate safety advice, official bank contact and replacement steps, case reference/status where a bank partnership supports it. A "block card" action must only be offered when the bank exposes an authorised action and confirms its result. Otherwise route the user to the bank's official channel.
3. **All-bank design:** Bank-neutral user/account model and provider adapter boundary. Postbank is a sensible first pilot candidate, but not an eligibility restriction. Add further South African banks only through verified agreements and tested capabilities.
4. **Accessible assistance:** Mobile-first, low-data, large controls, plain language, screen-reader support, language-ready content, optional WhatsApp/assisted support. Do not require an email address or smartphone as the only route to assistance.
5. **Trust and safety:** Explicit, revocable consent; data minimisation; strong authentication; encrypted secrets and sensitive fields; audit trails; clear fees; no sale of beneficiary data; no asking for bank PINs, passwords, CVVs, or OTPs.

## Repository audit — verified on main

### Existing reusable foundation
- Next.js 14.2.3, React 18, TypeScript, Tailwind, ShadCN/Radix components.
- Existing responsive dashboard, navigation, account cards, balance summary, transaction table/history, charts and authentication screens.
- Appwrite server-side session/admin client wrapper and user/account/transaction persistence actions.
- MIT-licensed fork of `adrianhajdin/banking`.

### Existing US-specific coupling — must be removed or isolated before a South African release
- `lib/plaid.ts` hardcodes `PlaidEnvironments.sandbox`.
- `lib/actions/user.actions.ts` requests Plaid country `US`, creates a Dwolla customer and a Plaid-to-Dwolla processor token during signup/linking.
- `lib/actions/bank.actions.ts` calls Plaid account/transaction/institution APIs and requests institution metadata with country `US`.
- `lib/actions/dwolla.actions.ts` hardcodes transfer currency `USD`.
- `components/PlaidLink.tsx` and `components/Sidebar.tsx` make Plaid linking a core UI path.
- `components/AuthForm.tsx`, `lib/utils.ts`, and `types/index.d.ts` collect/store US address/state/postal/SSN fields. SSN must not be repurposed as a South African ID field.
- `lib/utils.ts` formats money as `en-US` / `USD`.
- `constants/index.ts` contains hard-coded Plaid sandbox access tokens and sample account/user identifiers. Treat these as exposed test credentials, remove them from any production path, and rotate/revoke them if still active. Do not use these fixtures for real beneficiaries.
- Current data model stores provider access tokens/funding-source URLs alongside account records; this requires a redesigned secret boundary and least-privilege access.
- Existing transfer flow is US/Dwolla-specific and must remain disabled in SASSA ACCESS until a South African payment provider, regulatory model, and explicit product requirement are approved.
- `transactionsSync` in `lib/actions/bank.actions.ts` does not persist/pass the sync cursor. Replace with the provider's documented incremental-sync pattern and idempotent persistence before relying on transaction completeness.
- `.env.example` exposes the existing Appwrite/Plaid/Dwolla variable names (values blank); no South African provider integration is present in the inspected tree.
- No test/spec files, middleware, Dockerfile or CI workflow appeared in the inspected repository tree. This is a discovery result, not proof that no external checks exist.

## Target architecture

### Application layers
1. **Beneficiary experience:** dashboard, account activity, grant deposit explanation, lost/stolen card workflow, support and notification preferences.
2. **Domain API:** beneficiary profile, consent, linked accounts, balances, transactions, card incidents, notifications, support cases.
3. **Provider adapter interface:** capability discovery and bank-specific operations. Example capabilities: account list, balance, transaction history, transaction webhooks, card status, card block, replacement-case status. Every capability is optional and bank-authorised; absence must fail closed.
4. **Provider adapters:** one adapter per contracted South African bank/open-finance/payment provider. Postbank is a pilot candidate; add all other participating banks without changing beneficiary-facing domain contracts.
5. **Data/security layer:** PostgreSQL or an explicitly selected managed store, encrypted provider credentials in a dedicated secrets facility, consent ledger, append-only security/audit events, idempotent webhook ingestion, retention/deletion workflows.
6. **Operations:** observability without secrets/PII, incident response, support escalation, reconciliation, provider health and stale-data indicators.

### Core domain records (initial proposal)
- `beneficiary_profile`: internal ID, minimum necessary profile fields, verified contact methods; never store a bank PIN/password/OTP.
- `consent_grant`: beneficiary, provider, scopes, purpose, wording/version, granted/revoked timestamps and evidence.
- `financial_connection`: beneficiary, provider, external reference, status, granted scopes, last successful sync; provider secrets stored separately.
- `account_snapshot`: provider account reference, masked display identifier, currency, balance, available balance, source timestamp and freshness.
- `transaction`: provider transaction reference, account reference, amount in minor units, ISO currency, description, posted/pending status, transaction date, source timestamp, idempotency key.
- `card_incident`: beneficiary, bank/provider, incident type, created time, assistance path, provider case reference, status, resolution timestamps.
- `audit_event`: actor, action, target, timestamp, correlation ID, outcome; minimise and redact personal data.

## Delivery phases

### Phase 0 — safe foundation (current branch)
- Preserve the upstream application and create a dedicated SASSA ACCESS branch.
- Record the code audit and architecture boundaries.
- Establish an explicit demo-only mode and provider capability contract before changing live account flows.
- Inventory dependencies, runtime configuration, authentication/session security, Appwrite collections and deployment assumptions.

### Phase 1 — beneficiary MVP
- Rebrand and redesign the existing responsive dashboard for SASSA ACCESS.
- Replace USD formatting with ZAR-aware, locale-aware money formatting and integer minor-unit arithmetic.
- Build beneficiary onboarding with minimal data and contact verification; no SSN fields.
- Implement account visibility states (connected, consent required, stale, unavailable, demo) and transparent data provenance.
- Build lost-card guided support and official-contact directory with verified, versioned source records.
- Add accessibility and language-ready copy. Use synthetic demo accounts only in non-production.

### Phase 2 — first bank integration
- Complete legal, compliance, security and procurement assessment with the chosen bank/provider.
- Agree API scopes, consent wording, authentication, rate limits, incident escalation, service levels, webhook signatures, data retention and support ownership.
- Implement and independently test the first adapter (Postbank is a candidate, not an assumed agreement).
- Enable only contracted capabilities; test real bank sandbox/UAT before production.
- Add bank-confirmed card block only if explicitly supported and contractually authorised.

### Phase 3 — expand bank coverage
- Add additional bank adapters based on signed agreements and beneficiary demand.
- Standardise provider capability reporting and user experience across banks.
- Add monitoring, reconciliation, dispute handling and provider-specific service status.

### Phase 4 — regulated payment capabilities (separate approval gate)
- Do not enable cash-out, QR payments, transfers, stored value or payment initiation merely because the starter repo contains a transfer screen.
- Obtain South African legal/regulatory advice and required licences/partner sponsorship, risk controls, safeguarding, AML/CFT and operational approvals before any such feature.

## Release gates
- No live account claim without a verified provider response and timestamp.
- No card block claim without bank confirmation.
- No funds movement in MVP.
- No collection of credentials that belong to a bank.
- No production use of hard-coded test tokens or synthetic records.
- Consent, access control, encryption, audit, deletion/retention, vulnerability, accessibility and incident-response checks pass before pilot.
- Independent legal/compliance sign-off and bank/provider UAT approval before live integration.

## Immediate next engineering tasks
1. Inspect full auth/session and Appwrite schema/deployment configuration; add automated tests and CI.
2. Design the provider-neutral TypeScript contracts and mock adapter with deterministic synthetic fixtures.
3. Add SASSA ACCESS beneficiary UI using the existing dashboard components without breaking the Horizon baseline.
4. Replace US-specific onboarding and money formatting; isolate Plaid/Dwolla code behind legacy-only modules and remove all default UI references.
5. Implement lost-card guidance/case tracking without pretending to perform bank actions.
6. Add consent, data-provenance and audit foundations before any real provider credentials or beneficiary data are introduced.

## Decision record
- Audience: **all SASSA grant beneficiaries**, irrespective of receiving bank.
- First-release priority: **account visibility and lost-card protection together**.
- Integration posture: provider-neutral; Postbank is a candidate for the first pilot, not the only supported bank.
- Money movement: excluded from first release.
- Branding/affiliation: independent product; do not imply SASSA or bank endorsement without written authorisation.
