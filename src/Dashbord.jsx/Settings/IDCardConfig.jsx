import React, { useState, useEffect } from 'react';
import { FaUpload, FaImage, FaCheck, FaTrash } from 'react-icons/fa';
import api from '../../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ROLE_CONFIGS = {
  student: { label: 'Student ID Card', color: 'blue' },
  staff: { label: 'Staff ID Card', color: 'green' },
  teacher: { label: 'Teacher ID Card', color: 'purple' },
  driver: { label: 'Driver ID Card', color: 'red' },
  warden: { label: 'Warden ID Card', color: 'cyan' }
};

export default function IDCardConfig({ data, onSave, saving }) {
  const [templates, setTemplates] = useState({});
  const [uploadingRole, setUploadingRole] = useState(null);

  useEffect(() => {
    if (data?.templates) {
      setTemplates(data.templates);
    }
  }, [data]);

  const handleTemplateUpload = async (e, role) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingRole(role);
    const formData = new FormData();
    formData.append('template', file);
    formData.append('role', role);

    try {
      const res = await api.post('/api/client-settings/idcard/upload-template', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTemplates(prev => ({
        ...prev,
        [role]: res.data.templateUrl
      }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload template');
    } finally {
      setUploadingRole(null);
    }
  };

  const handleRemoveTemplate = (role) => {
    setTemplates(prev => {
      const updated = { ...prev };
      delete updated[role];
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ templates });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ID Card Templates</h2>
        <p className="text-gray-600">Upload black ID card templates for each role. These will be used as backgrounds when generating ID cards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(ROLE_CONFIGS).map(([role, config]) => (
          <div key={role} className={`border-2 border-${config.color}-200 rounded-2xl p-6 bg-${config.color}-50`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 bg-${config.color}-100 rounded-lg`}>
                <FaImage className={`text-${config.color}-600 text-xl`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
            </div>

            {templates[role] ? (
              <div className="space-y-4">
                <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                  <img
                    src={templates[role]}
                    alt={`${role} template`}
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveTemplate(role)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Remove
                  </button>
                  <label className={`flex-1 px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition font-semibold flex items-center justify-center gap-2 cursor-pointer`}>
                    {uploadingRole === role ? 'Uploading...' : <><FaUpload /> Change</>}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTemplateUpload(e, role)}
                      className="hidden"
                      disabled={uploadingRole === role}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className={`border-2 border-dashed border-${config.color}-300 rounded-xl p-8 text-center cursor-pointer hover:bg-${config.color}-100 transition`}>
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 bg-${config.color}-100 rounded-full`}>
                    <FaImage className={`text-${config.color}-600 text-3xl`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Upload Template</p>
                    <p className="text-sm text-gray-600">PNG, JPG • Max 5MB</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTemplateUpload(e, role)}
                  className="hidden"
                  disabled={uploadingRole === role}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-900 mb-2">Template Guidelines</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>✓ Recommended size: 350x550 pixels (ID card aspect ratio)</li>
          <li>✓ Format: PNG or JPG with transparent areas for data fields</li>
          <li>✓ Leave space for: Name, ID, Photo, Contact Info, etc.</li>
          <li>✓ High resolution recommended for better print quality</li>
        </ul>
      </div>

      <div className="flex justify-end gap-3 border-t-2 pt-8">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-60 shadow-lg flex items-center gap-2"
        >
          <FaCheck /> {saving ? 'Saving...' : 'Save Templates'}
        </button>
      </div>
    </form>
  );
}
