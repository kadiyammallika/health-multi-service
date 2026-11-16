'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plane, Bus, Building2, Heart, Home, Shield, Clock, CreditCard,
  CheckCircle2, Star, Users, TrendingUp, Zap, BadgeCheck, Megaphone,
  Banknote, ChevronDown, ChevronUp, HelpCircle, ArrowRight,
  IndianRupee, Globe, Headphones, Mail, Lock, Sparkles, Gift,
  BarChart3, Wallet, CalendarCheck, Award
} from 'lucide-react';

/* ───────── CSS animation helper ───────── */
const fadeUpClass = 'animate-[fadeUp_0.6s_ease-out_both]';
const fadeUpDelay = (i) => ({ animationDelay: `${i * 80}ms` });

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  /* ─── Customer Benefits ─── */
  const customerBenefits = [
    { icon: IndianRupee, title: 'No Booking Fee', desc: 'Zero platform fee for customers on flights, buses, hotels', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Shield, title: 'Best Price Guarantee', desc: 'We match or beat competitor prices', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: CalendarCheck, title: 'Free Cancellation', desc: 'Free cancellation on eligible bookings (24h window)', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer support', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Lock, title: 'Secure Payments', desc: '256-bit SSL encrypted transactions', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Zap, title: 'Instant Confirmation', desc: 'Real-time booking confirmation via email & SMS', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Globe, title: 'Multi-Service Platform', desc: 'Flights, Buses, Hotels, Properties, Wellness — all in one place', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Gift, title: 'Exclusive Deals', desc: "Provider marketplace deals you won't find elsewhere", color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  /* ─── Commission Table ─── */
  const commissionData = [
    { service: 'Flights', icon: Plane, rate: '3-5%', basis: 'of ticket price', whoPays: 'Airline / Provider', when: 'On successful booking', color: 'text-indigo-600' },
    { service: 'Buses', icon: Bus, rate: '5-8%', basis: 'of ticket price', whoPays: 'Bus Operator', when: 'On successful booking', color: 'text-amber-600' },
    { service: 'Hotels', icon: Building2, rate: '12-18%', basis: 'of room charge', whoPays: 'Hotel / Provider', when: 'After guest checkout', color: 'text-emerald-600' },
    { service: 'Properties', icon: Home, rate: '1-2% / 1 mo rent', basis: 'of deal value', whoPays: 'Agent / Owner', when: 'On deal closure', color: 'text-rose-600' },
    { service: 'Health & Wellness', icon: Heart, rate: '10-15%', basis: 'of consultation fee', whoPays: 'Practitioner / Clinic', when: 'After appointment', color: 'text-teal-600' },
  ];

  /* ─── Provider Benefits ─── */
  const providerBenefits = [
    { icon: Wallet, title: 'Free Registration', desc: 'No setup fee, no monthly subscription', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: BarChart3, title: 'Dashboard Access', desc: 'Full CRUD portal to manage listings', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track bookings, revenue, and customer engagement', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: IndianRupee, title: 'Flexible Pricing', desc: 'Set your own prices, we add our commission on top', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Globe, title: 'Nationwide Reach', desc: 'Access to customers across all major Indian cities', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Banknote, title: 'Quick Payouts', desc: 'Weekly settlements to your bank account', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Megaphone, title: 'Marketing Support', desc: 'Featured listings and promotional campaigns', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: BadgeCheck, title: 'Verified Badge', desc: 'Trust badge for verified providers', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  /* ─── Competitor Comparison ─── */
  const compFeatures = [
    'Flights', 'Buses', 'Hotels', 'Properties', 'Health & Wellness',
    'No Booking Fee', 'Provider Marketplace', 'Free Cancellation', 'Multi-Service',
  ];
  const competitors = [
    { name: 'OneConnect', values: ['yes','yes','yes','yes','yes','yes','yes','yes','All 5'], highlight: true },
    { name: 'MakeMyTrip', values: ['yes','yes','yes','no','no','no','no','partial','3 services'] },
    { name: 'EaseMyTrip', values: ['yes','no','yes','no','no','yes','no','partial','2 services'] },
    { name: 'RedBus', values: ['no','yes','no','no','no','no','no','no','1 service'] },
    { name: 'Practo', values: ['no','no','no','no','yes','no','yes','no','1 service'] },
  ];

  const renderCell = (val) => {
    if (val === 'yes') return <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />;
    if (val === 'no') return <span className="text-slate-300 text-lg font-bold">--</span>;
    if (val === 'partial') return <span className="text-amber-500 text-xs font-semibold">Partial</span>;
    return <span className="text-xs font-semibold text-slate-600">{val}</span>;
  };

  /* ─── Revenue Model ─── */
  const revenueStreams = [
    { num: '01', title: 'Commission per booking', desc: 'Primary revenue stream — earned on every successful transaction', tag: 'Primary', tagColor: 'bg-green-100 text-green-700' },
    { num: '02', title: 'Convenience fees', desc: 'Small transparent fee (₹0-100) shown clearly at checkout', tag: 'Active', tagColor: 'bg-blue-100 text-blue-700' },
    { num: '03', title: 'Featured listings', desc: 'Providers pay for premium placement and visibility boost', tag: 'Active', tagColor: 'bg-blue-100 text-blue-700' },
    { num: '04', title: 'Premium provider subscriptions', desc: 'Advanced analytics, priority support, and exclusive tools', tag: 'Future', tagColor: 'bg-amber-100 text-amber-700' },
    { num: '05', title: 'API partnerships', desc: 'White-label marketplace for other platforms and enterprises', tag: 'Future', tagColor: 'bg-amber-100 text-amber-700' },
  ];

  /* ─── FAQ ─── */
  const faqs = [
    { q: 'How does OneConnect make money?', a: 'OneConnect earns through commissions from service providers (airlines, hotels, bus operators, clinics) on every successful booking. We also charge a small convenience fee (₹0-100) that is transparently shown at checkout. Customers never pay a hidden platform fee.' },
    { q: 'Is there any hidden charge for customers?', a: 'Absolutely not. The price you see is the price you pay. The only additional charges are applicable taxes (GST) and a small convenience fee that is clearly displayed before payment. Payment gateway charges are absorbed by OneConnect.' },
    { q: 'How are providers verified?', a: 'All providers undergo a multi-step verification: business document verification (GST, PAN, trade license), physical address verification, service quality assessment, and background checks. Verified providers receive a trust badge on their listings.' },
    { q: 'What payment methods are accepted?', a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking (all major banks), and digital wallets. All payments are processed through RazorPay/Stripe with 256-bit SSL encryption.' },
    { q: 'How do refunds work?', a: 'Refunds are processed within 5-7 business days to the original payment method. Free cancellation is available within 24 hours of booking for eligible services. After 24 hours, cancellation charges may apply as per the provider\'s policy.' },
  ];

  return (
    <>
      {/* Global keyframe styles */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* ═══════════ SECTION 1: HERO ═══════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            <div className={fadeUpClass}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm font-semibold text-indigo-200 border border-white/10 mb-6">
                <Sparkles className="w-4 h-4" /> Pricing & Business Model
              </span>
            </div>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${fadeUpClass}`} style={fadeUpDelay(1)}>
              Transparent Pricing,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">Maximum Value</span>
            </h1>
            <p className={`mt-6 text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto ${fadeUpClass}`} style={fadeUpDelay(2)}>
              India&apos;s most affordable multi-service marketplace. Zero hidden fees for customers. Fair commissions for providers.
            </p>
            <div className={`flex flex-wrap items-center justify-center gap-4 mt-10 ${fadeUpClass}`} style={fadeUpDelay(3)}>
              {['Flights', 'Buses', 'Hotels', 'Properties', 'Wellness'].map((s) => (
                <span key={s} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm font-semibold border border-white/10">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 2: CUSTOMER BENEFITS ═══════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-4">
                <Users className="w-3.5 h-3.5" /> For Customers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Why Customers Love OneConnect</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">Book flights, buses, hotels, properties, and wellness services with complete transparency and zero platform fees.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {customerBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className={`group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${fadeUpClass}`} style={fadeUpDelay(i)}>
                    <div className={`w-12 h-12 rounded-xl ${b.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${b.color}`} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 3: COMMISSION MODEL ═══════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                <IndianRupee className="w-3.5 h-3.5" /> How We Earn
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Platform Commission Model</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">Our revenue comes from service providers, not customers. Here is exactly how it works.</p>
            </div>

            {/* Commission Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm mb-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="text-left px-6 py-4 font-bold">Service</th>
                    <th className="text-left px-6 py-4 font-bold">Commission Rate</th>
                    <th className="text-left px-6 py-4 font-bold hidden sm:table-cell">Who Pays</th>
                    <th className="text-left px-6 py-4 font-bold hidden md:table-cell">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissionData.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.service} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${row.color}`} />
                            <span className="font-semibold text-slate-800">{row.service}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                            {row.rate}
                          </span>
                          <span className="text-slate-400 text-xs ml-2">{row.basis}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{row.whoPays}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs hidden md:table-cell">{row.when}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Additional Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-slate-800">Convenience Fee</h4>
                </div>
                <p className="text-sm text-slate-600">₹0-100 per booking, shown transparently at checkout. No hidden surprises.</p>
              </div>
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-800">GST</h4>
                </div>
                <p className="text-sm text-slate-600">5% on convenience fee only (as per Indian tax law). Standard compliance.</p>
              </div>
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-800">Payment Gateway</h4>
                </div>
                <p className="text-sm text-slate-600">1.5-2% gateway charges <strong>absorbed by OneConnect</strong>, NOT charged to customer.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 4: PROVIDER BENEFITS ═══════════ */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Star className="w-3.5 h-3.5" /> For Providers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">Grow Your Business With OneConnect</h2>
              <p className="mt-3 text-slate-400 max-w-xl mx-auto">Join India&apos;s fastest-growing multi-service marketplace. Free to register, easy to manage, rewarding to grow.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {providerBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className={`group p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 ${fadeUpClass}`} style={fadeUpDelay(i)}>
                    <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${b.color.replace('600', '400')}`} />
                    </div>
                    <h3 className="font-bold text-white mb-1">{b.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 5: COMPETITOR COMPARISON ═══════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> Competitive Edge
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How We Compare</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">OneConnect is the only platform offering all 5 service verticals with zero customer booking fees.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-5 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Feature</th>
                    {competitors.map((c) => (
                      <th key={c.name} className={`text-center px-4 py-4 font-bold text-xs uppercase tracking-wider ${c.highlight ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'}`}>
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compFeatures.map((feat, fi) => (
                    <tr key={feat} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-700">{feat}</td>
                      {competitors.map((c) => (
                        <td key={c.name} className={`text-center px-4 py-3.5 ${c.highlight ? 'bg-indigo-50/50' : ''}`}>
                          {renderCell(c.values[fi])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 6: REVENUE MODEL ═══════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                <BarChart3 className="w-3.5 h-3.5" /> Revenue Model
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How OneConnect Generates Revenue</h2>
            </div>

            {/* Revenue Streams */}
            <div className="space-y-4 mb-14 max-w-3xl mx-auto">
              {revenueStreams.map((r, i) => (
                <div key={r.num} className={`flex items-start gap-5 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all ${fadeUpClass}`} style={fadeUpDelay(i)}>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {r.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900">{r.title}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${r.tagColor}`}>{r.tag}</span>
                    </div>
                    <p className="text-sm text-slate-500">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Projections */}
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-black text-slate-900 mb-6 text-center">Projected Revenue (Moderate Traffic)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-center">
                  <Plane className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <div className="text-xs font-semibold opacity-80 mb-1">100 flights/day @ avg ₹5,000</div>
                  <div className="text-2xl font-black">₹15K-25K</div>
                  <div className="text-xs opacity-70 mt-1">per day</div>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <div className="text-xs font-semibold opacity-80 mb-1">50 hotels/day @ avg ₹3,000</div>
                  <div className="text-2xl font-black">₹18K-27K</div>
                  <div className="text-xs opacity-70 mt-1">per day</div>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <div className="text-xs font-semibold opacity-80 mb-1">Total (all 5 verticals)</div>
                  <div className="text-2xl font-black">₹1-2 Lakhs</div>
                  <div className="text-xs opacity-70 mt-1">per day potential</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 7: FAQ ═══════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
                <HelpCircle className="w-3.5 h-3.5" /> FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="font-bold text-slate-800 pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 8: CTA ═══════════ */}
        <section className="py-20 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Join OneConnect Today</h2>
            <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-10">
              Whether you are looking to book services at the best prices or grow your business with nationwide reach — OneConnect has you covered.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/flights"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-lg shadow-xl shadow-indigo-900/30 hover:bg-indigo-50 transition-all hover:scale-105"
              >
                <Plane className="w-5 h-5" />
                Start Booking
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/partner/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-lg shadow-xl shadow-teal-900/30 hover:from-teal-600 hover:to-emerald-600 transition-all hover:scale-105"
              >
                <Star className="w-5 h-5" />
                Become a Provider
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}