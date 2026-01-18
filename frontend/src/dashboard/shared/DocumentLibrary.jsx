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
} from 'react-icons/io5';
import api from '../../api/axios';
import { useThemeColors } from '../../utils/themeHelper';

const DocumentLibrary = () => {
  const theme = useThemeColors();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadData, setUploadData] = useState({
    name: '',
    category: 'general',
    tags: '',
  });
  const [stats, setStats] = useState({ totalDocuments: 0, totalSize: 0 });

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [categoryFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await api.get(`/api/documents?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file && !uploadData.name) {
      setUploadData({ ...uploadData, name: file.name });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadData.name);
      formData.append('category', uploadData.category);
      formData.append('tags', JSON.stringify(uploadData.tags.split(',').map(t => t.trim())));

      await api.post('/api/documents', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadData({ name: '', category: 'general', tags: '' });
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Failed to upload document');
    }
  };

  const handleDownload = async (id, name) => {
    try {
      const response = await api.get(`/api/documents/${id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(type)) {
      return <IoImageOutline className="w-8 h-8 text-purple-600" />;
    } else if (['.pdf'].includes(type)) {
      return <IoDocumentTextOutline className="w-8 h-8 text-red-600" />;
    } else if (['.doc', '.docx', '.txt'].includes(type)) {
      return <IoDocumentOutline className={`w-8 h-8 text-${theme.primary}`} />;
    }
    return <IoFileTrayFullOutline className="w-8 h-8 text-gray-600" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-600 mt-2">Centralized file management for your team</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className={`flex items-center gap-2 ${theme.bgPrimary} text-white px-6 py-3 rounded-lg ${theme.bgPrimaryHover} transition`}
        >
          <IoCloudUploadOutline className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDocuments || 0}</p>
            </div>
            <div className={`w-12 h-12 bg-${theme.primaryLight} rounded-lg flex items-center justify-center`}>
              <IoDocumentOutline className={`w-6 h-6 text-${theme.primary}`} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Storage Used</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {formatFileSize(stats.totalSize || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <IoFolderOutline className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Access</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalAccess || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IoDownloadOutline className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchDocuments()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="contract">Contract</option>
            <option value="report">Report</option>
            <option value="presentation">Presentation</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="image">Image</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={fetchDocuments}
            className={`px-6 py-3 ${theme.bgPrimary} text-white rounded-lg ${theme.bgPrimaryHover} transition`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Document Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <IoFileTrayFullOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No documents found</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className={`text-${theme.primary} hover:text-${theme.primaryTextDark} font-medium`}
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className={`p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-all hover:border-${theme.primaryBorderLight}`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(doc._id, doc.originalName)}
                        className={`p-1.5 text-${theme.primary} hover:bg-${theme.primaryLight} rounded`}
                        title="Download"
                      >
                        <IoDownloadOutline className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {doc.name}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span className="capitalize">{doc.category}</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      By {doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}
                    </div>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 bg-${theme.primaryLight} text-${theme.primary} rounded-full text-[10px] font-medium`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="contract">Contract</option>
                  <option value="report">Report</option>
                  <option value="presentation">Presentation</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., important, Q1, finance"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 ${theme.bgPrimary} text-white rounded-lg ${theme.bgPrimaryHover} font-medium`}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentLibrary;
