'use client';

export default function StatusSummary() {
  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white">
      <h2 className="text-lg font-semibold mb-6">Status Summary</h2>
      
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">18</div>
          <div className="text-sm text-gray-300">ALL CLEAR</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-red-400 mb-2">2</div>
          <div className="text-sm text-gray-300">ISSUES</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">3</div>
          <div className="text-sm text-gray-300">PENDING</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">23</div>
          <div className="text-sm text-gray-300">TOTAL SITES</div>
        </div>
      </div>
    </div>
  );
}