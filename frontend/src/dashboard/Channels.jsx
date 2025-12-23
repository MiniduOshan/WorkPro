import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Channels() {
  const [companyId, setCompanyId] = useState('');
  const [channels, setChannels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const loadChannels = async () => {
    if (!companyId) return;
    const { data } = await api.get('/api/channels', { params: { companyId } });
    setChannels(data);
    if (!selected && data[0]) setSelected(data[0]);
  };

  const loadMessages = async (ch) => {
    const { data } = await api.get(`/api/channels/${ch._id}/messages`);
    setSelected({ ...ch, messages: data });
  };

  useEffect(() => { loadChannels(); }, [companyId]);
  useEffect(() => { if (selected) loadMessages(selected); }, [selected?._id]);

  const send = async (e) => {
    e.preventDefault();
    if (!selected || !message) return;
    await api.post(`/api/channels/${selected._id}/messages`, { text: message });
    setMessage('');
    loadMessages(selected);
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <div className="col-span-1">
        <h2 className="text-xl font-semibold mb-2">Channels</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        <ul className="space-y-2">
          {channels.map((c) => (
            <li key={c._id} className={`border rounded p-2 cursor-pointer ${selected?._id === c._id ? 'bg-blue-50' : ''}`} onClick={() => setSelected(c)}>
              {c.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-2">
        <h2 className="text-xl font-semibold mb-2">Chat</h2>
        {selected ? (
          <div className="flex flex-col h-[500px] border rounded">
            <div className="flex-1 overflow-auto p-2 space-y-2">
              {(selected.messages || []).map((m, i) => (
                <div key={i} className="bg-white border rounded p-2">
                  <div className="text-sm text-gray-600">{m.user?.firstName || 'You'}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="p-2 flex gap-2">
              <input className="border p-2 rounded flex-1" placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)} />
              <button className="bg-blue-600 text-white px-3 rounded">Send</button>
            </form>
          </div>
        ) : (
          <p>Select a channel to view messages.</p>
        )}
      </div>
    </div>
  );
}
