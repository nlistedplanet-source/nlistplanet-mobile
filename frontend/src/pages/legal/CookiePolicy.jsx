import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
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
          <h1 className="text-lg font-bold text-gray-900">Cookie Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Last Updated: December 2025</p>
          
          <p className="text-gray-700 mb-4">
            Nlist Planet uses cookies to improve your experience. This Cookie Policy explains how and why we use them.
          </p>

          <div className="space-y-6">
            {/* Section 1 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. What Are Cookies?</h2>
              <p className="text-gray-700">
                Cookies are small files stored on your device to remember your preferences and activity on our platform.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">a) Essential Cookies</h3>
                  <p className="text-gray-700 mb-2 text-sm">Required for:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Login authentication</li>
                    <li>Security</li>
                    <li>Basic website functions</li>
                  </ul>
                  <p className="text-red-600 font-semibold mt-2 text-sm">These cannot be disabled.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">b) Functional Cookies</h3>
                  <p className="text-gray-700 mb-2 text-sm">Used for:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Saving preferences</li>
                    <li>Improving user experience</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">c) Analytics Cookies</h3>
                  <p className="text-gray-700 mb-2 text-sm">Used for:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Traffic analysis</li>
                    <li>Understanding user behavior</li>
                    <li>Improving our services</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">d) Advertising Cookies (if applicable)</h3>
                  <p className="text-gray-700 mb-2 text-sm">Used for:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Relevant ads</li>
                    <li>Tracking marketing performance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. How You Can Control Cookies</h2>
              <p className="text-gray-700 mb-2">You can:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Disable cookies from browser settings</li>
                <li>Clear stored cookies anytime</li>
              </ul>
              <p className="text-gray-700 mt-3 text-sm italic">
                Note: Disabling essential cookies may affect website performance.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-2">We may use cookies from:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Google Analytics</li>
                <li>Payment partners</li>
                <li>Social media login providers</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We are not responsible for third-party cookie practices.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
