'use client';

import { useState, useEffect } from 'react';
import { CreditCard, QrCode, Building, CheckCircle2, AlertTriangle, ShieldCheck, Lock, Loader2, X } from 'lucide-react';
import { useCurrency } from '@/components/ui/CurrencyProvider';

export default function PaymentModal({
  isOpen,
  onClose,
  title = 'Simulated Payment Gateway',
  amount = 0,
  breakdown = {},
  onPaymentSuccess,
}) {
  const { formatPrice } = useCurrency();
  const [method, setMethod] = useState('card'); // 'card', 'upi', 'netbanking', 'instant'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [simulatedFailure, setSimulatedFailure] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states (Simulated fields)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Alex Morgan');
  const [upiId, setUpiId] = useState('alex@okhdfcbank');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMethod('card');
      setIsProcessing(false);
      setIsSuccess(false);
      setSimulatedFailure(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsProcessing(false);
      if (simulatedFailure) {
        setErrorMsg('Simulated Transaction Declined: Insufficient test funds or bank timeout. Try switching simulation mode.');
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          onPaymentSuccess({
            method: method.toUpperCase(),
            transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            amountPaid: amount,
            timestamp: new Date().toISOString()
          });
        }, 1200);
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
              <Lock className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-xs text-indigo-200">256-Bit Encrypted Simulated Checkout</p>
            </div>
          </div>
          {!isProcessing && !isSuccess && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-sm text-slate-600 mt-1">{formatPrice(amount)} received via Simulated Gateway</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Generating confirmation and booking voucher...
              </div>
            </div>
          ) : isProcessing ? (
            /* Processing State */
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-800">Processing Payment...</h4>
              <p className="text-sm text-slate-500 mt-1">Contacting simulated bank partner. Please do not refresh.</p>
            </div>
          ) : (
            /* Normal Checkout Interface */
            <div className="space-y-6">
              {/* Order Amount Bar */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Payable</span>
                  <div className="text-2xl font-black text-indigo-950">{formatPrice(amount)}</div>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-0.5">
                  {breakdown.baseFare && <div>Base: {formatPrice(breakdown.baseFare)}</div>}
                  {breakdown.taxes && <div>Taxes: {formatPrice(breakdown.taxes)}</div>}
                  {breakdown.convenienceFee && <div>Fee: {formatPrice(breakdown.convenienceFee)}</div>}
                  {breakdown.resortFee && <div>Resort: {formatPrice(breakdown.resortFee)}</div>}
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                    method === 'card'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1.5" />
                  Card (Demo)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                    method === 'upi'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1.5" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                    method === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mb-1.5" />
                  Net Banking
                </button>
              </div>

              {/* Method Specific Form */}
              {method === 'card' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Card Number (Simulated)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-700" />
                    <span className="text-[10px] text-indigo-600 font-bold uppercase">Scan with any UPI App</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Or Enter Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-center text-slate-800"
                    />
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600">Select Partner Bank</label>
                  <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800">
                    <option>HDFC Bank (Simulated)</option>
                    <option>State Bank of India (Simulated)</option>
                    <option>ICICI Bank (Simulated)</option>
                    <option>Axis Bank (Simulated)</option>
                    <option>Kotak Mahindra Bank (Simulated)</option>
                  </select>
                  <p className="text-xs text-slate-500">You will be redirected to the secure demo retail portal.</p>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Simulation Mode Toggle (For Testing Failure vs Success) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Simulate Failure Mode:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedFailure}
                    onChange={(e) => setSimulatedFailure(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>Pay {formatPrice(amount)}</span>
                  <Lock className="w-4 h-4" />
                </button>
              </div>

              {/* Legal Demo Disclaimer */}
              <p className="text-[11px] text-center text-slate-400">
                🛡️ Demo Sandbox: No real money or payment accounts are charged. All payment methods are simulated.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
