import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { IoCreateOutline, IoTrashOutline, IoTimeOutline, IoInformationCircleOutline } from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Notes() {
  const theme = useThemeColors();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/notes');
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const addNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;
    try {
      setSaving(true);
      const { data } = await api.post('/api/notes', { title: newTitle.trim(), content: newContent.trim() });
      setNotes([data, ...notes]);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setSaving(false);
    }
  };

  const updateNote = async (id, title, content) => {
    try {
      await api.put(`/api/notes/${id}`, { title, content });
      setNotes(notes.map(n => n._id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n));
    } catch (err) {
      console.error('Failed to update note', err);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  return (
    <div className="grow flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Personal Notes</h1>
            <p className="text-slate-600 text-sm font-medium">Organize your thoughts and daily reminders</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm font-semibold italic">
            <IoInformationCircleOutline className="text-lg" />
            Click on any note to edit instantly
          </div>
        </div>
      </div>

      <div className="grow overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Creator Section */}
          <div className="lg:col-span-4 lg:sticky lg:top-0 h-fit">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              {/* Increased visibility on header */}
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                <IoCreateOutline className="text-lg" />
                Draft a thought
              </h2>
              <form onSubmit={addNote} className="space-y-3">
                <input
                  type="text"
                  placeholder="Title (Optional)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  /* Darker placeholder for visibility */
                  className="w-full px-4 py-2 text-lg font-bold text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 focus:outline-none bg-transparent"
                />
                <textarea
                  placeholder="Take a note..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={newContent.length > 100 ? 8 : 4}
                  className="w-full px-4 py-2 text-slate-700 placeholder:text-slate-400 border-none focus:ring-0 focus:outline-none bg-transparent resize-none font-medium"
                />
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  {/* High visibility indicator */}
                  <span className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">Saved to cloud</span>
                  <button
                    type="submit"
                    disabled={saving || (!newTitle && !newContent)}
                    className={`px-6 py-2.5 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 
                      ${(saving || (!newTitle && !newContent)) 
                        ? 'bg-slate-300 text-slate-600 shadow-none cursor-not-allowed' 
                        : `${theme.bgPrimary} text-white ${theme.bgPrimaryHover} shadow-emerald-100`}`}
                  >
                    {saving ? 'Creating...' : 'Save Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Notes List Section */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-300 border-t-emerald-600 mb-4"></div>
                <p className="font-bold">Fetching notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                <p className="text-slate-600 font-bold text-lg">Your library is empty.</p>
                <p className="text-slate-500 font-medium">Start writing on the left.</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {notes.map(note => (
                  <NoteCard 
                    key={note._id} 
                    note={note} 
                    onUpdate={updateNote} 
                    onDelete={deleteNote} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const NoteCard = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState({ title: note.title, content: note.content });

  const handleBlur = () => {
    setIsEditing(false);
    if (val.title !== note.title || val.content !== note.content) {
      onUpdate(note._id, val.title, val.content);
    }
  };

  return (
    <div className="inline-block w-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-green-300 transition-colors group">
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-2">
            <input 
              autoFocus
              className="w-full font-bold text-slate-800 border-none focus:ring-0 p-0 text-base bg-transparent"
              value={val.title}
              onChange={e => setVal({...val, title: e.target.value})}
              onBlur={handleBlur}
            />
            <textarea 
              className="w-full text-slate-700 font-medium border-none focus:ring-0 p-0 text-sm resize-none bg-transparent"
              rows={5}
              value={val.content}
              onChange={e => setVal({...val, content: e.target.value})}
              onBlur={handleBlur}
            />
          </div>
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-pointer">
            {note.title && <h3 className="font-bold text-slate-800 mb-2 leading-tight">{note.title}</h3>}
            <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          {/* High visibility date */}
          <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
            <IoTimeOutline />
            {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <button
            onClick={() => onDelete(note._id)}
            /* Solid gray color instead of low opacity */
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Note"
          >
            <IoTrashOutline size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};