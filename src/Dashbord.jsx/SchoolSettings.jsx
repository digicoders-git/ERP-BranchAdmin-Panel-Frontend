import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  FaSave,
  FaUndo
} from 'react-icons/fa';
import api from '../api';
import BrandingSettings from './Settings/BrandingSettings';
import StaffConfiguration from './Settings/StaffConfiguration';
import TeacherConfiguration from './Settings/TeacherConfiguration';
import StudentConfiguration from './Settings/StudentConfiguration';
import AttendanceSettings from './Settings/AttendanceSettings';
import AdmissionSettings from './Settings/AdmissionSettings';
import IDCardConfig from './Settings/IDCardConfig';
import FeeSlipDesign from './Settings/FeeSlipDesign';
import MarksheetDesign from './Settings/MarksheetDesign';
import TransportSettings from './Settings/TransportSettings';

const menuItems = [
  { id: 'branding', label: 'Branding', component: BrandingSettings },
  { id: 'transport', label: 'Transport Settings', component: TransportSettings },
  { id: 'attendance', label: 'Attendance Settings', component: AttendanceSettings }
];

export default function SchoolSettings() {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'branding');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Update activeSection when URL section changes
  useEffect(() => {
    if (section) {
      setActiveSection(section);
    }
  }, [section]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/client-settings');
      setSettings(data.settings);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionData) => {
    try {
      setSaving(true);
      let endpoint = `/api/client-settings/${activeSection}/update`;

      // Special handling for ID Card configuration
      if (activeSection === 'idCard') {
        endpoint = '/api/client-settings/idcard/config/update';
      }

      // Special handling for Marksheet templates
      if (activeSection === 'marksheet') {
        endpoint = '/api/client-settings/marksheet/templates/update';
      }

      await api.put(endpoint, sectionData);

      // Refresh settings after save
      fetchSettings();

      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Settings updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Reset Settings?',
      text: 'This will reset all changes for this section',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Reset'
    }).then(result => {
      if (result.isConfirmed) {
        fetchSettings();
        Swal.fire('Reset!', 'Settings have been reset', 'success');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const ActiveComponent = menuItems.find(item => item.id === activeSection)?.component;
  const currentLabel = menuItems.find(item => item.id === activeSection)?.label;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            School Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure your branch-wide preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
          >
            <FaUndo /> Reset
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              navigate(`/dashbord/school-settings/${item.id}`);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${activeSection === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="mb-6 pb-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{currentLabel}</h2>
        </div>
        {ActiveComponent && (
          <ActiveComponent
            data={settings?.[activeSection]}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
