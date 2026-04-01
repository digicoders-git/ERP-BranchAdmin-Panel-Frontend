import React, { useState } from 'react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/sweetAlert';
import { FaGraduationCap, FaUmbrellaBeach, FaMoneyBillWave, FaClipboardList, FaEye, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt } from 'react-icons/fa';

export default function Approval() {
  const [approvals, setApprovals] = useState([
    { id: 1, type: 'Student Admission', name: 'Rahul Kumar', class: 'Class 5', date: '2024-01-15', status: 'Pending', priority: 'High', description: 'New student admission request for academic year 2024-25' },
    { id: 2, type: 'Leave Request', name: 'Priya Sharma', department: 'Teaching', date: '2024-01-16', status: 'Pending', priority: 'Medium', description: 'Medical leave for 3 days due to fever' },
    { id: 3, type: 'Fee Waiver', name: 'Amit Singh', class: 'Class 3', date: '2024-01-17', status: 'Pending', priority: 'Low', description: 'Fee waiver request due to financial hardship' },
    { id: 4, type: 'Transfer Certificate', name: 'Sneha Patel', class: 'Class 8', date: '2024-01-18', status: 'Approved', priority: 'High', description: 'Transfer certificate for relocation to another city' },
    { id: 5, type: 'Event Approval', name: 'Annual Sports Day', department: 'Sports', date: '2024-01-19', status: 'Pending', priority: 'Medium', description: 'Annual sports day event planning and budget approval' },
    { id: 6, type: 'Budget Request', name: 'Library Books', department: 'Library', date: '2024-01-20', status: 'Rejected', priority: 'Low', description: 'Budget request for purchasing new library books' },
    { id: 7, type: 'Student Admission', name: 'Vikram Rao', class: 'Class 1', date: '2024-01-21', status: 'Pending', priority: 'High', description: 'Admission request for kindergarten student' },
    { id: 8, type: 'Leave Request', name: 'Sunita Devi', department: 'Admin', date: '2024-01-22', status: 'Pending', priority: 'Medium', description: 'Maternity leave request for 3 months' },
  ]);
  
  const [showDetails, setShowDetails] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);

  const handleApprove = async (id) => {
    const result = await showConfirm('Approve Request?', 'Are you sure you want to approve this request?');
    if (result.isConfirmed) {
      setApprovals(approvals.map(item => 
        item.id === id ? { ...item, status: 'Approved' } : item
      ));
      setShowDetails(false);
      await showSuccess('Approved!', 'Request approved successfully!');
    }
  };

  const handleReject = async (id) => {
    const result = await showConfirm('Reject Request?', 'Are you sure you want to reject this request?');
    if (result.isConfirmed) {
      setApprovals(approvals.map(item => 
        item.id === id ? { ...item, status: 'Rejected' } : item
      ));
      setShowDetails(false);
      await showError('Rejected!', 'Request has been rejected!');
    }
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowDetails(true);
  };

  const getPendingCount = (type) => {
    return approvals.filter(item => 
      (type === 'All' ? true : item.type === type) && item.status === 'Pending'
    ).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Approval Management</h2>
      </div>

      {showDetails && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Approval Details</h3>
            <button 
              onClick={() => setShowDetails(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaTimes /> Close
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-4 text-blue-800 text-lg flex items-center gap-2"><FaClipboardList /> Request Information</h4>
              <div className="space-y-3">
                <p><span className="font-medium text-gray-700">Type:</span> 
                  <span className="ml-2 px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">{selectedApproval?.type}</span>
                </p>
                <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{selectedApproval?.name}</span></p>
                <p><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-900">{selectedApproval?.date}</span></p>
                <p><span className="font-medium text-gray-700">Priority:</span> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                    selectedApproval?.priority === 'High' ? 'bg-red-200 text-red-800' :
                    selectedApproval?.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {selectedApproval?.priority}
                  </span>
                </p>
                <p><span className="font-medium text-gray-700">Status:</span> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                    selectedApproval?.status === 'Approved' ? 'bg-green-200 text-green-800' :
                    selectedApproval?.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {selectedApproval?.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-4 text-gray-800 text-lg flex items-center gap-2"><FaFileAlt /> Additional Details</h4>
              <div className="space-y-3">
                <p><span className="font-medium text-gray-700">Class/Department:</span> <span className="text-gray-900">{selectedApproval?.class || selectedApproval?.department}</span></p>
                <p><span className="font-medium text-gray-700">Request ID:</span> <span className="text-gray-900 font-mono">REQ-{selectedApproval?.id.toString().padStart(4, '0')}</span></p>
                <p><span className="font-medium text-gray-700">Description:</span></p>
                <div className="bg-white p-3 rounded border text-gray-700 text-sm leading-relaxed">
                  {selectedApproval?.description}
                </div>
              </div>
            </div>
          </div>
          
          {selectedApproval?.status === 'Pending' && (
            <div className="mt-6 flex gap-4 justify-center">
              <button 
                onClick={() => handleApprove(selectedApproval.id)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg font-medium"
              >
                <FaCheckCircle /> Approve Request
              </button>
              <button 
                onClick={() => handleReject(selectedApproval.id)}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg font-medium"
              >
                <FaTimesCircle /> Reject Request
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaGraduationCap /> Admissions</h3>
              <p className="text-yellow-100 text-sm">Pending Applications</p>
            </div>
            <div className="text-3xl font-bold">{getPendingCount('Student Admission')}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaUmbrellaBeach /> Leave Requests</h3>
              <p className="text-blue-100 text-sm">Pending Requests</p>
            </div>
            <div className="text-3xl font-bold">{getPendingCount('Leave Request')}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaMoneyBillWave /> Fee Waivers</h3>
              <p className="text-purple-100 text-sm">Pending Waivers</p>
            </div>
            <div className="text-3xl font-bold">{getPendingCount('Fee Waiver')}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaClipboardList /> Total Pending</h3>
              <p className="text-green-100 text-sm">All Requests</p>
            </div>
            <div className="text-3xl font-bold">{getPendingCount('All')}</div>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><FaClipboardList /> Approval Requests ({approvals.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Class/Dept</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approvals.map((approval, index) => (
                <tr key={approval.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {approval.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{approval.name}</div>
                    <div className="text-sm text-gray-500">ID: REQ-{approval.id.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{approval.class || approval.department}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      approval.priority === 'High' ? 'bg-red-100 text-red-800' :
                      approval.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {approval.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{approval.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      approval.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      approval.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {approval.status === 'Approved' ? <><FaCheckCircle className="inline mr-1" /> Approved</> :
                       approval.status === 'Rejected' ? <><FaTimesCircle className="inline mr-1" /> Rejected</> :
                       <><FaClock className="inline mr-1" /> Pending</>}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewDetails(approval)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        <FaEye /> View
                      </button>
                      {approval.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(approval.id)}
                            className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors shadow-sm"
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(approval.id)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors shadow-sm"
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {approvals.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4"><FaClipboardList className="mx-auto" /></div>
            <p className="text-gray-500 text-lg">No approval requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}