import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="touch-feedback p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Last Updated: December 2025</p>
          
          <p className="text-gray-700 mb-4">
            Nlist Planet ("we", "our", "us") is committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you use 
            our platform for buying and selling unlisted shares.
          </p>

          <div className="space-y-6">
            {/* Section 1 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-700 mb-3">We may collect the following information:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">a) Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Mobile number</li>
                    <li>KYC documents (PAN, Aadhaar, etc.)</li>
                    <li>Bank details for transactions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">b) Usage Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>IP address</li>
                    <li>Device information</li>
                    <li>Browser type</li>
                    <li>Pages visited</li>
                    <li>Login activity</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">c) Transactional Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Buy/Sell orders</li>
                    <li>Bids & offers</li>
                    <li>Payment confirmation records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use your data for:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Creating & verifying your account</li>
                <li>Enabling buying and selling of unlisted shares</li>
                <li>Fraud detection & security</li>
                <li>Customer support</li>
                <li>Sending important updates & notifications</li>
                <li>Improving platform performance</li>
              </ul>
              <p className="text-gray-900 font-semibold mt-3">We never sell your data to any third party.</p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Sharing of Information</h2>
              <p className="text-gray-700 mb-2">We may share information only with:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Government authorities (if legally required)</li>
                <li>Payment gateway & banking partners</li>
                <li>KYC verification partners</li>
                <li>Internal team members (strictly limited access)</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Data Security</h2>
              <p className="text-gray-700 mb-2">We use:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Encrypted data storage</li>
                <li>Secure access control</li>
                <li>Regular security audits</li>
                <li>OTP-based authentication</li>
              </ul>
              <p className="text-gray-700 mt-3 text-sm italic">
                Still, no method is 100% secure. You use the platform at your own risk.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Your Rights</h2>
              <p className="text-gray-700 mb-2">You can request:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Your stored data</li>
                <li>Correction or update of your information</li>
                <li>Account deletion</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Contact: <a href="mailto:support@nlistplanet.com" className="text-emerald-600 font-semibold">support@nlistplanet.com</a>
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cookies & Tracking</h2>
              <p className="text-gray-700 mb-2">We use cookies to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Improve website performance</li>
                <li>Save login preferences</li>
                <li>Analyze user activity</li>
              </ul>
              <p className="text-gray-700 mt-2 text-sm">
                You can disable cookies from browser settings.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Third-Party Links</h2>
              <p className="text-gray-700">
                Our website may contain links to other sites. We are not responsible for their privacy practices.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this policy anytime. Continued use means you agree to the changes.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Contact Us</h2>
              <p className="text-gray-700">For questions, contact us at:</p>
              <div className="mt-3 space-y-2 text-gray-700">
                <p>📧 <a href="mailto:support@nlistplanet.com" className="text-emerald-600 font-semibold">support@nlistplanet.com</a></p>
                <p>📍 Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
