import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaMoneyBillWave, 
  FaClipboardCheck, 
  FaGraduationCap,
  FaCalendarAlt,
  FaBell,
  FaEye,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaHandPaper
} from 'react-icons/fa';

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample dashboard data
  const dashboardData = {
    stats: {
      totalStudents: 1250,
      totalTeachers: 45,
      totalStaff: 28,
      monthlyRevenue: 875000,
      todayAttendance: 92.5,
      pendingApprovals: 8,
      activeClasses: 12,
      completedTasks: 156
    },
    growth: {
      students: 8.5,
      revenue: 12.3,
      attendance: 2.1,
      teachers: 5.2
    },
    recentActivities: [
      { id: 1, type: 'enrollment', message: 'New student enrolled in Class 5-A', time: '2 minutes ago', icon: FaUsers, color: 'text-blue-600' },
      { id: 2, type: 'payment', message: 'Fee payment received from John Doe', time: '5 minutes ago', icon: FaMoneyBillWave, color: 'text-green-600' },
      { id: 3, type: 'attendance', message: 'Attendance marked for Class 3-B', time: '10 minutes ago', icon: FaClipboardCheck, color: 'text-purple-600' },
      { id: 4, type: 'approval', message: 'Leave request approved for Sarah Wilson', time: '15 minutes ago', icon: FaCheckCircle, color: 'text-emerald-600' }
    ],
    upcomingEvents: [
      { id: 1, title: 'Parent-Teacher Meeting', date: '2024-01-15', time: '10:00 AM', type: 'meeting' },
      { id: 2, title: 'Annual Sports Day', date: '2024-01-20', time: '9:00 AM', type: 'event' },
      { id: 3, title: 'Fee Collection Deadline', date: '2024-01-25', time: '5:00 PM', type: 'deadline' },
      { id: 4, title: 'Staff Training Session', date: '2024-01-30', time: '2:00 PM', type: 'training' }
    ],
    quickActions: [
      { id: 1, title: 'Add New Student', icon: FaUsers, color: 'from-blue-500 to-blue-600', path: '/manage-students' },
      { id: 2, title: 'Manage Teachers', icon: FaChalkboardTeacher, color: 'from-green-500 to-green-600', path: '/manage-teacher' },
      { id: 3, title: 'Fee Collection', icon: FaMoneyBillWave, color: 'from-purple-500 to-purple-600', path: '/manage-fees' },
      { id: 4, title: 'View Reports', icon: FaClipboardCheck, color: 'from-orange-500 to-orange-600', path: '/reports' }
    ]
  };

  const StatCard = ({ title, value, icon: Icon, growth, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
          <Icon className="text-lg sm:text-2xl" />
        </div>
        {growth && (
          <div className="flex items-center gap-1 text-xs sm:text-sm font-medium">
            {growth > 0 ? (
              <FaArrowUp className="text-green-200" />
            ) : (
              <FaArrowDown className="text-red-200" />
            )}
            <span className={growth > 0 ? 'text-green-200' : 'text-red-200'}>
              {Math.abs(growth)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-1">{title}</h3>
        <p className="text-2xl sm:text-3xl font-bold mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {subtitle && <div className="text-xs opacity-80">{subtitle}</div>}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className={`p-2 rounded-lg bg-gray-50`}>
          <Icon className={`text-base sm:text-lg ${activity.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.message}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
        </div>
      </div>
    );
  };

  const EventCard = ({ event }) => (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="p-2 sm:p-3 bg-blue-50 rounded-xl">
        <FaCalendarAlt className="text-blue-600 text-sm sm:text-base" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{event.title}</h4>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600">
          <span>{event.date}</span>
          <span>{event.time}</span>
        </div>
      </div>
      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
        event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
        event.type === 'event' ? 'bg-green-100 text-green-800' :
        event.type === 'deadline' ? 'bg-red-100 text-red-800' :
        'bg-purple-100 text-purple-800'
      }`}>
        {event.type}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
      {/* Welcome Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
              Welcome back, Admin! <FaHandPaper className="text-yellow-500" />
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Here's what's happening at your school today</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FaClock className="text-blue-500" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-green-500" />
                <span className="hidden sm:inline">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="sm:hidden">{currentTime.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <button className="relative p-2 sm:p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all">
              <FaBell className="text-blue-600 text-sm sm:text-base" />
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Students"
          value={dashboardData.stats.totalStudents}
          icon={FaUsers}
          growth={dashboardData.growth.students}
          color="from-blue-500 via-blue-600 to-blue-700"
          subtitle="Active enrollments"
        />
        <StatCard
          title="Teaching Staff"
          value={dashboardData.stats.totalTeachers}
          icon={FaChalkboardTeacher}
          growth={dashboardData.growth.teachers}
          color="from-green-500 via-green-600 to-green-700"
          subtitle="Active teachers"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(dashboardData.stats.monthlyRevenue / 100000).toFixed(1)}L`}
          icon={FaMoneyBillWave}
          growth={dashboardData.growth.revenue}
          color="from-purple-500 via-purple-600 to-purple-700"
          subtitle="Fee collections"
        />
        <StatCard
          title="Today's Attendance"
          value={`${dashboardData.stats.todayAttendance}%`}
          icon={FaClipboardCheck}
          growth={dashboardData.growth.attendance}
          color="from-orange-500 via-orange-600 to-orange-700"
          subtitle="Present students"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-indigo-100 rounded-xl">
              <FaGraduationCap className="text-indigo-600 text-lg sm:text-xl" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Active Classes</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardData.stats.activeClasses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl">
              <FaExclamationTriangle className="text-yellow-600 text-lg sm:text-xl" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Pending Approvals</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardData.stats.pendingApprovals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl">
              <FaCheckCircle className="text-emerald-600 text-lg sm:text-xl" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Completed Tasks</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardData.stats.completedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-pink-100 rounded-xl">
              <FaUsers className="text-pink-600 text-lg sm:text-xl" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Support Staff</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardData.stats.totalStaff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Quick Actions</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-2">
            View All <FaArrowRight className="text-xs" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {dashboardData.quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className={`group p-4 sm:p-6 bg-gradient-to-r ${action.color} text-white rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl mb-2 sm:mb-3 group-hover:bg-white/30 transition-all">
                    <Icon className="text-lg sm:text-xl" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm">{action.title}</h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-white/50">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activities</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-2">
              <FaEye className="text-xs" /> <span className="hidden sm:inline">View All</span>
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-white/50">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Upcoming Events</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-2">
              <FaCalendarAlt className="text-xs" /> <span className="hidden sm:inline">View Calendar</span>
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {dashboardData.upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;