import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Save, Camera, Mail, Phone, User, Calendar, Shield,
  CheckCircle, AlertCircle, Upload, Trash2, Lock, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { formatDate } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';

const ProfilePage = () => {
  const { user, updateProfile, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  // Form fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone('(555) 123-4567'); // Mock data
    }
  }, [user]);
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };
  
  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // In a real app, you would upload the avatar file to storage
      // and get back a URL to store in the user profile
      
      // Update user profile
      await updateProfile({
        name: `${firstName} ${lastName}`,
        avatar: avatarPreview || user?.avatar
      });
      
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile');
    }
  };
  
  const handleChangePassword = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Validate passwords
      if (!currentPassword) {
        setErrorMessage('Current password is required');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match');
        return;
      }
      
      if (newPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters');
        return;
      }
      
      // In a real app, this would call an authentication API to update the password
      
      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to change password');
    }
  };
  
  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center">
        <button
          type="button"
          className="mr-4 text-gray-500 hover:text-gray-700"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <PageHeader
          title="Your Profile"
          subtitle="Manage your account information and settings"
        />
      </div>
      
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </motion.div>
      )}
      
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-error-50 border border-error-200 rounded-md text-error-800 flex items-center"
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          {errorMessage}
        </motion.div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Profile Header with Avatar */}
        <div className="relative h-32 bg-primary-600">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              {avatarPreview || user.avatar ? (
                <img
                  src={avatarPreview || user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 border-4 border-white shadow-md flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-2xl">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 rounded-full bg-primary-500 p-1.5 text-white shadow-sm"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-14 px-8 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 capitalize">{user.role}</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-8">
            <button
              className={`${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button
              className={`${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </nav>
        </div>
        
        {activeTab === 'profile' && (
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                // Edit mode
                <>
                  <div>
                    <label htmlFor="firstName\" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email address cannot be changed
                    </p>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo
                    </label>
                    <div className="mt-1 flex items-center">
                      {avatarPreview ? (
                        <div className="relative">
                          <img 
                            src={avatarPreview} 
                            alt="Avatar preview" 
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm text-gray-500 hover:text-error-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                          onClick={handleAvatarClick}
                        >
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4 inline mr-1" />
                        Upload
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG or GIF up to 2MB
                    </p>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      Full Name
                    </div>
                    <div className="text-sm font-medium">{user.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      Email Address
                    </div>
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      Phone Number
                    </div>
                    <div className="text-sm font-medium">{phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-gray-400" />
                      Role
                    </div>
                    <div className="text-sm font-medium capitalize">{user.role}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Member Since
                    </div>
                    <div className="text-sm font-medium">June 15, 2024</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="px-8 py-6">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="current-password"
                      name="current-password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new-password"
                      name="new-password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      name="confirm-password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={handleChangePassword}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-primary-500" />
                    Password Requirements
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1 mt-2">
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                      Include at least one uppercase letter
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                      Include at least one number
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                      Include at least one special character
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Login Sessions</h3>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-primary-100">
                        <Shield className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        Current Session
                        <span className="ml-2 px-2 py-0.5 text-xs bg-success-100 text-success-800 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <div>Web Browser • Windows 10 • Chicago, IL</div>
                        <div className="text-xs mt-1 text-gray-400">
                          Started June 15, 2024 at 9:24 AM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="btn-error mt-2"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out all other devices?")) {
                      // In a real app, this would call an API to revoke all other sessions
                      setSuccessMessage("All other sessions have been logged out");
                    }
                  }}
                >
                  Log out from all other devices
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions Footer */}
        {isEditing && activeTab === 'profile' && (
          <div className="px-8 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setIsEditing(false);
                // Reset form values
                const nameParts = user.name.split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                setAvatarPreview(null);
                setAvatarFile(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;