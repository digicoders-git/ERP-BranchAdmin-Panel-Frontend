import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { showSuccess, showError, showConfirm, showToast, showWarning } from '../utils/sweetAlert';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash, FaUsers, FaTag, FaGraduationCap, FaFileAlt, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function ManageSection() {
  const { sections, classes, addSection, updateSection, deleteSection } = useSchool();
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    sectionName: '',
    assignedClass: '',
    capacity: '',
    description: ''
  });

  const handleAddSection = async () => {
    if (classes.length === 0) {
      await showWarning('Classes Required!', 'Please create classes first before adding sections!');
      return;
    }
    setShowForm(true);
    setEditingSection(null);
    setFormData({
      sectionName: '',
      assignedClass: '',
      capacity: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSection) {
      updateSection(editingSection.id, formData);
      await showSuccess('Updated!', 'Section updated successfully');
    } else {
      addSection(formData);
      await showSuccess('Added!', 'New section created successfully');
    }
    setShowForm(false);
    setEditingSection(null);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData(section);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('Delete Section?', 'This will permanently delete the section and all associated data');
    if (result.isConfirmed) {
      deleteSection(id);
      showToast('success', 'Section deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaLayerGroup className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Manage Sections
              </h1>
              <p className="text-gray-600 mt-1">Create sections and assign them to classes</p>
            </div>
          </div>
          <button 
            onClick={handleAddSection}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
          >
            <span className="text-lg"><FaPlus /></span>
            Add New Section
          </button>
        </div>
      </div>

      {/* Classes Required Notice */}
      {classes.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-2xl">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl text-yellow-600" />
            <div>
              <h3 className="text-lg font-bold text-yellow-800">Classes Required</h3>
              <p className="text-yellow-700 mt-1">
                You need to create classes first before you can add sections. 
                <a href="/manage-class" className="font-semibold underline ml-1">Go to Manage Classes</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h3>
                <p className="text-green-100 text-sm mt-1">Configure section details and assign to class</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaTag className="text-lg" />
                  Section Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., A, B, C, Alpha, Beta"
                  value={formData.sectionName}
                  onChange={(e) => setFormData({...formData, sectionName: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaGraduationCap className="text-lg" />
                  Assign to Class *
                </label>
                <select
                  value={formData.assignedClass}
                  onChange={(e) => setFormData({...formData, assignedClass: e.target.value})}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm hover:shadow-md"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map(classItem => (
                    <option key={classItem.id} value={classItem.className}>
                      {classItem.className} ({classItem.classCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaUsers className="text-lg" />
                Section Capacity *
              </label>
              <input
                type="number"
                placeholder="Maximum students for this section"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm hover:shadow-md"
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
                placeholder="Additional information about this section"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all bg-white shadow-sm hover:shadow-md"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {editingSection ? <><FaEdit /> Update Section</> : <><FaSave /> Add Section</>}
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

      {/* Section List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Sections List</h3>
          <p className="text-gray-600 text-sm mt-1">Manage all class sections</p>
        </div>
        
        {sections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4"><FaLayerGroup className="mx-auto" /></div>
            <p className="text-gray-500 text-lg font-medium">No sections created yet</p>
            <p className="text-gray-400 mt-2">
              {classes.length === 0 
                ? 'Create classes first, then add sections'
                : 'Click "Add New Section" to create your first section'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Section</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Assigned Class</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Capacity</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Description</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, index) => (
                  <tr key={section.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <FaLayerGroup className="text-green-600 font-bold" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Section {section.sectionName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {section.assignedClass}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-lg" />
                        <span className="font-bold text-gray-900">{section.capacity}</span>
                        <span className="text-gray-500 text-sm">students</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {section.description || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(section)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(section.id)}
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