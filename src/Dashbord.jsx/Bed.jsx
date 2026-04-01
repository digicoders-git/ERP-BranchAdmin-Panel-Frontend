import React, { useState, useEffect } from 'react';

export default function Bed() {
  const [beds, setBeds] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [formData, setFormData] = useState({
    hostel: '',
    room: '',
    bedNumber: '',
    bedCode: '',
    bedStatus: 'Vacant'
  });

  useEffect(() => {
    const savedBeds = localStorage.getItem('beds');
    const savedHostels = localStorage.getItem('hostels');
    const savedRooms = localStorage.getItem('rooms');
    if (savedBeds) setBeds(JSON.parse(savedBeds));
    if (savedHostels) setHostels(JSON.parse(savedHostels));
    if (savedRooms) setRooms(JSON.parse(savedRooms));
  }, []);

  useEffect(() => {
    if (formData.hostel) {
      const hostelRooms = rooms.filter(room => room.hostelName === formData.hostel);
      setFilteredRooms(hostelRooms);
    } else {
      setFilteredRooms([]);
    }
  }, [formData.hostel, rooms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bedData = {
      ...formData,
      id: editingBed?.id || Date.now(),
      createdDate: editingBed ? editingBed.createdDate : new Date().toLocaleDateString()
    };
    
    let updatedBeds;
    if (editingBed) {
      updatedBeds = beds.map(b => b.id === editingBed.id ? bedData : b);
    } else {
      updatedBeds = [...beds, bedData];
    }
    
    setBeds(updatedBeds);
    localStorage.setItem('beds', JSON.stringify(updatedBeds));
    setShowForm(false);
    setEditingBed(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      hostel: '',
      room: '',
      bedNumber: '',
      bedCode: '',
      bedStatus: 'Vacant'
    });
  };

  const handleEdit = (bed) => {
    setEditingBed(bed);
    setFormData(bed);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bed?')) {
      const updatedBeds = beds.filter(b => b.id !== id);
      setBeds(updatedBeds);
      localStorage.setItem('beds', JSON.stringify(updatedBeds));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bed Create / List</h2>
          <p className="text-gray-600">Manage hostel beds</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 font-bold transition-all duration-300"
        >
          Create Bed
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/50 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingBed ? 'Update Bed' : 'Create New Bed'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hostel *</label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({...formData, hostel: e.target.value, room: ''})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Hostel</option>
                {hostels.map(hostel => (
                  <option key={hostel.id} value={hostel.hostelName}>{hostel.hostelName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Room *</label>
              <select
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
                disabled={!formData.hostel}
              >
                <option value="">Select Room</option>
                {filteredRooms.map(room => (
                  <option key={room.id} value={room.roomNumber}>{room.roomNumber}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bed Number *</label>
              <input
                type="text"
                value={formData.bedNumber}
                onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bed Code</label>
              <input
                type="text"
                value={formData.bedCode}
                onChange={(e) => setFormData({...formData, bedCode: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bed Status</label>
              <select
                value={formData.bedStatus}
                onChange={(e) => setFormData({...formData, bedStatus: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="md:col-span-3 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 font-bold"
              >
                {editingBed ? 'Update' : 'Save'}
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

      {/* Bed List */}
      <div className="bg-white/50 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Bed List ({beds.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Hostel</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Room</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Bed Number</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Bed Code</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beds.map((bed, index) => (
                <tr key={bed.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-bold">{bed.hostel}</td>
                  <td className="px-4 py-3">{bed.room}</td>
                  <td className="px-4 py-3 font-bold">{bed.bedNumber}</td>
                  <td className="px-4 py-3">{bed.bedCode}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bed.bedStatus === 'Vacant' ? 'bg-green-100 text-green-800' :
                      bed.bedStatus === 'Occupied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bed.bedStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(bed)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bed.id)}
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