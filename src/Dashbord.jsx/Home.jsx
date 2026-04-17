import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaChalkboardTeacher, FaMoneyBillWave, FaClipboardCheck,
  FaGraduationCap, FaCalendarAlt, FaBell, FaArrowRight, FaClock,
  FaCheckCircle, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaHandPaper
} from 'react-icons/fa';
import api from '../api';

function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    pendingApprovals: 0,
    totalClasses: 0,
    totalSections: 0,
    approvedApprovals: 0,
    rejectedApprovals: 0
  });
  const [recentApprovals, setRecentApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data...');
        
        const response = await api.get('/api/branch-admin/dashboard');
        console.log('Dashboard response:', response);
        console.log('Dashboard data:', response.data);
        
        if (response.data && response.data.success) {
          const { stats: statsData, recentApprovals: approvals } = response.data;
          console.log('Stats data:', statsData);
          console.log('Recent approvals:', approvals);
          
          setStats({
            totalStudents: statsData.totalStudents || 0,
            totalTeachers: statsData.totalTeachers || 0,
            totalStaff: statsData.totalStaff || 0,
            pendingApprovals: statsData.pendingApprovals || 0,
            totalClasses: statsData.totalClasses || 0,
            totalSections: statsData.totalSections || 0,
            approvedApprovals: statsData.approvedApprovals || 0,
            rejectedApprovals: statsData.rejectedApprovals || 0
          });
          
          setRecentApprovals(approvals || []);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response?.data);
        console.error('Error message:', err.response?.data?.message);
        console.error('Error details:', err.response?.data?.error);
        setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} p-4 sm:p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
          <Icon className="text-lg sm:text-2xl" />
        </div>
      </div>
      <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-80 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl">
          <p className="font-bold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Welcome Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
              Welcome back, Admin! <FaHandPaper className="text-yellow-500" />
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Here's what's happening at your branch today</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><FaClock className="text-blue-500" />{currentTime.toLocaleTimeString()}</span>
              <span className="flex items-center gap-1"><FaCalendarAlt className="text-green-500" />{currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashbord/approval')}
            className="relative p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all"
          >
            <FaBell className="text-blue-600 text-lg" />
            {stats.pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon={FaUsers} color="from-blue-500 via-blue-600 to-blue-700" subtitle="Active enrollments" />
        <StatCard title="Teaching Staff" value={stats.totalTeachers} icon={FaChalkboardTeacher} color="from-green-500 via-green-600 to-green-700" subtitle="Active teachers" />
        <StatCard title="Support Staff" value={stats.totalStaff} icon={FaUsers} color="from-purple-500 via-purple-600 to-purple-700" subtitle="Non-teaching staff" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={FaClipboardCheck} color="from-orange-500 via-orange-600 to-orange-700" subtitle="Needs attention" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Classes', value: stats.totalClasses, icon: FaGraduationCap, color: 'bg-indigo-100 text-indigo-600' },
          { label: 'Total Sections', value: stats.totalSections, icon: FaGraduationCap, color: 'bg-teal-100 text-teal-600' },
          { label: 'Approved', value: stats.approvedApprovals, icon: FaCheckCircle, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Rejected', value: stats.rejectedApprovals, icon: FaExclamationTriangle, color: 'bg-red-100 text-red-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${item.color}`}>
                <item.icon className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Approvals Table */}
      {recentApprovals.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Approvals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Requested By</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApprovals.map((approval, i) => (
                  <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{approval.type || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{approval.title || approval.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{approval.requestedBy?.name || approval.createdBy?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'Approved' ? 'bg-green-100 text-green-700' : approval.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(approval.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Manage Staff', color: 'from-blue-500 to-blue-600', path: '/dashbord/manage-staff', icon: FaUsers },
            { title: 'Manage Teachers', color: 'from-green-500 to-green-600', path: '/dashbord/manage-teacher', icon: FaChalkboardTeacher },
            { title: 'Manage Classes', color: 'from-purple-500 to-purple-600', path: '/dashbord/manage-class', icon: FaGraduationCap },
            { title: 'Approvals', color: 'from-orange-500 to-orange-600', path: '/dashbord/approval', icon: FaClipboardCheck },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`group p-4 bg-gradient-to-r ${action.color} text-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-white/20 rounded-xl mb-2">
                  <action.icon className="text-xl" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm">{action.title}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
