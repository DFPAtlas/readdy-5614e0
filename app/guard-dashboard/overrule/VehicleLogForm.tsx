'use client';

import { useState } from 'react';

export default function VehicleLogForm() {
  const [formData, setFormData] = useState({
    vehicleReg: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    visitPurpose: '',
    parkingLocation: '',
    arrivalTime: '',
    expectedDeparture: '',
    hostName: '',
    department: '',
    vehicleType: 'car',
    isCommercial: false,
    companyName: '',
    deliveryDetails: '',
    specialInstructions: '',
    passRequired: false,
    passNumber: '',
    notes: ''
  });

  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      registration: 'AB12 CDE',
      make: 'Ford',
      model: 'Transit',
      color: 'White',
      driver: 'Mark Johnson',
      purpose: 'Delivery',
      location: 'Loading Bay A',
      arrivalTime: '2024-01-15 10:30',
      status: 'Parked',
      type: 'Van',
      company: 'DHL Express'
    },
    {
      id: 2,
      registration: 'XY98 ZAB',
      make: 'BMW',
      model: 'X5',
      color: 'Black',
      driver: 'Sarah Wilson',
      purpose: 'Business Meeting',
      location: 'Visitor Parking',
      arrivalTime: '2024-01-15 09:15',
      status: 'Parked',
      type: 'Car',
      company: 'TechCorp Solutions'
    },
    {
      id: 3,
      registration: 'FG56 HIJ',
      make: 'Mercedes',
      model: 'Sprinter',
      color: 'Silver',
      driver: 'David Brown',
      purpose: 'Maintenance',
      location: 'Service Area',
      arrivalTime: '2024-01-15 08:45',
      status: 'Departed',
      type: 'Van',
      company: 'ServicePro Ltd'
    }
  ]);

  const vehicleTypes = [
    'Car',
    'Van',
    'Truck',
    'Motorcycle',
    'Lorry',
    'Coach',
    'Minibus',
    'Emergency Vehicle',
    'Other'
  ];

  const visitPurposes = [
    'Business Meeting',
    'Delivery',
    'Maintenance',
    'Installation',
    'Inspection',
    'Service Call',
    'Emergency',
    'VIP Visit',
    'Staff Member',
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
    const newVehicle = {
      id: vehicles.length + 1,
      registration: formData.vehicleReg,
      make: formData.vehicleMake,
      model: formData.vehicleModel,
      color: formData.vehicleColor,
      driver: formData.driverName,
      purpose: formData.visitPurpose,
      location: formData.parkingLocation,
      arrivalTime: formData.arrivalTime,
      status: 'Parked',
      type: formData.vehicleType,
      company: formData.companyName || 'Individual'
    };
    setVehicles([...vehicles, newVehicle]);
    setFormData({
      vehicleReg: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleColor: '',
      driverName: '',
      driverPhone: '',
      driverLicense: '',
      visitPurpose: '',
      parkingLocation: '',
      arrivalTime: '',
      expectedDeparture: '',
      hostName: '',
      department: '',
      vehicleType: 'car',
      isCommercial: false,
      companyName: '',
      deliveryDetails: '',
      specialInstructions: '',
      passRequired: false,
      passNumber: '',
      notes: ''
    });
  };

  const handleVehicleDeparture = (vehicleId: number) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, status: 'Departed' }
        : vehicle
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Parked':
        return 'bg-blue-100 text-blue-800';
      case 'Departed':
        return 'bg-gray-100 text-gray-800';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vehicle Registration Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Registration</h2>
          <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration *</label>
                <input
                  type="text"
                  name="vehicleReg"
                  value={formData.vehicleReg}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AB12 CDE"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  {vehicleTypes.map(type => (
                    <option key={type.toLowerCase()} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver License Number</label>
              <input
                type="text"
                name="driverLicense"
                value={formData.driverLicense}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit Purpose *</label>
              <select
                name="visitPurpose"
                value={formData.visitPurpose}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select purpose</option>
                {visitPurposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking Location *</label>
              <input
                type="text"
                name="parkingLocation"
                value={formData.parkingLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Visitor Parking, Loading Bay A"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Departure</label>
                <input
                  type="datetime-local"
                  name="expectedDeparture"
                  value={formData.expectedDeparture}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Name</label>
                <input
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isCommercial"
                  checked={formData.isCommercial}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Commercial Vehicle</span>
              </label>
            </div>

            {formData.isCommercial && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Details</label>
              <textarea
                name="deliveryDetails"
                value={formData.deliveryDetails}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="If delivering, provide details..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.deliveryDetails.length}/500 characters</div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="passRequired"
                  checked={formData.passRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Temporary Pass Required</span>
              </label>
            </div>

            {formData.passRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass Number</label>
                <input
                  type="text"
                  name="passNumber"
                  value={formData.passNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any special parking or access instructions..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.specialInstructions.length}/500 characters</div>
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
              Register Vehicle
            </button>
          </form>
        </div>

        {/* Current Vehicles */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Vehicles</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{vehicle.registration}</h3>
                    <p className="text-xs text-gray-500">{vehicle.make} {vehicle.model} - {vehicle.color}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Driver:</strong> {vehicle.driver}</div>
                  <div><strong>Type:</strong> {vehicle.type}</div>
                  <div><strong>Purpose:</strong> {vehicle.purpose}</div>
                  <div><strong>Location:</strong> {vehicle.location}</div>
                  <div><strong>Company:</strong> {vehicle.company}</div>
                  <div><strong>Arrival:</strong> {vehicle.arrivalTime}</div>
                </div>
                
                {vehicle.status === 'Parked' && (
                  <button
                    onClick={() => handleVehicleDeparture(vehicle.id)}
                    className="mt-2 w-full bg-red-50 text-red-600 py-1 px-2 rounded text-xs hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Record Departure
                  </button>
                )}
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-car-line text-4xl mb-2"></i>
                <p>No vehicles currently registered</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Vehicle Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
            <div className="text-sm text-blue-600">Total Vehicles</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {vehicles.filter(v => v.status === 'Parked').length}
            </div>
            <div className="text-sm text-green-600">Currently Parked</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {vehicles.filter(v => v.company !== 'Individual').length}
            </div>
            <div className="text-sm text-purple-600">Commercial</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {vehicles.filter(v => v.status === 'Departed').length}
            </div>
            <div className="text-sm text-gray-600">Departed</div>
          </div>
        </div>
      </div>
    </div>
  );
}