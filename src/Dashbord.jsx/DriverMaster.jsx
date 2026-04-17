import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaUserTie, FaPlus, FaEdit, FaClipboardList } from 'react-icons/fa';
import api from '../api';

export default function DriverMaster() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    driverName: '',
    email: '',
    mobileNumber: '',
    password: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    experience: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/driver/all');
      setDrivers(data.drivers || data || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password for new drivers
    if (!editingDriver && !formData.password) {
      showError('Error', 'Password is required for new drivers');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.driverName,
        email: formData.email,
        mobileNo: formData.mobileNumber,
        password: formData.password || undefined,
        licenseNo: formData.licenseNumber,
        licenseExpiryDate: formData.licenseExpiryDate || null,
        experience: formData.experience,
        address: formData.address,
        status: formData.status === 'active'
      };

      if (editingDriver) {
        await api.put(`/api/driver/update/${editingDriver._id}`, payload);
        showSuccess('Updated!', 'Driver information updated successfully');
      } else {
        const response = await api.post('/api/driver/create', payload);
        showSuccess('Created!', `Driver created successfully!\n\nCredentials:\nEmail: ${formData.email}\nPassword: ${formData.password}`);
      }
      
      fetchDrivers();
      setShowForm(false);
      setEditingDriver(null);
      resetForm();
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      driverName: '',
      email: '',
      mobileNumber: '',
      password: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      experience: '',
      address: '',
      status: 'active'
    });
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      driverName: driver.name || '',
      email: driver.email || '',
      mobileNumber: driver.mobileNo || '',
      password: '',
      licenseNumber: driver.licenseNo || '',
      licenseExpiryDate: driver.licenseExpiryDate ? driver.licenseExpiryDate.split('T')[0] : '',
      experience: driver.experience || '',
      address: driver.address || '',
      status: driver.status === true ? 'active' : 'inactive'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Driver?', 'This will permanently delete the driver record');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/driver/delete/${id}`);
        fetchDrivers();
        showToast('success', 'Driver deleted successfully');
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (driver) => {
    try {
      const currentStatus = driver.status === true || driver.status === 'active';
      const newStatus = !currentStatus;
      await api.patch(`/api/driver/toggle-status/${driver._id}`, { status: newStatus });
      showToast('success', `Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
      setTimeout(() => fetchDrivers(), 100);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/60">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <FaUserTie className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Driver Master</h2>
              <p className="text-gray-600 text-lg mt-1">Manage transport drivers efficiently</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingDriver(null);
              resetForm();
            }}
            className="bg-blue-500 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
          >
            <FaPlus /> Add Driver
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <FaEdit className="text-xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{editingDriver ? 'Update Driver' : 'Add New Driver'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Driver Name *</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="driver@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number *</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password {editingDriver ? '(Leave empty to keep current)' : '*'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Min 6 characters"
                minLength="6"
                required={!editingDriver}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">License Number *</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">License Expiry Date *</label>
              <input
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Experience (Years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>
            
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 font-bold disabled:opacity-50"
              >
                {editingDriver ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Driver List */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        <div className="px-8 py-6" style={{backgroundColor: 'rgb(26,37,57)'}}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaClipboardList className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-white">Driver List ({drivers.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Driver Name</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Email</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Mobile</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">License Number</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">License Expiry</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Experience</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8">No drivers found</td></tr>
              ) : drivers.map((driver, index) => (
                <tr key={driver._id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-bold">{driver.name}</td>
                  <td className="px-4 py-3">{driver.email}</td>
                  <td className="px-4 py-3">{driver.mobileNo}</td>
                  <td className="px-4 py-3">{driver.licenseNo}</td>
                  <td className="px-4 py-3">{driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="px-4 py-3">{driver.experience || 0} years</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(driver)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        driver.status === true || driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {driver.status === true || driver.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driver._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
