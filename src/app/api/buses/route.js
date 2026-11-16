import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const buses = [];

    // Fetch ONLY provider-added buses from database (approved providers only)
    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          `SELECT pl.*, pp.business_name as provider_business, u.name as provider_name
           FROM provider_listings pl
           JOIN users u ON pl.provider_id = u.id
           JOIN provider_profiles pp ON pp.user_id = u.id AND pp.application_status = 'approved'
           WHERE pl.service_type = 'buses' AND pl.status = 'active'
           ORDER BY pl.created_at DESC`
        );

        for (const row of result.rows) {
          const d = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});

          buses.push({
            id: `pl-${row.id}`,
            listingId: row.id,
            providerId: row.provider_id,
            providerName: row.provider_business || row.provider_name,
            operator: (d.operatorName && d.operatorName !== '__other__') ? d.operatorName : (row.title !== '__other__' ? row.title : 'Bus Service'),
            busType: d.busType || 'AC Seater',
            busNumber: d.busNumber || '',
            fromCity: d.from || d.fromCity || d.boardingPoint || '',
            toCity: d.to || d.toCity || d.droppingPoint || '',
            departureTime: d.departureTime || '',
            arrivalTime: d.arrivalTime || '',
            duration: d.duration || '',
            rating: parseFloat(d.rating) || 4.0,
            reviewsCount: parseInt(d.reviewsCount) || 0,
            fare: parseFloat(row.price) || 0,
            availableSeatsCount: parseInt(d.availableSeats) || 36,
            totalSeats: parseInt(d.totalSeats) || parseInt(d.availableSeats) || 36,
            boardingPoints: Array.isArray(d.boardingPoints) ? d.boardingPoints : (d.boardingPoint ? [d.boardingPoint] : []),
            droppingPoints: Array.isArray(d.droppingPoints) ? d.droppingPoints : (d.droppingPoint ? [d.droppingPoint] : []),
            amenities: Array.isArray(d.amenities) ? d.amenities : (typeof d.amenities === 'string' && d.amenities ? d.amenities.split(',').map(a => a.trim()) : []),
            bookedSeats: [],
            image: d.imageUrl || null,
            source: 'provider',
            cancellation: d.cancellation || '',
            liveTracking: d.liveTracking || false,
            isAC: d.isAC !== undefined ? d.isAC : true,
            isPremium: d.isPremium || false,
          });
        }
      } catch (dbErr) {
        console.error('DB query error:', dbErr.message);
      }
    }

    // Build unique cities list
    const cities = [...new Set([
      ...buses.map(b => b.fromCity),
      ...buses.map(b => b.toCity),
    ].filter(Boolean))].sort();

    return NextResponse.json({
      success: true,
      buses,
      cities,
      counts: { provider: buses.length, total: buses.length },
      source: 'provider',
    });
  } catch (error) {
    console.error('Buses API error:', error.message);
    return NextResponse.json({
      success: true,
      buses: [],
      cities: [],
      counts: { provider: 0, total: 0 },
      source: 'provider',
    });
  }
}
