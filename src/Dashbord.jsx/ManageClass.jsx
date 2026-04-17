import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaGraduationCap, FaPlus, FaEdit, FaTrash, FaUsers, FaTag, FaFileAlt, FaSave, FaTimes, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ManageClass() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ className: '', classCode: '', capacity: '', description: '', streams: [] });
  const [streamInput, setStreamInput] = useState('');
  const [errors, setErrors] = useState({});

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/api/class/all');
      setClasses(data.classes || data || []);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const addStream = () => {
    if (streamInput.trim() && !formData.streams.includes(streamInput.trim())) {
      setFormData({ ...formData, streams: [...formData.streams, streamInput.trim()] });
      setStreamInput('');
    }
  };

  const removeStream = (index) => {
    const newStreams = formData.streams.filter((_, i) => i !== index);
    setFormData({ ...formData, streams: newStreams });
  };

  const validate = () => {
    const errs = {};
    if (!formData.className.trim()) errs.className = 'Class name is required';
    if (!formData.classCode.trim()) errs.classCode = 'Class code is required';
    if (!formData.capacity || formData.capacity < 1) errs.capacity = 'Valid capacity required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSubmitting(true);
    try {
      const payload = {
        className: formData.className,
        classCode: formData.classCode,
        classCapacity: formData.capacity,
        description: formData.description,
        stream: formData.streams.length > 0 ? formData.streams : null
      };
      if (editingClass) {
        await api.put(`/api/class/update/${editingClass._id}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/api/class/create', payload);
        Swal.fire({ icon: 'success', title: 'Class Created!', timer: 1500, showConfirmButton: false });
      }
      fetchClasses();
      setShowForm(false);
      setEditingClass(null);
      setFormData({ className: '', classCode: '', capacity: '', description: '', streams: [] });
      setStreamInput('');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    const streamValue = Array.isArray(cls.stream) ? cls.stream : cls.stream ? [cls.stream] : [];
    setFormData({ className: cls.className, classCode: cls.classCode, capacity: cls.classCapacity, description: cls.description || '', streams: streamValue });
    setStreamInput('');
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (cls) => {
    Swal.fire({ title: `Delete "${cls.className}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
      .then(async (res) => {
        if (res.isConfirmed) {
          try {
            await api.delete(`/api/class/delete/${cls._id}`);
            setClasses(classes.filter(c => c._id !== cls._id));
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
          } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Delete failed', 'error');
          }
        }
      });
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaGraduationCap className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Classes</h1>
            <p className="text-gray-500 text-sm">Create and manage school classes</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingClass(null); setFormData({ className: '', classCode: '', capacity: '', description: '', streams: [] }); setStreamInput(''); setErrors({}); }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg flex items-center gap-2 font-semibold"
        >
          <FaPlus /> Add New Class
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaGraduationCap /> {editingClass ? 'Edit Class' : 'Add New Class'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class Name *</label>
                <input type="text" placeholder="e.g., Class 1" value={formData.className}
                  onChange={(e) => { setFormData({ ...formData, className: e.target.value }); setErrors({ ...errors, className: '' }); }}
                  className={inp('className')} />
                {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class Code *</label>
                <input type="text" placeholder="e.g., CLS1" value={formData.classCode}
                  onChange={(e) => { setFormData({ ...formData, classCode: e.target.value }); setErrors({ ...errors, classCode: '' }); }}
                  className={inp('classCode')} />
                {errors.classCode && <p className="text-red-500 text-xs mt-1">{errors.classCode}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity *</label>
                <input type="number" placeholder="Max students" value={formData.capacity} min="1"
                  onChange={(e) => { setFormData({ ...formData, capacity: e.target.value }); setErrors({ ...errors, capacity: '' }); }}
                  className={inp('capacity')} />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input type="text" placeholder="Optional" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stream</label>
                <div className="border-2 border-gray-300 p-3 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.streams.map((stream, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                        {stream}
                        <button type="button" onClick={() => removeStream(idx)} className="text-purple-600 hover:text-purple-800 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type stream name" 
                      value={streamInput}
                      onChange={(e) => setStreamInput(e.target.value)}
                      className="flex-1 border-none focus:ring-0 p-0"
                    />
                    <button 
                      type="button" 
                      onClick={addStream}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Type a stream name and click Add to add</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                <FaSave /> {submitting ? 'Saving...' : editingClass ? 'Update Class' : 'Add Class'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center gap-2">
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Classes List</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaGraduationCap className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No classes yet. Add your first class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stream</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, i) => (
                  <tr key={cls._id} className={`border-t hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaGraduationCap className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{cls.className}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{cls.classCode}</span></td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1"><FaUsers className="text-gray-400" />{cls.classCapacity}</span></td>
                    <td className="px-6 py-4">
                      {Array.isArray(cls.stream) && cls.stream.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cls.stream.map((s, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">{s}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{cls.description || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/dashbord/class-view/${cls._id}`)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><FaEye /></button>
                        <button onClick={() => handleEdit(cls)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><FaEdit /></button>
                        <button onClick={() => handleDelete(cls)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FaTrash /></button>
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
