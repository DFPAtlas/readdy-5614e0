'use client';

import { useState } from 'react';

export default function DeliveryLogForm() {
  const [formData, setFormData] = useState({
    deliveryDate: '',
    deliveryTime: '',
    company: '',
    driverName: '',
    driverPhone: '',
    vehicleReg: '',
    deliveryType: '',
    recipient: '',
    recipientDepartment: '',
    packageCount: '',
    packageDescription: '',
    specialInstructions: '',
    signatureRequired: true,
    deliveryStatus: 'pending',
    notes: ''
  });

  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-2024-001',
      date: '2024-01-15',
      time: '10:30',
      company: 'DHL Express',
      driver: 'Mark Johnson',
      vehicle: 'VAN123',
      recipient: 'Reception',
      packages: '3 packages',
      status: 'Delivered',
      type: 'Standard'
    },
    {
      id: 'DEL-2024-002',
      date: '2024-01-15',
      time: '11:45',
      company: 'Royal Mail',
      driver: 'Sarah Wilson',
      vehicle: 'RM456',
      recipient: 'Security Office',
      packages: '1 package',
      status: 'Delivered',
      type: 'Registered'
    },
    {
      id: 'DEL-2024-003',
      date: '2024-01-15',
      time: '14:20',
      company: 'FedEx',
      driver: 'James Brown',
      vehicle: 'FDX789',
      recipient: 'Maintenance',
      packages: '2 packages',
      status: 'Pending',
      type: 'Express'
    }
  ]);

  const deliveryTypes = [
    'Standard',
    'Express',
    'Registered',
    'Special Delivery',
    'Fragile',
    'Hazardous',
    'Confidential',
    'Food/Catering',
    'Equipment',
    'Documents',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDelivery = {
      id: `DEL-2024-${String(deliveries.length + 1).padStart(3, '0')}`,
      date: formData.deliveryDate,
      time: formData.deliveryTime,
      company: formData.company,
      driver: formData.driverName,
      vehicle: formData.vehicleReg,
      recipient: formData.recipient,
      packages: `${formData.packageCount} package${formData.packageCount !== '1' ? 's' : ''}`,
      status: formData.deliveryStatus === 'pending' ? 'Pending' : 'Delivered',
      type: formData.deliveryType
    };
    setDeliveries([newDelivery, ...deliveries]);
    setFormData({
      deliveryDate: '',
      deliveryTime: '',
      company: '',
      driverName: '',
      driverPhone: '',
      vehicleReg: '',
      deliveryType: '',
      recipient: '',
      recipientDepartment: '',
      packageCount: '',
      packageDescription: '',
      specialInstructions: '',
      signatureRequired: true,
      deliveryStatus: 'pending',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Delivery Log Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Log Entry</h2>
          <form id="delivery-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time *</label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DHL, Royal Mail, FedEx"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration *</label>
                <input
                  type="text"
                  name="vehicleReg"
                  value={formData.vehicleReg}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AB12 CDE"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type *</label>
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  <option value="">Select delivery type</option>
                  {deliveryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient *</label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name or department"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Department</label>
                <input
                  type="text"
                  name="recipientDepartment"
                  value={formData.recipientDepartment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Count *</label>
                <input
                  type="number"
                  name="packageCount"
                  value={formData.packageCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status *</label>
                <select
                  name="deliveryStatus"
                  value={formData.deliveryStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed Delivery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
              <textarea
                name="packageDescription"
                value={formData.packageDescription}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Brief description of packages..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.packageDescription.length}/500 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any special handling instructions..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.specialInstructions.length}/500 characters</div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="signatureRequired"
                  checked={formData.signatureRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Signature Required</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any additional notes or observations..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.notes.length}/500 characters</div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Log Delivery
            </button>
          </form>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{delivery.id}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                  <div>
                    <strong>Company:</strong> {delivery.company}
                  </div>
                  <div>
                    <strong>Driver:</strong> {delivery.driver}
                  </div>
                  <div>
                    <strong>Vehicle:</strong> {delivery.vehicle}
                  </div>
                  <div>
                    <strong>Type:</strong> {delivery.type}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  <div><strong>Recipient:</strong> {delivery.recipient}</div>
                  <div><strong>Packages:</strong> {delivery.packages}</div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <i className="ri-calendar-line mr-1"></i>
                    {delivery.date} at {delivery.time}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Delivery Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{deliveries.length}</div>
            <div className="text-sm text-blue-600">Total Deliveries</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {deliveries.filter(d => d.status === 'Delivered').length}
            </div>
            <div className="text-sm text-green-600">Delivered</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {deliveries.filter(d => d.status === 'Pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {deliveries.filter(d => d.status === 'Failed').length}
            </div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}