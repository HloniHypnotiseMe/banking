# Provider adapter contract

The first code-level integration boundary is defined in `lib/providers/banking/types.ts`.

- Capabilities are explicit and optional. An adapter may not claim card block, replacement, account or transaction access unless authorised by its provider agreement.
- Consent is passed into each read/action call; production services must validate ownership, scope, expiry and revocation server-side before invoking an adapter.
- Financial amounts are integer minor units with an explicit ISO currency. No floating-point money arithmetic.
- Provider data includes mode, source freshness and fetch timestamp. Demo fixtures are marked `demo` at both envelope and balance level.
- Card actions are optional methods. Callers must check capability and method availability, require beneficiary confirmation, use idempotency keys, and report only provider-confirmed results.
- The demo fixtures are synthetic and are not a provider adapter. They have no network calls, credentials, or ability to access or alter accounts.

This contract is an engineering boundary, not evidence of any bank integration or regulatory approval.
