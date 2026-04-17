import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import api from '../api';

export default function DriverSalaryManagement() {
  const [salaries, setSalaries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    driver: '',
    month: '',
    baseSalary: '',
    allowances: '',
    deductions: '',
    status: 'Pending',
    paymentDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSalaries();
    fetchDrivers();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/driver-salary');
      setSalaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load salaries:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to load salaries', 'error');
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setDriversLoading(true);
      const { data } = await api.get('/api/driver-salary/drivers-list');
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load drivers:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to load drivers', 'error');
      setDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.driver) errs.driver = 'Driver is required';
    if (!formData.month) errs.month = 'Month is required';
    if (!formData.baseSalary) errs.baseSalary = 'Base salary is required';
    else if (Number(formData.baseSalary) < 0) errs.baseSalary = 'Base salary cannot be negative';
    if (formData.allowances && Number(formData.allowances) < 0) errs.allowances = 'Allowances cannot be negative';
    if (formData.deductions && Number(formData.deductions) < 0) errs.deductions = 'Deductions cannot be negative';
    if (formData.status === 'Paid' && !formData.paymentDate) errs.paymentDate = 'Payment date is required for paid status';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSubmitting(true);
    try {
      const selectedDriver = drivers.find(d => d._id === formData.driver);
      const payload = {
        driver: formData.driver,
        driverName: selectedDriver?.name || '',
        month: formData.month,
        baseSalary: Number(formData.baseSalary),
        allowances: Number(formData.allowances) || 0,
        deductions: Number(formData.deductions) || 0,
        status: formData.status,
        paymentDate: formData.paymentDate || null
      };

      if (editingSalary) {
        await api.put(`/api/driver-salary/${editingSalary._id}`, payload);
        Swal.fire({ icon: 'success', title: 'Salary Updated!', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/api/driver-salary', payload);
        Swal.fire({ icon: 'success', title: 'Salary Added!', timer: 1500, showConfirmButton: false });
      }
      fetchSalaries();
      resetForm();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSalary(null);
    setFormData({ driver: '', month: '', baseSalary: '', allowances: '', deductions: '', status: 'Pending', paymentDate: '' });
    setErrors({});
  };

  const handleEdit = (salary) => {
    setEditingSalary(salary);
    setFormData({
      driver: salary.driver?._id || '',
      month: salary.month || '',
      baseSalary: salary.baseSalary || '',
      allowances: salary.allowances || '',
      deductions: salary.deductions || '',
      status: salary.status || 'Pending',
      paymentDate: salary.paymentDate ? salary.paymentDate.split('T')[0] : ''
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (salary) => {
    Swal.fire({ title: 'Delete Salary Record?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
      .then(async (res) => {
        if (res.isConfirmed) {
          try {
            await api.delete(`/api/driver-salary/${salary._id}`);
            setSalaries(salaries.filter(x => x._id !== salary._id));
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
          } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Delete failed', 'error');
          }
        }
      });
  };

  const inp = (field) => `w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white text-sm ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaMoneyBillWave className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Salary Management</h1>
            <p className="text-gray-500 text-sm">Manage driver salary records</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingSalary(null); setFormData({ driver: '', month: '', baseSalary: '', allowances: '', deductions: '', status: 'Pending', paymentDate: '' }); setErrors({}); }}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2 font-semibold">
          <FaPlus /> Add Salary Record
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-blue-600 p-5">
            <h3 className="text-lg font-bold text-white">{editingSalary ? 'Edit Salary Record' : 'Add New Salary Record'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Driver * {driversLoading && '(Loading...)'}</label>
              <select value={formData.driver} onChange={(e) => { setFormData({ ...formData, driver: e.target.value }); setErrors({ ...errors, driver: '' }); }} className={inp('driver')} disabled={driversLoading}>
                <option value="">Select Driver ({drivers.length} available)</option>
                {drivers && drivers.length > 0 ? (
                  drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                  ))
                ) : (
                  <option disabled>{driversLoading ? 'Loading drivers...' : 'No drivers available'}</option>
                )}
              </select>
              {errors.driver && <p className="text-red-500 text-xs mt-1">{errors.driver}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Month *</label>
              <input type="month" value={formData.month} onChange={(e) => { setFormData({ ...formData, month: e.target.value }); setErrors({ ...errors, month: '' }); }} className={inp('month')} />
              {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Salary *</label>
              <input type="number" placeholder="0" value={formData.baseSalary} onChange={(e) => { setFormData({ ...formData, baseSalary: e.target.value }); setErrors({ ...errors, baseSalary: '' }); }} className={inp('baseSalary')} min="0" />
              {errors.baseSalary && <p className="text-red-500 text-xs mt-1">{errors.baseSalary}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Allowances</label>
              <input type="number" placeholder="0" value={formData.allowances} onChange={(e) => { setFormData({ ...formData, allowances: e.target.value }); setErrors({ ...errors, allowances: '' }); }} className={inp('allowances')} min="0" />
              {errors.allowances && <p className="text-red-500 text-xs mt-1">{errors.allowances}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deductions</label>
              <input type="number" placeholder="0" value={formData.deductions} onChange={(e) => { setFormData({ ...formData, deductions: e.target.value }); setErrors({ ...errors, deductions: '' }); }} className={inp('deductions')} min="0" />
              {errors.deductions && <p className="text-red-500 text-xs mt-1">{errors.deductions}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => { setFormData({ ...formData, status: e.target.value }); setErrors({ ...errors, status: '' }); }} className={inp('status')}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            {formData.status === 'Paid' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Date *</label>
                <input type="date" value={formData.paymentDate} onChange={(e) => { setFormData({ ...formData, paymentDate: e.target.value }); setErrors({ ...errors, paymentDate: '' }); }} className={inp('paymentDate')} />
                {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
              </div>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition disabled:opacity-60">
                {submitting ? 'Saving...' : editingSalary ? 'Update Record' : 'Add Record'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 font-semibold transition flex items-center gap-2">
                <IoClose /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Salary Records</h3>
          <span className="text-sm text-gray-500">{salaries.length} records</span>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
        ) : salaries.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><FaMoneyBillWave className="mx-auto text-5xl mb-3 opacity-30" /><p>No salary records added yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Driver', 'Month', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaries.map((s, i) => (
                  <tr key={s._id} className={`border-t hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{s.driver?.name || s.driverName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.month}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">₹{s.baseSalary}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">₹{s.allowances}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">₹{s.deductions}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">₹{s.netSalary}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><FaEdit /></button>
                        <button onClick={() => handleDelete(s)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FaTrash /></button>
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
