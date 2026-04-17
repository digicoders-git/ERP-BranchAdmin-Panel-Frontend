import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast, showWarning } from '../utils/sweetAlert';
import { FaCog, FaPlus, FaEdit, FaClipboardList } from 'react-icons/fa';
import api from '../api';

export default function TransportAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    route: '',
    shift: 'morning',
    fromDate: '',
    toDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, vehicleRes, driverRes, routeRes] = await Promise.all([
        api.get('/api/transport-assignment/all'),
        api.get('/api/vehicle/all'),
        api.get('/api/driver/all'),
        api.get('/api/route/all')
      ]);
      setAssignments(assignRes.data.assignments || assignRes.data || []);
      setVehicles(vehicleRes.data.vehicles || vehicleRes.data || []);
      setDrivers(driverRes.data.drivers || driverRes.data || []);
      setRoutes(routeRes.data.routes || routeRes.data || []);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    if (vehicles.length === 0 || drivers.length === 0 || routes.length === 0) {
      await showWarning('Prerequisites Missing!', 'Please create vehicles, drivers, and routes first!');
      return;
    }
    setShowForm(true);
    setEditingAssignment(null);
    setFormData({
      vehicle: '',
      driver: '',
      route: '',
      shift: 'morning',
      fromDate: '',
      toDate: '',
      status: 'active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vehicle: formData.vehicle,
        driver: formData.driver,
        route: formData.route,
        shift: formData.shift,
        fromDate: formData.fromDate || null,
        toDate: formData.toDate || null,
        status: formData.status === 'active'
      };

      if (editingAssignment) {
        await api.put(`/api/transport-assignment/update/${editingAssignment._id}`, payload);
        showSuccess('Updated!', 'Transport assignment updated successfully');
      } else {
        await api.post('/api/transport-assignment/create', payload);
        showSuccess('Created!', 'New transport assignment created successfully');
      }
      
      fetchData();
      setShowForm(false);
      setEditingAssignment(null);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      vehicle: assignment.vehicle?._id || assignment.vehicle || '',
      driver: assignment.driver?._id || assignment.driver || '',
      route: assignment.route?._id || assignment.route || '',
      shift: assignment.shift || 'morning',
      fromDate: assignment.fromDate ? assignment.fromDate.split('T')[0] : '',
      toDate: assignment.toDate ? assignment.toDate.split('T')[0] : '',
      status: assignment.status === true || assignment.status === 'active' ? 'active' : 'inactive'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Assignment?', 'This will permanently delete the transport assignment');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/transport-assignment/delete/${id}`);
        fetchData();
        showToast('success', 'Assignment deleted successfully');
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (assignment) => {
    try {
      const currentStatus = assignment.status === true || assignment.status === 'active';
      const newStatus = !currentStatus;
      await api.patch(`/api/transport-assignment/toggle-status/${assignment._id}`, { status: newStatus });
      showToast('success', `Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
      setTimeout(() => fetchData(), 100);
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
              <FaCog className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Transport Assignment</h2>
              <p className="text-gray-600 text-lg mt-1">Assign vehicles, drivers, and routes</p>
            </div>
          </div>
          <button
            onClick={handleAddAssignment}
            className="bg-blue-500 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
          >
            <FaPlus /> Create Assignment
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
            <h3 className="text-2xl font-bold text-gray-800">{editingAssignment ? 'Update Assignment' : 'Create New Assignment'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle (Active only) *</label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.filter(v => v.status === true || v.status === 'active').map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.vehicleNo} - {typeof vehicle.vehicleType === 'object' ? vehicle.vehicleType?.vehicleType || 'N/A' : vehicle.vehicleType || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Driver *</label>
              <select
                value={formData.driver}
                onChange={(e) => setFormData({...formData, driver: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Driver</option>
                {drivers.filter(d => d.status === true || d.status === 'active').map(driver => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} - {driver.licenseNumber}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Route *</label>
              <select
                value={formData.route}
                onChange={(e) => setFormData({...formData, route: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Route</option>
                {routes.filter(r => r.status === true || r.status === 'active').map(route => (
                  <option key={route._id} value={route._id}>
                    {route.routeName} - {route.routeCode}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">From Date *</label>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">To Date (Optional)</label>
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 font-bold"
              >
                {editingAssignment ? 'Update' : 'Save'}
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

      {/* Assignments List */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        <div className="px-8 py-6" style={{backgroundColor: 'rgb(26,37,57)'}}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaClipboardList className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-white">Transport Assignments ({assignments.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Vehicle</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Driver</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Route</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Shift</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">From Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">To Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
              ) : !Array.isArray(assignments) || assignments.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8">No assignments found</td></tr>
              ) : assignments.map((assignment, index) => (
                <tr key={assignment._id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-bold">{assignment.vehicle?.vehicleNo || assignment.vehicle || '-'}</td>
                  <td className="px-4 py-3">{assignment.driver?.name || assignment.driver || '-'}</td>
                  <td className="px-4 py-3">{assignment.route?.routeName || assignment.route || '-'}</td>
                  <td className="px-4 py-3 capitalize">{assignment.shift}</td>
                  <td className="px-4 py-3">{assignment.fromDate ? new Date(assignment.fromDate).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="px-4 py-3">{assignment.toDate ? new Date(assignment.toDate).toLocaleDateString('en-GB') : 'Ongoing'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(assignment)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.status === true || assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {assignment.status === true || assignment.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
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