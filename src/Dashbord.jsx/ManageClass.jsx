import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaGraduationCap, FaPlus, FaEdit, FaTrash, FaUsers, FaTag, FaFileAlt, FaSave, FaTimes } from 'react-icons/fa';

export default function ManageClass() {
  const { classes, addClass, updateClass, deleteClass } = useSchool();
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    capacity: '',
    description: ''
  });

  const handleAddClass = () => {
    setShowForm(true);
    setEditingClass(null);
    setFormData({
      className: '',
      classCode: '',
      capacity: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, formData);
      await showSuccess('Updated!', 'Class updated successfully');
    } else {
      addClass(formData);
      await showSuccess('Added!', 'New class created successfully');
    }
    setShowForm(false);
    setEditingClass(null);
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData(classItem);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Class?', 'This will permanently delete the class and all associated data');
    if (result.isConfirmed) {
      deleteClass(id);
      showToast('success', 'Class deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Manage Classes
              </h1>
              <p className="text-gray-600 mt-1">Create and manage school classes</p>
            </div>
          </div>
          <button 
            onClick={handleAddClass}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
          >
            <span className="text-lg"><FaPlus /></span>
            Add New Class
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center gap-3">
              <FaGraduationCap className="text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">Configure class details and capacity</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaFileAlt className="text-lg" />
                  Class Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Class 1, Class 2, etc."
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaTag className="text-lg" />
                  Class Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g., CLS1, CLS2, etc."
                  value={formData.classCode}
                  onChange={(e) => setFormData({...formData, classCode: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaUsers className="text-lg" />
                Total Class Capacity *
              </label>
              <input
                type="number"
                placeholder="Maximum students for this class"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaFileAlt className="text-lg" />
                Description (Optional)
              </label>
              <textarea
                placeholder="Additional information about this class"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {editingClass ? <><FaEdit /> Update Class</> : <><FaSave /> Add Class</>}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Classes List</h3>
          <p className="text-gray-600 text-sm mt-1">Manage all school classes</p>
        </div>
        
        {classes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4"><FaGraduationCap className="mx-auto" /></div>
            <p className="text-gray-500 text-lg font-medium">No classes created yet</p>
            <p className="text-gray-400 mt-2">Click "Add New Class" to create your first class</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Class Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Class Code</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Capacity</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Description</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem, index) => (
                  <tr key={classItem.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaGraduationCap className="text-blue-600 font-bold" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{classItem.className}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {classItem.classCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-lg" />
                        <span className="font-bold text-gray-900">{classItem.capacity}</span>
                        <span className="text-gray-500 text-sm">students</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {classItem.description || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(classItem)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(classItem.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
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