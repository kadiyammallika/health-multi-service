import { NextResponse } from 'next/server';
import { isAmadeusConfigured } from '@/lib/amadeus';
import { isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    integrations: {
      amadeus: {
        configured: isAmadeusConfigured(),
        name: 'Amadeus Travel API',
        tier: 'Free Self-Service',
        provides: ['Flight Offers', 'Hotel Search', 'Hotel Pricing'],
        docs: 'https://developers.amadeus.com',
        quotaLimit: '2,000 calls/month',
      },
      aviationstack: {
        configured: !!process.env.AVIATIONSTACK_API_KEY,
        name: 'AviationStack API',
        tier: 'Free',
        provides: ['Real-time Flight Schedules', 'Flight Status'],
        docs: 'https://aviationstack.com',
        quotaLimit: '100 calls/month',
      },
      unsplash: {
        configured: true,
        name: 'Unsplash Images API',
        tier: 'Free',
        provides: ['Hotel Images', 'Destination Images', 'Service Images'],
        docs: 'https://unsplash.com/developers',
        quotaLimit: 'Unlimited (hotlink)',
      },
      database: {
        configured: isDatabaseConfigured(),
        name: 'PostgreSQL Database',
        tier: 'Free',
        provides: ['User Accounts', 'Bookings', 'Provider Listings', 'Master Data'],
        docs: null,
        quotaLimit: '500MB storage',
      },
      oneconnect_api: {
        configured: true,
        name: 'OneConnect Marketplace API',
        tier: 'Live',
        provides: ['Provider Bus Listings', 'Provider Wellness Services', 'Provider Property Listings'],
        docs: '/api',
        quotaLimit: 'Unlimited',
      },
    },
    summary: {
      totalApis: 5,
      description: 'OneConnect integrates free-tier APIs for real travel data: AviationStack for live flight schedules, Unsplash for images, PostgreSQL for database, and our own Marketplace API for provider-listed buses/wellness/properties.',
    },
  });
}
