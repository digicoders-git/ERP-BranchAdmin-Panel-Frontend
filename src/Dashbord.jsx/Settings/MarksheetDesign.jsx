import React, { useState, useEffect } from 'react';
import { FaImage, FaEye, FaTimes } from 'react-icons/fa';
import api from '../../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MarksheetDesign({ data, onSave, saving, branchId }) {
  const [examTypes, setExamTypes] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamTypes();
  }, [branchId]);

  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/client-settings/exam-types?branchId=${branchId}`);
      setExamTypes(res.data.examTypes || []);
    } catch (err) {
      console.error('Fetch exam types error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Marksheet Templates</h2>
        <p className="text-gray-600">View available marksheet templates for each exam type</p>
      </div>

      {examTypes.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <FaImage className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No exam types available</p>
          <p className="text-gray-500 text-sm">Contact your admin to create exam types</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examTypes.map((examType) => (
            <div key={examType._id} className="border-2 border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{examType.name}</h3>
                <p className="text-sm text-gray-600">{examType.code}</p>
              </div>

              {examType.description && (
                <p className="text-sm text-gray-600 mb-4">{examType.description}</p>
              )}

              {examType.template ? (
                <div className="space-y-3">
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={examType.template}
                      alt={`${examType.name} template`}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate({ name: examType.name, url: examType.template })}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <FaEye /> Preview Template
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <FaImage className="text-2xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No template uploaded yet</p>
                </div>
              )}

              <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${examType.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {examType.isActive ? '✓ Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{previewTemplate.name} - Template Preview</h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                <img
                  src={previewTemplate.url}
                  alt="Template preview"
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
