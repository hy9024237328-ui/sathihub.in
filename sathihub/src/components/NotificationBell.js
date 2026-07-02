import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const [count] = useState(0);
  return (
    <button className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition">
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
