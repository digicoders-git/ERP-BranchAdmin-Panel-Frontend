import React, { useState } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash, FaTag, FaCalendarAlt, FaFileAlt, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../api';

export default function ManageFees() {
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    feeName: '',
    feeType: 'recurring',
    frequency: 'monthly',
    totalAmount: ''
  });

  // Load fees from backend
  React.useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/fee/all');
      setFees(res.data.fees || []);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
      showError('Error', 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = () => {
    setShowForm(true);
    setEditingFee(null);
    setFormData({
      feeName: '',
      feeType: 'recurring',
      frequency: 'monthly',
      totalAmount: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        feeName: formData.feeName,
        feeType: formData.feeType,
        totalAmount: formData.totalAmount
      };
      
      // Only add frequency if feeType is recurring
      if (formData.feeType === 'recurring') {
        payload.frequency = formData.frequency;
      }
      
      if (editingFee) {
        await api.put(`/api/fee/update/${editingFee._id}`, payload);
        await showSuccess('Updated!', 'Fee structure updated successfully');
      } else {
        await api.post('/api/fee/create', payload);
        await showSuccess('Created!', 'New fee structure created successfully');
      }
      fetchFees();
      setShowForm(false);
      setEditingFee(null);
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to save fee');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      feeName: fee.feeName,
      feeType: fee.feeType,
      frequency: fee.frequency || 'monthly',
      totalAmount: fee.totalAmount
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Fee?', 'This will permanently delete the fee structure');
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/fee/delete/${id}`);
        showToast('success', 'Fee deleted successfully');
        fetchFees();
      } catch (error) {
        showError('Error', error.response?.data?.message || 'Failed to delete fee');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaMoneyBillWave className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Manage Fees
              </h1>
              <p className="text-gray-600 mt-1">Create and manage fee structures independently</p>
            </div>
          </div>
          <button 
            onClick={handleAddFee}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
          >
            <span className="text-lg"><FaPlus /></span>
            Create New Fee
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingFee ? 'Edit Fee' : 'Create New Fee'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">Simple and independent fee creation</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fee Name */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FaFileAlt className="text-lg" />
                  Fee Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tuition Fee, Admission Fee, Transport Fee"
                  value={formData.feeName}
                  onChange={(e) => setFormData({...formData, feeName: e.target.value})}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                />
              </div>

              {/* Fee Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FaTag className="text-lg" />
                  Fee Type *
                </label>
                <select
                  value={formData.feeType}
                  onChange={(e) => setFormData({...formData, feeType: e.target.value})}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                >
                  <option value="recurring">Recurring Fees</option>
                  <option value="fixed">Fixed Fees</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt className="text-lg" />
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  disabled={formData.feeType === 'fixed'}
                  className={`w-full border-2 p-4 rounded-2xl transition-all shadow-sm text-lg ${
                    formData.feeType === 'fixed' 
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300 bg-white hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required={formData.feeType === 'recurring'}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Total Amount */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FaMoneyBillWave className="text-lg" />
                  Total Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter amount in ₹"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Amount Display */}
            {formData.totalAmount && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-blue-800 mb-2">Fee Summary</h4>
                  <div className="text-3xl font-bold text-blue-900">
                    ₹{parseInt(formData.totalAmount || 0).toLocaleString()} 
                    {formData.feeType === 'fixed' ? (
                      <span className="text-lg text-blue-600 ml-2">One Time</span>
                    ) : (
                      <span className="text-lg text-blue-600 ml-2 capitalize">/ {formData.frequency}</span>
                    )}
                  </div>
                  <p className="text-blue-700 mt-2 capitalize">{formData.feeName} - {formData.feeType} Fees</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">
  
  {/* Primary Button */}
  <button
    type="submit"
    disabled={loading}
    className="
      flex items-center justify-center gap-2
      px-10 py-4
      bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600
      text-white text-lg font-semibold
      rounded-2xl
      shadow-[0_10px_30px_rgba(59,130,246,0.4)]
      hover:shadow-[0_15px_40px_rgba(59,130,246,0.6)]
      hover:from-blue-600 hover:to-indigo-700
      transition-all duration-300 ease-in-out
      transform hover:-translate-y-1 hover:scale-[1.02]
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
    "
  >
    {loading ? (
      <>
        <FaSpinner className="animate-spin text-xl" />
        <span>Saving...</span>
      </>
    ) : editingFee ? (
      <>
        <FaEdit className="text-xl" />
        <span>Update Fee</span>
      </>
    ) : (
      <>
        <FaSave className="text-xl" />
        <span>Create Fee</span>
      </>
    )}
  </button>

  {/* Secondary Button */}
  <button
    type="button"
    onClick={() => setShowForm(false)}
    className="
      flex items-center justify-center gap-2
      px-10 py-4
      bg-white/80 backdrop-blur-md
      border border-gray-300
      text-gray-700 text-lg font-semibold
      rounded-2xl
      shadow-md
      hover:bg-red-50 hover:text-red-600 hover:border-red-300
      transition-all duration-300 ease-in-out
      transform hover:-translate-y-1 hover:scale-[1.02]
      active:scale-95
    "
  >
    <FaTimes className="text-xl" />
    <span>Cancel</span>
  </button>

</div>

          </form>
        </div>
      )}

      {/* Fees List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Created Fees ({fees.length})</h3>
          <p className="text-gray-600 text-sm mt-1">Manage all fee structures</p>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">Loading fees...</p>
          </div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4"><FaMoneyBillWave className="mx-auto" /></div>
            <p className="text-gray-500 text-lg font-medium">No fees created yet</p>
            <p className="text-gray-400 mt-2">Click "Create New Fee" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Fee Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Fee Type</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Frequency</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Amount</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, index) => (
                  <tr key={fee._id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaMoneyBillWave className="text-blue-600 font-bold" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{fee.feeName}</div>
                          <div className="text-sm text-gray-500">Created: {new Date(fee.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        fee.feeType === 'recurring' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {fee.feeType} Fees
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {fee.frequency || 'One Time'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-blue-600">
                        ₹{parseInt(fee.totalAmount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{fee.frequency ? `per ${fee.frequency}` : 'One Time'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        fee.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {fee.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(fee)}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(fee._id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                        >
                          <FaTrash /> Delete
                        </button>
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