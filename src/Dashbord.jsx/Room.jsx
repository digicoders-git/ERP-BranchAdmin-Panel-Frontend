import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaDoorOpen, FaPlus, FaEdit, FaTrash, FaSpinner, FaBuilding, FaLayerGroup } from 'react-icons/fa';
import api from '../api';

export default function Room() {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hostelId: '',
    floorNo: '',
    roomNo: '',
    roomTypeId: '',
    capacity: '',
    monthlyRent: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, hostelsRes, roomTypesRes] = await Promise.all([
        api.get('/api/room/all'),
        api.get('/api/hostel/all'),
        api.get('/api/room-type/all')
      ]);
      setRooms(roomsRes.data.rooms || []);
      setHostels(hostelsRes.data.hostels || []);
      setRoomTypes(roomTypesRes.data.roomTypes || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.roomTypeId) {
      const selectedRoomType = roomTypes.find(rt => rt._id === formData.roomTypeId);
      if (selectedRoomType) {
        setFormData(prev => ({
          ...prev,
          capacity: selectedRoomType.capacity,
          monthlyRent: selectedRoomType.monthlyRent
        }));
      }
    }
  }, [formData.roomTypeId, roomTypes]);

  const validate = () => {
    const errs = {};
    if (!formData.hostelId) errs.hostelId = 'Select a hostel';
    if (formData.floorNo === '') errs.floorNo = 'Floor number is required';
    if (!formData.roomNo.trim()) errs.roomNo = 'Room number is required';
    if (!formData.roomTypeId) errs.roomTypeId = 'Select a room type';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    
    setSubmitting(true);
    try {
      if (editingRoom) {
        await api.put(`/api/room/update/${editingRoom._id}`, formData);
        await showSuccess('Updated!', 'Room information updated successfully');
      } else {
        await api.post('/api/room/create', formData);
        await showSuccess('Created!', 'New room created successfully');
      }
      fetchData();
      setShowForm(false);
      setEditingRoom(null);
      resetForm();
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      hostelId: '',
      floorNo: '',
      roomNo: '',
      roomTypeId: '',
      capacity: '',
      monthlyRent: ''
    });
    setErrors({});
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      hostelId: room.hostel?._id || '',
      floorNo: room.floorNo,
      roomNo: room.roomNo,
      roomTypeId: room.roomType?._id || '',
      capacity: room.capacity,
      monthlyRent: room.monthlyRent
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Room?', 'This will permanently delete the room');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/room/delete/${id}`);
        showToast('success', 'Room deleted successfully');
        fetchData();
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const updateStatus = async (room, newStatus) => {
    try {
      await api.patch(`/api/room/update-status/${room._id}`, { status: newStatus });
      setRooms(rooms.map(r => r._id === room._id ? { ...r, status: newStatus } : r));
      showToast('success', 'Status updated');
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Status update failed');
    }
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaDoorOpen className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
            <p className="text-gray-500 text-sm">{roomTypes.length} room types available</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingRoom(null); resetForm(); }}
          disabled={roomTypes.length === 0}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          <FaPlus /> Add Room
        </button>
      </div>

      {/* Alert */}
      {roomTypes.length === 0 && !loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl text-yellow-800 text-sm">
          ⚠️ Please create room types first in <strong>Room Type & Charges</strong> section.
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaDoorOpen /> {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel *</label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => { setFormData({...formData, hostelId: e.target.value}); setErrors({...errors, hostelId: ''}); }}
                  className={inp('hostelId')}
                >
                  <option value="">Select Hostel</option>
                  {hostels.filter(h => h.status).map(hostel => (
                    <option key={hostel._id} value={hostel._id}>{hostel.hostelName}</option>
                  ))}
                </select>
                {errors.hostelId && <p className="text-red-500 text-xs mt-1">{errors.hostelId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Floor No *</label>
                <input
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.floorNo}
                  onChange={(e) => { setFormData({...formData, floorNo: e.target.value}); setErrors({...errors, floorNo: ''}); }}
                  className={inp('floorNo')}
                  min="0"
                />
                {errors.floorNo && <p className="text-red-500 text-xs mt-1">{errors.floorNo}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 101"
                  value={formData.roomNo}
                  onChange={(e) => { setFormData({...formData, roomNo: e.target.value}); setErrors({...errors, roomNo: ''}); }}
                  className={inp('roomNo')}
                />
                {errors.roomNo && <p className="text-red-500 text-xs mt-1">{errors.roomNo}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room Type *</label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => { setFormData({...formData, roomTypeId: e.target.value}); setErrors({...errors, roomTypeId: ''}); }}
                  className={inp('roomTypeId')}
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.filter(rt => rt.status).map(roomType => (
                    <option key={roomType._id} value={roomType._id}>
                      {roomType.roomTypeName} (₹{roomType.monthlyRent})
                    </option>
                  ))}
                </select>
                {errors.roomTypeId && <p className="text-red-500 text-xs mt-1">{errors.roomTypeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity (Auto)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Rent (Auto)</label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-100"
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room List */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Rooms List ({rooms.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaDoorOpen className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No rooms yet. Add your first room.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hostel</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Floor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Room No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => (
                  <tr key={room._id} className={`border-t hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-blue-500" />
                        <span className="font-semibold text-gray-900">{room.hostel?.hostelName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{room.floorNo}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{room.roomNo}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{room.roomType?.roomTypeName}</td>
                    <td className="px-6 py-4 text-gray-600">{room.capacity}</td>
                    <td className="px-6 py-4 text-green-600 font-bold">₹{parseInt(room.monthlyRent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={room.status}
                        onChange={(e) => updateStatus(room, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
                          room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
