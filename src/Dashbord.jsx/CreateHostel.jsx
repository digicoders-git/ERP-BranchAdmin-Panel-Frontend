import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa';
import api from '../api';

export default function CreateHostel() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hostelName: '',
    hostelCode: '',
    type: 'boys',
    totalFloor: '',
    contactNo: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/hostel/all');
      setHostels(data.hostels || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.hostelName.trim()) errs.hostelName = 'Hostel name is required';
    if (!formData.hostelCode.trim()) errs.hostelCode = 'Hostel code is required';
    if (!formData.totalFloor || formData.totalFloor < 1) errs.totalFloor = 'Valid floor count required';
    if (!formData.contactNo.trim()) errs.contactNo = 'Contact number is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    
    setSubmitting(true);
    try {
      if (editingHostel) {
        await api.put(`/api/hostel/update/${editingHostel._id}`, formData);
        await showSuccess('Updated!', 'Hostel information updated successfully');
      } else {
        await api.post('/api/hostel/create', formData);
        await showSuccess('Created!', 'New hostel created successfully');
      }
      fetchHostels();
      setShowForm(false);
      setEditingHostel(null);
      resetForm();
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      hostelName: '',
      hostelCode: '',
      type: 'boys',
      totalFloor: '',
      contactNo: ''
    });
    setErrors({});
  };

  const handleEdit = (hostel) => {
    setEditingHostel(hostel);
    setFormData({
      hostelName: hostel.hostelName,
      hostelCode: hostel.hostelCode,
      type: hostel.type,
      totalFloor: hostel.totalFloor,
      contactNo: hostel.contactNo
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Hostel?', 'This will permanently delete the hostel and all associated data');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/hostel/delete/${id}`);
        showToast('success', 'Hostel deleted successfully');
        fetchHostels();
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (hostel) => {
    try {
      await api.patch(`/api/hostel/toggle-status/${hostel._id}`);
      setHostels(hostels.map(h => h._id === hostel._id ? { ...h, status: !h.status } : h));
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
            <FaBuilding className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Hostels</h1>
            <p className="text-gray-500 text-sm">Create and manage hostel information</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingHostel(null); resetForm(); }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center gap-2 font-semibold"
        >
          <FaPlus /> Add Hostel
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaBuilding /> {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Boys Hostel A"
                  value={formData.hostelName}
                  onChange={(e) => { setFormData({...formData, hostelName: e.target.value}); setErrors({...errors, hostelName: ''}); }}
                  className={inp('hostelName')}
                />
                {errors.hostelName && <p className="text-red-500 text-xs mt-1">{errors.hostelName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel Code *</label>
                <input
                  type="text"
                  placeholder="e.g., BHA"
                  value={formData.hostelCode}
                  onChange={(e) => { setFormData({...formData, hostelCode: e.target.value}); setErrors({...errors, hostelCode: ''}); }}
                  className={inp('hostelCode')}
                />
                {errors.hostelCode && <p className="text-red-500 text-xs mt-1">{errors.hostelCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Floors *</label>
                <input
                  type="number"
                  placeholder="Number of floors"
                  value={formData.totalFloor}
                  onChange={(e) => { setFormData({...formData, totalFloor: e.target.value}); setErrors({...errors, totalFloor: ''}); }}
                  className={inp('totalFloor')}
                  min="1"
                />
                {errors.totalFloor && <p className="text-red-500 text-xs mt-1">{errors.totalFloor}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.contactNo}
                  onChange={(e) => { setFormData({...formData, contactNo: e.target.value}); setErrors({...errors, contactNo: ''}); }}
                  className={inp('contactNo')}
                />
                {errors.contactNo && <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                {submitting ? 'Saving...' : editingHostel ? 'Update Hostel' : 'Add Hostel'}
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

      {/* Hostel List */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Hostels List ({hostels.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : hostels.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaBuilding className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No hostels yet. Add your first hostel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hostel Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Floors</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map((hostel, index) => (
                  <tr key={hostel._id} className={`border-t hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                          <FaBuilding className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{hostel.hostelName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{hostel.hostelCode}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        hostel.type === 'boys' ? 'bg-blue-100 text-blue-800' : 
                        hostel.type === 'girls' ? 'bg-pink-100 text-pink-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {hostel.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{hostel.totalFloor}</td>
                    <td className="px-6 py-4 text-gray-600">{hostel.contactNo}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(hostel)}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          hostel.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {hostel.status ? <FaToggleOn /> : <FaToggleOff />}
                        {hostel.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(hostel)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(hostel._id)}
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
