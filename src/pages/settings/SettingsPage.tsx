import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import PageHeader from '../../components/ui/PageHeader';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'practice' | 'mips'>('profile');
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application settings"
      />
      
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <nav className="flex flex-col p-2">
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'preferences' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Preferences
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'practice' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('practice')}
              >
                Practice Information
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'mips' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('mips')}
              >
                MIPS Settings
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {activeTab === 'profile' && (
              <div className="divide-y divide-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Settings</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Update your personal information and account settings
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center space-x-4">
                    {user?.avatar ? (
                      <img
                        className="h-16 w-16 rounded-full"
                        src={user.avatar}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-xl">
                          {user?.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <button className="btn-outline py-1.5 text-sm">
                      Change
                    </button>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue={user?.name.split(' ')[0]}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        autoComplete="family-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue={user?.name.split(' ')[1]}
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue={user?.email}
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        autoComplete="role"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue={user?.role}
                        disabled
                      >
                        <option value="doctor">Doctor</option>
                        <option value="technician">Technician</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Role changes must be performed by an administrator
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                    <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current password
                        </label>
                        <input
                          type="password"
                          name="current-password"
                          id="current-password"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <div className="h-7" /> {/* Spacer for alignment */}
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New password
                        </label>
                        <input
                          type="password"
                          name="new-password"
                          id="new-password"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm password
                        </label>
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'preferences' && (
              <div className="divide-y divide-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Application Preferences</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Customize the application to suit your workflow
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6 space-y-6">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-900">Interface Theme</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="theme-light"
                          name="theme"
                          type="radio"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          defaultChecked
                        />
                        <label htmlFor="theme-light" className="ml-3 block text-sm text-gray-700">
                          Light
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="theme-dark"
                          name="theme"
                          type="radio"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="theme-dark" className="ml-3 block text-sm text-gray-700">
                          Dark
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="theme-system"
                          name="theme"
                          type="radio"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="theme-system" className="ml-3 block text-sm text-gray-700">
                          System default
                        </label>
                      </div>
                    </div>
                  </fieldset>
                  
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-900">Notifications</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="notifications-all"
                          name="notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-all" className="ml-3 block text-sm text-gray-700">
                          Receive all notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-appointment"
                          name="notifications-appointment"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-appointment" className="ml-3 block text-sm text-gray-700">
                          Appointment reminders
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-patient"
                          name="notifications-patient"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-patient" className="ml-3 block text-sm text-gray-700">
                          Patient check-ins
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-refill"
                          name="notifications-refill"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-refill" className="ml-3 block text-sm text-gray-700">
                          Prescription refill requests
                        </label>
                      </div>
                    </div>
                  </fieldset>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Default Examination Templates</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose default templates for different examination types
                    </p>
                    <div className="mt-2">
                      <select
                        id="default-template"
                        name="default-template"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option>Standard Comprehensive Examination</option>
                        <option>Contact Lens Fitting</option>
                        <option>Glaucoma Workup</option>
                        <option>Pediatric Examination</option>
                        <option>Custom Template 1</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'practice' && (
              <div className="divide-y divide-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Practice Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Update your practice details that appear on reports and patient communications
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="practice-name" className="block text-sm font-medium text-gray-700">
                        Practice Name
                      </label>
                      <input
                        type="text"
                        name="practice-name"
                        id="practice-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="Eye Care Specialists"
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="practice-phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="practice-phone"
                        id="practice-phone"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="(555) 123-4567"
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="practice-email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="practice-email"
                        id="practice-email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="info@eyecarespecialists.com"
                      />
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="practice-address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        name="practice-address"
                        id="practice-address"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="123 Vision Lane, Suite 101"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="practice-city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="practice-city"
                        id="practice-city"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="Anytown"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="practice-state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        name="practice-state"
                        id="practice-state"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="CA"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="practice-zip" className="block text-sm font-medium text-gray-700">
                        ZIP / Postal
                      </label>
                      <input
                        type="text"
                        name="practice-zip"
                        id="practice-zip"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        defaultValue="90210"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="practice-logo" className="block text-sm font-medium text-gray-700">
                      Practice Logo
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="business-hours" className="block text-sm font-medium text-gray-700">
                      Business Hours
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm w-24">Monday</span>
                        <input
                          type="text"
                          className="input w-24"
                          defaultValue="8:00 AM"
                        />
                        <span>to</span>
                        <input
                          type="text"
                          className="input w-24"
                          defaultValue="5:00 PM"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm w-24">Tuesday</span>
                        <input
                          type="text"
                          className="input w-24"
                          defaultValue="8:00 AM"
                        />
                        <span>to</span>
                        <input
                          type="text"
                          className="input w-24"
                          defaultValue="5:00 PM"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm w-24">Wednesday</span>
                        <input
                          type="text"
                          className="input w-24"
                          defaultValue="8:00 AM"
                        />
                        <span>to</span>
                        <input
                          type="text"
                          className="input w-24"
                          defaultValue="5:00 PM"
                        />
                      </div>
                      {/* Additional days would follow */}
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Practice Information
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'mips' && (
              <div className="divide-y divide-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">MIPS Reporting Settings</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Configure MIPS quality measures and reporting preferences
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Quality Measures</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Select quality measures that apply to your practice
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="measure-117"
                          name="measure-117"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="measure-117" className="ml-3 text-sm text-gray-700">
                          Measure #117: Diabetes Eye Exam
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="measure-12"
                          name="measure-12"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="measure-12" className="ml-3 text-sm text-gray-700">
                          Measure #12: Primary Open-Angle Glaucoma (POAG): Optic Nerve Evaluation
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="measure-141"
                          name="measure-141"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="measure-141" className="ml-3 text-sm text-gray-700">
                          Measure #141: Primary Open-Angle Glaucoma: Reduction of IOP
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="measure-19"
                          name="measure-19"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="measure-19" className="ml-3 text-sm text-gray-700">
                          Measure #19: Diabetic Retinopathy: Communication with Physician
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Promoting Interoperability</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure electronic health record requirements
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="pi-eprescribing"
                          name="pi-eprescribing"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="pi-eprescribing" className="ml-3 text-sm text-gray-700">
                          e-Prescribing
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="pi-health-info"
                          name="pi-health-info"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="pi-health-info" className="ml-3 text-sm text-gray-700">
                          Health Information Exchange
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="pi-security"
                          name="pi-security"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="pi-security" className="ml-3 text-sm text-gray-700">
                          Security Risk Analysis
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Reporting Periods</h4>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="quality-period" className="block text-sm font-medium text-gray-700">
                          Quality Measures Reporting
                        </label>
                        <select
                          id="quality-period"
                          name="quality-period"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          defaultValue="full-year"
                        >
                          <option value="full-year">Full Year (Jan 1 - Dec 31)</option>
                          <option value="q1-q2">First 6 Months (Jan 1 - Jun 30)</option>
                          <option value="q3-q4">Second 6 Months (Jul 1 - Dec 31)</option>
                        </select>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="pi-period" className="block text-sm font-medium text-gray-700">
                          Promoting Interoperability
                        </label>
                        <select
                          id="pi-period"
                          name="pi-period"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          defaultValue="full-year"
                        >
                          <option value="full-year">Full Year (Jan 1 - Dec 31)</option>
                          <option value="q1-q2">First 6 Months (Jan 1 - Jun 30)</option>
                          <option value="q3-q4">Second 6 Months (Jul 1 - Dec 31)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Automatic MIPS Compliance</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure when SOAP notes should be automatically marked as MIPS compliant
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center">
                        <input
                          id="auto-mips"
                          name="auto-mips"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="auto-mips" className="ml-3 text-sm text-gray-700">
                          Automatically check for MIPS compliance on SOAP note creation
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save MIPS Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;