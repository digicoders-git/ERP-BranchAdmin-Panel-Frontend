import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaTrash, 
  FaBook, 
  FaClock, 
  FaChalkboardTeacher,
  FaChevronDown,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import api from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { id: 1, name: 'Period 1', time: '08:00 - 09:00' },
  { id: 2, name: 'Period 2', time: '09:00 - 10:00' },
  { id: 3, name: 'Period 3', time: '10:00 - 11:00' },
  { id: 4, name: 'Period 4', time: '11:00 - 12:00' },
  { id: 5, name: 'Period 5', time: '12:30 - 01:30' },
  { id: 6, name: 'Period 6', time: '01:30 - 02:30' },
  { id: 7, name: 'Period 7', time: '02:30 - 03:30' },
  { id: 8, name: 'Period 8', time: '03:30 - 04:30' },
];

export default function TimetableBuilder() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetableData, setTimetableData] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState({ day: '', period: null });
  const [formData, setFormData] = useState({
    subject: '',
    teacherId: '',
    room: '',
    startTime: '',
    endTime: ''
  });
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  const fetchData = async () => {
    try {
      const [clsRes, secRes, teaRes, schoolRes] = await Promise.all([
        api.get('/api/class/all'),
        api.get('/api/section/all?limit=100'),
        api.get('/api/teacher/all?limit=500'),
        api.get('/api/branch-admin/profile')
      ]);
      setClasses(clsRes.data.classes || []);
      setSections(secRes.data.sections || []);
      setTeachers(teaRes.data.teachers || []);
      setSchoolInfo(schoolRes.data?.data?.branch || null);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchTimetable = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/timetable/all?classId=${selectedClass}&sectionId=${selectedSection}`);
      setTimetableData(data.timetables || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch timetable', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchTimetable(); }, [selectedClass, selectedSection]);

  const handleOpenModal = (day, periodObj) => {
    const existing = timetableData.find(t => t.day === day && t.periodNumber === periodObj.id);
    setCurrentSlot({ day, period: periodObj });
    
    const teacherId = existing?.teacherId?._id || existing?.teacherId || '';
    const teacher = teachers.find(t => t._id === teacherId);
    
    setFormData({
      subject: existing?.subject || '',
      teacherId: teacherId,
      room: existing?.room || '',
      startTime: existing?.startTime || periodObj.time.split(' - ')[0],
      endTime: existing?.endTime || periodObj.time.split(' - ')[1]
    });
    setTeacherSearch(teacher?.name || '');
    setShowModal(true);
  };

  const handleSavePeriod = async () => {
    if (!formData.subject || !formData.teacherId) {
      return Swal.fire('Missing Information', 'Please select both Subject and Teacher.', 'info');
    }

    setSaving(true);
    try {
      const teacher = teachers.find(t => t._id === formData.teacherId);
      const sub = formData.subject.toLowerCase().trim();
      const isAuthorized = teacher?.subjects?.some(s => s.toLowerCase().trim() === sub);

      if (!isAuthorized) {
        setSaving(false);
        return Swal.fire({
          title: 'Specialization Required',
          text: `${teacher?.name || 'Teacher'} is not qualified for "${formData.subject}".`,
          icon: 'error'
        });
      }

      const cls = classes.find(c => c._id === selectedClass);
      const classNameWithStream = cls ? `${cls.className}${cls.stream?.length > 0 ? ` (${cls.stream.join(', ')})` : ''}` : '';

      const payload = {
        ...formData,
        day: currentSlot.day,
        periodNumber: currentSlot.period.id,
        classId: selectedClass,
        className: classNameWithStream,
        sectionId: selectedSection,
        teacherName: teacher?.name
      };

      const existing = timetableData.find(t => t.day === currentSlot.day && t.periodNumber === currentSlot.period.id);
      
      if (existing) {
        await api.put(`/api/timetable/${existing._id}`, payload);
      } else {
        await api.post('/api/timetable/add', payload);
      }

      fetchTimetable();
      setShowModal(false);
      toast('Schedule updated successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      if (msg.toLowerCase().includes('conflict')) {
        toast(msg, 'warning');
      } else {
        Swal.fire('Error', msg, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePeriod = async (id) => {
    const res = await Swal.fire({ 
      title: 'Remove this period?', 
      text: 'This action cannot be undone.',
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    });

    if (res.isConfirmed) {
      try {
        await api.delete(`/api/timetable/${id}`);
        fetchTimetable();
        toast('Period removed', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete', 'error');
      }
    }
  };

  const toast = (title, icon) => {
    Swal.fire({
      title,
      icon,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: icon === 'warning' ? 5000 : 3000,
      timerProgressBar: true,
      width: '400px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-slate-100'
      }
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6 bg-[#f8fafc] min-h-screen">
      {/* Premium Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Academic Timetable</h1>
              <p className="text-slate-500 text-sm">Organize and manage class schedules</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Class & Stream</label>
              <div className="relative">
                <select 
                  value={selectedClass} 
                  onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }} 
                  className="appearance-none bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-w-[220px]"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.className} {c.stream?.length > 0 ? `(${c.stream.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Section</label>
              <div className="relative">
                <select 
                  value={selectedSection} 
                  onChange={(e) => setSelectedSection(e.target.value)} 
                  className="appearance-none bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-w-[140px] disabled:opacity-50"
                  disabled={!selectedClass}
                >
                  <option value="">Section</option>
                  {sections
                    .filter(s => s.assignToClass?._id === selectedClass || s.assignToClass === selectedClass)
                    .map(s => (
                      <option key={s._id} value={s._id}>Section {s.sectionName}</option>
                    ))
                  }
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]" />
              </div>
            </div>

            <button 
              onClick={handlePrint}
              disabled={!selectedSection}
              className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              Print Schedule
            </button>
            <button 
              onClick={fetchTimetable}
              className="mt-5 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center gap-2"
            >
              <FaFilter size={12} /> Apply
            </button>
          </div>
        </div>
      </div>

      {!selectedSection ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FaCalendarAlt className="text-3xl text-slate-300" />
          </div>
          <h2 className="text-lg font-bold text-slate-600 mb-2">Ready to Schedule?</h2>
          <p className="text-slate-400 max-w-sm">Please select a class and section from the menu above to start building the weekly timetable.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Active Schedule Info Bar */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Weekly Schedule</span>
              <h2 className="font-bold text-slate-700">
                {classes.find(c => c._id === selectedClass)?.className} - Section {sections.find(s => s._id === selectedSection)?.sectionName}
              </h2>
            </div>
            {loading && <div className="flex items-center gap-2 text-blue-600 text-xs font-bold animate-pulse"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Syncing...</div>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-white">
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-r border-slate-100 sticky left-0 bg-white z-20">Day / Period</th>
                  {PERIODS.map(p => (
                    <React.Fragment key={p.id}>
                      {p.id === 5 && (
                        <th className="p-5 text-center min-w-[60px] border-b border-r border-slate-100 bg-amber-50/30">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60">Break</span>
                        </th>
                      )}
                      <th className="p-5 border-b border-r border-slate-100 group min-w-[160px]">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 group-hover:text-blue-600 transition-colors">{p.name}</div>
                        <div className="text-sm font-bold text-slate-700">{p.time}</div>
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-700 bg-white border-r border-b border-slate-100 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                      {day}
                    </td>
                    {PERIODS.map(period => {
                      const slot = timetableData.find(t => t.day === day && t.periodNumber === period.id);
                      return (
                        <React.Fragment key={period.id}>
                          {period.id === 5 && (
                            <td className="p-0 border-r border-b border-slate-100 bg-amber-50/20 text-center">
                              <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600/40 py-4">Lunch</div>
                            </td>
                          )}
                          <td className="p-3 border-r border-b border-slate-100 group">
                            {slot ? (
                              <div 
                                onClick={() => handleOpenModal(day, period)}
                                className="bg-white border border-slate-200 rounded-xl p-3 h-full min-h-[90px] flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                              >
                                <div>
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-800 line-clamp-1">{slot.subject}</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeletePeriod(slot._id); }}
                                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <FaTrash size={10} />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <FaChalkboardTeacher size={10} className="text-slate-400" />
                                    <span className="text-[11px] font-medium truncate">{slot.teacherId?.name || slot.teacherName}</span>
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                    <FaClock size={8} />
                                    <span>{slot.startTime}</span>
                                  </div>
                                  {slot.room && (
                                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">R: {slot.room}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleOpenModal(day, period)}
                                className="w-full h-[90px] border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all group/btn"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover/btn:bg-blue-50 transition-colors">
                                  <FaPlus size={12} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider">Schedule</span>
                              </button>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Assign Period</h3>
                <p className="text-slate-500 text-xs font-medium">{currentSlot.day} • {currentSlot.period.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Assigned Teacher - Searchable */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Teacher</label>
                <div className="relative">
                  <FaChalkboardTeacher className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input 
                    type="text" 
                    placeholder="Search Teacher..." 
                    value={teacherSearch} 
                    onChange={(e) => {
                      setTeacherSearch(e.target.value);
                      setShowTeacherDropdown(true);
                    }}
                    onFocus={() => setShowTeacherDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700" 
                  />
                </div>
                
                {showTeacherDropdown && (
                  <div className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                    {teachers
                      .filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                      .map(t => (
                        <div 
                          key={t._id} 
                          onClick={() => {
                            setFormData({...formData, teacherId: t._id, subject: ''});
                            setTeacherSearch(t.name);
                            setShowTeacherDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          <div className="text-sm font-bold text-slate-700">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{t.subjects?.join(', ') || 'No subjects assigned'}</div>
                        </div>
                      ))
                    }
                    {teachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">No teachers found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Subject Selection - Dependent on Teacher */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                <div className="relative">
                  <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <select 
                    disabled={!formData.teacherId}
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    className="appearance-none w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <option value="">{formData.teacherId ? 'Select Subject' : 'Select Teacher First'}</option>
                    {teachers.find(t => t._id === formData.teacherId)?.subjects?.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                    {/* Allow manual entry if needed, but the user requested teacher subjects */}
                    <option value="" disabled className="border-t">—— OR ENTER MANUALLY ——</option>
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]" />
                </div>
                {!formData.teacherId && <p className="text-[9px] font-bold text-slate-400 mt-1 italic">* Please select a teacher to view their subjects</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
                  <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-semibold text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">End Time</label>
                  <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-semibold text-slate-700" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Room / Lab (Optional)</label>
                <input type="text" placeholder="e.g. 101" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700" />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSavePeriod} 
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Schedule'}
                </button>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="px-6 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Print-Only Section (Hidden in UI) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[1000] p-8 overflow-auto">
        {/* Header with Logo & Info */}
        <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8">
          <div className="flex items-center gap-6">
            {schoolInfo?.logo && (
              <img 
                src={schoolInfo.logo.startsWith('http') ? schoolInfo.logo : `${BASE_URL}/${schoolInfo.logo}`} 
                alt="Logo" 
                className="w-20 h-20 object-contain grayscale" 
              />
            )}
            <div>
              <h1 className="text-2xl font-bold uppercase text-black">{schoolInfo?.branchName || 'ACADEMIC INSTITUTION'}</h1>
              <p className="text-sm font-bold text-black opacity-80">{schoolInfo?.address || 'School Address Not Provided'}</p>
              <p className="text-xs font-medium text-black opacity-60">Phone: {schoolInfo?.phone || 'N/A'} | Email: {schoolInfo?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase border-2 border-black px-4 py-1">Weekly Schedule</h2>
            <p className="text-xs font-bold mt-1">Academic Year: 2024-25</p>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="grid grid-cols-3 gap-4 mb-6 border-2 border-black p-4 rounded-lg bg-gray-50">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500">Class:</span>
            <p className="font-bold text-sm">{classes.find(c => c._id === selectedClass)?.className}</p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500">Stream:</span>
            <p className="font-bold text-sm">{classes.find(c => c._id === selectedClass)?.stream?.join(', ') || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500">Section:</span>
            <p className="font-bold text-sm">{sections.find(s => s._id === selectedSection)?.sectionName}</p>
          </div>
        </div>

        {/* Print Table */}
        <table className="w-full border-collapse border-2 border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-2 border-black p-2 font-bold uppercase w-20">Day</th>
              {PERIODS.map(p => (
                <React.Fragment key={p.id}>
                  {p.id === 5 && (
                    <th className="border-2 border-black p-2 font-bold uppercase bg-gray-200">Break</th>
                  )}
                  <th className="border-2 border-black p-2 font-bold uppercase">
                    <div>{p.name}</div>
                    <div className="text-[8px] opacity-60">{p.time}</div>
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day}>
                <td className="border-2 border-black p-2 font-bold uppercase bg-gray-50">{day}</td>
                {PERIODS.map(period => {
                  const slot = timetableData.find(t => t.day === day && t.periodNumber === period.id);
                  return (
                    <React.Fragment key={period.id}>
                      {period.id === 5 && (
                        <td className="border-2 border-black p-1 text-center font-bold opacity-20 bg-gray-100 text-[8px]">LUNCH</td>
                      )}
                      <td className="border-2 border-black p-1 text-center h-12">
                        {slot ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="font-bold text-black leading-tight text-[10px]">{slot.subject}</div>
                            <div className="text-[8px] font-bold text-gray-600 truncate">{slot.teacherName}</div>
                            {slot.room && <div className="text-[7px] font-bold text-gray-400">R: {slot.room}</div>}
                          </div>
                        ) : (
                          <div className="text-gray-300">—</div>
                        )}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-12 flex justify-between items-end">
          <div className="border-t border-black pt-2 w-48 text-center">
            <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-400 italic">Printed on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Global Style for Printing */}
      <style>{`
        @media print {
          @page { margin: 5mm; size: landscape; }
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1.5pt solid black !important; page-break-inside: avoid; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
    </div>
  );
}
