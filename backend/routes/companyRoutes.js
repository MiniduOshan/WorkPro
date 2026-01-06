import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { searchCompanies, createCompany, myCompanies, getCompany, createInvitation, acceptInvitation, getInvitationDetails, listMembers, updateMemberRole, removeMember, myRole, acceptInvitationPublic, getUserCompanies, switchCompany } from '../controllers/companyController.js';
import { loadCompanyContext, requireRole } from '../middleware/companyAuth.js';

const router = Router();

// Search (public)
router.get('/search', searchCompanies);

// Companies
router.post('/', protect, createCompany);
router.get('/mine', protect, myCompanies);
router.get('/my-companies', protect, getUserCompanies);
router.post('/switch', protect, switchCompany);
router.get('/:id', protect, getCompany);

// Invitations
router.post('/:companyId/invitations', protect, createInvitation);
router.get('/invitations/details', getInvitationDetails);
router.post('/invitations/accept', protect, acceptInvitation);
router.post('/invitations/accept-public', acceptInvitationPublic); // Public endpoint for signup + join

// Role management & members
router.get('/:companyId/members', protect, listMembers);
router.put('/:companyId/members/:userId/role', protect, updateMemberRole);
router.delete('/:companyId/members/:userId', protect, removeMember);
router.get('/role', protect, myRole);

export default router;
