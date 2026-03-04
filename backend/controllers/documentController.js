import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Company from '../models/Company.js';

// Root uploads directory (absolute) to avoid cwd issues in container/VM setups
const uploadsRoot = path.resolve(process.cwd(), 'uploads');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.headers['x-company-id'];
    const uploadPath = path.join(uploadsRoot, 'documents', companyId || 'unknown');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Sanitize filename: remove path traversal, special characters, and lowercase everything
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    cb(null, uniqueSuffix + '-' + sanitizedOriginalName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const allowedExtensions = new Set([
    '.pdf',
    '.doc',
    '.docx',
    '.mp3',
    '.mp4',
    '.jpeg',
    '.jpg',
    '.png',
  ]);

  const allowedMimes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg',
    'video/mp4',
    'image/jpeg',
    'image/png',
  ]);

  if (allowedExtensions.has(ext) && allowedMimes.has(mimetype)) {
    return cb(null, true);
  }

  cb(new Error('Invalid file type. Allowed: PDF, Word, MP3, MP4, JPEG, PNG, JPG.'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

// Get all documents for a company
export const getDocuments = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { search, category, sortBy = '-createdAt' } = req.query;

    const query = { company: companyId, isArchived: false };

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .sort(sortBy);

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload a document
export const uploadDocument = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { category = 'general', tags, linkedType, linkedId } = req.body;

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
        if (!Array.isArray(parsedTags)) {
          parsedTags = [];
        }
      } catch (e) {
        parsedTags = [];
      }
    }

    const documentData = {
      company: companyId,
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileSize: req.file.size,
      filePath: req.file.path, // absolute path from multer; safe for downloads in containers
      category,
      uploadedBy: req.user._id,
      tags: parsedTags,
    };

    if (linkedId) {
      documentData.linkedTo = {
        type: linkedType || 'none',
        id: linkedId,
      };
    }

    const document = new Document(documentData);

    await document.save();

    // Update company storage usage
    await Company.findByIdAndUpdate(companyId, {
      $inc: { 'usage.storageUsed': req.file.size }
    });

    // If linked to a task, add document reference
    if (linkedType === 'task' && linkedId) {
      await Task.findByIdAndUpdate(linkedId, {
        $push: { attachments: document._id },
      });
    }

    const populatedDoc = await Document.findById(document._id)
      .populate('uploadedBy', 'firstName lastName email');

    res.status(201).json(populatedDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single document
export const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const document = await Document.findOne({ _id: id, company: companyId })
      .populate('uploadedBy', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update access count
    document.accessCount += 1;
    document.lastAccessed = new Date();
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download a document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const document = await Document.findOne({ _id: id, company: companyId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update access count
    document.accessCount += 1;
    document.lastAccessed = new Date();
    await document.save();

    res.download(document.filePath, document.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const document = await Document.findOneAndUpdate(
      { _id: id, company: companyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const document = await Document.findOne({ _id: id, company: companyId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.deleteOne();

    // Update company storage usage
    await Company.findByIdAndUpdate(companyId, {
      $inc: { 'usage.storageUsed': -document.fileSize }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get document stats
export const getDocumentStats = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const stats = await Document.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId), isArchived: false } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          byCategory: {
            $push: {
              category: '$category',
              count: 1,
            },
          },
          totalAccess: { $sum: '$accessCount' },
        },
      },
    ]);

    const finalStats = stats[0] || { totalDocuments: 0, totalSize: 0, totalAccess: 0 };

    // Sync company storageUsed cache if it differs significantly or on every check for consistency
    if (finalStats.totalSize !== undefined) {
      await Company.findByIdAndUpdate(companyId, {
        'usage.storageUsed': finalStats.totalSize
      });
    }

    res.json(finalStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
