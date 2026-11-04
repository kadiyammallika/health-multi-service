import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RoleSwitcher from '@/components/layout/RoleSwitcher';

export const metadata = {
  title: 'OneConnect | Multi-Service Living, Travel & Wellness Marketplace',
  description: 'Book flights, buses, luxury hotels, holistic wellness sessions, and explore premium real estate properties in one unified platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <RoleSwitcher />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
