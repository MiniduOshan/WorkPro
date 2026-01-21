import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cid = localStorage.getItem('companyId');
    const r = localStorage.getItem('companyRole') || '';
    let profile = null;
    try { profile = JSON.parse(localStorage.getItem('userProfile') || '{}'); } catch {}
    setCompanyId(cid || '');
    setRole(r);
    setUserProfile(profile);
    if (cid) loadTasks(cid, r, profile);
  }, []);

  // Refresh tasks when month changes
  useEffect(() => {
    if (companyId) {
      loadTasks(companyId, role, userProfile);
    }
  }, [currentDate]);

  const loadTasks = async (cid, r, profile) => {
    try {
      setLoading(true);
      const params = { companyId: cid };
      if (r === 'employee' && profile?._id) params.assignee = profile._id;
      const { data } = await api.get('/api/tasks', { params });
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('CalendarWidget: failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const dt = new Date(t.dueDate);
      if (dt.getMonth() !== month || dt.getFullYear() !== year) return;
      const d = dt.getDate();
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [tasks, month, year]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{monthName} {year}</h3>
          <p className="text-slate-500 text-xs">Task Calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth} 
            className="p-2 hover:bg-white rounded-lg border border-slate-200 transition-colors"
          >
            <IoChevronBackOutline className="text-slate-600" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-lg border border-slate-200 transition-colors"
          >
            <IoChevronForwardOutline className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-slate-500 py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isToday = isCurrentMonth && day === today.getDate();
                const dayTasks = day ? (tasksByDay[day] || []) : [];
                
                return (
                  <div
                    key={idx}
                    className={`min-h-20 p-2 rounded-lg border-2 transition-all ${
                      day
                        ? isToday
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                        : 'border-transparent bg-slate-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map((task) => (
                            <div
                              key={task._id}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold truncate cursor-pointer transition-colors ${
                                task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : task.priority === 'high'
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-[9px] text-slate-500 px-1.5">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
