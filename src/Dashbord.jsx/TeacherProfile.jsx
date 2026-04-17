import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaMoneyBillWave, FaChalkboardTeacher, FaToggleOn, FaToggleOff, FaEdit } from 'react-icons/fa';
import api from '../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeacher = async () => {
    try {
      const { data } = await api.get(`/api/teacher/${id}`);
      setTeacher(data.teacher);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load teacher details', 'error');
      navigate('/dashbord/manage-teacher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const toggleStatus = async () => {
    try {
      await api.patch(`/api/teacher/toggle-status/${id}`);
      setTeacher(prev => ({ ...prev, status: !prev.status }));
      Swal.fire({ icon: 'success', title: 'Status Updated!', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Teacher not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashbord/manage-teacher')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <FaArrowLeft /> Back to Teachers
        </button>
        <div className="flex gap-3">
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
              teacher.status
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {teacher.status ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
            {teacher.status ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={() => navigate(`/dashbord/manage-teacher?edit=${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600"></div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-green-100">
                {teacher.profileImage ? (
                  <img
                    src={`${BASE_URL}${teacher.profileImage}`}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-600 text-5xl font-bold">
                    {teacher.name?.[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 mt-16 md:mt-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <FaChalkboardTeacher /> Teacher
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaEnvelope className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold">{teacher.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaPhone className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="font-semibold">{teacher.mobile || '—'}</p>
                  </div>
                </div>

                {teacher.address && (
                  <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-semibold">{teacher.address}</p>
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
        {/* Professional Details */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaBriefcase className="text-blue-600" /> Professional Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FaGraduationCap className="text-blue-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Qualification</p>
                  <p className="font-semibold text-gray-900">{teacher.qualification || '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FaBriefcase className="text-green-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-semibold text-gray-900">{teacher.experience || '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FaMoneyBillWave className="text-purple-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="font-semibold text-gray-900">
                    {teacher.salary ? `₹${Number(teacher.salary).toLocaleString()}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Subjects */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChalkboardTeacher className="text-green-600" /> Teaching Subjects
          </h3>
          {teacher.subjects && teacher.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {teacher.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-semibold text-sm"
                >
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No subjects assigned</p>
          )}
        </div>

        {/* Assigned Classes */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaGraduationCap className="text-purple-600" /> Assigned Classes
          </h3>
          {teacher.assignedClass || teacher.assignedSection ? (
            <div className="space-y-3">
              {teacher.assignedClass && (
                <div className="p-4 bg-purple-50 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <FaGraduationCap className="text-purple-600 text-xl" />
                    <div>
                      <p className="text-xs text-purple-600 font-semibold">Class</p>
                      <p className="font-bold text-gray-900">{teacher.assignedClass.className || teacher.assignedClass.classCode || '—'}</p>
                    </div>
                  </div>
                  {teacher.assignedClass.stream && teacher.assignedClass.stream.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-200">
                      <span className="text-xs text-purple-600 font-semibold">Streams:</span>
                      {teacher.assignedClass.stream.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {teacher.assignedSection && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaChalkboardTeacher className="text-blue-600 text-xl" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">Section</p>
                      <p className="font-bold text-gray-900">{teacher.assignedSection.sectionName || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No classes assigned</p>
          )}
        </div>

        {/* Branch Info */}
        {teacher.branch && (
          <div className="bg-white rounded-2xl shadow border p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Branch Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold mb-1">Branch Name</p>
                <p className="font-bold text-gray-900">{teacher.branch.branchName || '—'}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 font-semibold mb-1">Branch Code</p>
                <p className="font-bold text-gray-900">{teacher.branch.branchCode || '—'}</p>
              </div>
              {teacher.branch.address && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-semibold mb-1">Address</p>
                  <p className="font-bold text-gray-900">{teacher.branch.address}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
