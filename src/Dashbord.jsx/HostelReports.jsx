import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBuilding, FaBed, FaUsers, FaUserTie, FaUser } from 'react-icons/fa';
import api from '../api';
import { showError } from '../utils/sweetAlert';

export default function HostelReports() {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [selectedReport, setSelectedReport] = useState('summary');
  const [selectedHostel, setSelectedHostel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelsRes, roomsRes, roomTypesRes, allocationsRes, wardensRes] = await Promise.all([
        api.get('/api/staff-panel/hostel/hostels'),
        api.get('/api/staff-panel/hostel/rooms'),
        api.get('/api/staff-panel/hostel/room-types'),
        api.get('/api/staff-panel/hostel/allocations'),
        api.get('/api/staff-panel/hostel/wardens')
      ]);
      
      setHostels(hostelsRes.data?.hostels ?? []);
      setRooms(roomsRes.data?.rooms ?? []);
      setRoomTypes(roomTypesRes.data?.roomTypes ?? []);
      setAllocations(allocationsRes.data?.allocations ?? []);
      setWardens(wardensRes.data?.wardens ?? wardensRes.data?.data ?? []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error', 'Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  // Summary Report
  const getSummaryReport = () => {
    const totalHostels = hostels.length;
    const totalRooms = rooms.length;
    const totalAllocations = allocations.length;
    const totalWardens = wardens.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + parseInt(room.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? ((totalAllocations / totalCapacity) * 100).toFixed(1) : 0;
    
    return {
      totalHostels,
      totalRooms,
      totalAllocations,
      totalWardens,
      totalCapacity,
      availableCapacity: totalCapacity - totalAllocations,
      occupancyRate
    };
  };

  // Hostel Wise Report
  const getHostelWiseReport = () => {
    return hostels.map(hostel => {
      const hostelRooms = rooms.filter(room => room.hostel?.hostelName === hostel.hostelName);
      const hostelAllocations = allocations.filter(allocation => allocation.hostel?.hostelName === hostel.hostelName);
      const hostelWardens = wardens.filter(warden => warden.assignedHostels?.includes(hostel.hostelName));
      const totalCapacity = hostelRooms.reduce((sum, room) => sum + parseInt(room.capacity || 0), 0);
      const monthlyCollection = hostelAllocations.reduce((sum, allocation) => sum + parseFloat(allocation.monthlyRent || 0), 0);
      
      return {
        hostelName: hostel.hostelName,
        hostelType: hostel.type,
        totalRooms: hostelRooms.length,
        totalCapacity,
        occupied: hostelAllocations.length,
        available: totalCapacity - hostelAllocations.length,
        occupancyRate: totalCapacity > 0 ? ((hostelAllocations.length / totalCapacity) * 100).toFixed(1) : 0,
        wardenCount: hostelWardens.length,
        monthlyCollection
      };
    });
  };

  // Room Type Report
  const getRoomTypeReport = () => {
    return roomTypes.map(roomType => {
      const typeRooms = rooms.filter(room => room.roomType?.roomTypeName === roomType.roomTypeName);
      const typeAllocations = allocations.filter(allocation => {
        const room = rooms.find(r => r.hostel?.hostelName === allocation.hostel?.hostelName && r.roomNo === allocation.roomNo);
        return room && room.roomType?.roomTypeName === roomType.roomTypeName;
      });
      
      return {
        roomTypeName: roomType.roomTypeName,
        capacity: roomType.capacity,
        monthlyRent: roomType.monthlyRent,
        totalRooms: typeRooms.length,
        totalCapacity: typeRooms.length * parseInt(roomType.capacity || 0),
        occupied: typeAllocations.length,
        available: (typeRooms.length * parseInt(roomType.capacity || 0)) - typeAllocations.length,
        revenue: typeAllocations.length * parseFloat(roomType.monthlyRent || 0)
      };
    });
  };

  // Student List Report
  const getStudentListReport = () => {
    return allocations.map(allocation => {
      const room = rooms.find(r => r.hostel?.hostelName === allocation.hostel?.hostelName && r.roomNo === allocation.roomNo);
      return {
        ...allocation,
        roomType: room?.roomType?.roomTypeName || room?.roomType || 'N/A'
      };
    });
  };

  // Warden Assignment Report
  const getWardenReport = () => {
    return wardens.map(warden => {
      const wardenHostel = warden.assignedHostel?.hostelName || warden.assignedHostel;
      const assignedStudents = allocations.filter(allocation => 
        allocation.hostel?.hostelName === wardenHostel
      ).length;
      
      return {
        ...warden,
        wardenName: warden.wardenName,
        mobileNumber: warden.mobileNumber,
        gender: warden.gender,
        shift: warden.shift,
        status: warden.status,
        assignedHostel: wardenHostel,
        hostelCount: warden.assignedHostel ? 1 : 0,
        assignedStudents
      };
    });
  };

  const renderReport = () => {
    switch (selectedReport) {
      case 'summary':
        const summary = getSummaryReport();
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Total Hostels</h3>
              <p className="text-3xl font-bold">{summary.totalHostels}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Total Rooms</h3>
              <p className="text-3xl font-bold">{summary.totalRooms}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Total Capacity</h3>
              <p className="text-3xl font-bold">{summary.totalCapacity}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Occupancy Rate</h3>
              <p className="text-3xl font-bold">{summary.occupancyRate}%</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Occupied</h3>
              <p className="text-3xl font-bold">{summary.totalAllocations}</p>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Available</h3>
              <p className="text-3xl font-bold">{summary.availableCapacity}</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Total Wardens</h3>
              <p className="text-3xl font-bold">{summary.totalWardens}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">Room Types</h3>
              <p className="text-3xl font-bold">{roomTypes.length}</p>
            </div>
          </div>
        );

      case 'hostelwise':
        const hostelData = getHostelWiseReport();
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Hostel Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Type</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Total Rooms</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Capacity</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Occupied</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Available</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Occupancy %</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Wardens</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Monthly Collection</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="text-center py-8">Loading...</td></tr>
                ) : hostelData.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-8">No hostels found</td></tr>
                ) : hostelData.map((hostel, index) => (
                  <tr key={hostel._id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-4 py-3 font-bold">{hostel.hostelName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hostel.hostelType === 'boys' ? 'bg-blue-100 text-blue-800' :
                        hostel.hostelType === 'girls' ? 'bg-pink-100 text-pink-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {hostel.hostelType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{hostel.totalRooms}</td>
                    <td className="px-4 py-3">{hostel.totalCapacity}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{hostel.occupied}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">{hostel.available}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hostel.occupancyRate > 80 ? 'bg-red-100 text-red-800' :
                        hostel.occupancyRate > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {hostel.occupancyRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{hostel.wardenCount}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">₹{hostel.monthlyCollection.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'roomtype':
        const roomTypeData = getRoomTypeReport();
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Room Type</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Capacity per Room</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Monthly Rent</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Total Rooms</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Total Capacity</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Occupied</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Monthly Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8">Loading...</td></tr>
                ) : roomTypeData.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8">No room types found</td></tr>
                ) : roomTypeData.map((roomType, index) => (
                  <tr key={roomType._id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-4 py-3 font-bold">{roomType.roomTypeName}</td>
                    <td className="px-4 py-3">{roomType.capacity}</td>
                    <td className="px-4 py-3">₹{parseInt(roomType.monthlyRent || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{roomType.totalRooms}</td>
                    <td className="px-4 py-3">{roomType.totalCapacity}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{roomType.occupied}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">₹{roomType.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'students':
        const studentData = getStudentListReport();
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Student ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Student Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Hostel</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Room No</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Room Type</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Joining Date</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Monthly Rent</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Security Deposit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
                ) : studentData.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8">No students found</td></tr>
                ) : studentData.map((student, index) => (
                  <tr key={student._id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-4 py-3 font-bold">{student.studentId}</td>
                    <td className="px-4 py-3">{student.studentName}</td>
                    <td className="px-4 py-3">{student.hostel?.hostelName}</td>
                    <td className="px-4 py-3">{student.roomNo}</td>
                    <td className="px-4 py-3">{student.roomType}</td>
                    <td className="px-4 py-3">
                      {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-bold">₹{parseInt(student.monthlyRent || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">₹{parseInt(student.securityDeposit || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'wardens':
        const wardenData = getWardenReport();
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Warden Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Gender</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Assigned Hostel</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Hostel Count</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Students Under Care</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Shift</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
                ) : wardenData.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8">No wardens found</td></tr>
                ) : wardenData.map((warden, index) => (
                  <tr key={warden._id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {warden.profileImage ? (
                            <img src={warden.profileImage} alt={warden.wardenName} className="w-full h-full object-cover" />
                          ) : (
                            <FaUser className="text-gray-400 text-xs" />
                          )}
                        </div>
                        <span className="font-bold">{warden.wardenName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{warden.email}</td>
                    <td className="px-4 py-3">{warden.gender}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {warden.assignedHostel || 'Not Assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{warden.hostelCount}</td>
                    <td className="px-4 py-3 text-blue-600 font-bold">{warden.assignedStudents}</td>
                    <td className="px-4 py-3">{warden.shift}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        warden.status === true || warden.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {warden.status === true || warden.status === 'active' ? 'active' : 'inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hostel Reports</h2>
        <p className="text-gray-600">Comprehensive hostel management reports and analytics</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white/50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Report Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setSelectedReport('summary')}
            className={`p-4 rounded-xl font-bold transition-all ${
              selectedReport === 'summary'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaChartBar className="inline mr-2" /> Summary Report
          </button>
          <button
            onClick={() => setSelectedReport('hostelwise')}
            className={`p-4 rounded-xl font-bold transition-all ${
              selectedReport === 'hostelwise'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaBuilding className="inline mr-2" /> Hostel Wise Report
          </button>
          <button
            onClick={() => setSelectedReport('roomtype')}
            className={`p-4 rounded-xl font-bold transition-all ${
              selectedReport === 'roomtype'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaBed className="inline mr-2" /> Room Type Report
          </button>
          <button
            onClick={() => setSelectedReport('students')}
            className={`p-4 rounded-xl font-bold transition-all ${
              selectedReport === 'students'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaUsers className="inline mr-2" /> Student List
          </button>
          <button
            onClick={() => setSelectedReport('wardens')}
            className={`p-4 rounded-xl font-bold transition-all ${
              selectedReport === 'wardens'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaUserTie className="inline mr-2" /> Warden Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white/50 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {selectedReport === 'summary' && <><FaChartBar className="inline mr-2" /> Summary Report - Overall Statistics</>}
            {selectedReport === 'hostelwise' && <><FaBuilding className="inline mr-2" /> Hostel Wise Report - Detailed Analysis</>}
            {selectedReport === 'roomtype' && <><FaBed className="inline mr-2" /> Room Type Report - Type wise Analysis</>}
            {selectedReport === 'students' && <><FaUsers className="inline mr-2" /> Student List - All Allocated Students</>}
            {selectedReport === 'wardens' && <><FaUserTie className="inline mr-2" /> Warden Report - Staff Management</>}
          </h3>
        </div>
        <div className="p-6">
          {renderReport()}
        </div>
      </div>
    </div>
  );
}