import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm, showToast, showWarning } from '../utils/sweetAlert';
import { FaBusAlt, FaPlus, FaEdit, FaClipboardList, FaExclamationTriangle, FaMap, FaTable } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import api from '../api';

export default function RouteStops() {
  const [routeStops, setRouteStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    routeName: '',
    stops: [],
    status: 'active'
  });
  const [currentStop, setCurrentStop] = useState({
    stopName: '',
    stopOrder: '',
    pickupTime: '',
    dropTime: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stopsRes, routesRes] = await Promise.all([
        api.get('/api/route-stop/all'),
        api.get('/api/route/all')
      ]);
      const stopsData = stopsRes.data?.stops || stopsRes.data?.routeStops || stopsRes.data?.data || (Array.isArray(stopsRes.data) ? stopsRes.data : []);
      const routesData = routesRes.data?.routes || routesRes.data?.data || (Array.isArray(routesRes.data) ? routesRes.data : []);
      setRouteStops(stopsData);
      setRoutes(routesData);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Failed to load data');
      setRouteStops([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = async () => {
    if (routes.length === 0) {
      await showWarning('Routes Required!', 'Please create routes first in Route Master!');
      return;
    }
    setShowForm(true);
    setEditingStop(null);
    setFormData({
      routeName: '',
      stops: [],
      status: 'active'
    });
    setCurrentStop({
      stopName: '',
      stopOrder: '',
      pickupTime: '',
      dropTime: ''
    });
  };

  const addStop = () => {
    if (currentStop.stopName.trim() && currentStop.stopOrder) {
      const newStop = {
        ...currentStop,
        id: Date.now() + Math.random()
      };
      setFormData({...formData, stops: [...formData.stops, newStop]});
      setCurrentStop({
        stopName: '',
        stopOrder: '',
        pickupTime: '',
        dropTime: ''
      });
    }
  };

  const removeStop = (stopId) => {
    setFormData({...formData, stops: formData.stops.filter(stop => stop.id !== stopId)});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStop();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.stops.length === 0) {
      showError('Error', 'Please add at least one stop');
      return;
    }
    
    setSubmitting(true);
    try {
      const selectedRoute = routes.find(r => r._id === formData.routeName);
      
      if (editingStop) {
        await api.put(`/api/route-stop/update/${editingStop._id}`, {
          route: formData.routeName,
          stopName: formData.stops[0]?.stopName,
          stopOrder: formData.stops[0]?.stopOrder,
          pickupTime: formData.stops[0]?.pickupTime || null,
          dropTime: formData.stops[0]?.dropTime || null,
          status: formData.status === 'active'
        });
        showSuccess('Updated!', 'Route stop updated successfully');
      } else {
        for (const stop of formData.stops) {
          await api.post('/api/route-stop/add', {
            route: formData.routeName,
            stopName: stop.stopName,
            stopOrder: stop.stopOrder,
            pickupTime: stop.pickupTime || null,
            dropTime: stop.dropTime || null,
            status: formData.status === 'active'
          });
        }
        showSuccess('Created!', `${formData.stops.length} route stops added successfully`);
      }
      
      fetchData();
      setShowForm(false);
      setEditingStop(null);
    } catch (err) {
      showError('Error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (stop) => {
    setEditingStop(stop);
    setFormData({
      routeName: stop.route?._id || stop.route || '',
      stops: [{
        id: stop._id,
        stopName: stop.stopName,
        stopOrder: stop.stopOrder,
        pickupTime: stop.pickupTime || '',
        dropTime: stop.dropTime || ''
      }],
      status: stop.status === true || stop.status === 'active' ? 'active' : 'inactive'
    });
    setCurrentStop({
      stopName: stop.stopName || '',
      stopOrder: stop.stopOrder || '',
      pickupTime: stop.pickupTime || '',
      dropTime: stop.dropTime || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Stop?', 'This will permanently delete the route stop');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/route-stop/delete/${id}`);
        fetchData();
        showToast('success', 'Stop deleted successfully');
      } catch (err) {
        showError('Error', err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleStatus = async (stop) => {
    try {
      const currentStatus = stop.status === true || stop.status === 'active';
      const newStatus = !currentStatus;
      console.log('Toggling stop:', stop._id, 'From:', currentStatus, 'To:', newStatus);
      
      const response = await api.put(`/api/route-stop/update/${stop._id}`, { status: newStatus });
      console.log('API Response:', response.data);
      
      showToast('success', `Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
      setTimeout(() => fetchData(), 100);
    } catch (err) {
      console.error('Toggle error:', err.response || err);
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
              <FaBusAlt className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Route Stop Master</h2>
              <p className="text-gray-600 text-lg mt-1">Manage route stops and timings</p>
            </div>
          </div>
          <button
            onClick={handleAddStop}
            className="bg-blue-500 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
          >
            <FaPlus /> Add Route Stop
          </button>
        </div>
      </div>

      {/* Routes Required Notice */}
      {routes.length === 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-blue-100 border-l-4 border-yellow-400 p-8 mb-8 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-800">Routes Required</h3>
              <p className="text-yellow-700 mt-2 text-lg">
                Please create routes first in Route Master before adding stops.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div data-edit-form className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <FaEdit className="text-xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{editingStop ? 'Update Route Stop' : 'Add New Route Stop'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Route Name *</label>
                <select
                  value={formData.routeName}
                  onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Route</option>
                  {routes.length > 0 ? routes.filter(r => r.status === true || r.status === 'active').map(route => (
                    <option key={route._id} value={route._id}>{route.routeName}</option>
                  )) : <option disabled>No routes available</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Add Stop Section */}
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <h4 className="text-lg font-bold text-blue-800 mb-4">Add Stops</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stop Name *</label>
                  <input
                    type="text"
                    placeholder="Enter stop name"
                    value={currentStop.stopName}
                    onChange={(e) => setCurrentStop({...currentStop, stopName: e.target.value})}
                    onKeyPress={handleKeyPress}
                    className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stop Order *</label>
                  <input
                    type="number"
                    placeholder="Order"
                    value={currentStop.stopOrder}
                    onChange={(e) => setCurrentStop({...currentStop, stopOrder: e.target.value})}
                    className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Time</label>
                  <input
                    type="time"
                    value={currentStop.pickupTime}
                    onChange={(e) => setCurrentStop({...currentStop, pickupTime: e.target.value})}
                    className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Drop Time</label>
                  <input
                    type="time"
                    value={currentStop.dropTime}
                    onChange={(e) => setCurrentStop({...currentStop, dropTime: e.target.value})}
                    className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addStop}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
              >
                <FaPlus /> Add Stop
              </button>
            </div>

            {/* Added Stops Display */}
            {formData.stops.length > 0 && (
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h4 className="text-lg font-bold text-green-800 mb-4">Added Stops ({formData.stops.length})</h4>
                <div className="space-y-3">
                  {formData.stops.map((stop, index) => (
                    <div key={stop._id || stop.id || index} className="bg-white p-4 rounded-lg border border-green-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">#{stop.stopOrder}</span>
                        <span className="font-bold text-gray-800">{stop.stopName}</span>
                        {stop.pickupTime && <span className="text-green-600 text-sm">Pickup: {stop.pickupTime}</span>}
                        {stop.dropTime && <span className="text-red-600 text-sm">Drop: {stop.dropTime}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStop(stop.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <IoClose size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 font-bold"
              >
                {editingStop ? 'Update Stop' : 'Save All Stops'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStop(null);
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Route Stops List */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        <div className="px-8 py-6" style={{backgroundColor: 'rgb(26,37,57)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FaClipboardList className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold text-white">Route Stops List ({routeStops.length})</h3>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-800 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FaTable /> Table View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'map' 
                    ? 'bg-white text-gray-800 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FaMap /> Map View
              </button>
            </div>
          </div>
        </div>
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Route Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Stop Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Order</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Pickup Time</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Drop Time</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8">Loading...</td></tr>
                ) : !Array.isArray(routeStops) || routeStops.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8">No route stops found</td></tr>
                ) : routeStops.map((stop, index) => (
                  <tr key={stop._id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-4 py-3 font-bold">{stop.route?.routeName || stop.routeName || '-'}</td>
                    <td className="px-4 py-3">{stop.stopName}</td>
                    <td className="px-4 py-3">{stop.stopOrder}</td>
                    <td className="px-4 py-3">{stop.pickupTime || '-'}</td>
                    <td className="px-4 py-3">{stop.dropTime || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(stop)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          stop.status === true || stop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {stop.status === true || stop.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(stop)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(stop._id)}
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
        ) : (
          <div className="p-8">
            {!Array.isArray(routeStops) || routeStops.length === 0 ? (
              <div className="text-center py-12">
                <FaBusAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No route stops to display</p>
                <p className="text-gray-400">Add some route stops to see them on the map</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group stops by route */}
                {Object.entries(
                  routeStops.reduce((acc, stop) => {
                    const routeKey = stop.route?.routeName || stop.routeName || 'Unknown';
                    if (!acc[routeKey]) acc[routeKey] = [];
                    acc[routeKey].push(stop);
                    return acc;
                  }, {})
                ).map(([routeName, stops]) => (
                  <div key={routeName} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <FaBusAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-xl">{routeName}</h4>
                        <p className="text-blue-600 font-medium">{stops.length} stops</p>
                      </div>
                    </div>
                    
                    {/* Route visualization */}
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-gray-600">Route Path</span>
                        <span className="text-xs text-gray-500">Ordered by stop sequence</span>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="flex items-center gap-2 pb-2" style={{minWidth: `${stops.length * 120}px`}}>
                          {stops
                            .sort((a, b) => parseInt(a.stopOrder) - parseInt(b.stopOrder))
                            .map((stop, index, sortedStops) => (
                              <React.Fragment key={stop._id || stop.id || index}>
                                <div className="flex flex-col items-center" style={{minWidth: '100px'}}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                    index === 0 ? 'bg-green-500' : 
                                    index === sortedStops.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                                  }`}>
                                    {stop.stopOrder}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 mt-1 text-center" style={{maxWidth: '90px', wordWrap: 'break-word'}}>
                                    {stop.stopName}
                                  </div>
                                  {stop.pickupTime && (
                                    <div className="text-xs text-green-600 mt-1">
                                      ↑ {stop.pickupTime}
                                    </div>
                                  )}
                                  {stop.dropTime && (
                                    <div className="text-xs text-red-600">
                                      ↓ {stop.dropTime}
                                    </div>
                                  )}
                                </div>
                                {index < sortedStops.length - 1 && (
                                  <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{minWidth: '20px', width: '20px'}}></div>
                                )}
                              </React.Fragment>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Stop details cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stops
                        .sort((a, b) => parseInt(a.stopOrder) - parseInt(b.stopOrder))
                        .map((stop, index) => (
                          <div key={stop._id || stop.id || index} className="bg-white rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                  parseInt(stop.stopOrder) === 1 ? 'bg-green-500' : 
                                  parseInt(stop.stopOrder) === Math.max(...stops.map(s => parseInt(s.stopOrder))) ? 'bg-red-500' : 'bg-blue-500'
                                }`}>
                                  {stop.stopOrder}
                                </span>
                                <span className="font-bold text-gray-800">{stop.stopName}</span>
                              </div>
                              <button
                                onClick={() => toggleStatus(stop)}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  stop.status === true || stop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {stop.status === true || stop.status === 'active' ? 'Active' : 'Inactive'}
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              {stop.pickupTime && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Pickup:</span>
                                  <span className="font-medium text-green-600">{stop.pickupTime}</span>
                                </div>
                              )}
                              {stop.dropTime && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Drop:</span>
                                  <span className="font-medium text-red-600">{stop.dropTime}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 mt-4 pt-3 border-t border-blue-100">
                              <button
                                onClick={() => handleEdit(stop)}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all text-sm flex items-center justify-center gap-1"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(stop.id)}
                                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-medium transition-all text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}