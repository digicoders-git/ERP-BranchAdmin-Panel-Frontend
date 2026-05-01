import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast, showWarning } from '../utils/sweetAlert';
import { FaUsers, FaPlus, FaEdit, FaClipboardList, FaSpinner } from 'react-icons/fa';
import api from '../api';

export default function TransportAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [routeCharges, setRouteCharges] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentStaffName: '',
    userType: 'Student',
    route: '',
    stop: '',
    vehicle: '',
    monthlyCharge: '',
    pickupDrop: 'both',
    joiningDate: '',
    status: 'active'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, routeRes, stopRes, chargeRes, assignRes] = await Promise.all([
        api.get('/api/transport-allocation/all'),
        api.get('/api/route/all'),
        api.get('/api/route-stop/all'),
        api.get('/api/route-charge/all'),
        api.get('/api/transport-assignment/all')
      ]);
      
      console.log('Allocations response:', allocRes.data);
      console.log('Routes response:', routeRes.data);
      console.log('Stops response:', stopRes.data);
      console.log('Charges response:', chargeRes.data);
      console.log('Assignments response:', assignRes.data);
      
      // Handle different response structures
      const allocationsData = allocRes.data?.allocations || allocRes.data?.data || (Array.isArray(allocRes.data) ? allocRes.data : []);
      const routesData = routeRes.data?.routes || routeRes.data?.data || (Array.isArray(routeRes.data) ? routeRes.data : []);
      const stopsData = stopRes.data?.routeStops || stopRes.data?.stops || stopRes.data?.data || (Array.isArray(stopRes.data) ? stopRes.data : []);
      const chargesData = chargeRes.data?.routeCharges || chargeRes.data?.charges || chargeRes.data?.data || (Array.isArray(chargeRes.data) ? chargeRes.data : []);
      const assignmentsData = assignRes.data?.transportAssignments || assignRes.data?.assignments || assignRes.data?.data || (Array.isArray(assignRes.data) ? assignRes.data : []);
      
      console.log('Processed allocations:', allocationsData);
      console.log('Allocations count:', allocationsData.length);
      
      setAllocations(allocationsData);
      setRoutes(routesData);
      setRouteStops(stopsData);
      setRouteCharges(chargesData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Fetch data error:', err);
      console.error('Error response:', err.response);
      showError('Error', err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStopsForRoute = () => {
    return routeStops.filter(stop => stop.route?._id === formData.route || stop.route === formData.route);
  };

  const getVehicleForRoute = () => {
    const assignment = assignments.find(a => (a.route?._id || a.route) === formData.route && (a.status === true || a.status === 'active'));
    return assignment ? assignment.vehicle?._id || assignment.vehicle : '';
  };

  const getChargeForRouteStop = () => {
    const routeId = formData.route;
    const stopId = formData.stop;
    
    if (!routeId || routeCharges.length === 0) {
      return '';
    }
    
    const exactMatch = routeCharges.find(c => {
      const routeMatch = c.route && (c.route._id === routeId || c.route === routeId);
      const stopMatch = c.routeStop && (c.routeStop._id === stopId || c.routeStop === stopId);
      const statusMatch = c.status === true || c.status === 'active';
      return routeMatch && stopMatch && statusMatch;
    });
    
    if (exactMatch && (exactMatch.monthlyCharges || exactMatch.monthlyCharge)) {
      return exactMatch.monthlyCharges || exactMatch.monthlyCharge;
    }
    
    const anyStopMatch = routeCharges.find(c => {
      const routeMatch = c.route && (c.route._id === routeId || c.route === routeId);
      const noStop = !c.routeStop;
      const statusMatch = c.status === true || c.status === 'active';
      return routeMatch && noStop && statusMatch;
    });
    
    if (anyStopMatch && (anyStopMatch.monthlyCharges || anyStopMatch.monthlyCharge)) {
      return anyStopMatch.monthlyCharges || anyStopMatch.monthlyCharge;
    }
    
    return '';
  };

  useEffect(() => {
    if (formData.route) {
      const vehicle = getVehicleForRoute();
      const charge = getChargeForRouteStop();
      setFormData(prev => ({ ...prev, vehicle, monthlyCharge: charge }));
    }
  }, [formData.route, assignments, routeCharges]);

  useEffect(() => {
    if (formData.stop) {
      const charge = getChargeForRouteStop();
      setFormData(prev => ({ ...prev, monthlyCharge: charge }));
    }
  }, [formData.stop, routeCharges]);

  // Handle Search for Students/Staff
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.studentStaffName && !verifiedUser && formData.studentStaffName.length > 1) {
        searchUsers();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.studentStaffName, formData.userType]);

  const searchUsers = async () => {
    try {
      setSearching(true);
      let endpoint = '';
      if (formData.userType === 'Student') {
        endpoint = `/api/staff-panel/student/enrollment-list?search=${formData.studentStaffName}&limit=10`;
      } else {
        // Search across all staff roles
        endpoint = `/api/staff-panel/staff-optimized/all?role=staff&search=${formData.studentStaffName}&limit=10`;
      }
      
      const res = await api.get(endpoint);
      const data = res.data.students || res.data.data || [];
      setSearchResults(data);
      setShowDropdown(data.length > 0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    const name = user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || user.wardenName || user.librarianName);
    setFormData({
      ...formData,
      studentStaffName: name,
      studentId: formData.userType === 'Student' ? user._id : undefined,
      staffId: formData.userType !== 'Student' ? user._id : undefined
    });
    setVerifiedUser(user);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleAddAllocation = async () => {
    if (routes.length === 0) {
      await showWarning('Routes Required!', 'Please create routes and assignments first!');
      return;
    }
    setShowForm(true);
    setEditingAllocation(null);
    setFormData({
      studentStaffName: '',
      userType: 'Student',
      route: '',
      stop: '',
      vehicle: '',
      monthlyCharge: '',
      pickupDrop: 'both',
      joiningDate: '',
      status: 'active',
      studentId: '',
      staffId: ''
    });
    setVerifiedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.route || !formData.stop || !formData.vehicle) {
      showError('Error', 'Please select route, stop and vehicle');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        userName: formData.studentStaffName,
        userType: formData.userType.toLowerCase(),
        routeId: formData.route,
        routeStopId: formData.stop,
        vehicleId: formData.vehicle,
        monthlyCharges: parseInt(formData.monthlyCharge) || 0,
        service: formData.pickupDrop,
        joiningDate: formData.joiningDate || null,
        status: formData.status === 'active',
        studentId: formData.studentId,
        staffId: formData.staffId
      };

      if (editingAllocation) {
        await api.put(`/api/transport-allocation/update/${editingAllocation._id}`, payload);
        showSuccess('Updated!', 'Transport allocation updated successfully');
      } else {
        await api.post('/api/transport-allocation/create', payload);
        showSuccess('Allocated!', 'Transport allocated successfully');
      }
      
      fetchData();
      setShowForm(false);
      setEditingAllocation(null);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (allocation) => {
    setEditingAllocation(allocation);
    setFormData({
      studentStaffName: allocation.userName || '',
      userType: allocation.userType || 'Student',
      route: allocation.route?._id || allocation.route || '',
      stop: allocation.routeStop?._id || allocation.routeStop || '',
      vehicle: allocation.vehicle?._id || allocation.vehicle || '',
      monthlyCharge: allocation.monthlyCharges || '',
      pickupDrop: allocation.service || 'both',
      joiningDate: allocation.joiningDate ? allocation.joiningDate.split('T')[0] : '',
      status: allocation.status === true || allocation.status === 'active' ? 'active' : 'inactive',
      studentId: allocation.student?._id || allocation.student || '',
      staffId: allocation.staff?._id || allocation.staff || ''
    });
    if (allocation.student || allocation.staff) setVerifiedUser(allocation.student || allocation.staff);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Allocation?', 'This will cancel the transport allocation');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/transport-allocation/delete/${id}`);
        fetchData();
        showToast('success', 'Allocation deleted successfully');
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (allocation) => {
    try {
      await api.patch(`/api/transport-allocation/toggle-status/${allocation._id}`);
      showToast('success', 'Status updated successfully');
      setTimeout(() => fetchData(), 100);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Status update failed');
    }
  };

  const getVehicleDisplayValue = () => {
    if (!formData.vehicle) return '';
    const assignment = assignments.find(a => 
      (a.vehicle?._id || a.vehicle) === formData.vehicle
    );
    if (assignment && assignment.vehicle && assignment.vehicle.vehicleNo) {
      return `${assignment.vehicle.vehicleNo} ${assignment.vehicle.vehicleName ? `(${assignment.vehicle.vehicleName})` : ''}`.trim();
    }
    return formData.vehicle;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/60">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Transport Allocation</h2>
              <p className="text-gray-600 text-lg mt-1">Allocate transport to students and staff</p>
            </div>
          </div>
          <button
            onClick={handleAddAllocation}
            className="bg-blue-500 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
          >
            <FaPlus /> Allocate Transport
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
            <h3 className="text-2xl font-bold text-gray-800">{editingAllocation ? 'Update Allocation' : 'Allocate Transport'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Student / Staff Name *</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Type to search database..."
                  value={formData.studentStaffName}
                  onChange={(e) => {
                    setFormData({...formData, studentStaffName: e.target.value});
                    if (verifiedUser) setVerifiedUser(null);
                  }}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                  className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${verifiedUser ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300'}`}
                  required
                />
                {searching && (
                  <div className="absolute right-4 top-[12px]">
                    <FaSpinner className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-5 py-3 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0 flex items-center justify-between transition-colors group/item"
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-black uppercase">
                            {(user.firstName || user.name || 'U').charAt(0)}
                         </div>
                         <div>
                            <div className="text-sm font-bold text-gray-800 group-hover/item:text-blue-600 transition-colors">
                              {user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || user.wardenName || user.librarianName)}
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {formData.userType === 'Student' ? `${user.class?.className || 'N/A'} • ${user.admissionNumber || 'ID'}` : `${user.role || 'Staff'} • ${user.staffId || 'ID'}`}
                            </div>
                         </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">User Type</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({...formData, userType: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-500"
              >
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Route *</label>
              <select
                value={formData.route}
                onChange={(e) => setFormData({...formData, route: e.target.value, stop: '', vehicle: '', monthlyCharge: ''})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select Route</option>
                {routes.filter(r => r.status === true || r.status === 'active').map(route => (
                  <option key={route._id} value={route._id}>{route.routeName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stop *</label>
              <select
                value={formData.stop}
                onChange={(e) => setFormData({...formData, stop: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-500"
                required
                disabled={!formData.route}
              >
                <option value="">Select Stop</option>
                {getStopsForRoute().map(stop => (
                  <option key={stop._id} value={stop._id}>{stop.stopName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle (Auto from route)</label>
              <input
                type="text"
                value={getVehicleDisplayValue()}
                className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Charge (Auto)</label>
              <input
                type="text"
                value={formData.monthlyCharge ? `₹${formData.monthlyCharge}` : ''}
                className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pickup / Drop</label>
              <select
                value={formData.pickupDrop}
                onChange={(e) => setFormData({...formData, pickupDrop: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-500"
              >
                <option value="pickup only">Pickup Only</option>
                <option value="drop only">Drop Only</option>
                <option value="both">Both</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Joining Date *</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-pink-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 font-bold"
              >
                {editingAllocation ? 'Update' : 'Allocate'}
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

      {/* Allocations List */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        <div className="px-8 py-6" style={{backgroundColor: 'rgb(26,37,57)'}}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaClipboardList className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-white">Transport Allocations ({allocations.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Name</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Route</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Stop</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Vehicle</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Charge</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Pickup/Drop</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center py-8">Loading...</td></tr>
              ) : !Array.isArray(allocations) || allocations.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-8">No allocations found</td></tr>
              ) : allocations.map((allocation, index) => {
                console.log('Rendering allocation:', allocation);
                return (
                <tr key={allocation._id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-bold">{allocation.userName || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      allocation.userType === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {allocation.userType || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {allocation.route?.routeName || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {allocation.routeStop?.stopName || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {allocation.vehicle?.vehicleNo || '-'}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-bold">₹{allocation.monthlyCharges || 0}</td>
                  <td className="px-4 py-3 capitalize">{allocation.service || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(allocation)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        allocation.status === true || allocation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {allocation.status === true || allocation.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(allocation)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(allocation._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Cancel
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