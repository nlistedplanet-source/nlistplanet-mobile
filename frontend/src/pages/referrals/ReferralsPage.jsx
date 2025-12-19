import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Share2,
  Copy,
  Eye,
  MousePointerClick,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Award,
  Package,
  User
} from 'lucide-react';
import { formatCurrency, haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-v8dc.onrender.com/api';

const ReferralsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [shares, setShares] = useState([]);

  useEffect(() => {
    fetchShareStats();
  }, []);

  const fetchShareStats = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
        haptic.medium();
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/share/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalShares: data.totalShares || 0,
          totalViews: data.totalClicks || 0,
          totalConversions: data.totalConversions || 0,
          totalEarnings: data.totalEarnings || 0,
          conversionRate: data.totalClicks > 0 
            ? ((data.totalConversions / data.totalClicks) * 100).toFixed(2)
            : 0
        });

        const enrichedShares = await Promise.all(
          (data.shares || []).map(async (share) => {
            const listing = share.listingId;
            if (!listing) return null;

            const isOwnPost = listing.userId?.toString() === user._id?.toString();
            
            return {
              _id: share._id,
              shareId: share.shareId,
              postId: listing.postId || 'N/A',
              company: listing.companyName || listing.company || 'Unknown',
              companyLogo: listing.companyId?.logo || listing.companyId?.Logo,
              type: listing.type,
              price: listing.price,
              quantity: listing.quantity,
              isOwnPost,
              ownerUsername: listing.username || 'N/A',
              views: share.uniqueVisitors?.length || 0,
              clicks: share.clicks || 0,
              conversions: share.conversions?.length || 0,
              earnings: share.conversions?.reduce((sum, c) => sum + (c.referralReward || 0), 0) || 0,
              shareDate: share.shareDate || share.createdAt,
              shareLink: `${window.location.origin}/listing/${listing._id}?ref=${share.shareId}`
            };
          })
        );

        setShares(enrichedShares.filter(s => s !== null));

        if (showToast) {
          haptic.success();
          toast.success('Stats refreshed!');
        }
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error);
      toast.error('Failed to load statistics');
      haptic.error();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyCode = () => {
    if (!user?.referralCode) return;
    
    haptic.medium();
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied!');
  };

  const handleCopyShareLink = (link) => {
    haptic.medium();
    navigator.clipboard.writeText(link);
    toast.success('Share link copied!');
  };

  const handleShare = async (link, company) => {
    haptic.medium();
    
    const shareText = `Check out this ${company} listing on NlistPlanet!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${company} | NlistPlanet`,
          text: shareText,
          url: link
        });
        toast.success('Shared successfully!');
        haptic.success();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700">
        <div className="px-6 pt-safe pb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                haptic.light();
                navigate(-1);
              }}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center touch-feedback"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => fetchShareStats(true)}
              disabled={refreshing}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center touch-feedback disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Share & Earn</h1>
          <p className="text-white/90">Track your shares and earnings</p>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 shadow-xl mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-purple-100 mb-1">Your Referral Code</p>
              <code className="text-2xl font-bold font-mono tracking-wider">{user?.referralCode || 'N/A'}</code>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Award size={28} />
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors touch-feedback"
          >
            <Copy size={18} />
            Copy Referral Code
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-mobile">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold text-gray-600">Shares</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalShares || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-mobile">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-xs font-semibold text-gray-600">Views</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-mobile">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-semibold text-gray-600">Conversions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalConversions || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-mobile text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-semibold">Earnings</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</p>
          </div>
        </div>

        {/* Shared Posts */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Shared Posts ({shares.length})
          </h2>

          {shares.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-mobile">
              <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No shares yet</p>
              <p className="text-sm text-gray-500">Start sharing posts to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <div key={share._id} className="bg-white rounded-2xl overflow-hidden shadow-mobile">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      {share.companyLogo && (
                        <img 
                          src={share.companyLogo} 
                          alt={share.company}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{share.company}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                            {share.postId}
                          </span>
                          {share.isOwnPost ? (
                            <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                              <CheckCircle size={10} />
                              Your Post
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                              <User size={10} />
                              @{share.ownerUsername}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        share.type === 'sell' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {share.type === 'sell' ? 'SELL' : 'BUY'}
                      </span>
                      <span className="text-gray-600">₹{share.price} × {share.quantity}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-900">{share.views}</p>
                        <p className="text-xs text-blue-700">Views</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <MousePointerClick className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-purple-900">{share.clicks}</p>
                        <p className="text-xs text-purple-700">Clicks</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-orange-900">{share.conversions}</p>
                        <p className="text-xs text-orange-700">Conv.</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-900">{formatCurrency(share.earnings)}</p>
                        <p className="text-xs text-green-700">Earned</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyShareLink(share.shareLink)}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 touch-feedback"
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                      <button
                        onClick={() => handleShare(share.shareLink, share.company)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 touch-feedback border border-gray-300"
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings Info */}
        {stats?.totalEarnings > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-mobile">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <DollarSign size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg mb-1">💰 {formatCurrency(stats.totalEarnings)}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Earned from {stats.totalConversions} conversion{stats.totalConversions !== 1 ? 's' : ''}!
                </p>
                <p className="text-xs text-gray-600">
                  📌 Rewards = 10% of platform revenue from your referrals
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;
