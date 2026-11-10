# SASSA ACCESS — security and integration boundaries

## Non-negotiable rules

- The app is an independent assistance and visibility layer, not a bank, SASSA system, card issuer or payment switch.
- Never collect or proxy a beneficiary's bank PIN, online-banking password, CVV, full card number or OTP.
- Do not store provider access tokens in ordinary beneficiary/account records. Use a dedicated encrypted secret store with rotation and least-privilege access.
- All account data must be obtained through a bank/provider-authorised API and explicit, purpose-specific beneficiary consent.
- User-provided statements must be clearly distinguished from live-connected data; parse locally where practical, minimise retention and provide deletion.
- Card freeze/block, cash withdrawal, card replacement, payment initiation and transfers are unavailable unless the issuing bank/provider exposes and authorises the exact capability. Always fail closed.
- No live beneficiary data or payment credentials in demos, screenshots, test fixtures or logs.
- Use synthetic data for development and public demonstrations.
- Do not use SASSA branding, logos or language implying government endorsement without written permission.

## Threat areas to model
- Account takeover and SIM-swap / phone-number reassignment.
- Social engineering, fake support agents and beneficiary impersonation.
- Consent theft, over-broad access scopes and insider access.
- Token theft, webhook spoofing/replay and duplicate transaction ingestion.
- Lost/stolen device exposure and insecure notifications.
- Incorrect/stale balance or transaction display causing financial harm.
- Malicious or fraudulent assisted-service agents.
- Denial of service and provider outages during grant-payment periods.

## Required controls before a live pilot
- Threat model and independent security review.
- Strong, risk-based authentication and secure session lifecycle; recovery must not rely solely on possession of a phone number.
- Step-up verification for sensitive actions and contact-detail changes.
- Encryption in transit and at rest; field-level protection for sensitive identity data.
- Strict server-side authorisation on every beneficiary/account/case object.
- Signed webhook verification, replay protection, idempotency and reconciliation.
- Rate limits, abuse detection, secure support-agent roles and complete audit trail.
- No PII, account identifiers, tokens or OTPs in logs/analytics/crash reports.
- POPIA impact assessment, lawful basis/purpose limitation, operator agreements, retention/deletion schedule, data-subject request process and breach response.
- South African legal review of any financial-services, payment-system, credit, AML/CFT and consumer-protection implications.
- Bank/provider UAT, operational escalation and written approval before production.

## Data display contract
Every financial datum must carry:
- Provider/source identity.
- Account identifier masked for display.
- Currency (ZAR where confirmed by provider).
- Source timestamp and last successful refresh.
- Posted/pending status for transactions.
- Freshness state: current, stale, unavailable, or demo.
- A clear message when a provider has not returned data.

Never calculate or infer a grant payment date, available balance, or card status from a generic calendar or from another beneficiary's activity.
