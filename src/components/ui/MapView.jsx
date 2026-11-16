'use client';

import { useEffect, useRef, useState } from 'react';

// City coordinates for Indian cities (fallback when hotel doesn't have coords)
const CITY_COORDINATES = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'goa': { lat: 15.2993, lng: 74.1240 },
  'panaji': { lat: 15.4909, lng: 73.8278 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'manali': { lat: 32.2396, lng: 77.1887 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'mysore': { lat: 12.2958, lng: 76.6394 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'pondicherry': { lat: 11.9416, lng: 79.8083 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'darjeeling': { lat: 27.0410, lng: 88.2663 },
  'ooty': { lat: 11.4102, lng: 76.6950 },
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'nainital': { lat: 29.3919, lng: 79.4542 },
  'lonavala': { lat: 18.7546, lng: 73.4062 },
  'mahabaleshwar': { lat: 17.9307, lng: 73.6477 },
  'kodaikanal': { lat: 10.2381, lng: 77.4892 },
  'alleppey': { lat: 9.4981, lng: 76.3388 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'jaisalmer': { lat: 26.9157, lng: 70.9083 },
  'leh': { lat: 34.1526, lng: 77.5771 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'gangtok': { lat: 27.3389, lng: 88.6065 },
  'shillong': { lat: 25.5788, lng: 91.8933 },
  'port blair': { lat: 11.6234, lng: 92.7265 },
};

function getCoordinates(item) {
  // Use explicit coordinates if available
  if (item.lat && item.lng) return { lat: item.lat, lng: item.lng };
  if (item.latitude && item.longitude) return { lat: item.latitude, lng: item.longitude };
  if (item.coordinates) return item.coordinates;

  // Try to match by city name
  const city = (item.city || item.location || '').toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.includes(key)) return coords;
  }

  // Try address
  const address = (item.address || '').toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (address.includes(key)) return coords;
  }

  // Default to Mumbai
  return { lat: 19.0760, lng: 72.8777 };
}

// Mini map preview (shown on cards - like Agoda's "Show on map" button)
export function MapPreviewButton({ item, onClick }) {
  const coords = getCoordinates(item);
  const staticMapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=300&height=150&center=lonlat:${coords.lng},${coords.lat}&zoom=14&apiKey=demo`;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      className="group relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-400 transition-all hover:shadow-md cursor-pointer"
    >
      {/* Static map background using OSM tile */}
      <img
        src={`https://tile.openstreetmap.org/${14}/${Math.floor((coords.lng + 180) / 360 * Math.pow(2, 14))}/${Math.floor((1 - Math.log(Math.tan(coords.lat * Math.PI / 180) + 1 / Math.cos(coords.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 14))}.png`}
        alt="Map"
        className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Show on map button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-bold transition group-hover:scale-105">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Show on map
        </div>
      </div>

      {/* Google attribution style */}
      <div className="absolute bottom-1 left-1 text-[8px] text-gray-600 bg-white/80 px-1 rounded">
        © OpenStreetMap
      </div>
    </button>
  );
}

// Full interactive map (shown in detail view / modal)
export function InteractiveMap({ item, items = [], height = '400px', zoom = 15, className = '', formatPrice = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Already initialized

    let cancelled = false;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (cancelled || !mapRef.current) return;

      // Fix Leaflet default marker icon issue with bundlers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const coords = getCoordinates(item);
      const map = L.map(mapRef.current, {
        center: [coords.lat, coords.lng],
        zoom: zoom,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom red marker icon
      const redIcon = L.divIcon({
        html: `<div style="background: #dc2626; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; margin: 8px auto; transform: rotate(45deg);"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: '',
      });

      // Main marker
      const name = item.name || item.title || 'Location';
      const address = item.address || item.location || item.city || '';
      L.marker([coords.lat, coords.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 700; font-size: 14px; color: #1f2937; margin-bottom: 4px;">${name}</div>
            <div style="font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
              📍 ${address}
            </div>
            ${item.pricePerNight ? `<div style="font-size: 14px; font-weight: 700; color: #059669; margin-top: 6px;">${formatPrice ? formatPrice(item.pricePerNight) : '₹' + item.pricePerNight.toLocaleString()}/night</div>` : ''}
            ${item.price ? `<div style="font-size: 14px; font-weight: 700; color: #059669; margin-top: 6px;">${formatPrice ? formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0) : '₹' + (typeof item.price === 'number' ? item.price.toLocaleString() : item.price)}</div>` : ''}
          </div>
        `)
        .openPopup();

      // Add nearby items as smaller markers
      if (items.length > 0) {
        const grayIcon = L.divIcon({
          html: `<div style="background: #6366f1; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
          className: '',
        });

        items.forEach(other => {
          if (other.id === item.id) return;
          const otherCoords = getCoordinates(other);
          const otherName = other.name || other.title || '';
          L.marker([otherCoords.lat, otherCoords.lng], { icon: grayIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: system-ui, sans-serif;">
                <div style="font-weight: 600; font-size: 12px;">${otherName}</div>
                ${other.pricePerNight ? `<div style="font-size: 11px; color: #059669;">${formatPrice ? formatPrice(other.pricePerNight) : '₹' + other.pricePerNight.toLocaleString()}/night</div>` : ''}
              </div>
            `);
        });
      }

      mapInstanceRef.current = map;
      setIsLoaded(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [item, zoom]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />

      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">Loading map...</span>
          </div>
        </div>
      )}

      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Directions button */}
      {isLoaded && (
        <div className="absolute bottom-3 right-3 z-[1000]">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${getCoordinates(item).lat},${getCoordinates(item).lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-gray-50 text-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 text-xs font-semibold transition hover:shadow-xl"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get Directions
          </a>
        </div>
      )}
    </div>
  );
}

// Map Modal (full screen map overlay)
export function MapModal({ item, items = [], isOpen, onClose, formatPrice = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900">{item.name || item.title}</h3>
            <p className="text-xs text-gray-500">{item.address || item.location || item.city}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map */}
        <InteractiveMap item={item} items={items} height="500px" zoom={15} formatPrice={formatPrice} />

        {/* Footer with nearby info */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            📍 {item.address || item.location || item.city}
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${getCoordinates(item).lat},${getCoordinates(item).lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </div>
  );
}

export { getCoordinates, CITY_COORDINATES };
export default InteractiveMap;
