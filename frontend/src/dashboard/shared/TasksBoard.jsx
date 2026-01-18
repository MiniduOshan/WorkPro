import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoAddOutline, 
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoCheckmarkDoneOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoPersonOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function TasksBoard() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('to-do');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const sampleTasks = () => ([
    {
      _id: 't1',
      title: 'Set up sprint backlog',
      description: 'Collect stories from product and estimate scope for Sprint 12.',
      status: 'to-do',
      assignedTo: { firstName: 'Alice' },
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 't2',
      title: 'Design system tokens',
      description: 'Align colors, spacing, and typography for the new dashboard.',
      status: 'in-progress',
      assignedTo: { firstName: 'Marcus' },
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 't3',
      title: 'API contract review',
      description: 'Review task service responses and update client typings.',
      status: 'blocked',
      assignedTo: { firstName: 'Sarah' },
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 't4',
      title: 'QA smoke tests',
      description: 'Run regression on Task Oversight flow before release.',
      status: 'done',
      assignedTo: { firstName: 'Leo' },
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    } else {
      setTasks(sampleTasks());
      setLoading(false);
    }
  }, []);

  const load = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const { data } = await api.get('/api/tasks', { params: { companyId } });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [companyId]);

  const create = async (e) => {
    e.preventDefault();
    if (!title) return;
    if (!companyId) {
      const newTask = {
        _id: `temp-${Date.now()}`,
        title,
        description,
        status,
        assignedTo: { firstName: 'You' },
        dueDate: null
      };
      setTasks((prev) => [...prev, newTask]);
      setTitle('');
      setDescription('');
      setStatus('to-do');
      setShowAddModal(false);
      return;
    }
    try {
      await api.post('/api/tasks', { title, description, companyId, status });
      setTitle('');
      setDescription('');
      setStatus('to-do');
      setShowAddModal(false);
      load();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    if (!companyId) {
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
      return;
    }
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      load();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    if (!companyId) {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      return;
    }
    try {
      await api.delete(`/api/tasks/${taskId}`);
      load();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const columns = [
    { id: 'to-do', label: 'To Do', icon: IoTimeOutline, color: 'slate', count: tasks.filter(t => t.status === 'to-do').length },
    { id: 'in-progress', label: 'In Progress', icon: IoCreateOutline, color: 'blue', count: tasks.filter(t => t.status === 'in-progress').length },
    { id: 'blocked', label: 'Cancel', icon: IoAlertCircleOutline, color: 'red', count: tasks.filter(t => t.status === 'blocked').length },
    { id: 'done', label: 'Done', icon: IoCheckmarkDoneOutline, color: 'green', count: tasks.filter(t => t.status === 'done').length },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'to-do': 'border-l-slate-500 hover:border-slate-600',
      'in-progress': 'border-l-blue-500 hover:border-blue-600',
      'blocked': 'border-l-red-500 hover:border-red-600',
      'done': 'border-l-green-500 hover:border-green-600',
    };
    return colors[status] || 'border-l-slate-500';
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Task Oversight</h1>
            <p className="text-slate-600">Manage and track team tasks across projects</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${theme.bgPrimaryHover} transition shadow-lg hover:shadow-xl active:scale-95`}
          >
            <IoAddOutline className="text-xl" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-grow overflow-x-auto overflow-y-hidden p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${theme.primary}`}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
            {columns.map((column) => {
              const Icon = column.icon;
              return (
                <div key={column.id} className="flex flex-col min-h-0">
                  {/* Column Header */}
                  <div className={`bg-${column.color}-50 border-2 border-${column.color}-200 rounded-2xl p-4 mb-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${column.color}-100 rounded-xl flex items-center justify-center`}>
                        <Icon className={`text-xl text-${column.color}-600`} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-${column.color}-800`}>{column.label}</h3>
                        <p className={`text-xs text-${column.color}-600`}>{column.count} tasks</p>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {tasks.filter(t => t.status === column.id).map((task) => (
                      <div
                        key={task._id}
                        className={`bg-white rounded-xl border-l-4 ${getStatusColor(task.status)} border-r border-t border-b border-slate-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                        draggable
                      >
                        {/* Task Content */}
                        <div className="mb-3">
                          <h4 className={`font-bold text-slate-800 mb-2 group-hover:text-${theme.primary} transition-colors`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                          )}
                        </div>

                        {/* Task Meta */}
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <div className="flex items-center gap-1">
                            <IoPersonOutline />
                            <span>{task.assignedTo?.firstName || 'Unassigned'}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <IoTimeOutline />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100">
                          {columns.map((col) => col.id !== task.status && (
                            <button
                              key={col.id}
                              onClick={() => updateStatus(task._id, col.id)}
                              className={`text-xs px-2 py-1 rounded-lg bg-${col.color}-50 text-${col.color}-700 hover:bg-${col.color}-100 transition font-medium`}
                              title={`Move to ${col.label}`}
                            >
                              {col.label}
                            </button>
                          ))}
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="ml-auto text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete task"
                          >
                            <IoTrashOutline className="inline" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === column.id).length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <Icon className="mx-auto text-4xl mb-2 opacity-50" />
                        <p className="text-sm">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Task</h2>
            <form onSubmit={create}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none`}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none resize-none`}
                  placeholder="Add task details..."
                  rows="3"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                >
                  <option value="to-do">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition`}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
