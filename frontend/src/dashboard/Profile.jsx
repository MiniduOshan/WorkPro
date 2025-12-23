import { IoPencilOutline, IoCameraOutline, IoSaveOutline, IoCloseOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import React from 'react';
import api from '../api/axios'; 

// 🎨 HIGH-CONTRAST COLOR MAPPINGS
const ACCENT_PURPLE = 'purple-700'; // Used for Avatar, Focus states
const SUCCESS_COLOR = 'teal-600';    // Used for Save button (Strong contrast with purple theme)
const NEUTRAL_ACTION = 'indigo-600'; // Used for Edit button

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        profilePic: '', 
    });
    const [tempPicUrl, setTempPicUrl] = useState(''); // To hold the URL during image edit prompt
    const [error, setError] = useState(null);
    const fileInputRef = React.useRef(null); // Reference for file input

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Derived state for display
    const combinedName = `${profileData.firstName} ${profileData.lastName}`;
    const initialAvatar = profileData.firstName[0] || 'U';


    // --- FETCH PROFILE DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError("No authentication token found.");
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/api/users/profile', config);
                
                const initialData = {
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    mobileNumber: data.mobileNumber || 'Add number',
                    profilePic: data.profilePic || '/images/default_avatar.png',
                };
                
                setProfileData(initialData);
                setTempPicUrl(initialData.profilePic); // Initialize temp URL
                
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);


    // --- SAVE PROFILE (API CALL) ---
    const handleSave = async (e) => {
        e.preventDefault();

        const dataToSave = {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            mobileNumber: profileData.mobileNumber === 'Add number' ? '' : profileData.mobileNumber,
            // Note: profilePic is now handled separately via file upload
        };

        try {
            // API call to update profile
            const { data: responseData } = await api.put('/api/users/profile', dataToSave, config);
            
            // FIX: Update the token if the backend re-issues it after save (common for updates)
            if (responseData.token) {
                localStorage.setItem('token', responseData.token);
            }
            
            // FIX: Update local state with the saved data
            setProfileData({ ...profileData, ...dataToSave });
            
            setIsEditing(false);
            alert('Profile Updated Successfully!');
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCancelEdit = () => {
        // Reset local form changes and exit edit mode
        // A better approach is to store the original state upon entering edit mode, 
        // but for simplicity, we'll rely on the existing state structure.
        setIsEditing(false);
        // Re-fetch or reset if necessary, but keeping simple for now.
    }


    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleNameChange = (e) => {
        const parts = e.target.value.trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ');

        setProfileData({ 
            ...profileData, 
            firstName: firstName,
            lastName: lastName,
        });
    };
    
    // Allows editing the profile picture via file upload
    const handlePictureChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('profilePic', file);

        try {
            const { data } = await api.post('/api/users/upload-profile-pic', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update profile data with new image
            setProfileData({ ...profileData, profilePic: data.profilePic });
            setTempPicUrl(data.profilePic);
            alert('Profile picture updated successfully!');
        } catch (err) {
            console.error('Picture upload failed:', err);
            alert('Failed to upload picture: ' + (err.response?.data?.message || err.message));
        }
    };

    // --- RENDER HELPERS ---
    const renderValue = (value) => value === 'Add number' || value === '' ? (
        <span className="text-gray-400 italic">Not specified</span>
    ) : (
        <span className="text-gray-800">{value}</span>
    );
    

    if (loading) return <div className="text-center p-10">Loading Profile...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Profile Settings</h2> {/* High contrast text */}

            <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
                
                {/* 1. Avatar Section */}
                <div className="flex items-center">
                    <div className="relative w-24 h-24 mr-6 flex-shrink-0">
                        {/* Avatar Image or Initial Placeholder */}
                        {/* Avatar initial placeholder color updated to ACCENT_PURPLE for brand consistency */}
                        <div className={`w-full h-full bg-${ACCENT_PURPLE} rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-white shadow-md`}>
                            {(isEditing ? tempPicUrl : profileData.profilePic) && 
                             (isEditing ? tempPicUrl : profileData.profilePic) !== '/images/default_avatar.png' ? (
                                <img 
                                    src={isEditing ? tempPicUrl : profileData.profilePic} 
                                    alt="User Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                initialAvatar
                            )}
                        </div>
                        
                        {/* Camera Button */}
                        {isEditing && (
                            <>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    type="button"
                                    // Camera button color updated to ACCENT_PURPLE
                                    className={`absolute bottom-0 right-0 p-2 bg-${ACCENT_PURPLE} text-white rounded-full border-2 border-white hover:bg-purple-800 transition-colors shadow-md`}
                                    title="Change Profile Picture"
                                >
                                    <IoCameraOutline className="w-5 h-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePictureChange}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>
                    
                    {/* User Info (Name/Email) */}
                    <div>
                        <p className="text-xl font-semibold text-gray-800">{combinedName}</p>
                        <p className="text-sm text-gray-800 mt-1">{profileData.email}</p>
                    </div>
                </div>

                {/* 2. Edit/Save/Cancel Button Group */}
                <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                type="button"
                                // Neutral Cancel button color
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                            >
                                <IoCloseOutline className="w-5 h-5" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                type="submit"
                                // Save button color updated to SUCCESS_COLOR (Teal)
                                className={`px-4 py-2 bg-${SUCCESS_COLOR} text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors flex items-center space-x-2`}
                            >
                                <IoSaveOutline className="w-5 h-5" />
                                <span>Save Changes</span>
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)}
                            type="button"
                            // Edit button color updated to NEUTRAL_ACTION (Indigo)
                            className={`px-4 py-2 bg-${NEUTRAL_ACTION} text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center space-x-2`}
                        >
                            <IoPencilOutline className="w-5 h-5" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>
            </div>

            {/* --- Profile Details Form --- */}
            <form onSubmit={handleSave} className="space-y-4">
                
                {/* Full Name Field */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center">
                    <label className="text-black-500 font-medium">Full Name</label>
                    <div className="col-span-2">
                        {isEditing ? (
                            <input
                                type="text"
                                name="fullName"
                                value={combinedName}
                                onChange={handleNameChange}
                                // Focus color updated to ACCENT_PURPLE
                                className={`w-full border border-gray-300 rounded-lg p-2 focus:ring-${ACCENT_PURPLE} focus:border-${ACCENT_PURPLE}`}
                                required
                            />
                        ) : (
                            renderValue(combinedName)
                        )}
                    </div>
                </div>
                
                {/* Email Field */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center">
                    <label className="text-black-500 font-medium">Email Account</label>
                    <div className="col-span-2">
                        {/* Email is never editable here, just displayed */}
                        <p className="text-gray-800 font-medium">{profileData.email}</p>
                    </div>
                </div>
                
                {/* Mobile Number Field */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center">
                    <label className="text-black-500 font-medium">Mobile Number</label>
                    <div className="col-span-2">
                        {isEditing ? (
                            <input
                                type="text"
                                name="mobileNumber"
                                value={profileData.mobileNumber === 'Add number' ? '' : profileData.mobileNumber}
                                onChange={handleChange}
                                placeholder="e.g., +1234567890"
                                // Focus color updated to ACCENT_PURPLE
                                className={`w-full border border-gray-300 rounded-lg p-2 focus:ring-${ACCENT_PURPLE} focus:border-${ACCENT_PURPLE}`}
                            />
                        ) : (
                            renderValue(profileData.mobileNumber)
                        )}
                    </div>
                </div>
                
                {/* Hidden submit button to allow form submission via Enter key */}
                {isEditing && <button type="submit" hidden />}

            </form>
        </div>
    );
};

export default Profile;