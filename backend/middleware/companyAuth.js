import Company from '../models/Company.js';

// Loads company to req.company and user's role in company to req.companyRole
export const loadCompanyContext = async (req, res, next) => {
  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
  if (!companyId) return res.status(400).json({ message: 'companyId is required' });

  const company = await Company.findById(companyId);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  const role = company.getMemberRole(req.user?._id);
  if (!role) return res.status(403).json({ message: 'Not a member of this company' });

  req.company = company;
  req.companyRole = role;
  next();
};

export const requireRole = (allowedRoles) => (req, res, next) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!req.companyRole) return res.status(500).json({ message: 'Company role not loaded' });
  if (!roles.includes(req.companyRole) && req.companyRole !== 'owner') {
    return res.status(403).json({ message: 'Insufficient role for this action' });
  }
  next();
};
