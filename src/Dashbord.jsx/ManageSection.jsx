import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash, FaUsers, FaGraduationCap, FaSave, FaTimes } from 'react-icons/fa';
import api from '../api';

export default function ManageSection() {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ sectionName: '', classId: '', stream: '', capacity: '', description: '' });
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const [secRes, clsRes] = await Promise.all([
        api.get('/api/section/all'),
        api.get('/api/class/all'),
      ]);
      setSections(secRes.data.sections || secRes.data || []);
      const cls = clsRes.data.classes || clsRes.data || [];
      setClasses(cls);
      setExpandedClasses(cls.flatMap(c =>
        c.stream && c.stream.length > 0
          ? c.stream.map(s => ({ ...c, _streamLabel: s }))
          : [{ ...c, _streamLabel: null }]
      ));
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const validate = () => {
    const errs = {};
    if (!formData.sectionName.trim()) errs.sectionName = 'Section name is required';
    if (!formData.classId) errs.classId = 'Select a class';
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
        sectionName: formData.sectionName,
        assignToClass: formData.classId,
        capacity: formData.capacity,
        description: formData.description
      };
      if (editingSection) {
        await api.put(`/api/section/update/${editingSection._id}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/api/section/create', payload);
        Swal.fire({ icon: 'success', title: 'Section Created!', timer: 1500, showConfirmButton: false });
      }
      fetchData();
      setShowForm(false);
      setEditingSection(null);
      setFormData({ sectionName: '', classId: '', stream: '', capacity: '', description: '' });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sec) => {
    setEditingSection(sec);
    setFormData({ sectionName: sec.sectionName, classId: sec.assignToClass?._id || sec.assignToClass || '', stream: sec.assignToClass?.stream?.[0] || '', capacity: sec.capacity, description: sec.description || '' });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (sec) => {
    Swal.fire({ title: `Delete "Section ${sec.sectionName}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
      .then(async (res) => {
        if (res.isConfirmed) {
          try {
            await api.delete(`/api/section/delete/${sec._id}`);
            setSections(sections.filter(s => s._id !== sec._id));
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
          } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Delete failed', 'error');
          }
        }
      });
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaLayerGroup className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Sections</h1>
            <p className="text-gray-500 text-sm">Create sections and assign to classes</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingSection(null); setFormData({ sectionName: '', classId: '', stream: '', capacity: '', description: '' }); setErrors({}); }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center gap-2 font-semibold"
          disabled={classes.length === 0}
        >
          <FaPlus /> Add New Section
        </button>
      </div>

      {classes.length === 0 && !loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl text-yellow-800 text-sm">
          ⚠️ No classes found. Please create classes first before adding sections.
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaLayerGroup /> {editingSection ? 'Edit Section' : 'Add New Section'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section Name *</label>
                <input type="text" placeholder="e.g., A, B, Alpha" value={formData.sectionName}
                  onChange={(e) => { setFormData({ ...formData, sectionName: e.target.value }); setErrors({ ...errors, sectionName: '' }); }}
                  className={inp('sectionName')} />
                {errors.sectionName && <p className="text-red-500 text-xs mt-1">{errors.sectionName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assign to Class *</label>
                <select value={formData.classId + (formData.stream ? '|' + formData.stream : '')}
                  onChange={(e) => {
                    const [cid, stream] = e.target.value.split('|');
                    setFormData({ ...formData, classId: cid, stream: stream || '' });
                    setErrors({ ...errors, classId: '' });
                  }}
                  className={inp('classId')}>
                  <option value="">Select a class</option>
                  {expandedClasses.map((cls, i) => (
                    <option key={cls._id + (cls._streamLabel || '') + i} value={cls._id + (cls._streamLabel ? '|' + cls._streamLabel : '')}>
                      {cls.className}{cls._streamLabel ? ` (${cls._streamLabel})` : ''}
                    </option>
                  ))}
                </select>
                {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
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
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-60 flex items-center gap-2">
                <FaSave /> {submitting ? 'Saving...' : editingSection ? 'Update Section' : 'Add Section'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center gap-2">
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Sections List</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaLayerGroup className="mx-auto text-5xl mb-3 opacity-30" />
            <p>No sections yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stream</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec, i) => (
                  <tr key={sec._id} className={`border-t hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                          <FaLayerGroup className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Section {sec.sectionName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {sec.assignToClass?.className || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 font-medium">{sec.assignToClass?.classCode || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {sec.assignToClass?.stream && sec.assignToClass.stream.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sec.assignToClass.stream.map((s, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1"><FaUsers className="text-gray-400" />{sec.capacity}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(sec)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><FaEdit /></button>
                        <button onClick={() => handleDelete(sec)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FaTrash /></button>
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
