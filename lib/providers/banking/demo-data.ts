import type {
  BalanceSnapshot,
  FinancialAccount,
  FinancialTransaction,
  ProviderData,
} from "./types";

/**
 * Synthetic-only data for local UI development.
 * This module has no network client, credentials, beneficiary lookup or bank action.
 * Never enable this fixture as a source of live beneficiary financial data.
 */
const DEMO_PROVIDER = {
  providerId: "sassa-access-demo",
  providerName: "SASSA ACCESS demonstration data",
  mode: "demo" as const,
};

const fetchedAt = "2026-11-10T08:00:00.000Z";

export const demoAccounts: ProviderData<FinancialAccount[]> = {
  ...DEMO_PROVIDER,
  freshness: "demo",
  fetchedAt,
  data: [
    {
      providerAccountId: "demo-account-001",
      displayName: "Grant receiving account",
      maskedIdentifier: "•••• 4821",
      currency: "ZAR",
      accountType: "grant",
    },
  ],
};

export const demoBalance: ProviderData<BalanceSnapshot> = {
  ...DEMO_PROVIDER,
  freshness: "demo",
  fetchedAt,
  data: {
    providerAccountId: "demo-account-001",
    currentBalanceMinor: 184250,
    availableBalanceMinor: 184250,
    currency: "ZAR",
    sourceTimestamp: fetchedAt,
    freshness: "demo",
  },
};

export const demoTransactions: ProviderData<{
  items: FinancialTransaction[];
}> = {
  ...DEMO_PROVIDER,
  freshness: "demo",
  fetchedAt,
  data: {
    items: [
      {
        providerTransactionId: "demo-txn-001",
        providerAccountId: "demo-account-001",
        description: "Example grant deposit",
        amountMinor: 218000,
        currency: "ZAR",
        direction: "credit",
        status: "posted",
        transactionTimestamp: "2026-11-03T06:00:00.000Z",
        sourceTimestamp: fetchedAt,
      },
      {
        providerTransactionId: "demo-txn-002",
        providerAccountId: "demo-account-001",
        description: "Example cash withdrawal",
        amountMinor: 33750,
        currency: "ZAR",
        direction: "debit",
        status: "posted",
        transactionTimestamp: "2026-11-04T09:30:00.000Z",
        sourceTimestamp: fetchedAt,
      },
    ],
  },
};
