import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBackOutline, 
  IoCardOutline, 
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline
} from 'react-icons/io5';

const Payment = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  useEffect(() => {
    // Get selected plan from localStorage
    const planData = localStorage.getItem('selectedPlan');
    if (!planData) {
      navigate('/');
      return;
    }
    
    try {
      setSelectedPlan(JSON.parse(planData));
    } catch (err) {
      console.error('Failed to parse selected plan:', err);
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentData({ ...paymentData, [name]: formatted.slice(0, 19) });
    } else if (name === 'cvv') {
      setPaymentData({ ...paymentData, [name]: value.slice(0, 3) });
    } else if (name === 'expiryMonth') {
      setPaymentData({ ...paymentData, [name]: value.slice(0, 2) });
    } else if (name === 'expiryYear') {
      setPaymentData({ ...paymentData, [name]: value.slice(0, 4) });
    } else {
      setPaymentData({ ...paymentData, [name]: value });
    }
    
    if (error) setError('');
  };

  const validatePayment = () => {
    if (!paymentData.cardName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (!paymentData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      setError('Expiry date is required');
      return false;
    }
    if (!paymentData.cvv.match(/^\d{3}$/)) {
      setError('CVV must be 3 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Redirect to signup after 2 seconds
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
    }, 2000);
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          Back to Pricing
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Payment</h1>
            <p className="text-gray-600 mb-8">Enter your payment details to proceed with your subscription</p>

            {error && (
              <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-pulse" role="alert">
                {error}
              </div>
            )}

            {paymentSuccess && (
              <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">Payment Successful!</p>
                  <p className="text-green-700 text-sm mt-1">Redirecting to signup...</p>
                </div>
              </div>
            )}

            {!paymentSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    placeholder="John Doe"
                    value={paymentData.cardName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <IoCardOutline className="w-4 h-4" />
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-mono"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <IoCalendarOutline className="w-4 h-4" />
                      Expiry Date
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="expiryMonth"
                        placeholder="MM"
                        value={paymentData.expiryMonth}
                        onChange={handleInputChange}
                        maxLength="2"
                        required
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                      />
                      <span className="flex items-center text-gray-400">/</span>
                      <input
                        type="text"
                        name="expiryYear"
                        placeholder="YYYY"
                        value={paymentData.expiryYear}
                        onChange={handleInputChange}
                        maxLength="4"
                        required
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      maxLength="3"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 font-bold rounded-xl transition-all ${
                    isProcessing
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Pay $${selectedPlan.price}/month`}
                </button>

                {/* Test Card Info */}
               
              </form>
            ) : (
              <div className="text-center py-8">
                <IoCheckmarkCircleOutline className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                <p className="text-gray-600">Redirecting to signup...</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-8">
            {/* Plan Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Monthly subscription</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">${selectedPlan.price}</p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="py-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Included Features:</h3>
                <div className="space-y-3">
                  {selectedPlan.features && selectedPlan.features.length > 0 ? (
                    selectedPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No additional features</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="py-6 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (estimated)</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total due today</span>
                  <span className="text-2xl font-bold text-blue-600">${selectedPlan.price}</span>
                </div>
              </div>

              {/* Billing Details */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="mb-2"><span className="font-semibold">Billing Cycle:</span> Monthly</p>
                <p><span className="font-semibold">Renews:</span> Auto-renews every month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
