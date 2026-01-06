# Code Changes - Detailed Reference

## File 1: Auth.jsx - Signup Route Fix

**Location:** `frontend/src/pages/Auth.jsx` (Line ~98)

### BEFORE
```javascript
} else {
  // New signup - go to dashboard (will show company creation)
  navigate('/dashboard?first-time=true');
}
```

### AFTER
```javascript
} else {
  // New signup - go directly to manager dashboard
  navigate('/dashboard/manager?first-time=true');
}
```

### What Changed
- Route changed from `/dashboard?first-time=true` to `/dashboard/manager?first-time=true`
- Ensures first-time users land on ManagerDashboard, not EmployeeDashboard
- Enables company creation modal to auto-show

---

## File 2: ManagerDashboard.jsx - Major Updates

**Location:** `frontend/src/dashboard/ManagerDashboard.jsx`

### Change 1: Updated Imports (Lines 1-20)

**BEFORE:**
```javascript
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  IoCheckmarkDoneOutline, 
  IoTimeOutline, 
  IoPeopleOutline, 
  IoWarningOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoSwapVerticalOutline,
  IoSendOutline,
  IoCopyOutline,
  IoLinkOutline,
  IoNotificationsOutline,
  IoAddOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';
```

**AFTER:**
```javascript
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  IoCheckmarkDoneOutline, 
  IoTimeOutline, 
  IoPeopleOutline, 
  IoWarningOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoSwapVerticalOutline,
  IoSendOutline,
  IoCopyOutline,
  IoLinkOutline,
  IoNotificationsOutline,
  IoAddOutline,
  IoCloseCircleOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoRocketOutline
} from 'react-icons/io5';
```

**Added:**
- `useSearchParams` hook for detecting first-time parameter
- Three new icons: `IoBusinessOutline`, `IoGlobeOutline`, `IoRocketOutline`

---

### Change 2: Updated Component Initialization (Lines 23-60)

**BEFORE:**
```javascript
export default function ManagerDashboard() {
  const [companyData, setCompanyData] = useState(null);
  const [stats, setStats] = useState({
    completedProjects: 124,
    avgCompletionTime: '3.4 Days',
    teamEngagement: '92%',
    overdueTasks: 4
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'to-do',
    priority: 'normal',
    assignedTo: ''
  });
```

**AFTER:**
```javascript
export default function ManagerDashboard() {
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get('first-time') === 'true';
  
  const [companyData, setCompanyData] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(isFirstTime);
  const [stats, setStats] = useState({
    completedProjects: 124,
    avgCompletionTime: '3.4 Days',
    teamEngagement: '92%',
    overdueTasks: 4
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'to-do',
    priority: 'normal',
    assignedTo: ''
  });
  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    website: '',
    mission: '',
    vision: '',
    industry: '',
    departments: ['Tech', 'Marketing', 'HR']
  });
  const [newDept, setNewDept] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    department: ''
  });
```

**Added State Variables:**
- `searchParams` - from URL query parameters
- `isFirstTime` - boolean flag (true if ?first-time=true)
- `showCompanyModal` - visibility of company creation modal
- `showInviteModal` - visibility of invite employee modal
- `companyForm` - company details form data
- `newDept` - new department input
- `inviteForm` - employee invitation form data

---

### Change 3: Added Handler Functions (Lines 100-145)

**NEW FUNCTION: handleCreateCompany()**
```javascript
const handleCreateCompany = async (e) => {
  e.preventDefault();
  try {
    const { data } = await api.post('/api/companies', companyForm);
    localStorage.setItem('companyId', data._id);
    localStorage.setItem('companyRole', 'owner');
    setShowCompanyModal(false);
    window.location.reload();
  } catch (err) {
    console.error('Failed to create company:', err);
    alert(err.response?.data?.message || 'Failed to create company');
  }
};
```

**NEW FUNCTION: handleAddDepartment()**
```javascript
const handleAddDepartment = () => {
  if (newDept.trim() && !companyForm.departments.includes(newDept.trim())) {
    setCompanyForm({
      ...companyForm,
      departments: [...companyForm.departments, newDept.trim()]
    });
    setNewDept('');
  }
};
```

**NEW FUNCTION: handleRemoveDepartment()**
```javascript
const handleRemoveDepartment = (dept) => {
  setCompanyForm({
    ...companyForm,
    departments: companyForm.departments.filter(d => d !== dept)
  });
};
```

**NEW FUNCTION: handleInviteEmployee()**
```javascript
const handleInviteEmployee = async (e) => {
  e.preventDefault();
  try {
    const companyId = localStorage.getItem('companyId');
    await api.post(`/api/companies/${companyId}/invitations`, inviteForm);
    setShowInviteModal(false);
    setInviteForm({ email: '', role: 'employee', department: '' });
    alert('Invitation sent successfully!');
  } catch (err) {
    console.error('Failed to send invitation:', err);
    alert(err.response?.data?.message || 'Failed to send invitation');
  }
};
```

---

### Change 4: Added Modal Components (Lines 205-450)

**NEW COMPONENT: CompanyCreationModal()**
```javascript
const CompanyCreationModal = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <IoBusinessOutline className="w-7 h-7" />
          Create Your Company
        </h2>
        <p className="text-blue-100 mt-1">Set up your organization to get started</p>
      </div>
      
      <form onSubmit={handleCreateCompany} className="p-6 space-y-6">
        {/* Form fields for: name, description, website, mission, vision, industry, departments */}
        {/* ... (see implementation in file) ... */}
        <button type="submit" className="...">
          Create Company
        </button>
      </form>
    </div>
  </div>
);
```

**Form Fields in CompanyCreationModal:**
- Company Name (required)
- Description (optional)
- Website (optional)
- Mission (optional)
- Vision (optional)
- Industry (optional)
- Departments (with add/remove functionality)

**NEW COMPONENT: InviteEmployeeModal()**
```javascript
const InviteEmployeeModal = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Add Team Member</h2>
        <p className="text-blue-100 mt-1">Send invitation to join your company</p>
      </div>
      
      <form onSubmit={handleInviteEmployee} className="p-6 space-y-4">
        {/* Email input */}
        {/* Role selector (Employee/Manager) */}
        {/* Department selector */}
        <button type="submit">Send Invitation</button>
      </form>
    </div>
  </div>
);
```

**Form Fields in InviteEmployeeModal:**
- Email Address (required)
- Role (required - Employee or Manager)
- Department (optional - dropdown from company departments)

---

### Change 5: Updated Return Statement (Wrapper)

**BEFORE:**
```javascript
return (
  <div className="grow flex flex-col overflow-hidden">
```

**AFTER:**
```javascript
return (
  <>
    {showCompanyModal && <CompanyCreationModal />}
    {showInviteModal && <InviteEmployeeModal />}
    <div className="grow flex flex-col overflow-hidden">
```

**AFTER (End of component):**
```javascript
      )}
      </>
    );
  }
```

**What Changed:**
- Wrapped entire component with Fragment (`<>...</>`)
- Render modals conditionally before main dashboard content
- Ensures modals appear on top of dashboard

---

### Change 6: Updated Team Oversight Header

**BEFORE:**
```javascript
<div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
  <h3 className="font-bold text-slate-800">Team Oversight</h3>
  <div className="flex gap-2">
    <button className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition">
      <IoFilterOutline className="text-xs" />
    </button>
    <button className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition">
      <IoSwapVerticalOutline className="text-xs" />
    </button>
  </div>
</div>
```

**AFTER:**
```javascript
<div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
  <h3 className="font-bold text-slate-800">Team Oversight</h3>
  <div className="flex gap-2">
    <button className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition">
      <IoFilterOutline className="text-xs" />
    </button>
    <button className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition">
      <IoSwapVerticalOutline className="text-xs" />
    </button>
    <button 
      onClick={() => setShowInviteModal(true)}
      className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-semibold"
    >
      <IoAddOutline className="text-sm" />
      Add Member
    </button>
  </div>
</div>
```

**What Changed:**
- Added "Add Member" button after filter/sort buttons
- Button onClick triggers `setShowInviteModal(true)`
- Opens InviteEmployeeModal when clicked

---

## Summary of Code Changes

| File | Changes | Lines | Type |
|------|---------|-------|------|
| Auth.jsx | Changed signup redirect | 1 line | Fix |
| ManagerDashboard.jsx | Updated imports | +3 icons | Addition |
| ManagerDashboard.jsx | Added state variables | +7 states | Addition |
| ManagerDashboard.jsx | Added handler functions | +4 functions | Addition |
| ManagerDashboard.jsx | Added modal components | ~250 lines | Addition |
| ManagerDashboard.jsx | Updated return wrapper | ~3 lines | Update |
| ManagerDashboard.jsx | Added "Add Member" button | 1 button | Addition |

**Total Code Added:** ~350 lines (mostly JSX for modals)
**Lines Modified:** 5 lines
**Files Changed:** 2 files

---

## API Calls Made

The new code makes these API calls:

### Company Creation
```javascript
POST /api/companies
{
  "name": "...",
  "description": "...",
  "website": "...",
  "mission": "...",
  "vision": "...",
  "industry": "...",
  "departments": [...]
}
```

### Employee Invitation
```javascript
POST /api/companies/:companyId/invitations
{
  "email": "...",
  "role": "employee" | "manager",
  "department": "..."
}
```

---

## State Flow Diagram

```
Initial State
    ↓
isFirstTime = true (detected from ?first-time=true)
    ↓
showCompanyModal = true (auto-opens)
    ↓
User fills companyForm
    ↓
handleCreateCompany() called
    ↓
API: POST /api/companies
    ↓
localStorage updated with companyId
    ↓
window.location.reload()
    ↓
Dashboard reloads with company data
    ↓
Manager can now click "Add Member" button
    ↓
showInviteModal = true
    ↓
User fills inviteForm
    ↓
handleInviteEmployee() called
    ↓
API: POST /api/companies/:companyId/invitations
    ↓
Employee sent invitation email
```

---

## Error Handling

Both handlers include try-catch blocks:

```javascript
try {
  // Make API call
} catch (err) {
  console.error('Error:', err);
  alert(err.response?.data?.message || 'Fallback error message');
}
```

This ensures:
- ✅ Errors logged to console
- ✅ User-friendly error message shown
- ✅ App doesn't crash on API failure

