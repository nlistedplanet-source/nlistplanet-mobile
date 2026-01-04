import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle } from 'lucide-react';
import LandingBottomNav from '../components/common/LandingBottomNav';

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'trading', label: 'Trading' },
    { id: 'kyc', label: 'KYC' },
    { id: 'payment', label: 'Payment' },
    { id: 'security', label: 'Security' }
  ];

  const faqs = [
    {
      category: 'trading',
      question: 'What are unlisted shares?',
      answer: 'Unlisted shares are equity shares of companies that are not listed on any stock exchange like NSE or BSE. These include shares of pre-IPO companies, startups, and private companies. You can trade these shares on our platform at your own price.'
    },
    {
      category: 'trading',
      question: 'How do I buy unlisted shares on NlistPlanet?',
      answer: '1. Create an account and complete KYC verification\n2. Browse available listings or search for specific companies\n3. Place a buy order at your desired price\n4. Wait for a seller to accept or negotiate\n5. Complete the payment and receive shares in your demat account'
    },
    {
      category: 'trading',
      question: 'How do I sell my unlisted shares?',
      answer: '1. Go to "Create Listing" and select "Sell"\n2. Enter company name, quantity, and your asking price\n3. Add your listing to the marketplace\n4. Buyers will see your listing and can place bids\n5. Accept a bid, complete transfer, and receive payment'
    },
    {
      category: 'trading',
      question: 'What is the minimum investment amount?',
      answer: 'There is no fixed minimum investment. You can buy shares based on the price set by sellers. Some shares might be priced as low as ₹100 per share, while others could be ₹10,000+ per share depending on the company valuation.'
    },
    {
      category: 'kyc',
      question: 'What documents are required for KYC?',
      answer: 'For KYC verification, you need:\n• PAN Card (mandatory)\n• Aadhaar Card or Passport\n• Bank account details with cancelled cheque\n• Demat account details (DP ID & Client ID)\n• Recent photograph'
    },
    {
      category: 'kyc',
      question: 'How long does KYC verification take?',
      answer: 'KYC verification typically takes 24-48 hours after you submit all required documents. You will receive email and SMS notifications once your KYC is approved or if additional documents are needed.'
    },
    {
      category: 'kyc',
      question: 'Can I trade without completing KYC?',
      answer: 'No, KYC verification is mandatory for all users before they can buy or sell shares. This is required for regulatory compliance and to ensure secure transactions between verified users.'
    },
    {
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept:\n• UPI (GPay, PhonePe, Paytm)\n• Net Banking (NEFT/RTGS/IMPS)\n• Bank Transfer\n\nPayments are made directly between buyer and seller. We do not hold funds.'
    },
    {
      category: 'payment',
      question: 'Is there any brokerage or fees?',
      answer: 'NlistPlanet charges a minimal platform fee on successful transactions. There are no hidden charges, subscription fees, or listing fees.'
    },
    {
      category: 'payment',
      question: 'How is payment secured?',
      answer: 'All transactions happen between verified KYC users. We provide:\n• Escrow protection on request\n• Transaction tracking\n• Dispute resolution support\n• Verified user badges\n\nWe recommend using our secure payment guidelines for all trades.'
    },
    {
      category: 'security',
      question: 'Is my data safe on NlistPlanet?',
      answer: 'Yes, we take data security very seriously:\n• Bank-grade encryption (256-bit SSL)\n• Secure data storage\n• Regular security audits\n• Two-factor authentication\n• Privacy-first approach - we never share your data'
    },
    {
      category: 'security',
      question: 'How do you verify share authenticity?',
      answer: 'We verify shares through:\n• Demat account verification\n• Company confirmation (where possible)\n• Document verification\n• Historical transaction records\n\nAlways verify shares before completing payment.'
    },
    {
      category: 'security',
      question: 'What if there is a dispute?',
      answer: 'In case of disputes:\n1. Report the issue through our support\n2. Our team will investigate\n3. We mediate between parties\n4. Resolution within 7-14 days\n\nWe have a dedicated dispute resolution team to handle such cases fairly.'
    },
    {
      category: 'trading',
      question: 'Can I set my own price?',
      answer: 'Yes! Unlike brokers, NlistPlanet allows you to set your own buying or selling price. This peer-to-peer model gives you full control over your trades. You can also negotiate with other users.'
    },
    {
      category: 'trading',
      question: 'How do shares get transferred to my demat?',
      answer: 'After payment confirmation:\n1. Seller initiates off-market transfer through their DP\n2. Seller provides transfer slip/confirmation\n3. Shares reflect in your demat within 1-3 working days\n4. You confirm receipt on platform\n5. Transaction marked complete'
    }
  ];

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <div>
              <h1 className="text-lg font-bold text-white">FAQ</h1>
              <p className="text-xs text-gray-500">Frequently Asked Questions</p>
            </div>
          </div>
          <img 
            src="/new_logo.png" 
            alt="NlistPlanet" 
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* FAQ List */}
      <div className="px-4 py-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">No questions found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left"
                >
                  <span className="text-white font-medium text-sm">
                    {faq.question}
                  </span>
                  <span className="text-gray-500 flex-shrink-0 mt-0.5">
                    {openItems[index] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                
                {openItems[index] && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-gray-700/50 pt-3">
                      <p className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-8 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-6 text-center border border-emerald-500/20">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <LandingBottomNav activePage="faq" />
    </div>
  );
};

export default FAQPage;
