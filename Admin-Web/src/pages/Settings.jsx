import React, { useEffect, useState } from 'react'
import { fetchProfile, updateProfilePhoto } from '../services/admin'
import { 
  FaUserCircle, FaCamera, FaEnvelope, FaPhone, 
  FaIdBadge, FaSave, FaUserShield 
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './settings.css'

// Handle Base URL safely
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'

const Settings = () => {
  const [admin, setAdmin] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getProfileData()
  }, [])

  const getProfileData = async () => {
    try {
      const result = await fetchProfile()
      if (result.status === 'success' && result.data.length > 0) {
        setAdmin(result.data[0])
      }
    } catch (error) {
      toast.error('Failed to load profile')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Create a local preview URL so the user sees the change immediately
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // ... imports FaCamera, etc.

const handleUpload = async () => {
  if (!selectedFile) {
    toast.warning('Please select an image first');
    return;
  }

  setLoading(true);
  try {
    // Call service with raw file
    const result = await updateProfilePhoto(selectedFile);

    if (result.status === 'success') {
      toast.success('Profile photo updated!');
      
      // Update the local state so UI updates immediately
      setAdmin(prev => ({
        ...prev,
        profile_photo_url: result.data.profile_photo_url
      }));

      setSelectedFile(null);
      setPreviewUrl(null);
    }
  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};

  // Helper to determine which image to show (Preview > Server URL > Placeholder)
  const displayImage = () => {
    if (previewUrl) return previewUrl;
    if (admin?.profile_photo_url) return `${BASE_URL}${admin.profile_photo_url}`;
    return null;
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div className="title-section">
          <h3>Account Settings</h3>
          <p>Manage your profile details and preferences</p>
        </div>
      </div>

      {admin && (
        <div className="settings-grid">
          
          {/* LEFT COLUMN: Profile Photo Card */}
          <div className="settings-card profile-card">
            <div className="card-header">
              <h4>Profile Picture</h4>
            </div>
            
            <div className="card-body centered">
              <div className="image-upload-wrapper">
                <div className="image-container">
                  {displayImage() ? (
                    <img
                      src={displayImage()}
                      alt="profile"
                      className="profile-img-lg"
                    />
                  ) : (
                    <FaUserCircle className="profile-placeholder" />
                  )}
                  
                  {/* Hidden File Input + Camera Icon Label */}
                  <label htmlFor="file-input" className="camera-btn">
                    <FaCamera />
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-input"
                  />
                </div>
              </div>

              <div className="profile-text">
                <h5>{admin.email?.split('@')[0]}</h5>
                <span>{admin.role}</span>
              </div>

              {/* Only show Save button if a file is selected */}
              {selectedFile && (
                <button 
                  className="save-btn" 
                  onClick={handleUpload} 
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : <><FaSave /> Save Changes</>}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Personal Details */}
          <div className="settings-card details-card">
            <div className="card-header">
              <h4>Personal Information</h4>
            </div>

            <div className="card-body">
              <form className="details-form" onSubmit={(e) => e.preventDefault()}>
                
                {/* Email Field */}
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input 
                      type="text" 
                      value={admin.email} 
                      disabled 
                      className="form-input disabled"
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div className="form-group">
                  <label>Role</label>
                  <div className="input-wrapper">
                    <FaUserShield className="input-icon" />
                    <input 
                      type="text" 
                      value={admin.role?.toUpperCase()} 
                      disabled 
                      className="form-input disabled"
                    />
                  </div>
                </div>

                {/* Mobile Field */}
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input 
                      type="text" 
                      value={admin.mobile || 'Not Provided'} 
                      disabled 
                      className="form-input disabled"
                    />
                  </div>
                </div>

                {/* created_at Field */}
                <div className="form-group">
                  <label>Created </label>
                  <div className="input-wrapper">
                    <FaIdBadge className="input-icon" />
                    <input 
                      type="text" 
                      value={admin.created_at || 'N/A'} 
                      disabled 
                      className="form-input disabled"
                    />
                  </div>
                </div>

              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default Settings