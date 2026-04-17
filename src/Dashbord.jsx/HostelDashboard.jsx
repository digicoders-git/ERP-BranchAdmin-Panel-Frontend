import React, { useState, useEffect } from 'react';
import { FaBuilding, FaBed, FaUsers, FaUnlock, FaUser, FaMoneyBillWave, FaSpinner, FaTools, FaUserTie } from 'react-icons/fa';
import api from '../api';

export default function HostelDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAllocations, setRecentAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/hostel/dashboard-stats');
      setStats(data.stats || {});
      setRecentAllocations(data.recentAllocations || []);
    } catch (err) {
      console.error('Failed to fetch hostel dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
    <div className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-80">
          <Icon />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaBuilding className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Hostel Dashboard
            </h1>
            <p className="text-gray-600 text-sm">Overview of hostel management</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Hostels" 
          value={stats?.totalHostels} 
          icon={FaBuilding} 
          gradient="from-blue-500 to-blue-600"
          subtitle={`${stats?.activeHostels || 0} active`}
        />
        <StatCard 
          title="Total Rooms" 
          value={stats?.totalRooms} 
          icon={FaBed} 
          gradient="from-green-500 to-green-600"
          subtitle="All rooms"
        />
        <StatCard 
          title="Occupied Rooms" 
          value={stats?.occupiedRooms} 
          icon={FaUsers} 
          gradient="from-orange-500 to-orange-600"
          subtitle={`${stats?.totalRooms ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}% occupancy`}
        />
        <StatCard 
          title="Available Rooms" 
          value={stats?.availableRooms} 
          icon={FaUnlock} 
          gradient="from-purple-500 to-purple-600"
          subtitle="Ready to allocate"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FaTools className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRooms - (stats?.availableRooms + stats?.occupiedRooms) || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FaUserTie className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Wardens</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalWardens || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <FaUsers className="text-emerald-600 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Allocations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeAllocations || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Allocations */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-gray-900">Recent Allocations</h3>
          <p className="text-gray-600 text-sm">Latest hostel room allocations</p>
        </div>
        
        {recentAllocations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaUser className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No recent allocations</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {recentAllocations.map((allocation, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{allocation.studentName || 'Student'}</p>
                  <p className="text-sm text-gray-500">
                    Room {allocation.roomNo} • {allocation.hostel?.hostelName || 'Hostel'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    allocation.allocationStatus === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {allocation.allocationStatus || 'Active'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(allocation.joiningDate || allocation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Occupancy Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Occupied</span>
              <span className="font-semibold text-orange-600">
                {stats?.occupiedRooms || 0} / {stats?.totalRooms || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats?.totalRooms ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Available</span>
              <span className="font-semibold text-purple-600">
                {stats?.availableRooms || 0} / {stats?.totalRooms || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats?.totalRooms ? (stats.availableRooms / stats.totalRooms) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
