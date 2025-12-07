import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, TrendingUp, Award, Target, Zap, CheckCircle } from 'lucide-react';
import LandingBottomNav from '../components/common/LandingBottomNav';

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '₹50Cr+', label: 'Trading Volume' },
    { value: '500+', label: 'Companies Listed' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Security First',
      description: 'Bank-grade security with KYC verification for all users'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Driven',
      description: 'Built by traders, for traders with real market insights'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Transparency',
      description: 'Fair pricing with no hidden fees or charges'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Innovation',
      description: 'Cutting-edge technology for seamless trading experience'
    }
  ];

  const team = [
    { name: 'Leadership', role: 'Founded by experienced fintech professionals' },
    { name: 'Technology', role: 'Built by engineers from top tech companies' },
    { name: 'Compliance', role: 'Guided by regulatory and legal experts' }
  ];

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
            <h1 className="text-lg font-bold text-white">About Us</h1>
          </div>
          <img 
            src="/new_logo.png" 
            alt="NlistPlanet" 
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <img 
              src="/new_logo.png" 
              alt="NlistPlanet" 
              className="w-16 h-16 object-contain"
              onError={(e) => { 
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-3xl font-bold text-white">N</span>';
              }}
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">NlistPlanet</h2>
          <p className="text-gray-400 text-sm">India's #1 Unlisted Share Marketplace</p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-6 mb-6 border border-emerald-500/20">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Our Mission
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            To democratize access to pre-IPO and unlisted shares, enabling every Indian investor 
            to participate in the growth stories of tomorrow's market leaders. We believe wealth 
            creation opportunities should be accessible to all, not just the privileged few.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Our Values */}
        <h3 className="text-lg font-bold text-white mb-4">Our Values</h3>
        <div className="space-y-3 mb-6">
          {values.map((value, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 flex-shrink-0">
                  {value.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{value.title}</h4>
                  <p className="text-gray-500 text-sm">{value.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What We Offer */}
        <div className="bg-gray-800/50 rounded-2xl p-5 mb-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            What We Offer
          </h3>
          <div className="space-y-3">
            {[
              'Trade unlisted shares at your own price',
              'Access to 500+ pre-IPO companies',
              'Zero brokerage - direct P2P trading',
              'Secure escrow & verified transfers',
              'Real-time market insights & news',
              'Dedicated customer support'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <h3 className="text-lg font-bold text-white mb-4">Our Team</h3>
        <div className="space-y-3 mb-6">
          {team.map((member, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h4 className="text-white font-semibold">{member.name}</h4>
              <p className="text-gray-500 text-sm">{member.role}</p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Have Questions?</h3>
          <p className="text-emerald-100 text-sm mb-4">We'd love to hear from you</p>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-2.5 bg-white text-emerald-600 font-semibold rounded-xl"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <LandingBottomNav activePage="about" />
    </div>
  );
};

export default AboutPage;
