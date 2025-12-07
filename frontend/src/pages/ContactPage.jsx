import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';
import LandingBottomNav from '../components/common/LandingBottomNav';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      value: 'support@nlistplanet.com',
      link: 'mailto:support@nlistplanet.com'
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Phone',
      value: '+91 98765 43210',
      link: 'tel:+919876543210'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Support Hours',
      value: 'Mon-Sat: 9AM - 7PM IST',
      link: null
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Office',
      value: 'Mumbai, Maharashtra, India',
      link: null
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 pb-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-gray-400 text-sm mb-6">
            We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-white">Contact Us</h1>
          </div>
          <img 
            src="/new_logo.png" 
            alt="NlistPlanet" 
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Header Text */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Get in Touch</h2>
          <p className="text-gray-400 text-sm">
            Have questions? We're here to help!
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {contactInfo.map((info, index) => (
            <div 
              key={index}
              onClick={() => info.link && window.open(info.link, '_blank')}
              className={`bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 ${info.link ? 'cursor-pointer hover:bg-gray-800' : ''}`}
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-2">
                {info.icon}
              </div>
              <p className="text-gray-500 text-xs mb-0.5">{info.label}</p>
              <p className="text-white text-sm font-medium">{info.value}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Send us a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Your Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Subject *</label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select a topic</option>
                <option value="trading">Trading Query</option>
                <option value="kyc">KYC Issue</option>
                <option value="payment">Payment Problem</option>
                <option value="technical">Technical Support</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Message *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">Looking for quick answers?</p>
          <button
            onClick={() => navigate('/faq')}
            className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-xl border border-gray-700"
          >
            View FAQ
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <LandingBottomNav activePage="contact" />
    </div>
  );
};

export default ContactPage;
