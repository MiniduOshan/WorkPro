import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { searchCompanies, createCompany, myCompanies, getCompany, createInvitation, acceptInvitation, getInvitationDetails, listMembers, updateMemberRole, removeMember, myRole, acceptInvitationPublic, getUserCompanies, switchCompany, deleteCompany } from '../controllers/companyController.js';
import { loadCompanyContext, requireRole } from '../middleware/companyAuth.js';

const router = Router();

// Search (public)
router.get('/search', searchCompanies);

// Companies - specific routes first
router.get('/mine', protect, myCompanies);
router.get('/my-companies', protect, getUserCompanies);
router.post('/switch', protect, switchCompany);
router.get('/role', protect, myRole);

// Invitations - specific routes
router.get('/invitations/details', getInvitationDetails);
router.post('/invitations/accept', protect, acceptInvitation);
router.post('/invitations/accept-public', acceptInvitationPublic);

// Company creation
router.post('/', protect, createCompany);

// Generic company routes with parameters
router.get('/:id', protect, getCompany);
router.delete('/:companyId', protect, deleteCompany);
router.post('/:companyId/invitations', protect, createInvitation);
router.get('/:companyId/members', protect, listMembers);
router.put('/:companyId/members/:userId/role', protect, updateMemberRole);
router.delete('/:companyId/members/:userId', protect, removeMember);

export default router;
