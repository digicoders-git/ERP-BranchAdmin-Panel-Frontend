import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { FaUserPlus, FaHistory, FaTrash, FaCalendarAlt, FaChalkboardTeacher } from 'react-icons/fa';

export default function SubstituteAssignment() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    substituteTeacherId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teacherRes, classRes, sectionRes, historyRes] = await Promise.all([
        api.get('/api/teacher/all'),
        api.get('/api/staff-panel/class/all'),
        api.get('/api/section/all?limit=100'),
        api.get('/api/staff-panel/substitute/history')
      ]);

      setTeachers(teacherRes.data.teachers || teacherRes.data || []);
      setClasses(classRes.data.classes || classRes.data || []);
      setSections(sectionRes.data.sections || sectionRes.data || []);
      setHistory(historyRes.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      Swal.fire('Error', 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.sectionId || !formData.substituteTeacherId || !formData.startDate || !formData.endDate) {
      return Swal.fire('Warning', 'Please fill all required fields', 'warning');
    }

    try {
      setSubmitting(true);
      await api.post('/api/staff-panel/substitute/assign', formData);
      Swal.fire('Success', 'Substitute teacher assigned successfully', 'success');
      setFormData({
        classId: '',
        sectionId: '',
        substituteTeacherId: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to assign substitute', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to remove this assignment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/staff-panel/substitute/${id}`);
        Swal.fire('Deleted!', 'Assignment has been removed.', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete assignment', 'error');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaUserPlus className="text-indigo-600" /> Substitute Teacher Assignment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">New Assignment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Substitute Teacher</label>
                  <select
                    value={formData.substituteTeacherId}
                    onChange={(e) => setFormData({ ...formData, substituteTeacherId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg h-20"
                    placeholder="Optional reason..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Assign Substitute'}
                </button>
              </form>
            </div>
          </div>

          {/* Assignment History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-gray-500" /> Assignment History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Teacher</th>
                      <th className="px-6 py-3 font-medium">Class / Section</th>
                      <th className="px-6 py-3 font-medium">Dates</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No substitution history found.</td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{item.substituteTeacherId?.name}</div>
                            <div className="text-xs text-gray-500">{item.substituteTeacherId?.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.classId?.className} - {item.sectionId?.sectionName}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="text-indigo-600 font-medium">
                              {new Date(item.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-gray-400">
                              to {new Date(item.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Assignment"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
