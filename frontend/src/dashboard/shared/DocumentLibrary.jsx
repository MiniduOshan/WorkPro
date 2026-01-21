import React, { useState, useEffect } from 'react';
import {
  IoDocumentOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoFileTrayFullOutline,
  IoCloudUploadOutline,
  IoSearchOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoClose,
  IoFolderOutline,
  IoFilterOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

// Theme color mapping for inline styles
const getThemeColorValues = () => {
  const path = window.location.pathname;
  const isEmployee = path.startsWith('/dashboard') && !path.startsWith('/dashboard/manager') && !path.startsWith('/dashboard/super-admin');
  
  if (isEmployee) {
    // Green theme for employees
    return {
      bgPrimary: '#16a34a',      // green-600
      bgPrimaryHover: '#15803d',  // green-700
      bgLight: '#dcfce7',         // green-50
      textPrimary: '#16a34a',     // green-600
      focusBorderPrimary: '#16a34a',
      accentLight: '#86efac',     // green-300
    };
  }
  
  // Blue theme for managers
  return {
    bgPrimary: '#2563eb',       // blue-600
    bgPrimaryHover: '#1d4ed8',   // blue-700
    bgLight: '#dbeafe',          // blue-50
    textPrimary: '#2563eb',      // blue-600
    focusBorderPrimary: '#2563eb',
    accentLight: '#93c5fd',      // blue-300
  };
};

const DocumentLibrary = () => {
  const theme = getThemeColorValues();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadData, setUploadData] = useState({ name: '', category: 'general', tags: '' });
  const [stats, setStats] = useState({ totalDocuments: 0, totalSize: 0, totalAccess: 0 });

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [categoryFilter, searchQuery]); // Refetch on filter change for real-time feel

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await api.get(`/api/documents?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, 'x-company-id': companyId },
      });
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/documents/stats', {
        headers: { Authorization: `Bearer ${token}`, 'x-company-id': companyId },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadData.name);
      formData.append('category', uploadData.category);
      formData.append('tags', JSON.stringify(uploadData.tags.split(',').map(t => t.trim())));

      await api.post('/api/documents', formData, {
        headers: {
          'x-company-id': companyId,
        },
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadData({ name: '', category: 'general', tags: '' });
      fetchDocuments();
      fetchStats();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      alert(`Upload failed: ${errorMsg}`);
      console.error('Document upload error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8faf9] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Document Library</h1>
          <p className="text-slate-500 mt-1">Manage and organize your team's shared knowledge.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className={`flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg`}
          style={{ backgroundColor: theme.bgPrimary, boxShadow: `0 10px 15px -3px ${theme.bgPrimary}40` }}
          onMouseEnter={(e) => e.target.style.backgroundColor = theme.bgPrimaryHover}
          onMouseLeave={(e) => e.target.style.backgroundColor = theme.bgPrimary}
        >
          <IoCloudUploadOutline className="w-5 h-5" />
          Upload New File
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Files" 
          value={stats.totalDocuments} 
          icon={<IoDocumentOutline />} 
          theme={theme}
        />
        <StatCard 
          label="Storage Used" 
          value={formatFileSize(stats.totalSize)} 
          icon={<IoFolderOutline />} 
          theme={theme}
        />
        <StatCard 
          label="Total Downloads" 
          value={stats.totalAccess || 0} 
          icon={<IoDownloadOutline />} 
          theme={theme}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or tag..."
            className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl transition-all text-sm`}
            style={{ focusRing: `2px ${theme.focusBorderPrimary}` }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <IoFilterOutline className="text-slate-400 hidden md:block" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 md:w-48 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-600"
            style={{ '--focus-color': theme.focusBorderPrimary }}
            onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px rgba(0,0,0,0.05), 0 0 0 3px ${theme.focusBorderPrimary}`}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          >
            <option value="all">All Categories</option>
            <option value="contract">Contracts</option>
            <option value="report">Reports</option>
            <option value="image">Images</option>
            <option value="spreadsheet">Sheets</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingState />
      ) : documents.length === 0 ? (
        <EmptyState onUpload={() => setShowUploadModal(true)} theme={theme} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <DocumentCard 
              key={doc._id} 
              doc={doc}
              theme={theme}
              onDownload={() => {}} // Connect handleDownload
              onDelete={() => {}}   // Connect handleDelete
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onUpload={handleUpload}
          uploadData={uploadData}
          setUploadData={setUploadData}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          formatFileSize={formatFileSize}
          theme={theme}
        />
      )}
    </div>
  );
};

/* --- Sub-Components --- */

const StatCard = ({ label, value, icon, theme }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: theme.bgLight, color: theme.bgPrimary }}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const DocumentCard = ({ doc, theme, onDownload, onDelete }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 transition-all group flex flex-col shadow-sm hover:shadow-md" style={{ borderColor: 'rgb(226, 232, 240)' }}>
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        <FileIcon type={doc.fileType} theme={theme} />
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDownload} className="p-2 rounded-lg transition-colors" style={{ color: theme.textPrimary, backgroundColor: theme.bgLight }}>
          <IoDownloadOutline />
        </button>
        <button onClick={onDelete} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors">
          <IoTrashOutline />
        </button>
      </div>
    </div>
    
    <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1 transition-colors" title={doc.name}>
      {doc.name}
    </h3>
    
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ color: theme.textPrimary, backgroundColor: theme.bgLight }}>
        {doc.category}
      </span>
      <span className="text-[10px] text-slate-400 font-medium italic">
        {doc.fileType.replace('.', '').toUpperCase()}
      </span>
    </div>

    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-medium text-slate-400">
      <span>{doc.uploadedBy?.firstName} • Today</span>
      <span className="text-slate-500 font-bold">1.2 MB</span>
    </div>
  </div>
);

const FileIcon = ({ type, theme }) => {
  const t = type?.toLowerCase();
  if (t?.includes('pdf')) return <IoDocumentTextOutline className="text-rose-500" />;
  if (t?.includes('jpg') || t?.includes('png')) return <IoImageOutline className="text-amber-500" />;
  if (t?.includes('xls') || t?.includes('csv')) return <IoFileTrayFullOutline style={{ color: theme.bgPrimary }} />;
  return <IoDocumentOutline className="text-slate-400" />;
};

const UploadModal = ({ onClose, onUpload, uploadData, setUploadData, selectedFile, setSelectedFile, formatFileSize, theme }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><IoClose size={20}/></button>
      </div>

      <form onSubmit={onUpload} className="p-8 space-y-5">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center transition-colors bg-slate-50 group cursor-pointer relative" style={{ borderColor: 'rgb(226, 232, 240)' }}>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => {
              const file = e.target.files[0];
              setSelectedFile(file);
              if (file) setUploadData(prev => ({ ...prev, name: file.name }));
            }}
          />
          <IoCloudUploadOutline className="w-10 h-10 mx-auto mb-3 transition-colors" style={{ color: 'rgb(148, 163, 184)' }} />
          {selectedFile ? (
            <p className="text-sm font-bold" style={{ color: theme.bgPrimary }}>{selectedFile.name}</p>
          ) : (
            <p className="text-sm text-slate-500 font-medium">Click or drag file to upload</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block">Display Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm"
              style={{ '--focus-color': theme.focusBorderPrimary }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px rgba(0,0,0,0.05), 0 0 0 3px ${theme.focusBorderPrimary}`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              value={uploadData.name}
              onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block">Category</label>
            <select
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm"
              style={{ '--focus-color': theme.focusBorderPrimary }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px rgba(0,0,0,0.05), 0 0 0 3px ${theme.focusBorderPrimary}`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="contract">Contract</option>
              <option value="report">Report</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block">Tags</label>
            <input
              type="text"
              placeholder="Q1, Draft..."
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm"
              style={{ '--focus-color': theme.focusBorderPrimary }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px rgba(0,0,0,0.05), 0 0 0 3px ${theme.focusBorderPrimary}`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              value={uploadData.tags}
              onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
          <button 
            type="submit" 
            className="flex-1 py-3 text-white rounded-xl font-bold transition-all"
            style={{ backgroundColor: theme.bgPrimary, boxShadow: `0 10px 15px -3px ${theme.bgPrimary}40` }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.bgPrimaryHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.bgPrimary}
          >Upload File</button>
        </div>
      </form>
    </div>
  </div>
);

const EmptyState = ({ onUpload, theme }) => (
  <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 text-center">
    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: theme.bgLight }}>
      <IoFileTrayFullOutline className="text-3xl" style={{ color: theme.accentLight }} />
    </div>
    <h3 className="text-xl font-bold text-slate-800">Library is Empty</h3>
    <p className="text-slate-400 text-sm mt-2 mb-8 max-w-xs mx-auto">Start by uploading important documents for your team to access.</p>
    <button 
      onClick={onUpload} 
      className="text-white px-8 py-3 rounded-xl font-bold transition" 
      style={{ backgroundColor: theme.bgPrimary }} 
      onMouseEnter={(e) => e.target.style.backgroundColor = theme.bgPrimaryHover} 
      onMouseLeave={(e) => e.target.style.backgroundColor = theme.bgPrimary}
    >
      Add Your First File
    </button>
  </div>
);

const LoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map((n) => (
      <div key={n} className="bg-white h-48 rounded-2xl border border-slate-100" />
    ))}
  </div>
);

export default DocumentLibrary;