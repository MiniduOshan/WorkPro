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

// Strict role enforcement middleware - checks user's actual role in company from DB
export const enforceRole = (allowedRoles) => async (req, res, next) => {
  try {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const companyId = req.params.companyId || req.body.companyId || req.query.companyId || req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get user's ACTUAL role from database (not from client)
    const actualRole = company.getMemberRole(req.user._id);
    if (!actualRole) {
      return res.status(403).json({ message: 'Not a member of this company' });
    }

    // Check if user's role is in the allowed list
    if (!roles.includes(actualRole)) {
      return res.status(403).json({ 
        message: `Access denied. This endpoint requires ${roles.join(' or ')} role. Your role: ${actualRole}` 
      });
    }

    // Store validated role for use in controller
    req.companyRole = actualRole;
    req.company = company;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Role validation failed', error: err.message });
  }
};
