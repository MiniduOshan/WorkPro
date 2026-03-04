import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IoArrowBackOutline,
    IoCardOutline,
    IoLockClosedOutline,
    IoCheckmarkCircle,
    IoTrashOutline,
} from 'react-icons/io5';

// Local storage key for saved card (in a real app this would be a token from Stripe/PayPal)
const CARD_KEY = 'savedPaymentCard';

const PaymentMethod = () => {
    const navigate = useNavigate();
    const returnPath = localStorage.getItem('paymentMethodReturnPath') || '/dashboard/manager/billing';

    const [mode, setMode] = useState('view'); // 'view' | 'add' | 'success'
    const [savedCard, setSavedCard] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        cardName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
    });

    useEffect(() => {
        const stored = localStorage.getItem(CARD_KEY);
        if (stored) {
            setSavedCard(JSON.parse(stored));
        } else {
            setMode('add'); // no card → go straight to add form
        }
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setError('');
        if (name === 'cardNumber') {
            const digits = value.replace(/\D/g, '').slice(0, 16);
            const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
            setForm(f => ({ ...f, cardNumber: formatted }));
        } else if (name === 'expiryMonth') {
            setForm(f => ({ ...f, expiryMonth: value.replace(/\D/g, '').slice(0, 2) }));
        } else if (name === 'expiryYear') {
            setForm(f => ({ ...f, expiryYear: value.replace(/\D/g, '').slice(0, 4) }));
        } else if (name === 'cvv') {
            setForm(f => ({ ...f, cvv: value.replace(/\D/g, '').slice(0, 3) }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const validate = () => {
        if (!form.cardName.trim()) { setError('Cardholder name is required.'); return false; }
        if (form.cardNumber.replace(/\s/g, '').length !== 16) { setError('Card number must be 16 digits.'); return false; }
        if (!form.expiryMonth || !form.expiryYear) { setError('Expiry date is required.'); return false; }
        const month = parseInt(form.expiryMonth);
        if (month < 1 || month > 12) { setError('Invalid expiry month.'); return false; }
        if (!form.cvv.match(/^\d{3}$/)) { setError('CVV must be 3 digits.'); return false; }
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Simulate API save (in prod: send to Stripe/PayPal tokenisation endpoint)
        await new Promise(r => setTimeout(r, 800));

        const card = {
            last4: form.cardNumber.replace(/\s/g, '').slice(-4),
            brand: detectBrand(form.cardNumber),
            expiry: `${form.expiryMonth.padStart(2, '0')}/${form.expiryYear.slice(-2)}`,
            name: form.cardName,
        };
        localStorage.setItem(CARD_KEY, JSON.stringify(card));
        setSavedCard(card);
        setMode('success');
        setTimeout(() => {
            localStorage.removeItem('paymentMethodReturnPath');
            navigate(returnPath);
        }, 1800);
    };

    const handleRemove = () => {
        localStorage.removeItem(CARD_KEY);
        setSavedCard(null);
        setForm({ cardName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
        setMode('add');
    };

    const detectBrand = (num) => {
        const n = num.replace(/\s/g, '');
        if (n.startsWith('4')) return 'Visa';
        if (/^5[1-5]/.test(n)) return 'Mastercard';
        if (/^3[47]/.test(n)) return 'Amex';
        if (/^6(?:011|5)/.test(n)) return 'Discover';
        return 'Card';
    };

    const brandColor = (brand) => {
        const map = { Visa: 'from-blue-800 to-blue-600', Mastercard: 'from-red-700 to-orange-500', Amex: 'from-slate-700 to-slate-500', Discover: 'from-orange-600 to-yellow-500' };
        return map[brand] || 'from-indigo-700 to-purple-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
            {/* Top bar */}
            <div className="max-w-2xl mx-auto w-full px-4 pt-8 pb-4">
                <button
                    onClick={() => { localStorage.removeItem('paymentMethodReturnPath'); navigate(returnPath); }}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <IoArrowBackOutline className="w-5 h-5" />
                    Back to Billing
                </button>
            </div>

            <div className="max-w-2xl mx-auto w-full px-4 pb-16 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Payment Method</h1>
                <p className="text-gray-500 mb-8">Add or update your card for subscriptions.</p>

                {mode === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                        <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Card saved!</h2>
                        <p className="text-gray-500">Redirecting back to billing...</p>
                    </div>
                )}

                {mode === 'view' && savedCard && (
                    <div className="space-y-6">
                        {/* Visual card */}
                        <div className={`bg-gradient-to-br ${brandColor(savedCard.brand)} rounded-2xl p-7 text-white shadow-xl relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
                            <div className="flex justify-between items-start mb-10">
                                <span className="text-white/70 text-sm font-medium uppercase tracking-widest">{savedCard.brand}</span>
                                <IoLockClosedOutline className="w-5 h-5 text-white/60" />
                            </div>
                            <p className="text-2xl font-mono tracking-[0.3em] mb-6">
                                •••• •••• •••• {savedCard.last4}
                            </p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Card Holder</p>
                                    <p className="font-bold">{savedCard.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Expires</p>
                                    <p className="font-bold">{savedCard.expiry}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setMode('add');
                                    setForm({ cardName: savedCard.name, cardNumber: '', expiryMonth: savedCard.expiry.split('/')[0], expiryYear: `20${savedCard.expiry.split('/')[1]}`, cvv: '' });
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                Edit Card
                            </button>
                            <button
                                onClick={handleRemove}
                                className="py-3 px-5 border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <IoTrashOutline className="w-5 h-5" />
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'add' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <IoCardOutline className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{savedCard ? 'Update Card' : 'Add New Card'}</h2>
                                <p className="text-sm text-gray-500">Your card details are encrypted and secure</p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-5">
                            {/* Cardholder name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cardholder Name</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    placeholder="John Doe"
                                    value={form.cardName}
                                    onChange={handleInput}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Card number */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        value={form.cardNumber}
                                        onChange={handleInput}
                                        inputMode="numeric"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all bg-gray-50 focus:bg-white font-mono"
                                    />
                                    <IoCardOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </div>

                            {/* Expiry + CVV */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Month</label>
                                    <input
                                        type="text"
                                        name="expiryMonth"
                                        placeholder="MM"
                                        value={form.expiryMonth}
                                        onChange={handleInput}
                                        inputMode="numeric"
                                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all bg-gray-50 focus:bg-white text-center font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                                    <input
                                        type="text"
                                        name="expiryYear"
                                        placeholder="YYYY"
                                        value={form.expiryYear}
                                        onChange={handleInput}
                                        inputMode="numeric"
                                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all bg-gray-50 focus:bg-white text-center font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVV</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        placeholder="•••"
                                        value={form.cvv}
                                        onChange={handleInput}
                                        inputMode="numeric"
                                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all bg-gray-50 focus:bg-white text-center font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {savedCard && (
                                    <button type="button" onClick={() => setMode('view')} className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-100"
                                >
                                    {savedCard ? 'Update Card' : 'Save Card'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-5 flex items-center gap-2 justify-center text-xs text-gray-400">
                            <IoLockClosedOutline className="w-3.5 h-3.5" />
                            256-bit SSL encrypted — your card details are safe
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethod;
