import React, { useState, useEffect } from 'react';
import {
  IoFlashOutline,
  IoAddOutline,
  IoTrashOutline,
  IoToggleOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoClose,
  IoPlayOutline,
  IoPauseOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const Automations = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ totalRules: 0, activeRules: 0, totalExecutions: 0 });
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerEvent: 'task_status_change',
    condition: { field: 'status', operator: 'equals', value: 'review' },
    actionType: 'assign_to_user',
    actionData: {},
  });
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    fetchRules();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/automations', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      setRules(response.data);
    } catch (err) {
      console.error('Failed to fetch automation rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/automations/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/api/companies/${companyId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/automations', newRule, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      setShowModal(false);
      setNewRule({
        name: '',
        description: '',
        triggerEvent: 'task_status_change',
        condition: { field: 'status', operator: 'equals', value: 'review' },
        actionType: 'assign_to_user',
        actionData: {},
      });
      fetchRules();
      fetchStats();
    } catch (err) {
      console.error('Failed to create rule:', err);
      alert('Failed to create automation rule');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/api/automations/${id}/toggle`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      fetchRules();
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this automation rule?')) return;
    try {
      await api.delete(`/api/automations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      fetchRules();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const getTriggerLabel = (trigger) => {
    const labels = {
      task_status_change: 'Task Status Changes',
      task_priority_change: 'Task Priority Changes',
      task_assigned: 'Task is Assigned',
      task_created: 'Task is Created',
      task_due_soon: 'Task Due Soon',
    };
    return labels[trigger] || trigger;
  };

  const getActionLabel = (action) => {
    const labels = {
      assign_to_user: 'Assign to User',
      change_priority: 'Change Priority',
      send_notification: 'Send Notification',
      add_comment: 'Add Comment',
      change_status: 'Change Status',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Automations</h1>
          <p className="text-gray-600 mt-2">Automate your workflow with intelligent rules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <IoAddOutline className="w-5 h-5" />
          Create Rule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Rules</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRules}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <IoFlashOutline className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Rules</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeRules}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Executions</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalExecutions}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rules Timeline */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Active Automation Rules</h2>
        
        {rules.length === 0 ? (
          <div className="text-center py-12">
            <IoFlashOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No automation rules yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first automation rule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule._id}
                className={`p-6 rounded-lg border-2 transition-all ${
                  rule.isActive
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rule.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                    )}
                    
                    {/* Rule Flow */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 block">WHEN</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {getTriggerLabel(rule.triggerEvent)}
                        </span>
                      </div>
                      <div className="text-gray-400">→</div>
                      {rule.condition && rule.condition.field && (
                        <>
                          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 block">IF</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {rule.condition.field} {rule.condition.operator} "{rule.condition.value}"
                            </span>
                          </div>
                          <div className="text-gray-400">→</div>
                        </>
                      )}
                      <div className="bg-blue-100 px-4 py-2 rounded-lg border border-blue-200">
                        <span className="text-xs text-blue-600 block">THEN</span>
                        <span className="text-sm font-semibold text-blue-700">
                          {getActionLabel(rule.actionType)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Executed {rule.executionCount} times
                      {rule.lastExecuted && ` • Last: ${new Date(rule.lastExecuted).toLocaleDateString()}`}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggle(rule._id)}
                      className={`p-2 rounded-lg transition ${
                        rule.isActive
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={rule.isActive ? 'Pause' : 'Activate'}
                    >
                      {rule.isActive ? (
                        <IoPauseOutline className="w-5 h-5" />
                      ) : (
                        <IoPlayOutline className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Automation Rule</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Auto-assign reviewed tasks"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trigger Event *
                  </label>
                  <select
                    value={newRule.triggerEvent}
                    onChange={(e) => setNewRule({ ...newRule, triggerEvent: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="task_status_change">Task Status Changes</option>
                    <option value="task_priority_change">Task Priority Changes</option>
                    <option value="task_assigned">Task is Assigned</option>
                    <option value="task_created">Task is Created</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Action Type *
                  </label>
                  <select
                    value={newRule.actionType}
                    onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="assign_to_user">Assign to User</option>
                    <option value="change_priority">Change Priority</option>
                    <option value="change_status">Change Status</option>
                    <option value="send_notification">Send Notification</option>
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Condition (Optional)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Field</label>
                    <select
                      value={newRule.condition.field}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          condition: { ...newRule.condition, field: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Operator</label>
                    <select
                      value={newRule.condition.operator}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          condition: { ...newRule.condition, operator: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Value</label>
                    <input
                      type="text"
                      value={newRule.condition.value}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          condition: { ...newRule.condition, value: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., review"
                    />
                  </div>
                </div>
              </div>

              {/* Action Data */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Action Configuration</h3>
                {newRule.actionType === 'assign_to_user' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign to User
                    </label>
                    <select
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          actionData: { userId: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {newRule.actionType === 'change_priority' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Priority
                    </label>
                    <select
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          actionData: { priority: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;
