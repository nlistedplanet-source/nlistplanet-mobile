import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, FileQuestion, Clock, ChevronRight } from 'lucide-react';
import { haptic } from '../../utils/helpers';

const HelpSupport = () => {
  const navigate = useNavigate();

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
        {/* Contact Options */}
        <div className="bg-white rounded-2xl shadow-mobile p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h2>
          <div className="space-y-3">
            <a
              href="mailto:support@nlistplanet.com"
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Email Support</p>
                <p className="text-sm text-gray-500">support@nlistplanet.com</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="tel:+918999999999"
              className="flex items-center gap-4 p-4 bg-green-50 rounded-xl"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-500">Mon-Sat, 10AM - 6PM</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="https://wa.me/918999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-500">Quick responses</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">Response Time</p>
              <p className="text-sm text-amber-700">We typically respond within 24 hours</p>
            </div>
          </div>
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
    </div>
  );
};

export default HelpSupport;
