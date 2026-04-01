import React, { useState } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaChalkboardTeacher, FaPlus, FaCamera, FaFolder, FaTrash, FaInfoCircle, FaEdit, FaEye, FaTasks, FaClock, FaUser } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { MdDone, MdAssignment } from "react-icons/md";

export default function ManageTeacher() {
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    category: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    subjects: [],
    email: '',
    password: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    salary: '',
    image: null,
    imagePreview: null
  });
  const [currentSubject, setCurrentSubject] = useState('');

  const handleAddTeacher = () => {
    setShowForm(true);
    setEditingTeacher(null);
    setFormData({
      name: '',
      subjects: [],
      email: '',
      password: '',
      phone: '',
      address: '',
      qualification: '',
      experience: '',
      salary: '',
      image: null,
      imagePreview: null
    });
    setCurrentSubject('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      showError('Error', 'Please add at least one teaching subject');
      return;
    }
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...formData, id: editingTeacher.id, status: 'Active' } : t));
      await showSuccess('Updated!', 'Teacher profile updated successfully');
    } else {
      const newTeacher = { ...formData, id: Date.now(), status: 'Active' };
      setTeachers([...teachers, newTeacher]);
      await showSuccess('Added!', 'New teacher added successfully');
    }
    setShowForm(false);
    setEditingTeacher(null);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addSubject = () => {
    if (currentSubject.trim() && !formData.subjects.includes(currentSubject.trim())) {
      setFormData({...formData, subjects: [...formData.subjects, currentSubject.trim()]});
      setCurrentSubject('');
    }
  };

  const removeSubject = (subjectToRemove) => {
    setFormData({...formData, subjects: formData.subjects.filter(subject => subject !== subjectToRemove)});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubject();
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: null
    });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Teacher?', 'This will permanently delete the teacher profile');
    if (result.isConfirmed) {
      setTeachers(teachers.filter(t => t.id !== id));
      showToast('success', 'Teacher deleted successfully');
    }
  };

  const toggleStatus = (id) => {
    setTeachers(teachers.map(t => 
      t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t
    ));
  };

  const handleAssignTask = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTaskForm(true);
    setTaskData({
      title: '',
      description: '',
      priority: 'Medium',
      deadline: '',
      category: ''
    });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      ...taskData,
      id: Date.now(),
      assignedTo: selectedTeacher.name,
      teacherId: selectedTeacher.id,
      status: 'Pending',
      assignedDate: new Date().toLocaleDateString()
    };
    
    setTeachers(teachers.map(t => 
      t.id === selectedTeacher.id 
        ? { ...t, tasks: [...(t.tasks || []), newTask] }
        : t
    ));
    
    setShowTaskForm(false);
    setSelectedTeacher(null);
    await showSuccess('Task Assigned!', `Task "${taskData.title}" assigned to ${selectedTeacher.name}`);
  };

  const [showViewTeacher, setShowViewTeacher] = useState(false);
  const [viewingTeacherDetails, setViewingTeacherDetails] = useState(null);

  const handleViewTeacher = (teacher) => {
    setViewingTeacherDetails(teacher);
    setShowViewTeacher(true);
  };

  const handleViewTasks = (teacher) => {
    setViewingTeacher(teacher);
    setShowTaskView(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline,
      category: task.category
    });
    setShowEditTaskForm(true);
  };

  const handleTaskUpdate = async (e) => {
    e.preventDefault();
    setTeachers(teachers.map(t => 
      t.id === viewingTeacher.id 
        ? {
            ...t, 
            tasks: t.tasks.map(task => 
              task.id === editingTask.id 
                ? { ...task, ...taskData }
                : task
            )
          }
        : t
    ));
    
    setViewingTeacher({
      ...viewingTeacher,
      tasks: viewingTeacher.tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      )
    });
    
    setShowEditTaskForm(false);
    setEditingTask(null);
    await showSuccess('Task Updated!', `Task "${taskData.title}" updated successfully`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl sm:text-2xl font-bold"><FaChalkboardTeacher /></span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Teachers</h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage teacher profiles and assign tasks</p>
            </div>
          </div>
          <button 
            onClick={handleAddTeacher}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg"><FaPlus /></span>
            Add New Teacher
          </button>
        </div>
      </div>

      {showTaskForm && (
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><MdAssignment /> Assign Task to {selectedTeacher?.name}</h3>
          </div>
          <form onSubmit={handleTaskSubmit} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Task Title *</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Priority</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Deadline *</label>
              <input
                type="date"
                value={taskData.deadline}
                onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Category *</label>
              <input
                type="text"
                placeholder="e.g., Teaching, Admin"
                value={taskData.category}
                onChange={(e) => setTaskData({...taskData, category: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Task Description *</label>
              <textarea
                placeholder="Enter detailed task description"
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                rows="4"
                required
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 font-bold transition-all flex items-center gap-2">
                <MdAssignment /> Assign Task
              </button>
              <button 
                type="button" 
                onClick={() => setShowTaskForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 font-bold transition-all flex items-center gap-2"
              >
                <IoClose /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <FaChalkboardTeacher className="text-xl sm:text-2xl" />
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h3>
            <p className="text-blue-100 mt-1 sm:mt-2 text-xs sm:text-sm">Configure teacher profile and details</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Image Upload Section */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaCamera className="text-lg" />
                Profile Image
              </label>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Image Preview Circle */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      {formData.imagePreview ? (
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <FaUser className="text-4xl mb-2 text-gray-400" />
                          <p className="text-xs font-medium">No Photo</p>
                        </div>
                      )}
                    </div>
                    {formData.imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg flex items-center justify-center text-sm"
                      >
                        <IoClose />
                      </button>
                    )}
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Upload Teacher Avatar</h3>
                    <p className="text-gray-600 mb-4 text-sm">Choose a professional photo for teacher profile</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <label className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <FaFolder className="text-base" />
                        Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      
                      {formData.imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <FaTrash className="text-base" />
                          Remove Photo
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium flex items-center gap-2">
                        <FaInfoCircle />
                        Supported: JPG, PNG, GIF • Max size: 5MB • Recommended: 400x400px
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Teacher Name *</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Teaching Subjects *</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter subject name"
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm flex items-center gap-1"
                  >
                    <FaPlus /> Add
                  </button>
                </div>
                {formData.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => removeSubject(subject)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <IoClose />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {formData.subjects.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No subjects added yet. Add subjects using the input above.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Email *</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Password *</label>
              <input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Phone Number *</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Qualification *</label>
              <input
                type="text"
                placeholder="Educational qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Experience *</label>
              <input
                type="text"
                placeholder="Years of experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Salary *</label>
              <input
                type="number"
                placeholder="Monthly salary"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Address *</label>
              <textarea
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border-2 border-gray-300 p-2 sm:p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                rows="3"
                required
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button type="submit" className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-blue-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base flex items-center gap-2 justify-center">
                {editingTeacher ? <><FaEdit /> Update Teacher</> : <><MdDone /> Add Teacher</>}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="bg-gray-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-gray-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base flex items-center gap-2 justify-center"
              >
                <IoClose /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showTaskView && (
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FaTasks /> Tasks for {viewingTeacher?.name}
              </h3>
              <button 
                onClick={() => setShowTaskView(false)}
                className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg hover:bg-opacity-30 transition-all font-medium"
              >
                <IoClose /> Close
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {!viewingTeacher?.tasks || viewingTeacher.tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4"><FaTasks className="mx-auto" /></div>
                <p className="text-gray-500 text-lg font-medium">No tasks assigned yet</p>
                <p className="text-gray-400">Click "Assign" to add tasks</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-sm text-gray-800">Task Title</th>
                      <th className="px-4 py-3 text-left font-bold text-sm text-gray-800">Priority</th>
                      <th className="px-4 py-3 text-left font-bold text-sm text-gray-800">Deadline</th>
                      <th className="px-4 py-3 text-left font-bold text-sm text-gray-800">Category</th>
                      <th className="px-4 py-3 text-left font-bold text-sm text-gray-800">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-sm text-gray-800">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingTeacher.tasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-sm">{task.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                            task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-sm">{task.deadline}</td>
                        <td className="px-4 py-3 font-medium text-sm">{task.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {task.status === 'Completed' ? <><MdDone className="inline mr-1" /> Completed</> : <><FaClock className="inline mr-1" /> Pending</>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleEditTask(task)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors font-medium flex items-center gap-1"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditTaskForm && (
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FaEdit /> Edit Task
            </h3>
          </div>
          <form onSubmit={handleTaskUpdate} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Task Title *"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              required
            />
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={taskData.deadline}
              onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              required
            />
            <input
              type="text"
              placeholder="Category *"
              value={taskData.category}
              onChange={(e) => setTaskData({...taskData, category: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              required
            />
            <textarea
              placeholder="Task Description *"
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              className="border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 md:col-span-2 text-sm font-medium"
              rows="3"
              required
            />
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold transition-all flex items-center gap-2 justify-center">
                <MdDone /> Update Task
              </button>
              <button 
                type="button" 
                onClick={() => setShowEditTaskForm(false)}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 font-bold transition-all flex items-center gap-2 justify-center"
              >
                <IoClose /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showViewTeacher && (
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-200 overflow-hidden">
          <div className="bg-emerald-600 p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FaEye /> Teacher Details - {viewingTeacherDetails?.name}
              </h3>
              <button 
                onClick={() => setShowViewTeacher(false)}
                className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg hover:bg-opacity-30 transition-all font-medium"
              >
                <IoClose /> Close
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Image Display */}
            <div className="md:col-span-2 flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                {viewingTeacherDetails?.imagePreview ? (
                  <img 
                    src={viewingTeacherDetails.imagePreview} 
                    alt={viewingTeacherDetails.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                    {viewingTeacherDetails?.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Teacher Name</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                {viewingTeacherDetails?.name}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Subjects</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                {viewingTeacherDetails?.subjects && viewingTeacherDetails.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingTeacherDetails.subjects.map((subject, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No subjects assigned</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Email</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                {viewingTeacherDetails?.email}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Phone Number</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                {viewingTeacherDetails?.phone}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Qualification</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                {viewingTeacherDetails?.qualification}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Experience</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                {viewingTeacherDetails?.experience}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Salary</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800">
                ₹{viewingTeacherDetails?.salary}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Address</label>
              <div className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-xl bg-gray-50 text-sm sm:text-base font-medium text-gray-800 min-h-[80px]">
                {viewingTeacherDetails?.address}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-center">
              <button 
                onClick={() => setShowViewTeacher(false)}
                className="bg-emerald-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-emerald-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                <MdDone /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Teachers List</h3>
        </div>
        {teachers.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="text-4xl sm:text-6xl mb-4"><FaChalkboardTeacher className="mx-auto" /></div>
            <p className="text-gray-500 text-base sm:text-lg">No teachers added yet</p>
            <p className="text-gray-400 text-sm sm:text-base">Click "Add New Teacher" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Name</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Subject</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Email</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Phone</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Tasks</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, index) => (
                  <tr key={teacher.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold mr-2 sm:mr-3 text-xs sm:text-base overflow-hidden">
                          {teacher.imagePreview ? (
                            <img 
                              src={teacher.imagePreview} 
                              alt={teacher.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                              {teacher.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{teacher.name}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 font-medium text-sm sm:text-base">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No subjects</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 font-medium text-sm sm:text-base">{teacher.email}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 font-medium text-sm sm:text-base">{teacher.phone}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {teacher.tasks ? teacher.tasks.length : 0} tasks
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <button 
                        onClick={() => toggleStatus(teacher.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-all ${
                          teacher.status === 'Active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          teacher.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {teacher.status}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="overflow-x-auto">
                        <div className="flex gap-2 min-w-max pb-2 sm:pb-0">
                          <button 
                            onClick={() => handleEdit(teacher)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center gap-1 justify-center shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            onClick={() => handleAssignTask(teacher)}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center gap-1 justify-center shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                          >
                            <FaTasks /> Assign
                          </button>
                          <button 
                            onClick={() => handleViewTeacher(teacher)}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center gap-1 justify-center shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                          >
                            <FaEye /> View
                          </button>
                          <button 
                            onClick={() => handleViewTasks(teacher)}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center gap-1 justify-center shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                          >
                            <FaTasks /> Tasks
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-1 justify-center shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
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