'use client';

import { useState } from 'react';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (paymentMethod: any) => void;
}

export default function AddPaymentMethodModal({ isOpen, onClose, onAdd }: AddPaymentMethodModalProps) {
  const [paymentType, setPaymentType] = useState('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'United Kingdom'
  });

  const [bankData, setBankData] = useState({
    accountHolderName: '',
    accountNumber: '',
    sortCode: '',
    bankName: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'United Kingdom'
  });

  const [makeDefault, setMakeDefault] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleaned;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const getCardType = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s+/g, '');
    if (cleaned.match(/^4/)) return 'Visa';
    if (cleaned.match(/^5[1-5]/)) return 'Mastercard';
    if (cleaned.match(/^3[47]/)) return 'American Express';
    return 'Unknown';
  };

  const validateCard = () => {
    const cleaned = cardData.cardNumber.replace(/\s+/g, '');
    return cleaned.length >= 13 && 
           cardData.expiryMonth && 
           cardData.expiryYear && 
           cardData.cvv.length >= 3 && 
           cardData.cardholderName.trim().length > 0;
  };

  const validateBank = () => {
    return bankData.accountHolderName.trim().length > 0 &&
           bankData.accountNumber.length >= 8 &&
           bankData.sortCode.length === 6 &&
           bankData.bankName.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentType === 'card' && !validateCard()) {
      setFormError('Please fill in all required card details');
      return;
    }
    
    if (paymentType === 'bank' && !validateBank()) {
      setFormError('Please fill in all required bank details');
      return;
    }
    setFormError('');

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPaymentMethod = {
        id: Date.now(),
        type: paymentType,
        default: makeDefault,
        ...(paymentType === 'card' ? {
          last4: cardData.cardNumber.slice(-4),
          brand: getCardType(cardData.cardNumber),
          expiry: `${cardData.expiryMonth}/${cardData.expiryYear}`
        } : {
          last4: bankData.accountNumber.slice(-4),
          brand: 'Bank Transfer',
          bankName: bankData.bankName
        })
      };
      
      onAdd(newPaymentMethod);
      onClose();
      
      // Reset form
      setCardData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        billingAddress: '',
        billingCity: '',
        billingPostalCode: '',
        billingCountry: 'United Kingdom'
      });
      setBankData({
        accountHolderName: '',
        accountNumber: '',
        sortCode: '',
        bankName: '',
        billingAddress: '',
        billingCity: '',
        billingPostalCode: '',
        billingCountry: 'United Kingdom'
      });
      setMakeDefault(false);
      
    } catch (error) {
      setFormError('Failed to add payment method. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = [
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Payment Method</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
          )}
          {/* Payment Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method Type</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentType === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentType('card')}
              >
                <div className="flex items-center justify-center mb-2">
                  <i className="ri-bank-card-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-900 text-center">Credit/Debit Card</h3>
                <p className="text-xs text-gray-500 text-center mt-1">Visa, Mastercard, Amex</p>
              </div>
              
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentType === 'bank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentType('bank')}
              >
                <div className="flex items-center justify-center mb-2">
                  <i className="ri-bank-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-sm font-medium text-gray-900 text-center">Bank Transfer</h3>
                <p className="text-xs text-gray-500 text-center mt-1">Direct bank account</p>
              </div>
            </div>
          </div>

          {/* Card Payment Form */}
          {paymentType === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    required
                  />
                  <div className="absolute right-3 top-2.5 text-sm text-gray-500">
                    {cardData.cardNumber && getCardType(cardData.cardNumber)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Month *</label>
                  <select
                    name="expiryMonth"
                    value={cardData.expiryMonth}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    required
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Year *</label>
                  <select
                    name="expiryYear"
                    value={cardData.expiryYear}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    required
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year.toString().slice(-2)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={cardData.cardholderName}
                  onChange={handleCardChange}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={cardData.billingAddress}
                    onChange={handleCardChange}
                    placeholder="123 Main Street"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={cardData.billingCity}
                    onChange={handleCardChange}
                    placeholder="London"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="billingPostalCode"
                    value={cardData.billingPostalCode}
                    onChange={handleCardChange}
                    placeholder="SW1A 1AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    name="billingCountry"
                    value={cardData.billingCountry}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {paymentType === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={bankData.accountHolderName}
                  onChange={handleBankChange}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankData.accountNumber}
                    onChange={handleBankChange}
                    placeholder="12345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Code *</label>
                  <input
                    type="text"
                    name="sortCode"
                    value={bankData.sortCode}
                    onChange={handleBankChange}
                    placeholder="12-34-56"
                    maxLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  value={bankData.bankName}
                  onChange={handleBankChange}
                  placeholder="Barclays Bank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={bankData.billingAddress}
                    onChange={handleBankChange}
                    placeholder="123 Main Street"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={bankData.billingCity}
                    onChange={handleBankChange}
                    placeholder="London"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="billingPostalCode"
                    value={bankData.billingPostalCode}
                    onChange={handleBankChange}
                    placeholder="SW1A 1AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    name="billingCountry"
                    value={bankData.billingCountry}
                    onChange={handleBankChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <i className="ri-shield-check-line text-blue-600 mt-0.5"></i>
              <div>
                <h4 className="font-medium text-blue-900">Security Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment information is encrypted and stored securely. We use industry-standard security measures to protect your data.
                </p>
              </div>
            </div>
          </div>

          {/* Default Payment Method */}
          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Make this my default payment method</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Processing...
                </span>
              ) : (
                'Add Payment Method'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}