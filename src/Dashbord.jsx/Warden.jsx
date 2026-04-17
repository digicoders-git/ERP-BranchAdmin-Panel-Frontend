import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaUserTie, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner, FaUser } from 'react-icons/fa';
import api from '../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Warden() {
  const [wardens, setWardens] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWarden, setEditingWarden] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    wardenName: '',
    mobileNumber: '',
    email: '',
    password: '',
    gender: 'male',
    shift: 'day',
    assignedHostel: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wardensRes, hostelsRes] = await Promise.all([
        api.get('/api/warden/all'),
        api.get('/api/hostel/all')
      ]);
      setWardens(wardensRes.data.wardens || []);
      setHostels(hostelsRes.data.hostels || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.wardenName.trim()) errs.wardenName = 'Name is required';
    if (!formData.mobileNumber.trim()) errs.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobileNumber)) errs.mobileNumber = 'Invalid mobile number (10 digits)';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email';
    if (!editingWarden && !formData.password) errs.password = 'Password is required';
    if (!formData.assignedHostel) errs.assignedHostel = 'Select a hostel';
    return errs;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('wardenName', formData.wardenName);
      fd.append('mobileNumber', formData.mobileNumber);
      fd.append('email', formData.email);
      if (formData.password) fd.append('password', formData.password);
      fd.append('gender', formData.gender);
      fd.append('shift', formData.shift);
      fd.append('assignedHostel', formData.assignedHostel);
      if (selectedFile) fd.append('profileImage', selectedFile);

      if (editingWarden) {
        await api.put(`/api/warden/update/${editingWarden._id}`, fd);
        await showSuccess('Updated!', 'Warden information updated successfully');
      } else {
        await api.post('/api/warden/create', fd);
        await showSuccess('Created!', 'New warden created successfully');
      }
      fetchData();
      setShowForm(false);
      setEditingWarden(null);
      resetForm();
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      wardenName: '',
      mobileNumber: '',
      email: '',
      password: '',
      gender: 'male',
      shift: 'day',
      assignedHostel: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrors({});
  };

  const handleEdit = (warden) => {
    setEditingWarden(warden);
    setFormData({
      wardenName: warden.wardenName,
      mobileNumber: warden.mobileNumber || '',
      email: warden.email,
      password: '',
      gender: warden.gender,
      shift: warden.shift,
      assignedHostel: warden.assignedHostel?._id || ''
    });
    setPreviewUrl(warden.profileImage ? `${BASE_URL}/${warden.profileImage}` : null);
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Warden?', 'This will permanently delete the warden');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/warden/delete/${id}`);
        showToast('success', 'Warden deleted successfully');
        fetchData();
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (warden) => {
    try {
      await api.patch(`/api/warden/toggle-status/${warden._id}`);
      setWardens(wardens.map(w => w._id === warden._id ? { 
        ...w, 
        status: (w.status === true || w.status === 'active') ? 'inactive' : 'active' 
      } : w));
      showToast('success', 'Status updated');
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Status update failed');
    }
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 transition bg-white ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaUserTie className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Wardens</h1>
            <p className="text-gray-500 text-sm">Create and assign hostel wardens</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingWarden(null); resetForm(); }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition shadow-lg flex items-center gap-2 font-semibold"
        >
          <FaPlus /> Add Warden
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaUserTie /> {editingWarden ? 'Edit Warden' : 'Add New Warden'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Image Upload */}
            <div className="flex justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-purple-300 rounded-full flex items-center justify-center overflow-hidden bg-purple-50 cursor-pointer"
                  onClick={() => document.getElementById('wardenImage').click()}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-purple-300 text-4xl" />
                  )}
                </div>
                <input
                  id="wardenImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="wardenImage"
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 cursor-pointer inline-block text-sm font-semibold"
                >
                  Upload Photo
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Warden Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.wardenName}
                  onChange={(e) => { setFormData({...formData, wardenName: e.target.value}); setErrors({...errors, wardenName: ''}); }}
                  className={inp('wardenName')}
                />
                {errors.wardenName && <p className="text-red-500 text-xs mt-1">{errors.wardenName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="Enter 10 digit number"
                  value={formData.mobileNumber}
                  onChange={(e) => { setFormData({...formData, mobileNumber: e.target.value}); setErrors({...errors, mobileNumber: ''}); }}
                  className={inp('mobileNumber')}
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''}); }}
                  className={inp('email')}
                  disabled={!!editingWarden}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {!editingWarden && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => { setFormData({...formData, password: e.target.value}); setErrors({...errors, password: ''}); }}
                    className={inp('password')}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Shift *</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({...formData, shift: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Hostel *</label>
                <select
                  value={formData.assignedHostel}
                  onChange={(e) => { setFormData({...formData, assignedHostel: e.target.value}); setErrors({...errors, assignedHostel: ''}); }}
                  className={inp('assignedHostel')}
                >
                  <option value="">Select Hostel</option>
                  {hostels.filter(h => h.status).map(hostel => (
                    <option key={hostel._id} value={hostel._id}>{hostel.hostelName}</option>
                  ))}
                </select>
                {errors.assignedHostel && <p className="text-red-500 text-xs mt-1">{errors.assignedHostel}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                {submitting ? 'Saving...' : editingWarden ? 'Update' : 'Save'}
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

      {/* Warden List */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Wardens List ({wardens.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : wardens.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaUserTie className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No wardens yet. Add your first warden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shift</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hostel</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wardens.map((warden, index) => (
                  <tr key={warden._id} className={`border-t hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex-shrink-0">
                          {warden.profileImage ? (
                            <img src={`${BASE_URL}/${warden.profileImage}`} alt={warden.wardenName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold">
                              {warden.wardenName?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{warden.wardenName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{warden.mobileNumber || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{warden.email}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{warden.gender}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {warden.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{warden.assignedHostel?.hostelName || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(warden)}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          warden.status === true || warden.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {warden.status === true || warden.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                        {warden.status === true || warden.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(warden)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(warden._id)}
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
