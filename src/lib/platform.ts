// Platform detection utilities

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor;
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  return cap?.getPlatform?.() === "ios";
}

export function isWeb(): boolean {
  return !isNativeApp();
}
