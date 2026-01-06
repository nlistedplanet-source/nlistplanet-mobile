import React, { useState, useRef } from 'react';
import { X, Send, MessageCircle, HelpCircle, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { haptic } from '../../utils/helpers';

const QueryModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [queryData, setQueryData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'General Query', icon: '💬' },
    { value: 'technical', label: 'Technical Issue', icon: '🔧' },
    { value: 'transaction', label: 'Transaction Support', icon: '💰' },
    { value: 'account', label: 'Account Help', icon: '👤' },
    { value: 'listing', label: 'Listing Query', icon: '📋' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed');
      return;
    }

    setAttachment(file);
    haptic.light();

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }

    toast.success('📎 Attachment added');
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    haptic.light();
    toast.success('Attachment removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!queryData.subject.trim() || !queryData.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    haptic.medium();
    
    try {
      const formData = new FormData();
      formData.append('subject', queryData.subject);
      formData.append('message', queryData.message);
      formData.append('category', queryData.category);
      formData.append('userId', user._id);
      formData.append('username', user.username);
      
      // Add attachment if present
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/send-query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Note: Don't set Content-Type header - browser will set it automatically with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to send query');

      haptic.success();
      toast.success('✅ Query sent to admin successfully!');
      setQueryData({ subject: '', message: '', category: 'general' });
      setAttachment(null);
      setAttachmentPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error) {
      haptic.error();
      toast.error('Failed to send query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar (Mobile) */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-emerald-50 to-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">We're Listening</h2>
              <p className="text-xs text-gray-600">We'll respond within 24 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
          >
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-safe">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Query Category
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setQueryData({ ...queryData, category: cat.value });
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 active:scale-95 ${
                    queryData.category === cat.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 active:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={queryData.subject}
              onChange={(e) => setQueryData({ ...queryData, subject: e.target.value })}
              placeholder="Brief description of your query"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 outline-none bg-white text-base"
              required
              maxLength={100}
              style={{ fontSize: '16px' }}
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              {queryData.subject.length}/100 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={queryData.message}
              onChange={(e) => setQueryData({ ...queryData, message: e.target.value })}
              placeholder="Describe your query in detail..."
              rows="5"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 outline-none bg-white text-base resize-none"
              required
              maxLength={500}
              style={{ fontSize: '16px' }}
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              {queryData.message.length}/500 characters
            </p>
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Attachment (Optional)
            </label>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload button or preview */}
            {!attachment ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <Upload size={20} className="text-gray-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Upload Screenshot or File</p>
                  <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP, PDF • Max 10MB</p>
                </div>
              </button>
            ) : (
              <div className="relative rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                {/* Preview for images */}
                {attachmentPreview ? (
                  <div className="mb-3">
                    <img 
                      src={attachmentPreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                )}
                
                {/* File info and remove button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-emerald-600" />
                    <p className="text-xs font-semibold text-emerald-700">
                      {attachment.name.length > 30 ? attachment.name.substring(0, 30) + '...' : attachment.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold active:scale-95 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
              <span className="text-blue-600 mt-0.5">💡</span>
              <span>Attach error screenshots or relevant documents to help us resolve your issue faster</span>
            </p>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-semibold">Query will be sent from:</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-gray-600">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-gray-300 bg-white text-gray-700 font-semibold text-base active:scale-95 transition-transform"
              disabled={isSubmitting}
              style={{ minHeight: '48px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-base active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2"
              style={{ minHeight: '48px' }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Query
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
            <HelpCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-900 mb-1">Quick Response Tips</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Be specific about your issue</li>
                <li>• Include relevant listing or transaction IDs if applicable</li>
                <li>• Admin typically responds within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryModal;
