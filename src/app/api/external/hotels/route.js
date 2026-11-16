import { NextResponse } from 'next/server';
import { isAmadeusConfigured, searchHotelsByCity, getHotelOffers } from '@/lib/amadeus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
  'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800',
];

function getHotelImage(hotelName, index) {
  return HOTEL_IMAGES[index % HOTEL_IMAGES.length];
}

function estimatePrice(rating) {
  const basePrices = { 3: 2500, 4: 5000, 5: 9000 };
  const base = basePrices[parseInt(rating)] || basePrices[4];
  const variance = base * 0.2;
  return Math.round(base + (Math.random() * 2 - 1) * variance);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'City parameter is required', hotels: [] },
        { status: 400 }
      );
    }

    if (!isAmadeusConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Amadeus API not configured', hotels: [] },
        { status: 200 }
      );
    }

    const hotelList = await searchHotelsByCity(city);

    if (!hotelList || hotelList.length === 0) {
      return NextResponse.json(
        { success: true, hotels: [], total: 0, source: 'amadeus_live' },
        { status: 200 }
      );
    }

    const hotelIds = hotelList.slice(0, 10).map((h) => h.hotelId);

    let offersMap = {};
    try {
      const offers = await getHotelOffers(hotelIds);
      if (offers && Array.isArray(offers)) {
        for (const offerData of offers) {
          if (offerData.hotel?.hotelId && offerData.offers?.[0]) {
            offersMap[offerData.hotel.hotelId] = offerData.offers[0];
          }
        }
      }
    } catch (offerErr) {
      console.warn('Failed to fetch hotel offers, using estimated prices:', offerErr.message);
    }

    const hotels = hotelList.slice(0, 10).map((hotel, index) => {
      const offer = offersMap[hotel.hotelId];
      return {
        id: `amadeus-${hotel.hotelId}`,
        name: hotel.name,
        city: city,
        address: hotel.address?.lines?.join(', ') || '',
        stars: hotel.rating || 4,
        rating: parseFloat(hotel.rating) || 4.0,
        reviews: Math.floor(50 + Math.random() * 200),
        pricePerNight: offer?.price?.total
          ? parseFloat(offer.price.total)
          : estimatePrice(hotel.rating),
        currency: offer?.price?.currency || 'INR',
        image: getHotelImage(hotel.name, index),
        amenities: [],
        source: 'amadeus',
        hotelId: hotel.hotelId,
      };
    });

    return NextResponse.json({
      success: true,
      hotels,
      total: hotels.length,
      source: 'amadeus_live',
    });
  } catch (error) {
    console.error('Hotel API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hotels', hotels: [] },
      { status: 500 }
    );
  }
}
