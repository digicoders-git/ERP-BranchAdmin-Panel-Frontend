import React, { useState } from 'react';

export default function FeesManagement() {
  const [showCreateFee, setShowCreateFee] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [createdFees, setCreatedFees] = useState([]);
  const [feeData, setFeeData] = useState({
    feeName: '',
    feeType: 'Recurring Fees',
    frequency: 'Monthly',
    totalAmount: ''
  });

  const handleCreateFee = () => {
    setShowCreateFee(true);
    setEditingFee(null);
    setFeeData({
      feeName: '',
      feeType: 'Recurring Fees',
      frequency: 'Monthly',
      totalAmount: ''
    });
  };

  const handleEditFee = (fee) => {
    setFeeData(fee);
    setEditingFee(fee);
    setShowCreateFee(true);
  };

  const handleDeleteFee = (id) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      setCreatedFees(createdFees.filter(fee => fee.id !== id));
    }
  };

  const handleViewDetails = (fee) => {
    setSelectedFee(fee);
    setShowDetails(true);
  };

  const handleInputChange = (field, value) => {
    setFeeData({ ...feeData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const feeStructure = {
      ...feeData,
      id: editingFee ? editingFee.id : Date.now(),
      createdDate: editingFee ? editingFee.createdDate : new Date().toLocaleDateString(),
      status: 'Active'
    };
    
    if (editingFee) {
      setCreatedFees(createdFees.map(fee => fee.id === editingFee.id ? feeStructure : fee));
    } else {
      setCreatedFees([...createdFees, feeStructure]);
    }
    
    setShowCreateFee(false);
    setEditingFee(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Fees Management
              </h1>
              <p className="text-gray-600 mt-1">Create and manage fee structures independently</p>
            </div>
          </div>
          <button 
            onClick={handleCreateFee}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
          >
            <span className="text-lg">➕</span>
            Create Fees
          </button>
        </div>
      </div>

      {showCreateFee && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingFee ? 'Edit Fee' : 'Create Fees'}
                </h3>
                <p className="text-purple-100 text-sm mt-1">Simple fee structure creation</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fee Name */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Fee Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tuition Fee, Admission Fee, Transport Fee"
                  value={feeData.feeName}
                  onChange={(e) => handleInputChange('feeName', e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                />
              </div>

              {/* Fee Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Fee Type *
                </label>
                <select
                  value={feeData.feeType}
                  onChange={(e) => handleInputChange('feeType', e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                >
                  <option value="Recurring Fees">Recurring Fees</option>
                  <option value="Fixed Fees">Fixed Fees</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Frequency *
                </label>
                <select
                  value={feeData.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              {/* Total Amount */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Total Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter amount in ₹"
                  value={feeData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-lg"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Amount Display */}
            {feeData.totalAmount && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-purple-800 mb-2">Fee Summary</h4>
                  <div className="text-3xl font-bold text-purple-900">
                    ₹{parseInt(feeData.totalAmount || 0).toLocaleString()} 
                    <span className="text-lg text-purple-600 ml-2">/ {feeData.frequency}</span>
                  </div>
                  <p className="text-purple-700 mt-2">{feeData.feeName} - {feeData.feeType}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-purple-600 hover:to-purple-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                {editingFee ? '✏️ Update Fee' : '💾 Create Fee'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateFee(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-10 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fee Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Fee Details</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedFee?.feeName}</h2>
                <p className="text-gray-600 mt-1">{selectedFee?.feeType}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-2xl">
                  <h4 className="font-bold mb-3 text-purple-800 flex items-center gap-2">
                    <span>💳</span> Payment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Amount:</span> ₹{selectedFee?.totalAmount}</p>
                    <p><span className="font-medium">Frequency:</span> {selectedFee?.frequency}</p>
                    <p><span className="font-medium">Type:</span> {selectedFee?.feeType}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <h4 className="font-bold mb-3 text-blue-800 flex items-center gap-2">
                    <span>📋</span> Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {selectedFee?.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Created:</span> {selectedFee?.createdDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Created Fees List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Created Fees ({createdFees.length})</h3>
          <p className="text-gray-600 text-sm mt-1">Manage all fee structures</p>
        </div>
        
        {createdFees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-gray-500 text-lg font-medium">No fees created yet</p>
            <p className="text-gray-400 mt-2">Click "Create Fees" to get started</p>
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
                {createdFees.map((fee, index) => (
                  <tr key={fee.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <span className="text-purple-600 font-bold">💰</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{fee.feeName}</div>
                          <div className="text-sm text-gray-500">Created: {fee.createdDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        fee.feeType === 'Recurring Fees' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {fee.feeType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {fee.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-purple-600">
                        ₹{parseInt(fee.totalAmount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per {fee.frequency.toLowerCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(fee)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          👁️ View
                        </button>
                        <button 
                          onClick={() => handleEditFee(fee)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFee(fee.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          🗑️ Delete
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