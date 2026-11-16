import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { CurrencyWrapper } from '@/components/ui/CurrencyWrapper';

export const metadata = {
  title: 'OneConnect | Multi-Service Living, Travel & Health & Healing Services Marketplace',
  description: 'Book flights, buses, luxury hotels, holistic health & healing sessions, and explore premium real estate properties in one unified platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <CurrencyWrapper>
          <AppShell>{children}</AppShell>
        </CurrencyWrapper>
      </body>
    </html>
  );
}
