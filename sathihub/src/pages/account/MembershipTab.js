import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Star, CheckCircle } from 'lucide-react';
const MembershipTab = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-4">
      {user?.is_premium && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2"><Star className="w-6 h-6 fill-white"/><p className="font-bold text-lg">Free Premium Member!</p></div>
          <p className="text-amber-100 text-sm">Aap pehle 1000 users mein hain — saari features bilkul FREE!</p>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Membership Plans</h3>
        {[['6 Months','₹199','₹500'],['1 Year ⭐','₹499','₹1000'],['Lifetime','₹999','₹2000']].map(([plan,price,old]) => (
          <div key={plan} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
            <span className="font-medium text-gray-700">{plan}</span>
            <div className="text-right">
              <span className="text-xs text-gray-400 line-through mr-2">{old}</span>
              <span className="font-bold text-green-600">{price} + GST</span>
            </div>
          </div>
        ))}
        <button className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
          Upgrade Now → (Coming Soon)
        </button>
      </div>
    </div>
  );
};
export default MembershipTab;
