import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const properties = [];

    // Fetch ONLY provider-added properties from database (approved providers only)
    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          `SELECT pl.*, pp.business_name as provider_business, u.name as provider_name
           FROM provider_listings pl
           JOIN users u ON pl.provider_id = u.id
           JOIN provider_profiles pp ON pp.user_id = u.id AND pp.application_status = 'approved'
           WHERE pl.service_type = 'properties' AND pl.status = 'active'
           ORDER BY pl.created_at DESC`
        );

        for (const row of result.rows) {
          const d = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});

          const amenitiesList = d.amenities
            ? (Array.isArray(d.amenities) ? d.amenities : d.amenities.split(',').map(a => a.trim()))
            : [];

          properties.push({
            id: `pl-${row.id}`,
            listingId: row.id,
            providerId: row.provider_id,
            providerName: row.provider_business || row.provider_name,
            title: (d.propertyName && d.propertyName !== '__other__') ? d.propertyName : (row.title !== '__other__' ? row.title : 'Property'),
            type: d.propertyType || 'Apartment',
            purpose: d.purpose || 'rent',
            city: d.city || d.location || '',
            location: d.address || d.location || '',
            price: parseFloat(row.price) || 0,
            pricePerSqft: d.pricePerSqft ? parseFloat(d.pricePerSqft) : null,
            area: parseInt(d.areaSqFt) || parseInt(d.area) || 0,
            bedrooms: parseInt(d.bedrooms) || 0,
            bathrooms: parseInt(d.bathrooms) || 0,
            floor: d.floor || '',
            totalFloors: parseInt(d.totalFloors) || 0,
            furnishing: d.furnishing || 'Unfurnished',
            facing: d.facing || '',
            ageOfProperty: d.ageOfProperty || '',
            possession: d.possession || 'Ready to Move',
            description: d.description || `${d.propertyType || 'Property'} in ${d.location || d.city || ''}. ${amenitiesList.join(', ')}`,
            amenities: amenitiesList,
            images: d.images || (d.imageUrl ? [d.imageUrl] : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']),
            agent: d.agent || { name: row.provider_business || row.provider_name, phone: '' },
            tags: d.tags || [],
            featured: d.featured || false,
            highlights: d.highlights || [],
            maxGuests: parseInt(d.maxGuests) || 4,
            checkInTime: d.checkInTime || '02:00 PM',
            checkOutTime: d.checkOutTime || '11:00 AM',
            minimumStay: d.minimumStay || '1 Night',
            cancellationPolicy: d.cancellationPolicy || 'Non-refundable',
            petsAllowed: d.petsAllowed === 'Yes' || d.petsAllowed === true,
            source: 'provider',
          });
        }
      } catch (dbErr) {
        console.error('DB query error:', dbErr.message);
      }
    }

    // Build unique cities and types lists
    const cities = [...new Set(properties.map(p => p.city).filter(Boolean))].sort();
    const types = [...new Set(properties.map(p => p.type).filter(Boolean))].sort();

    return NextResponse.json({
      success: true,
      properties,
      cities,
      types,
      counts: { provider: properties.length, total: properties.length },
      source: 'provider',
    });
  } catch (error) {
    console.error('Properties API error:', error.message);
    return NextResponse.json({
      success: true,
      properties: [],
      cities: [],
      types: [],
      counts: { provider: 0, total: 0 },
      source: 'provider',
    });
  }
}
