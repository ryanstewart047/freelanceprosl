import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, uploadProfilePhoto, uploadDocument } from '../api/auth';
import FileUploader from '../components/FileUploader';
import '../styles/pages/UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile(id);
        setProfile(response.data);
        setFormData({
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          email: response.data.email,
          phone: response.data.phone || '',
          bio: response.data.bio || '',
          title: response.data.title || '',
          location: response.data.location || '',
          skills: response.data.skills || [],
          hourlyRate: response.data.hourly_rate || '',
        });
        setDocuments(response.data.documents || []);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData({
      ...formData,
      skills
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        title: formData.title,
        location: formData.location,
        skills: formData.skills,
        hourly_rate: formData.hourlyRate,
      };
      
      const response = await updateUserProfile(id, updateData);
      setProfile(response.data);
      setIsEditing(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    try {
      setLoading(true);
      const response = await uploadProfilePhoto(id, file);
      
      // Update the profile with the new photo URL
      setProfile({
        ...profile,
        avatar_url: response.data.avatar_url
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file, type) => {
    try {
      setLoading(true);
      const response = await uploadDocument(id, file, type);
      
      // Update the documents list
      setDocuments([...documents, response.data]);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(`Failed to upload ${type}. Please try again.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="profile-loading">
        <i className="fas fa-circle-notch fa-spin"></i>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <i className="fas fa-user-slash"></i>
        <h2>User not found</h2>
        <p>The profile you're looking for doesn't exist or you don't have permission to view it.</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Go to Homepage</button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === parseInt(id);

  return (
    <div className="user-profile-container">
      {saveSuccess && (
        <div className="profile-success-message">
          <i className="fas fa-check-circle"></i>
          Profile updated successfully!
        </div>
      )}
      
      {error && profile && (
        <div className="profile-error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i> Profile
        </button>
        
        {isOwnProfile && (
          <>
            <button 
              className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <i className="fas fa-file-alt"></i> Documents
            </button>
            
            <button 
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog"></i> Settings
            </button>
          </>
        )}
      </div>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                  </div>
                )}
                
                {isOwnProfile && !isEditing && (
                  <div className="avatar-overlay">
                    <button className="change-photo-btn" onClick={() => setActiveTab('documents')}>
                      <i className="fas fa-camera"></i>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="profile-title">
                <h1>{profile.first_name} {profile.last_name}</h1>
                <p className="profile-headline">{profile.title || 'No title set'}</p>
                
                {isOwnProfile && !isEditing && (
                  <button 
                    className="btn btn-outline edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="title">Professional Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Senior Web Developer"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., New York, USA"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell clients about yourself and your expertise"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="skills">Skills (comma separated)</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="hourlyRate">Hourly Rate ($)</label>
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Save Changes
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="profile-section">
                  <h2>About</h2>
                  <p className="profile-bio">{profile.bio || 'No bio provided yet.'}</p>
                </div>
                
                <div className="profile-section">
                  <h2>Skills</h2>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="skills-list">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p>No skills listed yet.</p>
                  )}
                </div>
                
                <div className="profile-section">
                  <h2>Contact Information</h2>
                  <div className="contact-details">
                    <div className="contact-item">
                      <i className="fas fa-envelope"></i>
                      <span>{profile.email}</span>
                    </div>
                    
                    {profile.phone && (
                      <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    
                    {profile.location && (
                      <div className="contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'documents' && isOwnProfile && (
          <div className="documents-section">
            <h2>Profile Photo & Documents</h2>
            
            <div className="document-type">
              <h3>Profile Photo</h3>
              <FileUploader
                onUpload={handlePhotoUpload}
                label="Upload a new profile photo"
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                maxSize={2}
                id="profile-photo"
                type="photo"
              />
            </div>
            
            <div className="document-type">
              <h3>CV / Resume</h3>
              <FileUploader
                onUpload={(file) => handleDocumentUpload(file, 'cv')}
                label="Upload your CV/Resume"
                acceptedFileTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                maxSize={5}
                id="cv-upload"
                type="CV"
              />
              
              {documents.filter(doc => doc.type === 'cv').length > 0 && (
                <div className="existing-documents">
                  <h4>Current CV / Resume</h4>
                  <ul className="documents-list">
                    {documents.filter(doc => doc.type === 'cv').map((doc, index) => (
                      <li key={index} className="document-item">
                        <i className="fas fa-file-pdf"></i>
                        <span className="document-name">{doc.filename}</span>
                        <div className="document-actions">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="document-link">
                            <i className="fas fa-download"></i> Download
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="document-type">
              <h3>Certificates</h3>
              <FileUploader
                onUpload={(file) => handleDocumentUpload(file, 'certificate')}
                label="Upload a certificate"
                acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                maxSize={5}
                id="certificate-upload"
                type="Certificate"
              />
              
              {documents.filter(doc => doc.type === 'certificate').length > 0 && (
                <div className="existing-documents">
                  <h4>Uploaded Certificates</h4>
                  <ul className="documents-list">
                    {documents.filter(doc => doc.type === 'certificate').map((doc, index) => (
                      <li key={index} className="document-item">
                        <i className="fas fa-certificate"></i>
                        <span className="document-name">{doc.filename}</span>
                        <div className="document-actions">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="document-link">
                            <i className="fas fa-download"></i> Download
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="document-type">
              <h3>Other Documents</h3>
              <FileUploader
                onUpload={(file) => handleDocumentUpload(file, 'other')}
                label="Upload other documents"
                acceptedFileTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']}
                maxSize={5}
                id="other-upload"
                type="Document"
              />
              
              {documents.filter(doc => doc.type === 'other').length > 0 && (
                <div className="existing-documents">
                  <h4>Other Documents</h4>
                  <ul className="documents-list">
                    {documents.filter(doc => doc.type === 'other').map((doc, index) => (
                      <li key={index} className="document-item">
                        <i className="fas fa-file"></i>
                        <span className="document-name">{doc.filename}</span>
                        <div className="document-actions">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="document-link">
                            <i className="fas fa-download"></i> Download
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && isOwnProfile && (
          <div className="settings-section">
            <h2>Account Settings</h2>
            
            <div className="settings-group">
              <h3>Change Password</h3>
              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input type="password" id="currentPassword" name="currentPassword" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input type="password" id="newPassword" name="newPassword" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" />
                </div>
                
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-key"></i> Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
