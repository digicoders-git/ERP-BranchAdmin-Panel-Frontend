import React, { useState } from 'react';
import { FaDownload, FaEnvelope, FaFilePdf, FaFileExcel, FaCalendarAlt, FaFilter, FaChartLine, FaUsers, FaMoneyBillWave, FaClipboardCheck, FaChalkboardTeacher, FaGraduationCap, FaLayerGroup, FaClock, FaUserTie } from 'react-icons/fa';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced sample data
  const reportData = {
    overview: {
      totalStudents: 1250,
      totalTeachers: 45,
      totalStaff: 28,
      totalClasses: 12,
      totalSections: 36,
      pendingApprovals: 8,
      monthlyFees: 875000,
      attendance: 92.5,
      growth: {
        students: 8.5,
        fees: 12.3,
        attendance: 2.1
      }
    },
    students: [
      { class: 'Class 1', sections: 3, students: 105, boys: 58, girls: 47, capacity: 120, utilization: 87.5 },
      { class: 'Class 2', sections: 3, students: 98, boys: 52, girls: 46, capacity: 120, utilization: 81.7 },
      { class: 'Class 3', sections: 3, students: 112, boys: 61, girls: 51, capacity: 120, utilization: 93.3 },
      { class: 'Class 4', sections: 3, students: 108, boys: 55, girls: 53, capacity: 120, utilization: 90.0 },
      { class: 'Class 5', sections: 3, students: 115, boys: 63, girls: 52, capacity: 120, utilization: 95.8 }
    ],
    fees: [
      { month: 'January', collected: 125000, pending: 15000, total: 140000, students: 280 },
      { month: 'February', collected: 130000, pending: 12000, total: 142000, students: 284 },
      { month: 'March', collected: 128000, pending: 18000, total: 146000, students: 292 },
      { month: 'April', collected: 135000, pending: 10000, total: 145000, students: 290 }
    ],
    attendance: [
      { class: 'Class 1', present: 98, absent: 7, total: 105, percentage: 93.3, trend: 'up' },
      { class: 'Class 2', present: 89, absent: 9, total: 98, percentage: 90.8, trend: 'down' },
      { class: 'Class 3', present: 105, absent: 7, total: 112, percentage: 93.8, trend: 'up' },
      { class: 'Class 4', present: 101, absent: 7, total: 108, percentage: 93.5, trend: 'stable' },
      { class: 'Class 5', present: 108, absent: 7, total: 115, percentage: 93.9, trend: 'up' }
    ]
  };

  const reportTypes = [
    { id: 'overview', name: 'Dashboard Overview', icon: FaChartLine, color: 'from-blue-500 to-blue-600' },
    { id: 'students', name: 'Student Analytics', icon: FaUsers, color: 'from-green-500 to-green-600' },
    { id: 'fees', name: 'Financial Report', icon: FaMoneyBillWave, color: 'from-purple-500 to-purple-600' },
    { id: 'attendance', name: 'Attendance Metrics', icon: FaClipboardCheck, color: 'from-orange-500 to-orange-600' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FaUsers className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-xs font-medium opacity-80">Growth</div>
              <div className="text-sm font-bold text-green-200">+{reportData.overview.growth.students}%</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Students</h3>
            <p className="text-3xl font-bold">{reportData.overview.totalStudents.toLocaleString()}</p>
            <div className="mt-2 text-xs opacity-80">Active enrollments</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FaChalkboardTeacher className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-xs font-medium opacity-80">Faculty</div>
              <div className="text-sm font-bold">{reportData.overview.totalTeachers + reportData.overview.totalStaff}</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Teaching Staff</h3>
            <p className="text-3xl font-bold">{reportData.overview.totalTeachers}</p>
            <div className="mt-2 text-xs opacity-80">Active teachers</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FaMoneyBillWave className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-xs font-medium opacity-80">Growth</div>
              <div className="text-sm font-bold text-green-200">+{reportData.overview.growth.fees}%</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Monthly Revenue</h3>
            <p className="text-2xl font-bold">₹{(reportData.overview.monthlyFees / 100000).toFixed(1)}L</p>
            <div className="mt-2 text-xs opacity-80">Fee collections</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FaClipboardCheck className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-xs font-medium opacity-80">Trend</div>
              <div className="text-sm font-bold text-green-200">+{reportData.overview.growth.attendance}%</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Attendance Rate</h3>
            <p className="text-3xl font-bold">{reportData.overview.attendance}%</p>
            <div className="mt-2 text-xs opacity-80">Daily average</div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FaGraduationCap className="text-indigo-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Classes</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalClasses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 rounded-xl">
              <FaLayerGroup className="text-pink-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Sections</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalSections}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FaClock className="text-yellow-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.pendingApprovals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <FaUserTie className="text-teal-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Support Staff</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalStaff}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentReport = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <FaUsers className="text-white text-xl" />
          <h3 className="text-xl font-bold text-white">Student Distribution Analytics</h3>
        </div>
        <p className="text-green-100 text-sm mt-1">Comprehensive breakdown by class and gender</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Class</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Sections</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Enrolled</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Capacity</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Boys</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Girls</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {reportData.students.map((item, index) => (
              <tr key={index} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="px-6 py-4 font-bold text-gray-900">{item.class}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{item.sections}</td>
                <td className="px-6 py-4 text-gray-900 font-bold">{item.students}</td>
                <td className="px-6 py-4 text-gray-600">{item.capacity}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium">{item.boys}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-pink-600 font-medium">{item.girls}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                      <div 
                        className={`h-2 rounded-full ${
                          item.utilization >= 90 ? 'bg-red-500' :
                          item.utilization >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${item.utilization}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.utilization}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFeeReport = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <FaMoneyBillWave className="text-white text-xl" />
          <h3 className="text-xl font-bold text-white">Financial Performance Report</h3>
        </div>
        <p className="text-purple-100 text-sm mt-1">Monthly fee collection analysis</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Month</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Collected</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Pending</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Total</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Collection Rate</th>
            </tr>
          </thead>
          <tbody>
            {reportData.fees.map((item, index) => (
              <tr key={index} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="px-6 py-4 font-bold text-gray-900">{item.month}</td>
                <td className="px-6 py-4 text-green-600 font-bold">₹{item.collected.toLocaleString()}</td>
                <td className="px-6 py-4 text-red-600 font-bold">₹{item.pending.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">₹{item.total.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (item.collected / item.total * 100) >= 90 ? 'bg-green-100 text-green-800' :
                    (item.collected / item.total * 100) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {((item.collected / item.total) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <FaClipboardCheck className="text-white text-xl" />
          <h3 className="text-xl font-bold text-white">Attendance Analytics</h3>
        </div>
        <p className="text-orange-100 text-sm mt-1">Class-wise attendance performance</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Class</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Present</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Absent</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Total</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Attendance %</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800">Trend</th>
            </tr>
          </thead>
          <tbody>
            {reportData.attendance.map((item, index) => (
              <tr key={index} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="px-6 py-4 font-bold text-gray-900">{item.class}</td>
                <td className="px-6 py-4 text-green-600 font-bold">{item.present}</td>
                <td className="px-6 py-4 text-red-600 font-bold">{item.absent}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{item.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.percentage >= 95 ? 'bg-green-100 text-green-800' :
                    item.percentage >= 90 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.percentage}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    item.trend === 'up' ? 'text-green-600' :
                    item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.trend === 'up' ? '↗️ Rising' : 
                     item.trend === 'down' ? '↘️ Falling' : '➡️ Stable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case 'overview': return renderOverview();
      case 'students': return renderStudentReport();
      case 'fees': return renderFeeReport();
      case 'attendance': return renderAttendanceReport();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              <FaFilter className="text-gray-600" />
              <span className="text-gray-700 font-medium">Filters</span>
            </button>
            
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2">
              <FaCalendarAlt className="text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border-none outline-none bg-transparent text-gray-700 font-medium"
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Report Type Selector */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedReport === type.id
                    ? `bg-gradient-to-r ${type.color} text-white shadow-xl shadow-blue-500/25`
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-100'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl mb-3 transition-all ${
                    selectedReport === type.id 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <IconComponent className={`text-xl ${
                      selectedReport === type.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="font-bold text-sm">{type.name}</h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div className="mb-8">
        {renderContent()}
      </div>

      {/* Enhanced Export Options */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50">
        <div className="flex items-center gap-3 mb-6">
          <FaDownload className="text-gray-600 text-xl" />
          <h3 className="text-xl font-bold text-gray-900">Export & Share</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="group flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <div className="p-2 bg-white/20 rounded-xl">
              <FaFileExcel className="text-xl" />
            </div>
            <div className="text-left">
              <div className="font-bold">Export to Excel</div>
              <div className="text-xs opacity-90">Download spreadsheet</div>
            </div>
          </button>
          
          <button className="group flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <div className="p-2 bg-white/20 rounded-xl">
              <FaFilePdf className="text-xl" />
            </div>
            <div className="text-left">
              <div className="font-bold">Export to PDF</div>
              <div className="text-xs opacity-90">Generate report</div>
            </div>
          </button>
          
          <button className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <div className="p-2 bg-white/20 rounded-xl">
              <FaEnvelope className="text-xl" />
            </div>
            <div className="text-left">
              <div className="font-bold">Email Report</div>
              <div className="text-xs opacity-90">Send via email</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}