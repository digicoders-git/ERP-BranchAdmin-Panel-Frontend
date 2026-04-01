import React, { useState } from 'react';

export default function Charges() {
  const [showForm, setShowForm] = useState(false);
  const [charges, setCharges] = useState([
    { id: 1, chargeName: 'Room Rent', hostel: 'Boys Hostel A', amount: 5000, frequency: 'Monthly' },
    { id: 2, chargeName: 'Mess Fee', hostel: 'All Hostels', amount: 3000, frequency: 'Monthly' },
    { id: 3, chargeName: 'Security Deposit', hostel: 'All Hostels', amount: 10000, frequency: 'One Time' }
  ]);
  
  const [formData, setFormData] = useState({
    chargeName: '',
    hostel: 'All Hostels',
    amount: '',
    frequency: 'Monthly'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCharge = {
      id: Date.now(),
      ...formData,
      amount: parseInt(formData.amount)
    };
    setCharges([...charges, newCharge]);
    setShowForm(false);
    setFormData({ chargeName: '', hostel: 'All Hostels', amount: '', frequency: 'Monthly' });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hostel Charges</h2>
          <p className="text-gray-600">Manage hostel fees and charges</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 font-bold transition-all duration-300"
        >
          Add Charge
        </button>
      </div>

      {/* Add Charge Form */}
      {showForm && (
        <div className="bg-white/50 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Add New Charge</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Charge Name"
              value={formData.chargeName}
              onChange={(e) => setFormData({...formData, chargeName: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            />
            <select
              value={formData.hostel}
              onChange={(e) => setFormData({...formData, hostel: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="All Hostels">All Hostels</option>
              <option value="Boys Hostel A">Boys Hostel A</option>
              <option value="Girls Hostel B">Girls Hostel B</option>
              <option value="Mixed Hostel C">Mixed Hostel C</option>
            </select>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
              min="1"
              required
            />
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="One Time">One Time</option>
            </select>
          </form>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 font-bold"
            >
              Add Charge
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Charges List */}
      <div className="bg-white/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-gray-800">Charge Name</th>
                <th className="px-6 py-4 text-left font-bold text-gray-800">Hostel</th>
                <th className="px-6 py-4 text-left font-bold text-gray-800">Amount</th>
                <th className="px-6 py-4 text-left font-bold text-gray-800">Frequency</th>
                <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge, index) => (
                <tr key={charge.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-6 py-4 font-bold text-gray-900">{charge.chargeName}</td>
                  <td className="px-6 py-4">{charge.hostel}</td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-green-600">
                      ₹{charge.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {charge.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mr-2">
                      Edit
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
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