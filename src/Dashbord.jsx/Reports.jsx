import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaClipboardCheck, FaChalkboardTeacher, FaHome, FaBus, FaSpinner } from 'react-icons/fa';
import api from '../api';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overview: {
      totalStudents: 0,
      totalTeachers: 0,
      totalStaff: 0,
      totalClasses: 0,
      totalSections: 0,
      pendingApprovals: 0,
      approvedApprovals: 0,
      rejectedApprovals: 0
    },
    hostel: {
      totalHostels: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      totalAllocations: 0,
      totalWardens: 0
    },
    transport: {
      totalVehicles: 0,
      totalDrivers: 0,
      totalRoutes: 0,
      totalAllocations: 0
    },
    fees: {
      totalFees: 0,
      recurringFees: 0,
      fixedFees: 0,
      totalAmount: 0,
      feesList: []
    }
  });

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [dashboardRes, hostelRes, vehiclesRes, driversRes, routesRes, allocationsRes, feeRes] = await Promise.all([
        api.get('/api/branch-admin/dashboard').catch(err => {
          console.error('Dashboard API error:', err);
          return { data: { stats: {} } };
        }),
        api.get('/api/hostel/dashboard-stats').catch(err => {
          console.error('Hostel API error:', err);
          return { data: { stats: {} } };
        }),
        api.get('/api/vehicle/all').catch(err => {
          console.error('Vehicles API error:', err);
          return { data: [] };
        }),
        api.get('/api/driver/all').catch(err => {
          console.error('Drivers API error:', err);
          return { data: [] };
        }),
        api.get('/api/route/all').catch(err => {
          console.error('Routes API error:', err);
          return { data: [] };
        }),
        api.get('/api/transport-allocation/all').catch(err => {
          console.error('Allocations API error:', err);
          return { data: [] };
        }),
        api.get('/api/fee/all').catch(err => {
          console.error('Fee API error:', err);
          return { data: [] };
        })
      ]);

      console.log('Dashboard Response:', dashboardRes.data);
      console.log('Hostel Response:', hostelRes.data);
      console.log('Vehicles Response:', vehiclesRes.data);
      console.log('Drivers Response:', driversRes.data);
      console.log('Routes Response:', routesRes.data);
      console.log('Allocations Response:', allocationsRes.data);
      console.log('Fee Response:', feeRes.data);

      // Extract data from responses
      const dashboardData = dashboardRes.data?.stats || dashboardRes.data || {};
      const hostelStats = hostelRes.data?.stats || hostelRes.data || {};
      
      // Extract transport data from individual endpoints
      const vehiclesList = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : (vehiclesRes.data?.vehicles || vehiclesRes.data?.data || []);
      const driversList = Array.isArray(driversRes.data) ? driversRes.data : (driversRes.data?.drivers || driversRes.data?.data || []);
      const routesList = Array.isArray(routesRes.data) ? routesRes.data : (routesRes.data?.routes || routesRes.data?.data || []);
      const allocationsList = Array.isArray(allocationsRes.data) ? allocationsRes.data : (allocationsRes.data?.allocations || allocationsRes.data?.data || []);
      
      const transportStats = {
        totalVehicles: Array.isArray(vehiclesList) ? vehiclesList.length : 0,
        totalDrivers: Array.isArray(driversList) ? driversList.length : 0,
        totalRoutes: Array.isArray(routesList) ? routesList.length : 0,
        totalAllocations: Array.isArray(allocationsList) ? allocationsList.length : 0
      };
      
      const feesList = Array.isArray(feeRes.data) ? feeRes.data : (feeRes.data?.fees || feeRes.data?.data || []);

      console.log('Extracted Dashboard Data:', dashboardData);
      console.log('Extracted Hostel Data:', hostelStats);
      console.log('Extracted Transport Data:', transportStats);
      console.log('Extracted Fee Data:', feesList);

      // Calculate fee stats
      const recurringFees = Array.isArray(feesList) ? feesList.filter(f => f.feeType === 'recurring').length : 0;
      const fixedFees = Array.isArray(feesList) ? feesList.filter(f => f.feeType === 'fixed').length : 0;
      const totalAmount = Array.isArray(feesList) ? feesList.reduce((sum, f) => sum + (parseInt(f.totalAmount) || 0), 0) : 0;

      setReportData({
        overview: {
          totalStudents: dashboardData.totalStudents || 0,
          totalTeachers: dashboardData.totalTeachers || 0,
          totalStaff: dashboardData.totalStaff || 0,
          totalClasses: dashboardData.totalClasses || 0,
          totalSections: dashboardData.totalSections || 0,
          pendingApprovals: dashboardData.pendingApprovals || 0,
          approvedApprovals: dashboardData.approvedApprovals || 0,
          rejectedApprovals: dashboardData.rejectedApprovals || 0
        },
        hostel: {
          totalHostels: hostelStats.totalHostels || 0,
          totalRooms: hostelStats.totalRooms || 0,
          occupiedRooms: hostelStats.occupiedRooms || 0,
          availableRooms: hostelStats.availableRooms || 0,
          totalAllocations: hostelStats.totalAllocations || 0,
          totalWardens: hostelStats.totalWardens || 0
        },
        transport: transportStats,
        fees: {
          totalFees: Array.isArray(feesList) ? feesList.length : 0,
          recurringFees,
          fixedFees,
          totalAmount,
          feesList: Array.isArray(feesList) ? feesList : []
        }
      });
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { id: 'overview', name: 'Dashboard Overview', icon: FaChartLine, color: 'from-blue-500 to-blue-600' },
    { id: 'hostel', name: 'Hostel Report', icon: FaHome, color: 'from-indigo-500 to-indigo-600' },
    { id: 'transport', name: 'Transport Report', icon: FaBus, color: 'from-teal-500 to-teal-600' },
    { id: 'fees', name: 'Financial Report', icon: FaMoneyBillWave, color: 'from-purple-500 to-purple-600' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Students</h3>
          <p className="text-3xl font-bold">{reportData.overview.totalStudents?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Teachers</h3>
          <p className="text-3xl font-bold">{reportData.overview.totalTeachers || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Staff</h3>
          <p className="text-3xl font-bold">{reportData.overview.totalStaff || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Pending Approvals</h3>
          <p className="text-3xl font-bold">{reportData.overview.pendingApprovals || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Classes</p>
          <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalClasses || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Sections</p>
          <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalSections || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">{reportData.overview.approvedApprovals || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{reportData.overview.rejectedApprovals || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderHostelReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Hostels</h3>
          <p className="text-3xl font-bold">{reportData.hostel.totalHostels || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Rooms</h3>
          <p className="text-3xl font-bold">{reportData.hostel.totalRooms || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Occupied Rooms</h3>
          <p className="text-3xl font-bold">{reportData.hostel.occupiedRooms || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Available Rooms</h3>
          <p className="text-3xl font-bold">{reportData.hostel.availableRooms || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Allocations</h3>
          <p className="text-3xl font-bold">{reportData.hostel.totalAllocations || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Wardens</h3>
          <p className="text-3xl font-bold">{reportData.hostel.totalWardens || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderTransportReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Vehicles</h3>
          <p className="text-3xl font-bold">{reportData.transport.totalVehicles || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Drivers</h3>
          <p className="text-3xl font-bold">{reportData.transport.totalDrivers || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Routes</h3>
          <p className="text-3xl font-bold">{reportData.transport.totalRoutes || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Allocations</h3>
          <p className="text-3xl font-bold">{reportData.transport.totalAllocations || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderFeeReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Fees</h3>
          <p className="text-3xl font-bold">{reportData.fees.totalFees || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Recurring Fees</h3>
          <p className="text-3xl font-bold">{reportData.fees.recurringFees || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Fixed Fees</h3>
          <p className="text-3xl font-bold">{reportData.fees.fixedFees || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Amount</h3>
          <p className="text-3xl font-bold">₹{reportData.fees.totalAmount?.toLocaleString() || 0}</p>
        </div>
      </div>

      {reportData.fees.feesList && reportData.fees.feesList.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-bold text-gray-900">Fee Details ({reportData.fees.feesList.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Fee Name</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Type</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Amount</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {reportData.fees.feesList.map((fee, i) => (
                  <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{fee.feeName}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.feeType === 'recurring' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{fee.feeType}</span></td>
                    <td className="px-6 py-4 font-bold text-orange-600">₹{parseInt(fee.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 capitalize">{fee.frequency || 'One Time'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      );
    }

    switch (selectedReport) {
      case 'overview':
        return renderOverview();
      case 'hostel':
        return renderHostelReport();
      case 'transport':
        return renderTransportReport();
      case 'fees':
        return renderFeeReport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Reports</h2>
        <p className="text-gray-600 mt-1">View and analyze your institution data</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportTypes.map(type => {
          const IconComponent = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`group p-4 rounded-2xl transition-all duration-300 ${
                selectedReport === type.id
                  ? `bg-gradient-to-r ${type.color} text-white shadow-xl`
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg border'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <IconComponent className="text-xl mb-2" />
                <h3 className="font-bold text-xs">{type.name}</h3>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-8">
        {renderContent()}
      </div>
    </div>
  );
}
