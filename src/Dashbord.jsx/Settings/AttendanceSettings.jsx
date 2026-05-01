import React, { useState, useEffect } from 'react';
import { 
  FaFingerprint, 
  FaUserEdit, 
  FaMobileAlt, 
  FaSync, 
  FaSave,
  FaRobot,
  FaUserGraduate,
  FaUserTie
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../api';

export default function AttendanceSettings() {
  const [settings, setSettings] = useState({
    studentMode: 'manual',
    staffMode: 'manual'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/staff-panel/attendance-config/settings');
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/api/staff-panel/attendance-config/settings', settings);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Attendance methods updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const modes = [
    { id: 'manual', label: 'Manual Only', desc: 'Mark manually', icon: FaUserEdit, activeClass: 'border-blue-500 bg-blue-50', iconClass: 'bg-blue-100 text-blue-600' },
    { id: 'biometric', label: 'Biometric Only', desc: 'Only device logs', icon: FaFingerprint, activeClass: 'border-purple-500 bg-purple-50', iconClass: 'bg-purple-100 text-purple-600' },
    { id: 'hybrid', label: 'Hybrid Mode', desc: 'Auto-fill + Manual', icon: FaSync, activeClass: 'border-green-500 bg-green-50', iconClass: 'bg-green-100 text-green-600' },
    { id: 'app', label: 'Mobile/App Based', desc: 'Self check-in', icon: FaMobileAlt, activeClass: 'border-orange-500 bg-orange-50', iconClass: 'bg-orange-100 text-orange-600' }
  ];

  if (loading) return <div className="text-center py-10">Loading configuration...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <form onSubmit={handleUpdate} className="space-y-10">
        
        {/* Student Attendance Mode */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <FaUserGraduate />
            </div>
            Student Attendance Method
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map(m => (
              <label 
                key={m.id} 
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  settings.studentMode === m.id ? m.activeClass : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="studentMode" 
                  value={m.id} 
                  checked={settings.studentMode === m.id}
                  onChange={(e) => setSettings({ ...settings, studentMode: e.target.value })}
                  className="absolute top-4 right-4"
                />
                <div className={`p-3 rounded-full ${m.iconClass}`}>
                  <m.icon className="text-2xl" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900">{m.label}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{m.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Staff Attendance Mode */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <FaUserTie />
            </div>
            Staff Attendance Method
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map(m => (
              <label 
                key={m.id} 
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  settings.staffMode === m.id ? m.activeClass : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="staffMode" 
                  value={m.id} 
                  checked={settings.staffMode === m.id}
                  onChange={(e) => setSettings({ ...settings, staffMode: e.target.value })}
                  className="absolute top-4 right-4"
                />
                <div className={`p-3 rounded-full ${m.iconClass}`}>
                  <m.icon className="text-2xl" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900">{m.label}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{m.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
          >
            <FaSave className="text-xl" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
