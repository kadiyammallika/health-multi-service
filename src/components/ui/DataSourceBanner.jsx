'use client';

import { useState } from 'react';
import { Database, Globe, Radio, ChevronDown, ChevronUp, Zap, Server, Image } from 'lucide-react';

const API_INFO = {
  amadeus: {
    name: 'Amadeus Travel API',
    tier: 'Free Self-Service',
    icon: Globe,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    description: 'Real flight prices & hotel data (2,000 calls/month)',
    url: 'https://developers.amadeus.com',
  },
  aviationstack: {
    name: 'AviationStack API',
    tier: 'Free',
    icon: Radio,
    color: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
    description: 'Real-time flight schedules & status (100 calls/month)',
    url: 'https://aviationstack.com',
  },
  supabase: {
    name: 'Provider Listings Database',
    tier: 'Live',
    icon: Database,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    description: 'Real-time provider listings, bookings & user accounts',
    url: null,
  },
  unsplash: {
    name: 'Unsplash Images API',
    tier: 'Free',
    icon: Image,
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    dot: 'bg-pink-500',
    description: 'High-quality royalty-free hotel, travel & wellness images',
    url: 'https://unsplash.com/developers',
  },
  oneconnect: {
    name: 'OneConnect Marketplace API',
    tier: 'Live',
    icon: Server,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    description: 'Provider-added listings for buses, hotels, wellness & properties',
    url: null,
  },
};

export default function DataSourceBanner({ sources = [], counts = {} }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-slate-700">
            Powered by {sources.length} Free API{sources.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1 ml-1">
            {sources.map((src) => {
              const api = API_INFO[src];
              if (!api) return null;
              return (
                <span key={src} className={`w-2 h-2 rounded-full ${api.dot}`} title={api.name} />
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {counts.total > 0 && (
            <span className="text-[10px] font-bold text-slate-500">{counts.total} results</span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sources.map((src) => {
            const api = API_INFO[src];
            if (!api) return null;
            const Icon = api.icon;
            const count = counts[src] || 0;
            return (
              <div key={src} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${api.color}`}>
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">{api.name}</span>
                    <span className="px-1 py-0 rounded text-[8px] font-bold bg-white/60">{api.tier}</span>
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">{api.description}</p>
                  {count > 0 && (
                    <p className="text-[10px] font-semibold mt-0.5">{count} results from this source</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
