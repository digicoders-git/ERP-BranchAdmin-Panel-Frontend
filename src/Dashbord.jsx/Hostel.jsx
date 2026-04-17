import React from 'react';
import { Outlet } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

export default function Hostel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaHome className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Hostel Management
            </h1>
            <p className="text-gray-600 mt-1">Manage hostel facilities and accommodations</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}