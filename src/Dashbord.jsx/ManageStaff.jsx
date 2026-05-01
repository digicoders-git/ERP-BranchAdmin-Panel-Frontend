import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaPlus, FaCamera, FaFolder, FaTrash, FaInfoCircle, FaEdit, FaEye, FaUser, FaToggleOn, FaToggleOff, FaIdCard } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import api from '../api';
import IDCardPrint from './IDCardPrint';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', address: '',
    qualification: '', experience: '', salary: '', image: null, imagePreview: null
  });
  const [errors, setErrors] = useState({});

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/api/staff/all');
      setStaff(data.staff || data || []);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email';
    if (!editingStaff && !formData.password) errs.password = 'Password is required';
    if (!formData.mobile.trim()) errs.mobile = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = '10-digit phone required';
    if (!formData.qualification.trim()) errs.qualification = 'Qualification is required';
    if (!formData.salary) errs.salary = 'Salary is required';
    return errs;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: file, imagePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'image') { if (v) fd.append('profileImage', v); }
        else if (k !== 'imagePreview' && v !== null && v !== '') fd.append(k, v);
      });
      if (editingStaff) {
        await api.put(`/api/staff/update/${editingStaff._id}`, fd);
        Swal.fire({ icon: 'success', title: 'Staff Updated!', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/api/staff/create', fd);
        Swal.fire({ icon: 'success', title: 'Staff Added!', timer: 1500, showConfirmButton: false });
      }
      fetchStaff();
      resetForm();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', mobile: '', address: '', qualification: '', experience: '', salary: '', image: null, imagePreview: null });
    setErrors({});
  };

  const handleEdit = (s) => {
    setEditingStaff(s);
    setFormData({ name: s.name, email: s.email, password: '', mobile: s.mobile || '', address: s.address || '', qualification: s.qualification || '', experience: s.experience || '', salary: s.salary || '', image: null, imagePreview: s.profileImage ? `${BASE_URL}${s.profileImage}` : null });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (s) => {
    Swal.fire({ title: `Delete "${s.name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
      .then(async (res) => {
        if (res.isConfirmed) {
          try {
            await api.delete(`/api/staff/delete/${s._id}`);
            setStaff(staff.filter(x => x._id !== s._id));
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
          } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Delete failed', 'error');
          }
        }
      });
  };

  const toggleStatus = async (s) => {
    try {
      await api.patch(`/api/staff/toggle-status/${s._id}`);
      setStaff(staff.map(x => x._id === s._id ? { ...x, status: !x.status } : x));
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white text-sm ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaUsers className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Staff</h1>
            <p className="text-gray-500 text-sm">Manage non-teaching staff members</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingStaff(null); setFormData({ name: '', email: '', password: '', mobile: '', address: '', qualification: '', experience: '', salary: '', image: null, imagePreview: null }); setErrors({}); }}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2 font-semibold">
          <FaPlus /> Add New Staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-blue-600 p-5">
            <h3 className="text-lg font-bold text-white">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-5 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex-shrink-0">
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUser className="text-3xl" /></div>
                  )}
                </div>
                <div>
                  <label className="bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-700 transition flex items-center gap-2 text-sm font-semibold w-fit">
                    <FaFolder /> Choose Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG • Max 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input type="text" placeholder="Enter full name" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }} className={inp('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }} className={inp('email')} disabled={!!editingStaff} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            {!editingStaff && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }} className={inp('password')} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input type="tel" placeholder="10-digit number" value={formData.mobile} onChange={(e) => { setFormData({ ...formData, mobile: e.target.value }); setErrors({ ...errors, mobile: '' }); }} className={inp('mobile')} />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Qualification *</label>
              <input type="text" placeholder="e.g., B.Com, MBA" value={formData.qualification} onChange={(e) => { setFormData({ ...formData, qualification: e.target.value }); setErrors({ ...errors, qualification: '' }); }} className={inp('qualification')} />
              {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
              <input type="text" placeholder="e.g., 3 years" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Salary *</label>
              <input type="number" placeholder="Monthly salary" value={formData.salary} onChange={(e) => { setFormData({ ...formData, salary: e.target.value }); setErrors({ ...errors, salary: '' }); }} className={inp('salary')} />
              {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea placeholder="Complete address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm resize-none" rows={3} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition disabled:opacity-60">
                {submitting ? 'Saving...' : editingStaff ? 'Update Staff' : 'Add Staff'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 font-semibold transition flex items-center gap-2">
                <IoClose /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Staff List</h3>
          <span className="text-sm text-gray-500">{staff.length} members</span>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><FaUsers className="mx-auto text-5xl mb-3 opacity-30" /><p>No staff added yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Phone', 'Qualification', 'Salary', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s, i) => (
                  <tr key={s._id} className={`border-t hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                          {s.profileImage ? <img src={`${BASE_URL}${s.profileImage}`} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-sm">{s.name?.[0]}</div>}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.mobile || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.qualification || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">₹{s.salary || '—'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStatus(s)} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${s.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.status ? <FaToggleOn /> : <FaToggleOff />} {s.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/dashbord/staff-profile/${s._id}`)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="View Profile"><FaEye /></button>
                        <button onClick={() => setSelectedStaff(s)} className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Print ID Card"><FaIdCard /></button>
                        <button onClick={(() => handleEdit(s))} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit Staff"><FaEdit /></button>
                        <button onClick={() => handleDelete(s)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Delete Staff"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStaff && <IDCardPrint staffId={selectedStaff._id} staffData={selectedStaff} onClose={() => setSelectedStaff(null)} />}
    </div>
  );
}
