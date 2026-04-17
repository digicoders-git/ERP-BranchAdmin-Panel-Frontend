import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import api from '../api';

export default function Approval() {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Student Admission',
    name: '',
    class: '',
    department: '',
    priority: 'Medium',
    description: ''
  });

  const fetchApprovals = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/api/approval/all'),
        api.get('/api/approval/stats'),
      ]);
      setApprovals(listRes.data.approvals || listRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load approvals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApprovals(); }, []);

  const createApproval = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/approval/create', formData);
      setApprovals([res.data.approval || res.data, ...approvals]);
      setShowCreateModal(false);
      setFormData({ type: 'Student Admission', name: '', class: '', department: '', priority: 'Medium', description: '' });
      Swal.fire({ icon: 'success', title: 'Approval Created!', timer: 1500, showConfirmButton: false });
      fetchApprovals();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to create approval', 'error');
    }
  };

  const updateStatus = async (id, status) => {
    const action = status === 'approved' ? 'Approve' : 'Reject';
    const result = await Swal.fire({ title: `${action} this request?`, icon: 'question', showCancelButton: true, confirmButtonColor: status === 'approved' ? '#16a34a' : '#ef4444', confirmButtonText: action });
    if (!result.isConfirmed) return;
    try {
      await api.patch(`/api/approval/${id}/status`, { status });
      setApprovals(approvals.map(a => a._id === id ? { ...a, status } : a));
      setSelectedApproval(null);
      Swal.fire({ icon: 'success', title: `${action}d!`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter);

  const statusBadge = (status) => {
    const map = { approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' };
    const icons = { approved: <FaCheckCircle className="inline mr-1" />, rejected: <FaTimesCircle className="inline mr-1" />, pending: <FaClock className="inline mr-1" /> };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || map.pending}`}>{icons[status]}{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Management</h1>
          <p className="text-gray-500 text-sm">Review and manage all approval requests</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg">
          <FaClipboardList /> Create Approval
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total ?? approvals.length, color: 'from-blue-500 to-blue-600' },
          { label: 'Pending', value: stats.pending ?? approvals.filter(a => a.status === 'pending').length, color: 'from-yellow-500 to-yellow-600' },
          { label: 'Approved', value: stats.approved ?? approvals.filter(a => a.status === 'approved').length, color: 'from-green-500 to-green-600' },
          { label: 'Rejected', value: stats.rejected ?? approvals.filter(a => a.status === 'rejected').length, color: 'from-red-500 to-red-600' },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-r ${s.color} text-white p-5 rounded-2xl shadow-lg`}>
            <p className="text-sm opacity-90">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create New Approval</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><IoClose /></button>
            </div>
            <form onSubmit={createApproval} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Student Admission</option>
                  <option>Fee Waiver</option>
                  <option>Leave Request</option>
                  <option>Document Verification</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input type="text" value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Class 5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter department" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter description"></textarea>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                  Create Approval
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Approval Details</h3>
              <button onClick={() => setSelectedApproval(null)} className="p-2 hover:bg-gray-100 rounded-lg"><IoClose /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Type', selectedApproval.type],
                ['Name', selectedApproval.name],
                ['Class', selectedApproval.class],
                ['Department', selectedApproval.department],
                ['Priority', selectedApproval.priority],
                ['Date', new Date(selectedApproval.createdAt).toLocaleDateString('en-IN')],
                ['Status', null],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">{label}</span>
                  {label === 'Status' ? statusBadge(selectedApproval.status) : <span className="text-gray-800 font-semibold">{val || '—'}</span>}
                </div>
              ))}
              {selectedApproval.description && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-gray-500 text-xs mb-1">Description</p>
                  <p className="text-gray-800">{selectedApproval.description}</p>
                </div>
              )}
            </div>
            {selectedApproval.status === 'pending' && (
              <div className="flex gap-3 mt-5">
                <button onClick={() => updateStatus(selectedApproval._id, 'approved')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <FaCheckCircle /> Approve
                </button>
                <button onClick={() => updateStatus(selectedApproval._id, 'rejected')} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                  <FaTimesCircle /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-gray-900">Requests ({filtered.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><FaClipboardList className="mx-auto text-5xl mb-3 opacity-30" /><p>No requests found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{['Type', 'Name', 'Class', 'Date', 'Status', 'Actions'].map(h => <th key={h} className="px-5 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a._id} className={`border-t hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{a.type}</span></td>
                    <td className="px-5 py-4 font-medium text-gray-900 text-sm">{a.name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{a.class || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">{statusBadge(a.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedApproval(a)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><FaEye /></button>
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(a._id, 'approved')} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><FaCheckCircle /></button>
                            <button onClick={() => updateStatus(a._id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FaTimesCircle /></button>
                          </>
                        )}
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
