import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Map full category names to lowercase IDs used by the frontend
const CATEGORY_MAP = {
  'Ayurveda': 'ayurveda',
  'Yoga & Meditation': 'yoga',
  'Physiotherapy': 'physiotherapy',
  'Nutrition & Dietetics': 'nutrition',
  'Naturopathy': 'naturopathy',
  'Homeopathy': 'homeopathy',
  'Mental Wellness': 'mental_wellness',
  'Acupuncture & Alternative': 'alternative',
  'Meditation': 'meditation',
};

const WELLNESS_CATEGORIES = [
  { id: 'ayurveda', name: 'Ayurveda', icon: '🌿' },
  { id: 'yoga', name: 'Yoga & Meditation', icon: '🧘' },
  { id: 'physiotherapy', name: 'Physiotherapy', icon: '💪' },
  { id: 'nutrition', name: 'Nutrition & Dietetics', icon: '🥗' },
  { id: 'naturopathy', name: 'Naturopathy', icon: '🌱' },
  { id: 'homeopathy', name: 'Homeopathy', icon: '💊' },
  { id: 'mental_wellness', name: 'Mental Wellness', icon: '🧠' },
  { id: 'alternative', name: 'Alternative Medicine', icon: '🔮' },
];

export async function GET(request) {
  try {
    const practitioners = [];

    // Fetch ONLY provider-added wellness listings (approved providers only)
    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          `SELECT pl.*, pp.business_name as provider_business, u.name as provider_name
           FROM provider_listings pl
           JOIN users u ON pl.provider_id = u.id
           JOIN provider_profiles pp ON pp.user_id = u.id AND pp.application_status = 'approved'
           WHERE pl.service_type = 'wellness' AND pl.status = 'active'
           ORDER BY pl.created_at DESC`
        );

        for (const row of result.rows) {
          const d = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});

          const slotsRaw = d.availableSlots || '';
          const slots = Array.isArray(slotsRaw) ? slotsRaw : (typeof slotsRaw === 'string' && slotsRaw
            ? slotsRaw.split(',').map(s => s.trim())
            : ['10:00 AM', '02:00 PM', '04:00 PM']);

          const servicesRaw = d.services || [];
          const services = Array.isArray(servicesRaw) ? servicesRaw : (typeof servicesRaw === 'string' && servicesRaw ? servicesRaw.split(',').map(s => ({ name: s.trim(), price: parseFloat(row.price) || 500 })) : []);

          const expMatch = (d.experience || d.experienceLevel || '').match(/(\d+)/);

          practitioners.push({
            id: `pl-${row.id}`,
            listingId: row.id,
            providerId: row.provider_id,
            providerName: row.provider_business || row.provider_name,
            name: (d.practitionerName && d.practitionerName !== '__other__') ? d.practitionerName : (row.title !== '__other__' ? row.title : 'Practitioner'),
            clinic: d.clinic || d.location || '',
            city: d.city || d.location || '',
            location: d.city || d.location || '',
            category: CATEGORY_MAP[d.category] || d.category?.toLowerCase() || 'alternative',
            specialization: d.specialization || 'General',
            qualifications: d.qualifications || '',
            experience: d.experience || d.experienceLevel || '0 years',
            experienceYears: expMatch ? parseInt(expMatch[1]) : 0,
            rating: parseFloat(d.rating) || 4.5,
            reviews: parseInt(d.reviews) || 0,
            consultationFee: parseFloat(row.price) || 0,
            price: parseFloat(row.price) || 0,
            originalFee: parseFloat(d.originalFee) || parseFloat(row.price) || 0,
            consultationMode: d.consultationMode || 'In-Person',
            sessionDuration: d.sessionDuration || '45 mins',
            languages: d.language ? [d.language] : (d.languages || ['Hindi', 'English']),
            image: d.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
            description: d.description || `${d.specialization || 'Health'} practitioner. ${d.qualifications || ''}`,
            services,
            availableDates: d.availableDates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            availableSlots: slots,
            tags: d.tags || [],
            cancellation: d.cancellationPolicy || 'Free cancellation up to 2 hours before appointment',
            insuranceAccepted: d.insuranceAccepted === 'Yes' ? ['General Insurance'] : [],
            isPremium: d.isPremium || false,
            isVerified: true,
            source: 'provider',
          });
        }
      } catch (dbErr) {
        console.error('DB query error:', dbErr.message);
      }
    }

    // Build unique cities list
    const cities = [...new Set(practitioners.map(p => p.city).filter(Boolean))].sort();

    return NextResponse.json({
      success: true,
      practitioners,
      categories: WELLNESS_CATEGORIES,
      cities,
      counts: { provider: practitioners.length, total: practitioners.length },
      source: 'provider',
    });
  } catch (error) {
    console.error('Practitioners API error:', error.message);
    return NextResponse.json({
      success: true,
      practitioners: [],
      categories: WELLNESS_CATEGORIES,
      cities: [],
      counts: { provider: 0, total: 0 },
      source: 'provider',
    });
  }
}
