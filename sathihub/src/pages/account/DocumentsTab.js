import React from 'react';
import { FileText } from 'lucide-react';
const DocumentsTab = () => (
  <div className="max-w-md mx-auto py-6 px-4">
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 text-center">
      <FileText className="w-12 h-12 text-purple-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800 mb-2">KYC Documents</h3>
      <p className="text-gray-500 text-sm">Aadhaar, PAN verification — coming soon!</p>
    </div>
  </div>
);
export default DocumentsTab;
