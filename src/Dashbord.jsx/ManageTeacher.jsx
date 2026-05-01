import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaChalkboardTeacher, FaPlus, FaFolder, FaTrash, FaEdit, FaEye, FaUser, FaToggleOn, FaToggleOff, FaIdCard } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import IDCardPrint from './IDCardPrint';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ManageTeacher() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [currentSubject, setCurrentSubject] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '',
    qualification: '', experience: '', salary: '', subjects: [],
    assignedClass: '', assignedSection: '',
    isClassTeacher: false,
    image: null, imagePreview: null
  });
  const [errors, setErrors] = useState({});

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/api/teacher/all');
      setTeachers(data.teachers || data || []);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/api/staff-panel/class/all');
      setClasses(data.classes || data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const fetchSections = async () => {
    try {
      const { data } = await api.get('/api/section/all?limit=100');
      setSections(data.sections || data || []);
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  useEffect(() => { 
    fetchTeachers(); 
    fetchClasses();
    fetchSections();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email';
    if (!editingTeacher && !formData.password) errs.password = 'Password is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) errs.phone = '10-digit phone required';
    if (formData.subjects.length === 0) errs.subjects = 'Add at least one subject';
    return errs;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: file, imagePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const addSubject = () => {
    if (currentSubject.trim() && !formData.subjects.includes(currentSubject.trim())) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, currentSubject.trim()] }));
      setCurrentSubject('');
      setErrors(prev => ({ ...prev, subjects: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSubmitting(true);

    const submitData = async (forceReplace = false) => {
      const fd = new FormData();
      // Append non-file fields first
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'image' || k === 'imagePreview') return;
        if (k === 'subjects') fd.append(k, JSON.stringify(v));
        else if (k === 'phone') fd.append('mobile', v);
        else if (k === 'assignedClass' && v) fd.append('assignedClass', v);
        else if (k === 'assignedSection' && v) fd.append('assignedSection', v);
        else if (k === 'isClassTeacher') fd.append('isClassTeacher', v ? 'true' : 'false');
        else if (v !== null && v !== '') fd.append(k, v);
      });
      
      // Append file last
      if (formData.image) fd.append('profileImage', formData.image);
      if (forceReplace) fd.append('forceReplace', 'true');

      if (editingTeacher) {
        await api.put(`/api/teacher/update/${editingTeacher._id}`, fd);
      } else {
        await api.post('/api/teacher/create', fd);
      }
    };

    try {
      await submitData(false);
      Swal.fire({ icon: 'success', title: editingTeacher ? 'Teacher Updated!' : 'Teacher Added!', timer: 1500, showConfirmButton: false });
      fetchTeachers();
      resetForm();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        const result = await Swal.fire({
          title: 'Class Teacher Conflict',
          text: err.response.data.message,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Replace',
          cancelButtonText: 'No, Keep existing'
        });

        if (result.isConfirmed) {
          setSubmitting(true);
          try {
            await submitData(true);
            Swal.fire({ icon: 'success', title: 'Teacher Updated!', timer: 1500, showConfirmButton: false });
            fetchTeachers();
            resetForm();
          } catch (retryErr) {
            Swal.fire('Error', retryErr.response?.data?.message || 'Operation failed', 'error');
          }
        }
      } else {
        Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false); setEditingTeacher(null); setCurrentSubject('');
    setFormData({ name: '', email: '', password: '', phone: '', address: '', qualification: '', experience: '', salary: '', subjects: [], assignedClass: '', assignedSection: '', isClassTeacher: false, image: null, imagePreview: null });
    setErrors({});
  };

  const handleEdit = (t) => {
    setEditingTeacher(t);
    setFormData({ 
      name: t.name, 
      email: t.password ? '' : t.email, 
      password: '', 
      phone: t.mobile || t.phone || '', 
      address: t.address || '', 
      qualification: t.qualification || '', 
      experience: t.experience || '', 
      salary: t.salary || '', 
      subjects: t.subjects || [], 
      assignedClass: t.assignedClass?._id || t.assignedClass || '',
      assignedSection: t.assignedSection?._id || t.assignedSection || '',
      isClassTeacher: t.isClassTeacher || false,
      image: null, 
      imagePreview: t.profileImage ? (t.profileImage.startsWith('http') ? t.profileImage : `${BASE_URL.replace(/\/$/, '')}/${t.profileImage.replace(/\\/g, '/').replace(/^\//, '')}`) : null 
    });
    setErrors({}); setShowForm(true);
  };

  const handleDelete = (t) => {
    Swal.fire({ title: `Delete "${t.name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
      .then(async (res) => {
        if (res.isConfirmed) {
          try {
            await api.delete(`/api/teacher/delete/${t._id}`);
            setTeachers(teachers.filter(x => x._id !== t._id));
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
          } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Delete failed', 'error');
          }
        }
      });
  };

  const toggleStatus = async (t) => {
    try {
      await api.patch(`/api/teacher/toggle-status/${t._id}`);
      setTeachers(teachers.map(x => x._id === t._id ? { ...x, status: !x.status } : x));
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white text-sm ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaChalkboardTeacher className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
            <p className="text-gray-500 text-sm">Manage teaching staff profiles</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTeacher(null); setFormData({ name: '', email: '', password: '', phone: '', address: '', qualification: '', experience: '', salary: '', subjects: [], assignedClass: '', assignedSection: '', image: null, imagePreview: null }); setErrors({}); }}
          className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition shadow-lg flex items-center gap-2 font-semibold">
          <FaPlus /> Add New Teacher
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-green-600 p-5">
            <h3 className="text-lg font-bold text-white">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image */}
            <div className="md:col-span-2">
              <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-2xl p-5 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-green-100 flex-shrink-0">
                  {formData.imagePreview ? <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUser className="text-3xl" /></div>}
                </div>
                <label className="bg-green-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-green-700 transition flex items-center gap-2 text-sm font-semibold w-fit">
                  <FaFolder /> Choose Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input type="text" placeholder="Enter full name" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }} className={inp('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }} className={inp('email')} disabled={!!editingTeacher} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            {!editingTeacher && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }} className={inp('password')} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input type="tel" placeholder="10-digit number" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }} className={inp('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Qualification</label>
              <input type="text" placeholder="e.g., B.Ed, M.Sc" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
              <input type="text" placeholder="e.g., 5 years" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Salary</label>
              <input type="number" placeholder="Monthly salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white text-sm" />
            </div>

            {/* Assigned Class & Section (Primary Class Teacher Role) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="md:col-span-3">
                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <FaChalkboardTeacher /> Class Teacher Designation (Primary)
                </h4>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Is Class Teacher?</label>
                <div className="flex items-center gap-3 h-[46px]">
                  <button type="button" onClick={() => setFormData({ ...formData, isClassTeacher: !formData.isClassTeacher })} className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isClassTeacher ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isClassTeacher ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                  <span className="text-xs font-medium text-gray-500">{formData.isClassTeacher ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Class</label>
                <select value={formData.assignedClass} onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value, assignedSection: '' })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm" disabled={!formData.isClassTeacher}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Section</label>
                <select value={formData.assignedSection} onChange={(e) => setFormData({ ...formData, assignedSection: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm" disabled={!formData.assignedClass}>
                  <option value="">Select Section</option>
                  {sections.filter(s => s.assignToClass?._id === formData.assignedClass || s.assignToClass === formData.assignedClass).map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                </select>
              </div>
            </div>



            {/* Subjects Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Global Skills/Subjects (Tags) *</label>
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Enter subject and press Enter" value={currentSubject} onChange={(e) => setCurrentSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())} className="flex-1 border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white text-sm" />
                <button type="button" onClick={addSubject} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm font-semibold">Add</button>
              </div>
              {errors.subjects && <p className="text-red-500 text-xs mb-2">{errors.subjects}</p>}
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((sub, i) => (
                  <span key={i} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {sub}
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, subjects: prev.subjects.filter((_, j) => j !== i) }))} className="text-green-600 hover:text-green-900"><IoClose /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea placeholder="Complete address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 bg-white text-sm resize-none" rows={3} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-semibold transition disabled:opacity-60">
                {submitting ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Add Teacher'}
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
          <h3 className="font-bold text-gray-900">Teachers List</h3>
          <span className="text-sm text-gray-500">{teachers.length} teachers</span>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><FaChalkboardTeacher className="mx-auto text-5xl mb-3 opacity-30" /><p>No teachers added yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{['Name', 'Email', 'Phone', 'Subjects', 'Status', 'Actions'].map(h => <th key={h} className="px-5 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}</tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t._id} className={`border-t hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-green-100 flex-shrink-0">
                          {t.profileImage ? <img src={t.profileImage.startsWith('http') ? t.profileImage : `${BASE_URL.replace(/\/$/, '')}/${t.profileImage.replace(/\\/g, '/').replace(/^\//, '')}`} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-green-600 font-bold text-sm">{t.name?.[0]}</div>}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                        {t.isClassTeacher && <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm">Class Teacher</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{t.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{t.mobile || t.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(t.subjects || []).slice(0, 2).map((s, j) => <span key={j} className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{s}</span>)}
                        {(t.subjects || []).length > 2 && <span className="text-xs text-gray-400">+{t.subjects.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStatus(t)} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${t.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.status ? <FaToggleOn /> : <FaToggleOff />} {t.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/dashbord/teacher-profile/${t._id}`)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="View Profile"><FaEye /></button>
                        <button onClick={() => setSelectedTeacher(t)} className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Print ID Card"><FaIdCard /></button>
                        <button onClick={() => handleEdit(t)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit Teacher"><FaEdit /></button>
                        <button onClick={() => handleDelete(t)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Delete Teacher"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedTeacher && <IDCardPrint roleType="teacher" staffId={selectedTeacher._id} staffData={selectedTeacher} onClose={() => setSelectedTeacher(null)} />}
    </div>
  );
}
