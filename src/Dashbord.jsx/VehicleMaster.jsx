import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaBus, FaPlus, FaEdit, FaClipboardList } from 'react-icons/fa';
import api from '../api';

export default function VehicleMaster() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Bus',
    seatingCapacity: '',
    fuelType: 'Diesel',
    rcNumber: '',
    insuranceExpiryDate: '',
    fitnessExpiryDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/vehicle/all');
      setVehicles(data.vehicles || data || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vehicleNo: formData.vehicleNumber,
        vehicleType: formData.vehicleType.toLowerCase(),
        vehicleCapacity: formData.seatingCapacity,
        fuelType: formData.fuelType.toLowerCase(),
        rcNo: formData.rcNumber,
        insuranceExpiryDate: formData.insuranceExpiryDate || null,
        fitnessExpiryDate: formData.fitnessExpiryDate || null,
        status: formData.status === 'active'
      };

      if (editingVehicle) {
        await api.put(`/api/vehicle/update/${editingVehicle._id}`, payload);
        showSuccess('Updated!', 'Vehicle information updated successfully');
      } else {
        await api.post('/api/vehicle/create', payload);
        showSuccess('Created!', 'New vehicle added successfully');
      }
      
      fetchVehicles();
      setShowForm(false);
      setEditingVehicle(null);
      resetForm();
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      vehicleType: 'bus',
      seatingCapacity: '',
      fuelType: 'diesel',
      rcNumber: '',
      insuranceExpiryDate: '',
      fitnessExpiryDate: '',
      status: 'active'
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNo || '',
      vehicleType: vehicle.vehicleType || 'bus',
      seatingCapacity: vehicle.vehicleCapacity || '',
      fuelType: vehicle.fuelType || 'diesel',
      rcNumber: vehicle.rcNo || '',
      insuranceExpiryDate: vehicle.insuranceExpiryDate ? vehicle.insuranceExpiryDate.split('T')[0] : '',
      fitnessExpiryDate: vehicle.fitnessExpiryDate ? vehicle.fitnessExpiryDate.split('T')[0] : '',
      status: vehicle.status === true ? 'active' : 'inactive'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Vehicle?', 'This will permanently delete the vehicle record');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/vehicle/delete/${id}`);
        fetchVehicles();
        showToast('success', 'Vehicle deleted successfully');
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (vehicle) => {
    try {
      const currentStatus = vehicle.status === true || vehicle.status === 'active';
      const newStatus = !currentStatus;
      await api.patch(`/api/vehicle/toggle-status/${vehicle._id}`, { status: newStatus });
      showToast('success', `Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
      setTimeout(() => fetchVehicles(), 100);
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
              <FaBus className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vehicle Master</h2>
              <p className="text-gray-600 text-lg mt-1">Manage transport vehicles efficiently</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
          >
            <FaPlus /> Add Vehicle
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
            <h3 className="text-2xl font-bold text-gray-800">{editingVehicle ? 'Update Vehicle' : 'Add New Vehicle'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Number *</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., MH12AB1234"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Type *</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="bus">Bus</option>
                <option value="van">Van</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Seating Capacity *</label>
              <input
                type="number"
                value={formData.seatingCapacity}
                onChange={(e) => setFormData({...formData, seatingCapacity: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">RC Number *</label>
              <input
                type="text"
                value={formData.rcNumber}
                onChange={(e) => setFormData({...formData, rcNumber: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Insurance Expiry Date *</label>
              <input
                type="date"
                value={formData.insuranceExpiryDate}
                onChange={(e) => setFormData({...formData, insuranceExpiryDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fitness Expiry Date *</label>
              <input
                type="date"
                value={formData.fitnessExpiryDate}
                onChange={(e) => setFormData({...formData, fitnessExpiryDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 font-bold"
              >
                {editingVehicle ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 font-bold"
              >
                Reset
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

      {/* Vehicle List */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        <div className="px-8 py-6" style={{backgroundColor: 'rgb(26,37,57)'}}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaClipboardList className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-white">Vehicle List ({vehicles.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Vehicle Number</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Capacity</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Fuel Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">RC Number</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8">Loading...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8">No vehicles found</td></tr>
              ) : vehicles.map((vehicle, index) => (
                <tr key={vehicle._id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-bold">{vehicle.vehicleNo}</td>
                  <td className="px-4 py-3 capitalize">{vehicle.vehicleType}</td>
                  <td className="px-4 py-3">{vehicle.vehicleCapacity}</td>
                  <td className="px-4 py-3 capitalize">{vehicle.fuelType}</td>
                  <td className="px-4 py-3">{vehicle.rcNo || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(vehicle)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === true || vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vehicle.status === true || vehicle.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
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
