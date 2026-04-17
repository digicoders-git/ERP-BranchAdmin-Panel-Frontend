import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaEnvelope, FaBuilding, FaUserShield, FaCalendar,
  FaSpinner, FaSave, FaPhone, FaMapMarkerAlt, FaUser, FaEdit,
  FaTimes, FaCodeBranch, FaIdBadge, FaUsers, FaGraduationCap,
  FaStar, FaRupeeSign, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import api from '../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

export default function BranchAdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    principalName: '',
    mobile: '',
    address: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('branchUser') || '{}');
    if (stored) setAdmin(stored);

    api.get('/api/branch-admin/profile')
      .then((res) => {
        if (res.data.success && res.data.data) {
          const { admin: adminData, branch: branchData } = res.data.data;
          setAdmin(adminData);
          setBranch(branchData);
          localStorage.setItem('branchUser', JSON.stringify(adminData));
          setFormData({
            principalName: branchData?.principalName || '',
            mobile: adminData?.mobile || '',
            address: branchData?.address || '',
            phone: branchData?.phone || '',
            location: branchData?.location || ''
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (selectedFile) {
        data.append('profileImage', selectedFile);
      }

      const res = await api.put('/api/branch-admin/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const { admin: updatedAdmin, branch: updatedBranch } = res.data.data;
        setAdmin(updatedAdmin);
        setBranch(updatedBranch);
        localStorage.setItem('branchUser', JSON.stringify(updatedAdmin));
        setEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        window.dispatchEvent(new Event('profileUpdate'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      principalName: branch?.principalName || '',
      mobile: admin?.mobile || '',
      address: branch?.address || '',
      phone: branch?.phone || '',
      location: branch?.location || ''
    });
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  const displayName = branch?.principalName || admin?.name || admin?.email || 'Branch Admin';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Manage your profile and branch information</p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaEdit size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />} Save
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            >
              <FaTimes size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative flex items-center gap-6">
          <div className="relative group">
            <div 
              className="w-24 h-24 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-white/20 flex-shrink-0 cursor-pointer"
              onClick={() => document.getElementById('profileInput').click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : admin?.profileImage ? (
                <img src={admin.profileImage.startsWith('http') ? admin.profileImage : `${BASE_URL}/${admin.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <FaUser className="text-white text-xl" />
              </div>
            </div>
            <input
              id="profileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-blue-100 text-sm mt-1">{admin?.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                <FaUserShield size={12} /> Branch Admin
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${admin?.status !== false ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                {admin?.status !== false ? <><FaCheckCircle size={10} /> Active</> : <><FaTimesCircle size={10} /> Inactive</>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white border border-t-0 rounded-b-2xl shadow-sm">

        {/* Personal Details Section */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FaUser className="text-blue-500" /> Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

            {/* Principal Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Principal Name</label>
              {editing ? (
                <input
                  type="text"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="Enter principal name"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{branch?.principalName || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <p className="text-sm text-gray-900 font-medium">{admin?.email || '—'}</p>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
              {editing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="Enter mobile number"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{admin?.mobile || '—'}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
              <p className="text-sm text-gray-900 font-medium">Branch Admin</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Account Status</label>
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${admin?.status !== false ? 'text-green-600' : 'text-red-600'}`}>
                {admin?.status !== false ? <><FaCheckCircle size={12} /> Active</> : <><FaTimesCircle size={12} /> Inactive</>}
              </span>
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Joined Date</label>
              <p className="text-sm text-gray-900 font-medium">
                {admin?.createdAt
                  ? new Date(admin.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
            </div>

            {/* Allowed Panels */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Allowed Panels</label>
              <div className="flex flex-wrap gap-2">
                {admin?.allowedPanels?.length > 0 ? (
                  admin.allowedPanels.map((panel, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full capitalize">
                      {panel}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Branch Details Section */}
        {branch && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <FaBuilding className="text-purple-500" /> Branch Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

              {/* Branch Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Branch Name</label>
                <p className="text-sm text-gray-900 font-medium">{branch.branchName || '—'}</p>
              </div>

              {/* Branch Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Branch Code</label>
                <p className="text-sm text-gray-900 font-medium font-mono">{branch.branchCode || '—'}</p>
              </div>

              {/* Branch Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Branch Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="Enter branch phone"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{branch.phone || '—'}</p>
                )}
              </div>

              {/* Branch Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Branch Email</label>
                <p className="text-sm text-gray-900 font-medium">{branch.email || '—'}</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Location</label>
                {editing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="Enter location"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{branch.location || '—'}</p>
                )}
              </div>

              {/* Established Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Established Year</label>
                <p className="text-sm text-gray-900 font-medium">{branch.establishedYear || '—'}</p>
              </div>

              {/* Address */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Branch Address</label>
                {editing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                    placeholder="Enter branch address"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{branch.address || '—'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Branch Stats Section */}
        {branch && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <FaIdBadge className="text-green-500" /> Branch Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <FaUsers className="text-blue-500 text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{branch.students || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Students</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <FaGraduationCap className="text-purple-500 text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{branch.teachers || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Teachers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <FaBuilding className="text-green-500 text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{branch.classes || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Classes</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <FaUsers className="text-orange-500 text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{branch.capacity || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Capacity</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <FaStar className="text-yellow-500 text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{branch.rating || 0}</p>
                <p className="text-xs text-gray-500 font-medium">Rating</p>
              </div>
            </div>
          </div>
        )}

        {/* Client Info Section */}
        {branch?.client && (
          <div className="p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <FaCodeBranch className="text-indigo-500" /> School / Client Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">School Name</label>
                <p className="text-sm text-gray-900 font-medium">{branch.client.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">School Phone</label>
                <p className="text-sm text-gray-900 font-medium">{branch.client.phone || '—'}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
