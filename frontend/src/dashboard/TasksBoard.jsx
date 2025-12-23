import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TasksBoard() {
  const [companyId, setCompanyId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('to-do');

  const load = async () => {
    if (!companyId) return;
    const { data } = await api.get('/api/tasks', { params: { companyId } });
    setTasks(data);
  };

  useEffect(() => { load(); }, [companyId]);

  const create = async (e) => {
    e.preventDefault();
    if (!companyId || !title) return;
    await api.post('/api/tasks', { title, companyId, status });
    setTitle('');
    load();
  };

  const updateStatus = async (taskId, newStatus) => {
    await api.put(`/api/tasks/${taskId}`, { status: newStatus });
    load();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 rounded" placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        <form className="flex gap-2" onSubmit={create}>
          <input className="border p-2 rounded" placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="to-do">To do</option>
            <option value="in-progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
          <button className="bg-blue-600 text-white px-3 rounded">Add</button>
        </form>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {['to-do', 'in-progress', 'blocked', 'done'].map((col) => (
          <div key={col} className="bg-gray-50 border rounded p-2">
            <h3 className="font-semibold capitalize">{col.replace('-', ' ')}</h3>
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t._id} className="bg-white border rounded p-2 mt-2">
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
                <div className="flex gap-2 mt-2">
                  {['to-do', 'in-progress', 'blocked', 'done'].map((s) => (
                    <button key={s} className="text-xs border px-2 py-1 rounded" onClick={() => updateStatus(t._id, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
