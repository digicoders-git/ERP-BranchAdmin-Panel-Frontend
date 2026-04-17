import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBus, FaUserTie, FaMapMarkedAlt, FaBusAlt, FaUsers, FaSpinner } from 'react-icons/fa';
import api from '../api';

export default function Transport() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    totalRoutes: 0,
    totalAllocations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransportStats();
  }, []);

  const fetchTransportStats = async () => {
    try {
      setLoading(true);
      
      // Fetch from individual endpoints
      const [vehiclesRes, driversRes, routesRes] = await Promise.all([
        api.get('/api/staff-panel/transport/vehicles').catch(err => {
          console.error('Vehicles API error:', err);
          return { data: { vehicles: [] } };
        }),
        api.get('/api/staff-panel/transport/drivers').catch(err => {
          console.error('Drivers API error:', err);
          return { data: { drivers: [] } };
        }),
        api.get('/api/staff-panel/transport/routes').catch(err => {
          console.error('Routes API error:', err);
          return { data: { routes: [] } };
        })
      ]);

      console.log('Vehicles Response:', vehiclesRes.data);
      console.log('Drivers Response:', driversRes.data);
      console.log('Routes Response:', routesRes.data);

      // Extract data
      const vehiclesList = vehiclesRes.data?.vehicles || vehiclesRes.data || [];
      const driversList = driversRes.data?.drivers || driversRes.data || [];
      const routesList = routesRes.data?.routes || routesRes.data || [];

      console.log('Vehicles Count:', Array.isArray(vehiclesList) ? vehiclesList.length : 0);
      console.log('Drivers Count:', Array.isArray(driversList) ? driversList.length : 0);
      console.log('Routes Count:', Array.isArray(routesList) ? routesList.length : 0);

      setStats({
        totalVehicles: Array.isArray(vehiclesList) ? vehiclesList.length : 0,
        totalDrivers: Array.isArray(driversList) ? driversList.length : 0,
        totalRoutes: Array.isArray(routesList) ? routesList.length : 0,
        totalAllocations: 0
      });
    } catch (err) {
      console.error('Failed to fetch transport stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Transport Dashboard */}
      <div className="p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaBus className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Transport Management
              </h1>
              <p className="text-gray-600 mt-1">Manage school transport system</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1"><FaBus className="inline mr-2" />Vehicles</h3>
                    <p className="text-blue-100 text-sm">Total Fleet</p>
                  </div>
                  <div className="text-3xl font-bold">{stats.totalVehicles || 0}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1"><FaUserTie className="inline mr-2" />Drivers</h3>
                    <p className="text-green-100 text-sm">Active Drivers</p>
                  </div>
                  <div className="text-3xl font-bold">{stats.totalDrivers || 0}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1"><FaMapMarkedAlt className="inline mr-2" />Routes</h3>
                    <p className="text-purple-100 text-sm">Active Routes</p>
                  </div>
                  <div className="text-3xl font-bold">{stats.totalRoutes || 0}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1"><FaUsers className="inline mr-2" />Allocations</h3>
                    <p className="text-orange-100 text-sm">Active Allocations</p>
                  </div>
                  <div className="text-3xl font-bold">{stats.totalAllocations || 0}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600 text-sm mt-1">Manage transport operations</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/dashbord/transport/vehicle" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl border border-blue-200 transition-all hover:shadow-md">
                <div className="text-blue-600 text-2xl mb-2"><FaBus /></div>
                <h4 className="font-bold text-gray-800">Vehicle Master</h4>
                <p className="text-sm text-gray-600">Manage vehicles</p>
              </a>
              
              <a href="/dashbord/transport/driver" className="bg-green-50 hover:bg-green-100 p-4 rounded-xl border border-green-200 transition-all hover:shadow-md">
                <div className="text-green-600 text-2xl mb-2"><FaUserTie /></div>
                <h4 className="font-bold text-gray-800">Driver Master</h4>
                <p className="text-sm text-gray-600">Manage drivers</p>
              </a>
              
              <a href="/dashbord/transport/route" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl border border-purple-200 transition-all hover:shadow-md">
                <div className="text-purple-600 text-2xl mb-2"><FaMapMarkedAlt /></div>
                <h4 className="font-bold text-gray-800">Route Master</h4>
                <p className="text-sm text-gray-600">Manage routes</p>
              </a>
              
              <a href="/dashbord/transport/route-stops" className="bg-orange-50 hover:bg-orange-100 p-4 rounded-xl border border-orange-200 transition-all hover:shadow-md">
                <div className="text-orange-600 text-2xl mb-2"><FaBusAlt /></div>
                <h4 className="font-bold text-gray-800">Route Stops</h4>
                <p className="text-sm text-gray-600">Manage stops</p>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nested Routes */}
      <Outlet />
    </div>
  );
}
