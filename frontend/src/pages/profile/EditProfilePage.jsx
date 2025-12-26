import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Camera, Upload, FileText, CheckCircle, XCircle, 
  User, Mail, Phone, Calendar, MapPin, Building2, CreditCard, Users, Shuffle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';
import axios from 'axios';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    accountType: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    nomineeName: '',
    nomineeRelationship: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [kycDocuments, setKycDocuments] = useState({
    pan: null,
    aadharFront: null,
    aadharBack: null,
    cancelledCheque: null,
    cml: null
  });
  
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',
        accountType: user.bankAccount?.accountType || '',
        accountNumber: user.bankAccount?.accountNumber || '',
        ifsc: user.bankAccount?.ifsc || '',
        bankName: user.bankAccount?.bankName || '',
        nomineeName: user.nominee?.name || '',
        nomineeRelationship: user.nominee?.relationship || ''
      });
      
      if (user.profileImage) {
        setProfileImagePreview(user.profileImage);
      }
      
      if (user.kycDocuments) {
        setKycDocuments({
          pan: user.kycDocuments.pan || null,
          aadharFront: user.kycDocuments.aadharFront || user.kycDocuments.aadhar || null,
          aadharBack: user.kycDocuments.aadharBack || null,
          cancelledCheque: user.kycDocuments.cancelledCheque || null,
          cml: user.kycDocuments.cml || null
        });
      }
    }
  }, [user]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycDocumentUpload = async (docType, file) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/kyc/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setKycDocuments(prev => ({
        ...prev,
        [docType]: response.data.url || response.data.documentUrl
      }));
      
      haptic.success();
      toast.success(`${docType.toUpperCase()} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || `Failed to upload ${docType}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDOBChange = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    }
    setProfileData({ ...profileData, dob: cleaned });
  };

  const generateUsername = () => {
    const adjectives = ['cool', 'smart', 'fast', 'wise', 'bold', 'brave', 'swift', 'sharp'];
    const nouns = ['tiger', 'eagle', 'shark', 'wolf', 'lion', 'hawk', 'bear', 'fox'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999);
    const newUsername = `${randomAdj}${randomNoun}${randomNum}`;
    setProfileData({ ...profileData, username: newUsername });
  };

  const handleSave = async () => {
    haptic.medium();
    setLoading(true);
    try {
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        
        await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/upload-profile-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }
      
      const success = await updateProfile(profileData);
      if (success) {
        haptic.success();
        toast.success('Profile updated successfully!');
        navigate(-1);
      }
    } catch (error) {
      haptic.error();
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNextTab = () => {
    haptic.light();
    if (activeTab === 'personal') {
      setActiveTab('bank');
    } else if (activeTab === 'bank') {
      setActiveTab('documents');
    }
  };

  const handlePreviousTab = () => {
    haptic.light();
    if (activeTab === 'documents') {
      setActiveTab('bank');
    } else if (activeTab === 'bank') {
      setActiveTab('personal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-safe-offset-24">
      {/* Clean Header with Back */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 px-6 pt-safe pb-6 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Edit Profile</h1>
            <p className="text-sm text-white/70">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Profile Image */}
      <div className="px-6 py-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
              {profileImagePreview || user.profileImage ? (
                <img 
                  src={profileImagePreview || user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-600">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 shadow-lg"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Tap to change profile picture</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-sm">
          {['personal', 'bank', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-zinc-400'
              }`}
            >
              {tab === 'personal' ? 'Personal' : tab === 'bank' ? 'Bank' : 'Documents'}
            </button>
          ))}
        </div>
      </div>

      {/* Forms */}
      <div className="px-6 space-y-6">
        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <>
            <FormField
              label="Username"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              icon={<User size={18} />}
              readOnly
              action={
                <button onClick={generateUsername} className="text-primary-600 font-semibold text-sm">
                  <Shuffle size={16} />
                </button>
              }
            />
            <FormField
              label="Full Name *"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              icon={<User size={18} />}
              required
            />
            <FormField
              label="Email *"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              icon={<Mail size={18} />}
              required
            />
            <FormField
              label="Phone *"
              type="tel"
              value={profileData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setProfileData({ ...profileData, phone: value });
                }
              }}
              icon={<Phone size={18} />}
              maxLength="10"
              required
            />
            <FormField
              label="Date of Birth"
              value={profileData.dob}
              onChange={(e) => handleDOBChange(e.target.value)}
              icon={<Calendar size={18} />}
              placeholder="DD/MM/YYYY"
              maxLength="10"
            />
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 block">Gender</label>
              <select
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-zinc-100"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <FormField
              label="Address Line 1"
              value={profileData.addressLine1}
              onChange={(e) => setProfileData({ ...profileData, addressLine1: e.target.value })}
              icon={<MapPin size={18} />}
            />
            <FormField
              label="Address Line 2"
              value={profileData.addressLine2}
              onChange={(e) => setProfileData({ ...profileData, addressLine2: e.target.value })}
              icon={<MapPin size={18} />}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="City"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                icon={<Building2 size={18} />}
              />
              <FormField
                label="State"
                value={profileData.state}
                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                icon={<Building2 size={18} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Pincode"
                value={profileData.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setProfileData({ ...profileData, pincode: value });
                  }
                }}
                icon={<MapPin size={18} />}
                maxLength="6"
              />
              <FormField
                label="Country"
                value={profileData.country}
                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                icon={<MapPin size={18} />}
              />
            </div>
          </>
        )}

        {/* Bank Tab */}
        {activeTab === 'bank' && (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 block">Account Type</label>
              <select
                value={profileData.accountType}
                onChange={(e) => setProfileData({ ...profileData, accountType: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-zinc-100"
              >
                <option value="">Select Type</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
            <FormField
              label="Account Number"
              value={profileData.accountNumber}
              onChange={(e) => setProfileData({ ...profileData, accountNumber: e.target.value })}
              icon={<CreditCard size={18} />}
            />
            <FormField
              label="IFSC Code"
              value={profileData.ifsc}
              onChange={(e) => setProfileData({ ...profileData, ifsc: e.target.value })}
              icon={<Building2 size={18} />}
            />
            <FormField
              label="Bank Name"
              value={profileData.bankName}
              onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
              icon={<Building2 size={18} />}
            />
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nominee Details</h3>
              <FormField
                label="Nominee Name"
                value={profileData.nomineeName}
                onChange={(e) => setProfileData({ ...profileData, nomineeName: e.target.value })}
                icon={<Users size={18} />}
              />
              <FormField
                label="Relationship"
                value={profileData.nomineeRelationship}
                onChange={(e) => setProfileData({ ...profileData, nomineeRelationship: e.target.value })}
                icon={<Users size={18} />}
              />
            </div>
          </>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">KYC Documents</h3>
              
              <KycDocumentCardMobile
                title="PAN Card"
                docType="pan"
                document={kycDocuments.pan}
                onUpload={handleKycDocumentUpload}
                uploading={uploadingDoc}
                color="blue"
              />
              
              <KycDocumentCardMobile
                title="Aadhar Card (Front)"
                docType="aadharFront"
                document={kycDocuments.aadharFront}
                onUpload={handleKycDocumentUpload}
                uploading={uploadingDoc}
                color="green"
              />
              
              <KycDocumentCardMobile
                title="Aadhar Card (Back)"
                docType="aadharBack"
                document={kycDocuments.aadharBack}
                onUpload={handleKycDocumentUpload}
                uploading={uploadingDoc}
                color="green"
              />
              
              <KycDocumentCardMobile
                title="Cancelled Cheque"
                docType="cancelledCheque"
                document={kycDocuments.cancelledCheque}
                onUpload={handleKycDocumentUpload}
                uploading={uploadingDoc}
                color="purple"
              />
              
              <KycDocumentCardMobile
                title="CML (Client Master List)"
                docType="cml"
                document={kycDocuments.cml}
                onUpload={handleKycDocumentUpload}
                uploading={uploadingDoc}
                color="orange"
                optional
              />
              
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> Upload clear documents. Formats: JPG, PNG, PDF (Max 10MB)
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Action Buttons at Bottom */}
      <div className="px-6 py-6 bg-white dark:bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          {/* Left side - Previous/Cancel */}
          <div className="flex gap-3 flex-1">
            {activeTab !== 'personal' && (
              <button
                onClick={handlePreviousTab}
                className="px-6 py-3.5 border-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-2xl font-semibold"
              >
                ← Prev
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-2xl font-semibold"
            >
              Cancel
            </button>
          </div>
          
          {/* Right side - Next/Save */}
          {activeTab !== 'documents' ? (
            <button
              onClick={handleNextTab}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save All'}
            </button>
          )}
        </div>
      </div>    </div>
  );
};

const FormField = ({ label, value, onChange, icon, type = 'text', required = false, readOnly = false, action, ...props }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
    <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
      {icon && <span className="text-primary-600">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center gap-2">
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-zinc-100 ${readOnly ? 'opacity-60' : ''}`}
        {...props}
      />
      {action}
    </div>
  </div>
);

const KycDocumentCardMobile = ({ title, docType, document, onUpload, uploading, color = 'blue', optional = false }) => {
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(docType, file);
    }
    e.target.value = '';
  };

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  };
  
  const isPDF = document && document.toLowerCase().endsWith('.pdf');
  
  return (
    <div className={`${colorClasses[color]} border rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-gray-600 dark:text-zinc-400" />
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
              {title}
              {optional && <span className="text-xs text-gray-500 ml-2">(Optional)</span>}
            </h5>
            <p className="text-xs flex items-center gap-1 mt-1">
              {document ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle size={12} />
                  Uploaded {isPDF && '(PDF)'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <XCircle size={12} />
                  Not uploaded
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {document && (
          <a
            href={document}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl font-semibold text-center"
          >
            {isPDF ? 'Download' : 'View'}
          </a>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 px-4 py-2.5 text-sm bg-primary-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          {uploading ? 'Uploading...' : document ? 'Replace' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default EditProfilePage;
