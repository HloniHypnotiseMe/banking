/**
 * Provider-neutral financial access contracts for SASSA ACCESS.
 *
 * These contracts deliberately describe capabilities, not assumed bank features.
 * A production adapter may expose only capabilities explicitly authorised by its
 * bank/provider agreement. Never implement unsupported operations as local success.
 */

export type ProviderMode = "demo" | "sandbox" | "production";

export type ProviderCapability =
  | "accounts.read"
  | "balances.read"
  | "transactions.read"
  | "transactions.webhook"
  | "cards.status.read"
  | "cards.block"
  | "cards.replacement.create"
  | "cards.replacement.status";

export type DataFreshness = "current" | "stale" | "unavailable" | "demo";

export type ConnectionStatus =
  | "connected"
  | "consent_required"
  | "stale"
  | "unavailable"
  | "revoked";

export interface ProviderConsent {
  consentId: string;
  beneficiaryId: string;
  providerId: string;
  scopes: ProviderCapability[];
  purpose: string;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface FinancialAccount {
  providerAccountId: string;
  displayName: string;
  maskedIdentifier: string;
  currency: string;
  accountType: "grant" | "transactional" | "savings" | "other";
}

export interface BalanceSnapshot {
  providerAccountId: string;
  currentBalanceMinor: number;
  availableBalanceMinor: number | null;
  currency: string;
  sourceTimestamp: string;
  freshness: DataFreshness;
}

export interface FinancialTransaction {
  providerTransactionId: string;
  providerAccountId: string;
  description: string;
  amountMinor: number;
  currency: string;
  direction: "debit" | "credit";
  status: "pending" | "posted" | "reversed";
  transactionTimestamp: string;
  sourceTimestamp: string;
}

export interface ProviderData<T> {
  providerId: string;
  providerName: string;
  mode: ProviderMode;
  freshness: DataFreshness;
  fetchedAt: string;
  data: T;
}

export interface CardBlockRequest {
  providerAccountId: string;
  reason: "lost" | "stolen" | "suspected_fraud";
  idempotencyKey: string;
  beneficiaryConfirmation: boolean;
}

export interface CardBlockResult {
  providerCaseReference: string;
  status: "received" | "processing" | "blocked" | "rejected";
  confirmedAt?: string;
  message: string;
}

export interface ReplacementCaseRequest {
  providerAccountId: string;
  deliveryOrCollectionPreference?: string;
  idempotencyKey: string;
}

export interface ReplacementCaseResult {
  providerCaseReference: string;
  status: "received" | "processing" | "ready_for_collection" | "dispatched" | "completed" | "rejected";
  message: string;
}

export interface BankingProviderAdapter {
  readonly providerId: string;
  readonly providerName: string;
  readonly mode: ProviderMode;
  readonly capabilities: ReadonlySet<ProviderCapability>;

  listAccounts(input: {
    beneficiaryId: string;
    consent: ProviderConsent;
  }): Promise<ProviderData<FinancialAccount[]>>;

  getBalance(input: {
    beneficiaryId: string;
    providerAccountId: string;
    consent: ProviderConsent;
  }): Promise<ProviderData<BalanceSnapshot>>;

  getTransactions(input: {
    beneficiaryId: string;
    providerAccountId: string;
    consent: ProviderConsent;
    from?: string;
    to?: string;
    cursor?: string;
  }): Promise<ProviderData<{ items: FinancialTransaction[]; nextCursor?: string }>>;

  blockCard?(input: {
    beneficiaryId: string;
    consent: ProviderConsent;
    request: CardBlockRequest;
  }): Promise<CardBlockResult>;

  createReplacementCase?(input: {
    beneficiaryId: string;
    consent: ProviderConsent;
    request: ReplacementCaseRequest;
  }): Promise<ReplacementCaseResult>;
}

export function assertProviderCapability(
  adapter: BankingProviderAdapter,
  capability: ProviderCapability,
): void {
  if (!adapter.capabilities.has(capability)) {
    throw new Error(`Provider ${adapter.providerId} does not support authorised capability: ${capability}`);
  }
}
