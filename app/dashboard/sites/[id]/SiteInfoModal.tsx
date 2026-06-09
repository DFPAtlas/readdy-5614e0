'use client';

interface SiteInfoModalProps {
  type: string;
  onClose: () => void;
  siteId: string;
}

export default function SiteInfoModal({ type, onClose, siteId }: SiteInfoModalProps) {
  const renderContent = () => {
    switch (type) {
      case 'contact':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Emergency Contact:</span>
                <span className="text-gray-900 font-medium">+44 999 Emergency</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Site Manager:</span>
                <span className="text-gray-900 font-medium">+44 7700 900100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Control:</span>
                <span className="text-gray-900 font-medium">+44 7700 900101</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backup Officer:</span>
                <span className="text-gray-900 font-medium">+44 7700 900102</span>
              </div>
            </div>
          </div>
        );
      
      case 'patrol-log':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Patrol Log</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">20:30 - Perimeter Check</span>
                  <span className="text-green-600">Completed</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">All access points secured. No anomalies detected.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">19:15 - Building Interior</span>
                  <span className="text-green-600">Completed</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">All floors checked. Emergency exits clear.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">18:00 - Parking Area</span>
                  <span className="text-yellow-600">Issue Noted</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Suspicious individual observed. Incident report filed.</p>
              </div>
            </div>
          </div>
        );
      
      case 'details':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Guard Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Badge Number:</span>
                <span className="text-gray-900 font-medium">SEC-0123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth:</span>
                <span className="text-gray-900 font-medium">15/03/1985</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certifications:</span>
                <span className="text-gray-900 font-medium">SIA License, First Aid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shift:</span>
                <span className="text-gray-900 font-medium">18:00 - 06:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Years Experience:</span>
                <span className="text-gray-900 font-medium">7 years</span>
              </div>
            </div>
          </div>
        );
      
      case 'risk-assessment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-green-800">Overall Risk Level</span>
                  <span className="text-green-600 font-bold">LOW</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Physical Security:</span>
                  <span className="text-green-600">Good</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Access Control:</span>
                  <span className="text-green-600">Excellent</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CCTV Coverage:</span>
                  <span className="text-yellow-600">Fair</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lighting:</span>
                  <span className="text-yellow-600">Needs Improvement</span>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Recommendation:</strong> Improve lighting in parking area. Consider additional CCTV coverage for blind spots.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'incident-report':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-red-800">Suspicious Activity</span>
                  <span className="text-red-600">Today 18:30</span>
                </div>
                <p className="text-xs text-red-700 mt-1">Individual testing vehicle door handles in parking area</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-yellow-800">Equipment Malfunction</span>
                  <span className="text-yellow-600">Yesterday 14:20</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">CCTV Camera 3 offline for 2 hours</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-500">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-800">False Alarm</span>
                  <span className="text-gray-600">2 days ago</span>
                </div>
                <p className="text-xs text-gray-700 mt-1">Motion sensor triggered by cleaning staff</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Information not available</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Site Information</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>
        
        {renderContent()}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}