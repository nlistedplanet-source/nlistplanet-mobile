import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-lg font-bold text-gray-900">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Last Updated: December 2025</p>
          
          <p className="text-gray-700 mb-4">
            These Terms govern your use of Nlist Planet's platform for buying & selling unlisted shares. 
            By creating an account, you agree to these Terms.
          </p>

          <div className="space-y-6">
            {/* Section 1 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Eligibility</h2>
              <p className="text-gray-700 mb-2">To use Nlist Planet, you must:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Be 18+ years old</li>
                <li>Have valid KYC documents</li>
                <li>Use the platform for lawful purposes</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Account Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-3">
                <li>Maintain accurate information</li>
                <li>Keep login details confidential</li>
                <li>Report any unauthorized access</li>
              </ul>
              <p className="text-gray-900 font-semibold">
                You are fully responsible for activities performed from your account
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Platform Services</h2>
              <p className="text-gray-700 mb-2">Nlist Planet provides:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Marketplace for unlisted shares</li>
                <li>Bidding & offer placement</li>
                <li>User-to-user communication</li>
                <li>Transaction tracking</li>
                <li>Verification support</li>
              </ul>
              <p className="text-gray-900 font-semibold mt-3">
                We are NOT a stock exchange or SEBI-registered broker.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. User Conduct Rules</h2>
              <p className="text-gray-700 mb-2">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Post fake or misleading listings</li>
                <li>Engage in fraud or illegal activities</li>
                <li>Upload harmful or malicious code</li>
                <li>Use automated bots</li>
                <li>Harass or abuse other users</li>
              </ul>
              <p className="text-red-600 font-semibold mt-3">
                Violation may lead to account suspension.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Transaction Terms</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>All trades are user-to-user (P2P)</li>
                <li>Prices are set by the users</li>
                <li>Nlist Planet charges a platform fee (if applicable)</li>
                <li>We are not responsible for losses, disputes, or incorrect information posted by users</li>
                <li>Users should do their own research before trading</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Content Ownership</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>You own the content you post</li>
                <li>By posting, you give us permission to display it on our platform</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-2">Nlist Planet is not liable for:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Investment losses</li>
                <li>Price fluctuations</li>
                <li>Inaccurate user listings</li>
                <li>Delays or errors in transactions</li>
                <li>Technical issues</li>
              </ul>
              <p className="text-gray-900 font-semibold mt-3">
                Use the platform at your own risk.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Termination</h2>
              <p className="text-gray-700 mb-2">We may suspend or terminate your account if:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>You violate our policies</li>
                <li>You engage in suspicious activity</li>
                <li>You post false documents</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update the Terms any time. Continued use means you accept the changes.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Contact Us</h2>
              <div className="space-y-2 text-gray-700">
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

export default TermsOfService;
