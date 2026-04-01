import React from 'react';
import { showSuccess, showError, showWarning, showConfirm, showLoading, closeLoading, showToast } from './utils/sweetAlert';

export default function SweetAlertExample() {
  
  const handleSuccess = () => {
    showSuccess('Success!', 'Data saved successfully');
  };

  const handleError = () => {
    showError('Error!', 'Something went wrong');
  };

  const handleWarning = () => {
    showWarning('Warning!', 'Please check your input');
  };

  const handleConfirm = async () => {
    const result = await showConfirm('Are you sure?', 'This action cannot be undone');
    if (result.isConfirmed) {
      showToast('success', 'Action completed!');
    }
  };

  const handleLoading = () => {
    showLoading('Processing...', 'Please wait');
    
    // Simulate API call
    setTimeout(() => {
      closeLoading();
      showSuccess('Done!', 'Process completed');
    }, 3000);
  };

  const handleToast = () => {
    showToast('info', 'This is a toast notification');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">SweetAlert2 Examples</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button 
          onClick={handleSuccess}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Success Alert
        </button>
        
        <button 
          onClick={handleError}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Error Alert
        </button>
        
        <button 
          onClick={handleWarning}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Warning Alert
        </button>
        
        <button 
          onClick={handleConfirm}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Confirm Dialog
        </button>
        
        <button 
          onClick={handleLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Loading Alert
        </button>
        
        <button 
          onClick={handleToast}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Toast Notification
        </button>
      </div>
    </div>
  );
}