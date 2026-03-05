// In-App Purchase integration for iOS via Capacitor
// Uses StoreKit 2 through a native Capacitor plugin
//
// SETUP REQUIRED:
// 1. In App Store Connect, create subscription products:
//    - com.vocalreps.pro.monthly ($9.99/month)
//    - com.vocalreps.pro.yearly ($89.99/year)
// 2. Add the StoreKit capability in Xcode
// 3. The native plugin code is in ios/App/App/IAPPlugin.swift

/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "@/lib/supabase";

export const IAP_PRODUCTS = {
  monthly: "com.vocalreps.pro.monthly",
  yearly: "com.vocalreps.pro.yearly",
};

interface IAPPlugin {
  getProducts(options: {
    productIds: string[];
  }): Promise<{ products: IAPProduct[] }>;
  purchase(options: { productId: string }): Promise<{ transaction: IAPTransaction }>;
  restorePurchases(): Promise<{ transactions: IAPTransaction[] }>;
}

interface IAPProduct {
  id: string;
  displayName: string;
  displayPrice: string;
  price: number;
}

interface IAPTransaction {
  productId: string;
  originalTransactionId: string;
  expirationDate: string;
}

function getIAPPlugin(): IAPPlugin | null {
  try {
    const cap = (window as any).Capacitor;
    return cap?.Plugins?.InAppPurchase || null;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<IAPProduct[]> {
  const plugin = getIAPPlugin();
  if (!plugin) return [];

  try {
    const result = await plugin.getProducts({
      productIds: Object.values(IAP_PRODUCTS),
    });
    return result.products;
  } catch {
    return [];
  }
}

export async function purchaseProduct(
  productId: string,
  userId: string
): Promise<boolean> {
  const plugin = getIAPPlugin();
  if (!plugin) return false;

  try {
    const result = await plugin.purchase({ productId });

    // Sync to Supabase
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      tier: "premium",
      apple_original_transaction_id: result.transaction.originalTransactionId,
      current_period_end: result.transaction.expirationDate,
      updated_at: new Date().toISOString(),
    });

    return true;
  } catch {
    return false;
  }
}

export async function restorePurchases(
  userId: string
): Promise<boolean> {
  const plugin = getIAPPlugin();
  if (!plugin) return false;

  try {
    const result = await plugin.restorePurchases();

    if (result.transactions.length > 0) {
      const latest = result.transactions[0];
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        tier: "premium",
        apple_original_transaction_id: latest.originalTransactionId,
        current_period_end: latest.expirationDate,
        updated_at: new Date().toISOString(),
      });
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
