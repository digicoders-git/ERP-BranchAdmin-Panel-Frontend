import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import api from '../api';

export default function HostelAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    hostelName: '',
    roomNo: '',
    joiningDate: '',
    monthlyRent: '',
    securityDeposit: '',
    remark: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelsRes, roomsRes, roomTypesRes, allocationsRes] = await Promise.all([
        api.get('/api/staff-panel/hostel/hostels'),
        api.get('/api/staff-panel/hostel/rooms'),
        api.get('/api/staff-panel/hostel/room-types'),
        api.get('/api/staff-panel/hostel/allocations')
      ]);
      console.log('Hostels response:', hostelsRes.data);
      console.log('Rooms response:', roomsRes.data);
      console.log('RoomTypes response:', roomTypesRes.data);
      console.log('Allocations response:', allocationsRes.data);
      
      setHostels(hostelsRes.data?.hostels ?? []);
      setRooms(roomsRes.data?.rooms ?? []);
      setRoomTypes(roomTypesRes.data?.roomTypes ?? []);
      setAllocations(allocationsRes.data?.allocations ?? []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      showError('Error', 'Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRooms = () => {
    return rooms.filter(room => {
      const roomHostelName = room.hostel?.hostelName;
      return roomHostelName === formData.hostelName && room.status === 'available';
    });
  };

  useEffect(() => {
    if (formData.roomNo) {
      const selectedRoom = rooms.find(room => {
        const roomHostelName = room.hostel?.hostelName;
        return roomHostelName === formData.hostelName && room.roomNo === formData.roomNo;
      });
      if (selectedRoom) {
        const roomTypeId = selectedRoom.roomType?._id || selectedRoom.roomType;
        const roomType = roomTypes.find(rt => rt._id === roomTypeId || rt.typeName === selectedRoom.roomType?.roomTypeName);
        if (roomType) {
          setFormData(prev => ({
            ...prev,
            monthlyRent: roomType.monthlyRent,
            securityDeposit: roomType.securityDeposit
          }));
        }
      }
    }
  }, [formData.roomNo, formData.hostelName, rooms, roomTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedRoom = rooms.find(room => {
        const roomHostelName = room.hostel?.hostelName;
        return roomHostelName === formData.hostelName && room.roomNo === formData.roomNo;
      });
      
      const selectedHostel = hostels.find(h => h.hostelName === formData.hostelName);
      
      const allocationData = {
        studentId: formData.studentId,
        studentName: formData.studentName,
        hostel: selectedHostel?._id,
        roomNo: formData.roomNo,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : null,
        monthlyRent: formData.monthlyRent,
        securityDeposit: formData.securityDeposit,
        remark: formData.remark
      };
      
      await api.post('/api/staff-panel/hostel/allocations', allocationData);
      
      setShowForm(false);
      resetForm();
      await fetchData();
      await showSuccess('Allocated!', 'Student successfully allocated to hostel room');
    } catch (error) {
      console.error('Error allocating:', error);
      showError('Error', 'Failed to allocate student');
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      hostelName: '',
      roomNo: '',
      joiningDate: '',
      monthlyRent: '',
      securityDeposit: '',
      remark: ''
    });
  };

  const handleCancelAllocation = async (id) => {
    const result = await showConfirm('Cancel Allocation?', 'This will cancel the student hostel allocation');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/staff-panel/hostel/allocations/${id}`);
        await fetchData();
        showToast('success', 'Allocation cancelled successfully');
      } catch (error) {
        console.error('Error cancelling allocation:', error);
        showError('Error', 'Failed to cancel allocation');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hostel Allocation</h2>
          <p className="text-gray-600">Allocate students to hostel beds</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 font-bold transition-all duration-300"
        >
          Allocate Student
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/50 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Allocate Student to Hostel</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Student ID *</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Student Name *</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hostel Name *</label>
              <select
                value={formData.hostelName}
                onChange={(e) => setFormData({...formData, hostelName: e.target.value, roomNo: '', bedNo: ''})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Hostel</option>
                {hostels.map(hostel => (
                  <option key={hostel._id} value={hostel.hostelName || hostel.name}>{hostel.hostelName || hostel.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Room No (Vacant only) *</label>
              <select
                value={formData.roomNo}
                onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
                disabled={!formData.hostelName}
              >
                <option value="">Select Room</option>
                {getAvailableRooms().map(room => (
                  <option key={room._id} value={room.roomNo}>{room.roomNo}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Joining Date *</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent (Auto)</label>
              <input
                type="number"
                value={formData.monthlyRent}
                className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit (Auto)</label>
              <input
                type="number"
                value={formData.securityDeposit}
                className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-100"
                disabled
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Remark</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                rows="2"
              />
            </div>
            
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 font-bold"
              >
                Allocate
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allocation List */}
      <div className="bg-white/50 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Hostel Allocations ({allocations.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Student ID</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Student Name</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Hostel</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Room</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Joining Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Monthly Rent</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">Loading...</td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">No allocations found</td>
                </tr>
              ) : allocations.map((allocation, index) => {
                const hostelName = allocation.hostel?.hostelName || allocation.hostel?.name || allocation.hostel;
                return (
                <tr key={allocation._id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-bold">{allocation.studentId}</td>
                  <td className="px-4 py-3">{allocation.studentName}</td>
                  <td className="px-4 py-3">{hostelName}</td>
                  <td className="px-4 py-3">{allocation.roomNo}</td>
                  <td className="px-4 py-3">
                    {allocation.joiningDate 
                      ? new Date(allocation.joiningDate).toLocaleDateString('en-GB') 
                      : allocation.allocationDate || '-'}
                  </td>
                  <td className="px-4 py-3">₹{allocation.monthlyRent}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCancelAllocation(allocation._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Cancel Allocation
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}