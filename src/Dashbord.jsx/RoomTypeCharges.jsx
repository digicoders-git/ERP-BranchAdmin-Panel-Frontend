import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa';
import api from '../api';

export default function RoomTypeCharges() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomTypeName: '',
    capacity: '',
    monthlyRent: '',
    securityDeposit: '',
    electricityCharges: '',
    effectiveFrom: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/room-type/all');
      setRoomTypes(data.roomTypes || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.roomTypeName.trim()) errs.roomTypeName = 'Room type name is required';
    if (!formData.capacity || formData.capacity < 1) errs.capacity = 'Valid capacity required';
    if (!formData.monthlyRent || formData.monthlyRent < 0) errs.monthlyRent = 'Valid rent required';
    if (!formData.securityDeposit || formData.securityDeposit < 0) errs.securityDeposit = 'Valid deposit required';
    if (!formData.effectiveFrom) errs.effectiveFrom = 'Effective date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    
    setSubmitting(true);
    try {
      if (editingRoomType) {
        await api.put(`/api/room-type/update/${editingRoomType._id}`, formData);
        await showSuccess('Updated!', 'Room type updated successfully');
      } else {
        await api.post('/api/room-type/create', formData);
        await showSuccess('Created!', 'New room type created successfully');
      }
      fetchRoomTypes();
      setShowForm(false);
      setEditingRoomType(null);
      resetForm();
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomTypeName: '',
      capacity: '',
      monthlyRent: '',
      securityDeposit: '',
      electricityCharges: '',
      effectiveFrom: ''
    });
    setErrors({});
  };

  const handleEdit = (roomType) => {
    setEditingRoomType(roomType);
    setFormData({
      roomTypeName: roomType.roomTypeName,
      capacity: roomType.capacity,
      monthlyRent: roomType.monthlyRent,
      securityDeposit: roomType.securityDeposit,
      electricityCharges: roomType.electricityCharges || '',
      effectiveFrom: roomType.effectiveFrom ? new Date(roomType.effectiveFrom).toISOString().split('T')[0] : ''
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Room Type?', 'This will permanently delete the room type');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/room-type/delete/${id}`);
        showToast('success', 'Room type deleted successfully');
        fetchRoomTypes();
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (roomType) => {
    try {
      await api.patch(`/api/room-type/toggle-status/${roomType._id}`);
      setRoomTypes(roomTypes.map(rt => rt._id === roomType._id ? { ...rt, status: !rt.status } : rt));
      showToast('success', 'Status updated');
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Status update failed');
    }
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition bg-white ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaLayerGroup className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Type & Charges</h1>
            <p className="text-gray-500 text-sm">Create room types with pricing before creating rooms</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingRoomType(null); resetForm(); }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center gap-2 font-semibold"
        >
          <FaPlus /> Add Room Type
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaLayerGroup /> {editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room Type Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Single Bed, Double Bed"
                  value={formData.roomTypeName}
                  onChange={(e) => { setFormData({...formData, roomTypeName: e.target.value}); setErrors({...errors, roomTypeName: ''}); }}
                  className={inp('roomTypeName')}
                />
                {errors.roomTypeName && <p className="text-red-500 text-xs mt-1">{errors.roomTypeName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  placeholder="Number of beds"
                  value={formData.capacity}
                  onChange={(e) => { setFormData({...formData, capacity: e.target.value}); setErrors({...errors, capacity: ''}); }}
                  className={inp('capacity')}
                  min="1"
                />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Rent *</label>
                <input
                  type="number"
                  placeholder="Amount in ₹"
                  value={formData.monthlyRent}
                  onChange={(e) => { setFormData({...formData, monthlyRent: e.target.value}); setErrors({...errors, monthlyRent: ''}); }}
                  className={inp('monthlyRent')}
                  min="0"
                />
                {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Security Deposit *</label>
                <input
                  type="number"
                  placeholder="Amount in ₹"
                  value={formData.securityDeposit}
                  onChange={(e) => { setFormData({...formData, securityDeposit: e.target.value}); setErrors({...errors, securityDeposit: ''}); }}
                  className={inp('securityDeposit')}
                  min="0"
                />
                {errors.securityDeposit && <p className="text-red-500 text-xs mt-1">{errors.securityDeposit}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Electricity Charges</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={formData.electricityCharges}
                  onChange={(e) => setFormData({...formData, electricityCharges: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Effective From *</label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => { setFormData({...formData, effectiveFrom: e.target.value}); setErrors({...errors, effectiveFrom: ''}); }}
                  className={inp('effectiveFrom')}
                />
                {errors.effectiveFrom && <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                {submitting ? 'Saving...' : editingRoomType ? 'Update' : 'Save'}
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

      {/* Room Types List */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Room Types List ({roomTypes.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : roomTypes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaLayerGroup className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No room types yet. Add your first room type.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Room Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Monthly Rent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Security Deposit</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Electricity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((roomType, index) => (
                  <tr key={roomType._id} className={`border-t hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                          <FaLayerGroup className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{roomType.roomTypeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{roomType.capacity}</td>
                    <td className="px-6 py-4 text-green-600 font-bold">₹{parseInt(roomType.monthlyRent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">₹{parseInt(roomType.securityDeposit || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">₹{parseInt(roomType.electricityCharges || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(roomType)}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          roomType.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {roomType.status ? <FaToggleOn /> : <FaToggleOff />}
                        {roomType.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(roomType)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(roomType._id)}
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
