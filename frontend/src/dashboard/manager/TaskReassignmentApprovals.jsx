import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoPersonOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';

export default function TaskReassignmentApprovals() {
  const [companyId, setCompanyId] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      loadPendingReassignments(storedCompanyId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadPendingReassignments = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/tasks/pending-reassignments', {
        params: { companyId: id }
      });
      setPendingTasks(data);
    } catch (err) {
      console.error('Failed to load pending reassignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (taskId, approve) => {
    try {
      await api.post(`/api/tasks/${taskId}/approve-reassignment`, { approve });
      alert(approve ? 'Reassignment approved!' : 'Reassignment rejected');
      loadPendingReassignments(companyId);
    } catch (err) {
      console.error('Failed to process approval:', err);
      alert('Failed to process approval');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Task Reassignment Approvals</h1>
          <p className="text-slate-600">Review and approve employee reassignment requests</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="grow overflow-y-auto p-8">
        {!companyId ? (
          <div className="text-center py-16">
            <IoAlertCircleOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Company Found</h3>
            <p className="text-slate-500">Please select or create a company first</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center py-16">
            <IoCheckmarkCircleOutline className="mx-auto text-6xl text-green-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">All Caught Up!</h3>
            <p className="text-slate-500">No pending reassignment requests at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    )}
                    
                    {/* Reassignment Details */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                        <IoPersonOutline className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {task.assignee?.firstName} {task.assignee?.lastName}
                        </span>
                      </div>
                      <IoArrowForwardOutline className="text-slate-400" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                        <IoPersonOutline className="text-green-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {task.pendingReassignment?.newAssignee?.firstName}{' '}
                          {task.pendingReassignment?.newAssignee?.lastName}
                        </span>
                      </div>
                    </div>

                    {/* Request Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <IoPersonOutline className="text-purple-500" />
                        <span>
                          Requested by: {task.pendingReassignment?.requestedBy?.firstName}{' '}
                          {task.pendingReassignment?.requestedBy?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoTimeOutline className="text-orange-500" />
                        <span>
                          {new Date(task.pendingReassignment?.requestedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {task.pendingReassignment?.reason && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Reason:</p>
                        <p className="text-sm text-slate-700">{task.pendingReassignment.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleApproval(task._id, false)}
                    className="flex-1 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <IoCloseCircleOutline className="text-xl" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproval(task._id, true)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <IoCheckmarkCircleOutline className="text-xl" />
                    Approve Reassignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
