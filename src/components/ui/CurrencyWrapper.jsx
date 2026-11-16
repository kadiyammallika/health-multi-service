'use client';

import { CurrencyProvider } from './CurrencyProvider';

export function CurrencyWrapper({ children }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
