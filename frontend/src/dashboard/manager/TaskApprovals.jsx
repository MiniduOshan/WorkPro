import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoClipboardOutline
} from 'react-icons/io5';

export default function TaskApprovals() {
  const [companyId, setCompanyId] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      loadPendingApprovals(storedCompanyId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadPendingApprovals = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/tasks/pending-approvals', {
        params: { companyId: id }
      });
      setPendingTasks(data);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (taskId, approve) => {
    try {
      await api.post(`/api/tasks/${taskId}/approve-task`, { approve });
      alert(approve ? 'Task approved!' : 'Task rejected and deleted');
      loadPendingApprovals(companyId);
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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Task Approvals</h1>
          <p className="text-slate-600">Review and approve tasks created by managers</p>
        </div>
      </div>

      {/* Pending Approvals */}
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
            <p className="text-slate-500">No pending task approvals at the moment</p>
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
                    
                    {/* Task Details */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                        <IoPersonOutline className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">
                          Created by: {task.createdBy?.firstName} {task.createdBy?.lastName}
                        </span>
                      </div>
                      {task.assignee && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                          <IoPersonOutline className="text-green-600" />
                          <span className="text-sm font-medium text-slate-700">
                            Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <IoTimeOutline className="text-orange-500" />
                        <span>
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {task.department && (
                        <div className="flex items-center gap-1">
                          <IoClipboardOutline className="text-purple-500" />
                          <span>{task.department.name}</span>
                        </div>
                      )}
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleApproval(task._id, false)}
                    className="flex-1 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <IoCloseCircleOutline className="text-xl" />
                    Reject & Delete
                  </button>
                  <button
                    onClick={() => handleApproval(task._id, true)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <IoCheckmarkCircleOutline className="text-xl" />
                    Approve Task
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
