import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Trade Unlisted Shares',
      description: 'Access pre-IPO opportunities from top startups and unicorns'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Trusted',
      description: 'Bank-grade security with KYC verification for all users'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Transactions',
      description: 'Fast and seamless P2P trading experience'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Active Community',
      description: 'Join thousands of investors trading daily'
    }
  ];

  const benefits = [
    'Zero platform fees for buyers',
    'Real-time price discovery',
    'Transparent seller ratings',
    'Secure escrow service',
    'Mobile-first experience',
    '24/7 customer support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="px-6 pt-12 pb-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">N</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Trade Unlisted
            <br />
            <span className="text-primary-600">Shares</span> Securely
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Your trusted P2P marketplace for pre-IPO investments and unlisted securities
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-12">
          <Link
            to="/register"
            className="btn-primary w-full flex items-center justify-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary w-full flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>10K+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>₹500Cr+ Traded</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose NlistPlanet?
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Platform Benefits</h3>
          <div className="grid grid-cols-1 gap-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2">Ready to Start Trading?</h3>
          <p className="text-primary-100 text-sm mb-4">
            Join thousands of investors already trading on NlistPlanet
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4">
        <p className="text-xs text-center text-gray-500">
          © 2024 NlistPlanet. All rights reserved.
          <br />
          <span className="text-primary-600 font-medium">Terms</span> • {' '}
          <span className="text-primary-600 font-medium">Privacy</span> • {' '}
          <span className="text-primary-600 font-medium">Contact</span>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
