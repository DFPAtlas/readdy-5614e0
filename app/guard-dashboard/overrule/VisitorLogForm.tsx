
'use client';

import { useState, useRef } from 'react';

export default function VisitorLogForm() {
  const [formData, setFormData] = useState({
    visitorName: '',
    company: '',
    visitPurpose: '',
    hostName: '',
    hostDepartment: '',
    arrivalTime: '',
    expectedDeparture: '',
    visitorPhone: '',
    visitorEmail: '',
    idType: 'driving_license',
    idNumber: '',
    vehicleReg: '',
    accessLevel: 'ground_floor',
    escortRequired: false,
    notes: ''
  });

  const [visitors, setVisitors] = useState([
    {
      id: 1,
      name: 'David Wilson',
      company: 'ABC Construction',
      purpose: 'Maintenance Meeting',
      host: 'John Smith',
      arrivalTime: '2024-01-15 09:30',
      status: 'Checked In',
      badgeNumber: 'V-001',
      photo: null
    },
    {
      id: 2,
      name: 'Lisa Brown',
      company: 'TechCorp Solutions',
      purpose: 'System Installation',
      host: 'Sarah Johnson',
      arrivalTime: '2024-01-15 10:15',
      status: 'Checked In',
      badgeNumber: 'V-002',
      photo: null
    },
    {
      id: 3,
      name: 'Mark Johnson',
      company: 'Delivery Express',
      purpose: 'Package Delivery',
      host: 'Reception',
      arrivalTime: '2024-01-15 11:00',
      status: 'Checked Out',
      badgeNumber: 'V-003',
      photo: null
    }
  ]);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photoData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const usePhoto = () => {
    setShowCameraModal(false);
    stopCamera();
  };

  const closeModal = () => {
    setShowCameraModal(false);
    setCapturedPhoto(null);
    stopCamera();
  };

  const handlePrintPass = (visitor: any) => {
    setSelectedVisitor(visitor);
    setShowPrintModal(true);
  };

  const confirmPrint = () => {
    window.print();
    setShowPrintModal(false);
    setSelectedVisitor(null);
  };

  const cancelPrint = () => {
    setShowPrintModal(false);
    setSelectedVisitor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVisitor = {
      id: visitors.length + 1,
      name: formData.visitorName,
      company: formData.company,
      purpose: formData.visitPurpose,
      host: formData.hostName,
      arrivalTime: formData.arrivalTime,
      status: 'Checked In',
      badgeNumber: `V-${String(visitors.length + 1).padStart(3, '0')}`,
      photo: capturedPhoto
    };
    setVisitors([...visitors, newVisitor]);
    setFormData({
      visitorName: '',
      company: '',
      visitPurpose: '',
      hostName: '',
      hostDepartment: '',
      arrivalTime: '',
      expectedDeparture: '',
      visitorPhone: '',
      visitorEmail: '',
      idType: 'driving_license',
      idNumber: '',
      vehicleReg: '',
      accessLevel: 'ground_floor',
      escortRequired: false,
      notes: ''
    });
    setCapturedPhoto(null);
  };

  const handleCheckOut = (visitorId: number) => {
    setVisitors(visitors.map(visitor => 
      visitor.id === visitorId 
        ? { ...visitor, status: 'Checked Out' }
        : visitor
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitor Registration Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visitor Registration</h2>
          <form id="visitor-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name *</label>
                <input
                  type="text"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Photo</label>
              <div className="flex items-center space-x-4">
                {capturedPhoto ? (
                  <div className="relative">
                    <img 
                      src={capturedPhoto} 
                      alt="Visitor" 
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setCapturedPhoto(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <i className="ri-camera-line text-gray-400 text-xl"></i>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center"
                >
                  <i className="ri-camera-line mr-2"></i>
                  {capturedPhoto ? 'Retake Photo' : 'Take Photo'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit *</label>
              <select
                name="visitPurpose"
                value={formData.visitPurpose}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select purpose</option>
                <option value="business_meeting">Business Meeting</option>
                <option value="maintenance">Maintenance</option>
                <option value="delivery">Delivery</option>
                <option value="inspection">Inspection</option>
                <option value="installation">Installation</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Name *</label>
                <input
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Department</label>
                <input
                  type="text"
                  name="hostDepartment"
                  value={formData.hostDepartment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="visitorPhone"
                  value={formData.visitorPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="visitorEmail"
                  value={formData.visitorEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="driving_license">Driving License</option>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="employee_id">Employee ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                <input
                  type="text"
                  name="vehicleReg"
                  value={formData.vehicleReg}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AB12 CDE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <select
                  name="accessLevel"
                  value={formData.accessLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="ground_floor">Ground Floor Only</option>
                  <option value="all_floors">All Floors</option>
                  <option value="specific_area">Specific Area</option>
                  <option value="escorted">Escorted Access</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="escortRequired"
                  checked={formData.escortRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Escort Required</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any additional information about the visit..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.notes.length}/500 characters</div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Register Visitor
            </button>
          </form>
        </div>

        {/* Current Visitors */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Visitors</h2>
          <div className="space-y-4">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {visitor.photo ? (
                        <img 
                          src={visitor.photo} 
                          alt={visitor.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="ri-user-line text-blue-600"></i>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{visitor.name}</h3>
                      <p className="text-xs text-gray-500">{visitor.company}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    visitor.status === 'Checked In' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {visitor.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Purpose:</strong> {visitor.purpose}</div>
                  <div><strong>Host:</strong> {visitor.host}</div>
                  <div><strong>Arrival:</strong> {visitor.arrivalTime}</div>
                  <div><strong>Badge:</strong> {visitor.badgeNumber}</div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handlePrintPass(visitor)}
                    className="flex-1 bg-blue-50 text-blue-600 py-1 px-2 rounded text-xs hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-printer-line mr-1"></i>
                    Print Pass
                  </button>
                  {visitor.status === 'Checked In' && (
                    <button
                      onClick={() => handleCheckOut(visitor.id)}
                      className="flex-1 bg-red-50 text-red-600 py-1 px-2 rounded text-xs hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Check Out
                    </button>
                  )}
                </div>
              </div>
            ))}
            {visitors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-user-line text-4xl mb-2"></i>
                <p>No visitors currently registered</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Take Visitor Photo</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {!capturedPhoto ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-lg bg-gray-100"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <i className="ri-camera-line text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-600">Camera not started</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                {!capturedPhoto ? (
                  <>
                    {!isStreaming ? (
                      <button
                        onClick={startCamera}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-camera-line mr-2"></i>
                        Start Camera
                      </button>
                    ) : (
                      <button
                        onClick={capturePhoto}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-camera-3-line mr-2"></i>
                        Capture Photo
                      </button>
                    )}
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-restart-line mr-2"></i>
                      Retake
                    </button>
                    <button
                      onClick={usePhoto}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Use Photo
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Pass Modal */}
      {showPrintModal && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Print Visitor Pass</h3>
              <button
                onClick={cancelPrint}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            {/* Print Preview */}
            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">VISITOR PASS</h2>
                  <p className="text-sm text-gray-600">Security Access Badge</p>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedVisitor.photo ? (
                      <img 
                        src={selectedVisitor.photo} 
                        alt={selectedVisitor.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="ri-user-line text-gray-400 text-2xl"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedVisitor.name}</h3>
                    <p className="text-sm text-gray-600">{selectedVisitor.company}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Badge Number:</span>
                    <span className="font-medium">{selectedVisitor.badgeNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span className="font-medium">{selectedVisitor.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span className="font-medium">{selectedVisitor.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrival:</span>
                    <span className="font-medium">{selectedVisitor.arrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedVisitor.status === 'Checked In' 
                        ? 'text-green-600' 
                        : 'text-gray-600'
                    }`}>
                      {selectedVisitor.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    This pass must be worn visibly at all times
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Generated on {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmPrint}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
              >
                <i className="ri-printer-line mr-2"></i>
                Confirm Print
              </button>
              <button
                onClick={cancelPrint}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
