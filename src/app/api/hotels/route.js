import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const hotels = [];

    // Fetch ONLY provider-added hotels from database (approved providers only)
    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          `SELECT pl.*, pp.business_name as provider_business, u.name as provider_name
           FROM provider_listings pl
           JOIN users u ON pl.provider_id = u.id
           JOIN provider_profiles pp ON pp.user_id = u.id AND pp.application_status = 'approved'
           WHERE pl.service_type = 'hotels' AND pl.status = 'active'
           ORDER BY pl.created_at DESC`
        );

        for (const row of result.rows) {
          const d = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});

          const amenitiesList = d.amenities
            ? (Array.isArray(d.amenities) ? d.amenities : d.amenities.split(',').map(a => a.trim()))
            : [];

          // Build rooms array from listing details
          const rooms = [];
          const basePrice = parseFloat(row.price) || 5000;
          const hotelDisplayName = (d.hotelName && d.hotelName !== '__other__') ? d.hotelName : (row.title !== '__other__' ? row.title : 'Hotel');

          if (d.roomType) {
            rooms.push({
              id: `room-${row.id}-1`,
              name: d.roomType,
              price: basePrice,
              bed: d.beds || '1 King Bed',
              capacity: `${parseInt(d.maxGuests) || 2} Guests`,
              size: d.roomSize || '32 sqm',
              features: amenitiesList.slice(0, 4),
              available: parseInt(d.availableRooms) || 5,
            });
            // Add a premium room variant
            rooms.push({
              id: `room-${row.id}-2`,
              name: `Deluxe ${d.roomType}`,
              price: Math.round(basePrice * 1.4),
              bed: d.beds || '1 King Bed',
              capacity: `${Math.min((parseInt(d.maxGuests) || 2) + 1, 4)} Guests`,
              size: d.roomSize ? `${parseInt(d.roomSize) + 10} sqm` : '42 sqm',
              features: [...amenitiesList.slice(0, 4), 'City View', 'Mini Bar'],
              available: Math.max(1, (parseInt(d.availableRooms) || 5) - 2),
            });
          } else {
            // Generate default rooms when provider didn't specify roomType
            rooms.push({
              id: `room-${row.id}-1`,
              name: 'Standard Room',
              price: basePrice,
              bed: d.beds || '1 Queen Bed',
              capacity: `${parseInt(d.maxGuests) || 2} Guests`,
              size: '28 sqm',
              features: amenitiesList.slice(0, 4).length > 0 ? amenitiesList.slice(0, 4) : ['Free WiFi', 'Air Conditioning', 'Room Service'],
              available: parseInt(d.availableRooms) || 5,
            });
            rooms.push({
              id: `room-${row.id}-2`,
              name: 'Deluxe Room',
              price: Math.round(basePrice * 1.3),
              bed: '1 King Bed',
              capacity: `${Math.min((parseInt(d.maxGuests) || 2) + 1, 4)} Guests`,
              size: '36 sqm',
              features: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'City View', 'Room Service'],
              available: Math.max(1, (parseInt(d.availableRooms) || 5) - 2),
            });
            rooms.push({
              id: `room-${row.id}-3`,
              name: 'Premium Suite',
              price: Math.round(basePrice * 1.8),
              bed: '1 King Bed + Sofa',
              capacity: '4 Guests',
              size: '52 sqm',
              features: ['Free WiFi', 'Living Area', 'Mini Bar', 'City View', 'Butler Service', 'Premium Bath'],
              available: 2,
            });
          }

          hotels.push({
            id: `pl-${row.id}`,
            listingId: row.id,
            providerId: row.provider_id,
            providerName: row.provider_business || row.provider_name,
            name: (d.hotelName && d.hotelName !== '__other__') ? d.hotelName : (row.title !== '__other__' ? row.title : 'Hotel'),
            city: d.city || '',
            address: d.address || d.city || '',
            location: d.address || d.city || '',
            stars: parseInt(d.starRating) || 4,
            rating: Math.round((parseFloat(d.rating) || 4.5) * 10) / 10,
            reviews: parseInt(d.reviews) || 0,
            pricePerNight: parseFloat(row.price) || 0,
            originalPrice: d.originalPrice ? parseFloat(d.originalPrice) : null,
            discount: d.discount ? parseInt(d.discount) : null,
            image: d.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            images: d.images || (d.imageUrl ? [d.imageUrl] : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']),
            description: d.description || `${d.roomType || 'Room'} at ${(d.hotelName && d.hotelName !== '__other__') ? d.hotelName : (row.title !== '__other__' ? row.title : 'Hotel')}. ${amenitiesList.join(', ')}`,
            amenities: amenitiesList,
            rooms,
            roomType: d.roomType || '',
            checkInTime: d.checkInTime || '02:00 PM',
            checkOutTime: d.checkOutTime || '12:00 PM',
            availableRooms: parseInt(d.availableRooms) || 10,
            cancellation: d.cancellationPolicy || d.cancellation || 'Non-refundable',
            breakfastIncluded: d.breakfastIncluded === 'Yes' || d.breakfastIncluded === true,
            wifiAvailable: d.wifiAvailable === 'Yes' || d.wifiAvailable === true,
            parkingAvailable: d.parkingAvailable === 'Yes' || d.parkingAvailable === true,
            isPremium: parseInt(d.starRating) >= 5,
            couplesFriendly: d.couplesFriendly || false,
            petFriendly: d.petFriendly || false,
            tags: d.tags || [],
            source: 'provider',
          });
        }
      } catch (dbErr) {
        console.error('DB query error:', dbErr.message);
      }
    }

    // Build unique cities list
    const cities = [...new Set(hotels.map(h => h.city).filter(Boolean))].sort();

    return NextResponse.json({
      success: true,
      hotels,
      cities,
      counts: { provider: hotels.length, total: hotels.length },
      source: 'provider',
    });
  } catch (error) {
    console.error('Hotels API error:', error.message);
    return NextResponse.json({
      success: true,
      hotels: [],
      cities: [],
      counts: { provider: 0, total: 0 },
      source: 'provider',
    });
  }
}
