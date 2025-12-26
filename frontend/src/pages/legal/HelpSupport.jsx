import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Send } from 'lucide-react';
import { haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import QueryModal from '../../components/modals/QueryModal';
import toast from 'react-hot-toast';

const HelpSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  const faqs = [
    {
      question: 'How do I create a listing?',
      answer: 'Go to the marketplace, tap the + button, select whether you want to Buy or Sell, choose the company, enter price and quantity, and submit.'
    },
    {
      question: 'How does KYC verification work?',
      answer: 'Upload your Aadhaar and PAN card in the KYC section. Our team verifies your documents within 24-48 hours.'
    },
    {
      question: 'How do I complete a trade?',
      answer: 'Once both parties accept a deal, our RM will contact you with verification codes. Share documents as instructed to complete the transfer.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security practices. Your documents and personal data are stored securely.'
    },
    {
      question: 'How do I contact admin?',
      answer: 'Use the "Send Query to Admin" button below. Our admin team will respond to your query within 24 hours.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-50 shadow-sm border-b border-slate-200">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                haptic.light();
                navigate(-1);
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* Send Query Button */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white mb-2">Need Help?</h2>
            <p className="text-sm text-white/80">Send us your query and our admin team will respond within 24 hours</p>
          </div>
          <button
            onClick={() => {
              haptic.medium();
              setIsQueryModalOpen(true);
            }}
            className="w-full bg-white text-primary-600 rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <Send size={20} />
            Send Query to Admin
          </button>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-mobile p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <p className="font-semibold text-gray-900 mb-2">{faq.question}</p>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Query Modal */}
      <QueryModal 
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
      />
    </div>
  );
};

export default HelpSupport;
