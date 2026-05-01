import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';

export default function AttendanceDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Substitute Management
  const [substituteTab, setSubstituteTab] = useState(false);
  const [substitutes, setSubstitutes] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [allSections, setAllSections] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchSections();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchAttendance();
    }
    if (substituteTab) {
      fetchSubstitutes();
    }
  }, [selectedClass, selectedSection, date, activeTab, substituteTab]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/staff-panel/class/all');
      setClasses(res.data.classes || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await api.get('/api/section/all?limit=100');
      setAllSections(res.data.sections || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection('');
    
    // Filter sections based on selected class
    const filteredSections = allSections.filter(s => 
      s.assignToClass?._id === classId || s.assignToClass === classId
    );
    setSections(filteredSections);
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/api/teacher/all');
      setTeachers(res.data.teachers || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/attendance/by-date`, {
        params: {
          date,
          type: activeTab === 'students' ? 'student' : 'staff',
          classId: selectedClass,
          sectionId: selectedSection
        }
      });
      setAttendanceData(res.data.attendance || []);
    } catch (err) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubstitutes = async () => {
    try {
      const res = await api.get('/api/attendance/substitute/all');
      setSubstitutes(res.data.substitutes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusOverride = async (id, newStatus) => {
    try {
      await api.put(`/api/attendance/update/${id}`, { status: newStatus, remark: 'Admin Override' });
      toast.success('Attendance status updated');
      fetchAttendance();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const [subForm, setSubForm] = useState({
    substituteTeacherId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState('student');
  const [biometricFile, setBiometricFile] = useState(null);

  const handleAssignSubstitute = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) {
      return toast.warning('Please select a class and section first');
    }
    try {
      await api.post('/api/attendance/substitute/assign', {
        classId: selectedClass,
        sectionId: selectedSection,
        ...subForm
      });
      toast.success('Substitute assigned successfully');
      fetchSubstitutes();
      setSubForm({ substituteTeacherId: '', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      toast.error('Failed to assign substitute');
    }
  };

  const handleBiometricSync = async () => {
    if (!biometricFile) return toast.warning('Please select a CSV file');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const records = [];

      // Skip header, parse CSV (id, timeIn, date)
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const [id, timeIn, recordDate] = lines[i].split(',');
        if (id && timeIn && recordDate) {
          records.push({ id: id.trim(), timeIn: timeIn.trim(), date: recordDate.trim() });
        }
      }

      if (records.length === 0) return toast.error('No valid records found in CSV');

      try {
        setLoading(true);
        const res = await api.post('/api/attendance/biometric/sync', { records, type: biometricType });
        toast.success(res.data.message || 'Biometric sync successful');
        setShowBiometricModal(false);
        setBiometricFile(null);
        if (selectedClass && selectedSection) fetchAttendance();
      } catch (err) {
        toast.error('Biometric sync failed');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(biometricFile);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor daily attendance, sync biometrics, and assign substitute teachers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBiometricModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            <FaClock /> Sync Biometrics
          </button>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('students'); setSubstituteTab(false); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'students' && !substituteTab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaUserGraduate /> Students
          </button>
          <button
            onClick={() => { setSubstituteTab(true); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              substituteTab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaUserEdit /> Substitutes
          </button>
        </div>
      </div>
    </div>

    {!substituteTab ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.className}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s._id} value={s._id}>{s.sectionName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-4 text-slate-500">Loading attendance data...</p>
            ) : attendanceData.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 text-sm">
                    <th className="py-4 px-6 font-semibold">Student Name</th>
                    <th className="py-4 px-6 font-semibold">Marked By</th>
                    <th className="py-4 px-6 font-semibold">Source</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceData.map(record => (
                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">
                          {record.studentId?.firstName} {record.studentId?.lastName}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-sm">
                        {record.overriddenBy ? 'Admin (Overridden)' : (record.source === 'biometric' ? 'Biometric Device' : 'Teacher')}
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-sm capitalize">
                        {record.source || 'manual'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status === 'present' ? <FaCheckCircle /> : record.status === 'absent' ? <FaTimesCircle /> : <FaClock />}
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusOverride(record._id, e.target.value)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="half-day">Half Day</option>
                          <option value="leave">Leave</option>
                          <option value="left-early">Left Early</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-8 text-slate-500">No attendance records found for this selection.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Assign Substitute</h2>
            <form onSubmit={handleAssignSubstitute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Substitute Teacher</label>
                <select
                  value={subForm.substituteTeacherId}
                  onChange={(e) => setSubForm({ ...subForm, substituteTeacherId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={subForm.startDate}
                    onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={subForm.endDate}
                    onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  value={subForm.reason}
                  onChange={(e) => setSubForm({ ...subForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  rows="2"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
                Assign Substitute
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Active Substitutes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 text-sm">
                    <th className="py-3 px-4 font-semibold">Class/Section</th>
                    <th className="py-3 px-4 font-semibold">Teacher</th>
                    <th className="py-3 px-4 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {substitutes.map(sub => (
                    <tr key={sub._id}>
                      <td className="py-3 px-4 font-medium">{sub.classId?.className} - {sub.sectionId?.sectionName}</td>
                      <td className="py-3 px-4 text-slate-600">{sub.substituteTeacherId?.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {new Date(sub.startDate).toLocaleDateString()} to {new Date(sub.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {substitutes.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-500">No substitutes assigned currently.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Sync Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaClock /> Sync Biometric Data
              </h3>
              <button onClick={() => setShowBiometricModal(false)} className="text-white/80 hover:text-white">
                <FaTimesCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sync For</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="bType" value="student" checked={biometricType === 'student'} onChange={() => setBiometricType('student')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Students</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="bType" value="staff" checked={biometricType === 'staff'} onChange={() => setBiometricType('staff')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Staff/Teachers</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setBiometricFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-slate-500 mt-2">Expected format: id, timeIn, date</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBiometricSync}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Syncing...' : 'Start Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
