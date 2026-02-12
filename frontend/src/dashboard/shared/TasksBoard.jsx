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
  IoPersonOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoFunnelOutline,
  IoPeopleOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function TasksBoard() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('to-do');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [department, setDepartment] = useState('');
  const [group, setGroup] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [companyRole, setCompanyRole] = useState('');
  
  // View/Edit Task Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

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
      status: 'cancelled',
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
    const role = localStorage.getItem('companyRole');
    setCompanyRole(role || '');
    
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        setUserProfile(data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    
    fetchUserProfile();
    
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    } else {
      setTasks(sampleTasks());
      setLoading(false);
    }
  }, []);

  const loadEmployees = async () => {
    if (!companyId) return;
    try {
      const { data } = await api.get(`/api/companies/${companyId}`);
      if (data && data.members) {
        const mappedEmployees = data.members.map(m => {
          const userId = m.user?._id || m.user;
          const firstName = m.user?.firstName || '';
          const lastName = m.user?.lastName || '';
          const fullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'Unknown';
          return {
            _id: userId,
            name: fullName,
            department: m.department,
            role: m.role
          };
        });
        setEmployees(mappedEmployees);
        // Initialize filteredEmployees with all employees
        if (!department) {
          setFilteredEmployees(mappedEmployees);
        }
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  // Filter employees based on selected department
  useEffect(() => {
    if (department) {
      // Show employees/managers in the selected department, plus all managers/owners
      const filtered = employees.filter(emp => 
        emp.department === department || 
        ['owner', 'manager'].includes(emp.role)
      );
      setFilteredEmployees(filtered);
    } else {
      // Show all employees and managers when no department selected
      setFilteredEmployees(employees);
    }
  }, [department, employees]);

  const loadDepartments = async () => {
    if (!companyId) return;
    try {
      const { data } = await api.get('/api/departments', { params: { companyId } });
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadGroups = async () => {
    if (!companyId) return;
    try {
      const { data } = await api.get('/api/groups', { params: { companyId } });
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const load = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const params = { companyId };
      if (filterDepartment) params.department = filterDepartment;
      const { data } = await api.get('/api/tasks', { params });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (companyId) {
      loadEmployees();
      loadDepartments();
      loadGroups();
      load();
    }
  }, [companyId, filterDepartment]);

  const create = async (e) => {
    e.preventDefault();
    if (!title) return;
    if (!companyId) {
      const newTask = {
        _id: `temp-${Date.now()}`,
        title,
        description,
        status,
        assignee: assignee ? { firstName: 'Assignee' } : null,
        department: department ? { name: 'Department' } : null,
        dueDate: dueDate || null
      };
      setTasks((prev) => [...prev, newTask]);
      resetForm();
      return;
    }
    try {
      const taskData = { 
        title, 
        description, 
        companyId, 
        status,
        priority
      };
      if (assignee) taskData.assignee = assignee;
      if (department && department !== '') taskData.department = department;
      if (group && group !== '') taskData.group = group;
      if (dueDate) taskData.dueDate = dueDate;
      
      await api.post('/api/tasks', taskData);
      resetForm();
      load();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('to-do');
    setPriority('medium');
    setAssignee('');
    setDepartment('');
    setGroup('');
    setDueDate('');
    setShowAddModal(false);
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

  const openViewModal = (task) => {
    setViewTask(task);
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
    setEditPriority(task.priority || 'medium');
    setEditAssignee(task.assignee?._id || task.assignee || '');
    setEditDepartment(task.department?._id || task.department || '');
    setEditGroup(task.group?._id || task.group || '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setShowViewModal(true);
  };
  
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewTask(null);
    setIsEditing(false);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!viewTask) return;
    
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
        dueDate: editDueDate || undefined
      };
      
      // Only managers/owners can change assignee and department
      if (['owner', 'manager'].includes(companyRole)) {
        if (editAssignee) payload.assignee = editAssignee;
        if (editDepartment && editDepartment !== '') payload.department = editDepartment;
        if (editGroup && editGroup !== '') payload.group = editGroup;
      }
      
      await api.put(`/api/tasks/${viewTask._id}`, payload);
      alert('Task updated successfully!');
      load();
      closeViewModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  const columns = [
    { id: 'to-do', label: 'To Do', icon: IoTimeOutline, color: 'slate', count: tasks.filter(t => t.status === 'to-do').length },
    { id: 'in-progress', label: 'In Progress', icon: IoCreateOutline, color: 'blue', count: tasks.filter(t => t.status === 'in-progress').length },
    { id: 'cancelled', label: 'Cancelled', icon: IoAlertCircleOutline, color: 'red', count: tasks.filter(t => t.status === 'cancelled').length },
    { id: 'done', label: 'Done', icon: IoCheckmarkDoneOutline, color: 'green', count: tasks.filter(t => t.status === 'done').length },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'to-do': 'border-l-slate-500 hover:border-slate-600',
      'in-progress': 'border-l-blue-500 hover:border-blue-600',
      'cancelled': 'border-l-red-500 hover:border-red-600',
      'done': 'border-l-green-600 hover:border-green-600',
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
          <div className="flex items-center gap-3">
            {/* Department Filter */}
            {departments.length > 0 && (
              <div className="flex items-center gap-2">
                <IoFunnelOutline className="text-slate-600" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}
            {companyRole !== 'employee' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${theme.bgPrimaryHover} transition shadow-lg hover:shadow-xl active:scale-95`}
              >
                <IoAddOutline className="text-xl" />
                <span>Create Task</span>
              </button>
            )}
          </div>
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
                  <div className={`kanban-column-header kanban-column-${column.id} bg-${column.color}-50 border-2 border-${column.color}-200 rounded-2xl p-4 mb-4 flex items-center justify-between`}>
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
                        onClick={() => openViewModal(task)}
                        className={`kanban-task-card bg-white rounded-xl border-l-4 ${getStatusColor(task.status)} border-r border-t border-b border-slate-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
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
                        <div className="space-y-2 text-xs text-slate-600 mb-3">
                          <div className="flex items-center gap-2">
                            <IoPersonOutline className="text-blue-500" />
                            <span className="font-medium">
                              {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                            </span>
                          </div>
                          {task.department && (
                            <div className="flex items-center gap-2">
                              <IoBusinessOutline className="text-purple-500" />
                              <span>{task.department.name}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-2">
                              <IoCalendarOutline className="text-orange-500" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.priority && (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100 task-quick-actions">
                          {/* Status change buttons - show to managers or assignee employees */}
                          {(['owner', 'manager'].includes(companyRole) || 
                            (companyRole === 'employee' && userProfile && task.assignee?._id === userProfile._id)) && 
                           columns.map((col) => col.id !== task.status && (
                            <button
                              key={col.id}
                              onClick={(e) => { e.stopPropagation(); updateStatus(task._id, col.id); }}
                              className={`status-change-btn status-change-${col.id} text-xs px-2 py-1 rounded-lg bg-${col.color}-50 text-${col.color}-700 hover:bg-${col.color}-100 transition font-medium`}
                              title={`Move to ${col.label}`}
                            >
                              {col.label}
                            </button>
                          ))}
                          {['owner', 'manager'].includes(companyRole) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                              className="ml-auto text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete task"
                            >
                              <IoTrashOutline className="inline" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === column.id).length === 0 && (
                      <div className="text-center py-8 text-slate-400 kanban-empty-state">
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
      {showAddModal && companyRole !== 'employee' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Task</h2>
            <form onSubmit={create}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Task Title *
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
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setAssignee(''); // Reset assignee when department changes
                    }}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Group
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                  >
                    <option value="">No Group</option>
                    {groups.map((grp) => (
                      <option key={grp._id} value={grp._id}>{grp.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a group to track progress on group-related tasks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                    disabled={companyRole === 'employee'}
                  >
                    <option value="">
                      {companyRole === 'employee' ? 'Self-assign only' : department ? 'Select from Department' : 'Select Employee'}
                    </option>
                    {filteredEmployees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                  {companyRole === 'employee' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Only managers can assign tasks to others
                    </p>
                  )}
                  {department && filteredEmployees.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No employees in this department yet
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                  >
                    <option value="to-do">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
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

      {/* View/Edit Task Modal */}
      {showViewModal && viewTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            {/* Modal Header */}
            <div className={`${theme.bgPrimary} text-white p-6 rounded-t-2xl flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <IoCreateOutline className="text-2xl" />
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Task' : 'Task Details'}
                </h2>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-white/20 rounded-lg transition text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Title</label>
                    <h3 className="text-2xl font-bold text-slate-800">{viewTask.title}</h3>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {viewTask.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Status</label>
                      <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                        viewTask.status === 'done' ? 'bg-green-100 text-green-700' :
                        viewTask.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        viewTask.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {viewTask.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Priority</label>
                      <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                        viewTask.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        viewTask.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        viewTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {(viewTask.priority || 'medium').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Assignee & Department */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Assigned To</label>
                      <div className="flex items-center gap-2 text-slate-700">
                        <IoPersonOutline className="text-blue-500" />
                        <span>
                          {viewTask.assignee ? 
                            `${viewTask.assignee.firstName} ${viewTask.assignee.lastName}` : 
                            'Unassigned'
                          }
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Department</label>
                      <div className="flex items-center gap-2 text-slate-700">
                        <IoBusinessOutline className="text-purple-500" />
                        <span>{viewTask.department?.name || 'No department'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Group */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Group</label>
                    <div className="flex items-center gap-2 text-slate-700">
                      <IoPeopleOutline className="text-indigo-500" />
                      <span>{viewTask.group?.name || 'No group'}</span>
                    </div>
                  </div>

                  {/* Due Date */}
                  {viewTask.dueDate && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Due Date</label>
                      <div className="flex items-center gap-2 text-slate-700">
                        <IoCalendarOutline className="text-orange-500" />
                        <span>{new Date(viewTask.dueDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  )}

                  {/* Created By */}
                  {viewTask.createdBy && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Created By</label>
                      <p className="text-slate-700">
                        {viewTask.createdBy.firstName} {viewTask.createdBy.lastName}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleUpdateTask} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none`}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none resize-none`}
                      rows="4"
                      placeholder="Describe the task..."
                    />
                  </div>

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                      >
                        <option value="to-do">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Department & Assignee (Only for Managers/Owners) */}
                  {['owner', 'manager'].includes(companyRole) && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                        <select
                          value={editDepartment}
                          onChange={(e) => {
                            setEditDepartment(e.target.value);
                            setEditAssignee(''); // Reset assignee when department changes
                          }}
                          className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                        >
                          <option value="">All Departments</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To</label>
                        <select
                          value={editAssignee}
                          onChange={(e) => setEditAssignee(e.target.value)}
                          className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                        >
                          <option value="">Select Employee</option>
                          {employees.filter(emp => {
                            if (!editDepartment) return true;
                            if (['owner', 'manager'].includes(emp.role)) return true;
                            const selectedDept = departments.find(d => d._id === editDepartment);
                            return emp.department === selectedDept?.name;
                          }).map((emp) => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Group</label>
                        <select
                          value={editGroup}
                          onChange={(e) => setEditGroup(e.target.value)}
                          className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                        >
                          <option value="">No Group</option>
                          {groups.map((grp) => (
                            <option key={grp._id} value={grp._id}>{grp.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none`}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition`}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer - Action Buttons */}
            {!isEditing && (
              <div className="p-6 border-t border-slate-200 flex gap-3">
                {/* Edit button - show to managers or task assignee */}
                {(['owner', 'manager'].includes(companyRole) || 
                  (companyRole === 'employee' && userProfile && viewTask.assignee?._id === userProfile._id)) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition flex items-center justify-center gap-2`}
                  >
                    <IoCreateOutline /> Edit Task
                  </button>
                )}
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            )}
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
