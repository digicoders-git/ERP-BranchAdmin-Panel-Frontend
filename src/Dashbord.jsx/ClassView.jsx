import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaGraduationCap, FaUsers, FaTag, FaFileAlt, FaEdit, FaCalendarAlt, FaUserTie } from 'react-icons/fa';
import api from '../api';

export default function ClassView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClass = async () => {
    try {
      const { data } = await api.get(`/api/class/${id}`);
      setClassData(data.class);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load class details', 'error');
      navigate('/dashbord/manage-class');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Class not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashbord/manage-class')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <FaArrowLeft /> Back to Classes
        </button>
        <button
          onClick={() => navigate('/dashbord/manage-class', { state: { editId: id } })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          <FaEdit /> Edit Class
        </button>
      </div>

      {/* Class Card */}
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Class Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            {/* Class Icon */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-blue-100 flex items-center justify-center">
                <FaGraduationCap className="text-blue-600 text-6xl" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 mt-16 md:mt-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{classData.className}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <FaTag /> {classData.classCode}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="font-semibold">{classData.classCapacity || '—'} Students</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaTag className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Class Code</p>
                    <p className="font-semibold">{classData.classCode}</p>
                  </div>
                </div>

                {classData.description && (
                  <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaFileAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="font-semibold">{classData.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branch Info */}
        {classData.branch && (
          <div className="bg-white rounded-2xl shadow border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600" /> Branch Information
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold mb-1">Branch Name</p>
                <p className="font-bold text-gray-900">{classData.branch.branchName || '—'}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 font-semibold mb-1">Branch Code</p>
                <p className="font-bold text-gray-900">{classData.branch.branchCode || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Created Info */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-green-600" /> Creation Details
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-xs text-green-600 font-semibold mb-1">Created At</p>
              <p className="font-bold text-gray-900">
                {classData.createdAt ? new Date(classData.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '—'}
              </p>
            </div>
            {classData.createdBy && (
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-xs text-indigo-600 font-semibold mb-1 flex items-center gap-1">
                  <FaUserTie /> Created By
                </p>
                <p className="font-bold text-gray-900">{classData.createdBy.email || '—'}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{classData.createdBy.role || '—'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {classData.description && (
        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaFileAlt className="text-purple-600" /> Description
          </h3>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-700 leading-relaxed">{classData.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
