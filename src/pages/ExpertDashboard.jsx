import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaClipboardList, FaGavel, FaUser, FaTimes, FaDollarSign, FaPercent, FaClock, FaStar, FaCheckCircle } from 'react-icons/fa';
import '../styles/cred-theme.css';
import '../styles/mobile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ExpertDashboard() {
  const navigate = useNavigate();
  const [expertData, setExpertData] = useState(null);
  const [availableListings, setAvailableListings] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({
    listingId: null,
    bidAmount: '',
    commissionPercentage: '',
    proposal: '',
    estimatedCompletionDays: ''
  });
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('expertToken');
    const storedExpertData = localStorage.getItem('expertData');

    if (!token || !storedExpertData) {
      navigate('/expert/login');
      return;
    }

    setExpertData(JSON.parse(storedExpertData));
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const listingsRes = await axios.get(`${API_URL}/api/experts/listings/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableListings(listingsRes.data.listings);

      const bidsRes = await axios.get(`${API_URL}/api/experts/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBids(bidsRes.data.bids);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('expertToken');
        localStorage.removeItem('expertData');
        navigate('/expert/login');
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('expertToken');
    localStorage.removeItem('expertData');
    navigate('/expert/login');
  };

  const openBidModal = (listing) => {
    setBidForm({
      listingId: listing.ListingID,
      bidAmount: '',
      commissionPercentage: '',
      proposal: '',
      estimatedCompletionDays: ''
    });
    setShowBidModal(true);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('expertToken');

    try {
      await axios.post(
        `${API_URL}/api/experts/bids`,
        {
          listingId: bidForm.listingId,
          bidAmount: parseFloat(bidForm.bidAmount),
          commissionPercentage: bidForm.commissionPercentage ? parseFloat(bidForm.commissionPercentage) : null,
          proposal: bidForm.proposal,
          estimatedCompletionDays: bidForm.estimatedCompletionDays ? parseInt(bidForm.estimatedCompletionDays) : null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Bid placed successfully!');
      setShowBidModal(false);
      fetchData(token);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place bid');
    }
  };

  const withdrawBid = async (bidId) => {
    const token = localStorage.getItem('expertToken');
    if (!confirm('Are you sure you want to withdraw this bid?')) return;

    try {
      await axios.put(
        `${API_URL}/api/experts/bids/${bidId}/withdraw`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Bid withdrawn successfully');
      fetchData(token);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to withdraw bid');
    }
  };

  if (loading) {
    return (
      <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--cred-text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="cred-page" style={{ padding: '20px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="cred-card glass" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
              Expert Dashboard
            </h1>
            {expertData && (
              <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px' }}>
                Welcome, {expertData.firstName} {expertData.lastName} - {expertData.expertiseArea} Expert
                {expertData.isVerified && (
                  <FaCheckCircle style={{ color: 'var(--cred-success)', marginLeft: '8px', verticalAlign: 'middle' }} />
                )}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="cred-btn"
            style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* Stats */}
        {expertData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="cred-card glass" style={{ padding: '20px', textAlign: 'center' }}>
              <FaStar style={{ fontSize: '32px', color: 'var(--cred-accent)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '0.875rem', color: 'var(--cred-text-secondary)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</h3>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{expertData.rating || 0}/5.0</p>
            </div>
            <div className="cred-card glass" style={{ padding: '20px', textAlign: 'center' }}>
              <FaCheckCircle style={{ fontSize: '32px', color: 'var(--cred-success)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '0.875rem', color: 'var(--cred-text-secondary)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Successful Sales</h3>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{expertData.successfulSales || 0}</p>
            </div>
            <div className="cred-card glass" style={{ padding: '20px', textAlign: 'center' }}>
              <FaGavel style={{ fontSize: '32px', color: 'var(--cred-accent)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '0.875rem', color: 'var(--cred-text-secondary)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Bids</h3>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{myBids.filter(b => b.Status === 'pending').length}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="cred-card glass" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setActiveTab('listings')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === 'listings' ? 'var(--cred-accent)' : 'var(--cred-text-secondary)',
                borderBottom: activeTab === 'listings' ? '2px solid var(--cred-accent)' : 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <FaClipboardList /> Available Listings ({availableListings.length})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === 'bids' ? 'var(--cred-accent)' : 'var(--cred-text-secondary)',
                borderBottom: activeTab === 'bids' ? '2px solid var(--cred-accent)' : 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <FaGavel /> My Bids ({myBids.length})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'listings' && (
              <div>
                {availableListings.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--cred-text-secondary)', padding: '40px' }}>
                    No available listings in your area and expertise.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {availableListings.map((listing) => (
                      <div key={listing.ListingID} className="cred-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{listing.Title}</h3>
                            <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px' }}>
                              {listing.Category?.CategoryName} - {listing.Subcategory?.SubcategoryName}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cred-accent)', marginBottom: '4px' }}>
                              ${listing.Price}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--cred-text-tertiary)' }}>
                              {new Date(listing.CreatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          {listing.Description?.substring(0, 150)}...
                        </p>
                        <button
                          onClick={() => openBidModal(listing)}
                          className="cred-btn"
                          style={{ width: '100%' }}
                        >
                          Place Bid
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bids' && (
              <div>
                {myBids.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--cred-text-secondary)', padding: '40px' }}>
                    You haven't placed any bids yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myBids.map((bid) => (
                      <div key={bid.BidID} className="cred-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                              {bid.Listing?.Title}
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '14px', color: 'var(--cred-text-secondary)' }}>
                                <FaDollarSign style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Bid: ${bid.BidAmount}
                              </span>
                              {bid.CommissionPercentage && (
                                <span style={{ fontSize: '14px', color: 'var(--cred-text-secondary)' }}>
                                  <FaPercent style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                  {bid.CommissionPercentage}%
                                </span>
                              )}
                              {bid.EstimatedCompletionDays && (
                                <span style={{ fontSize: '14px', color: 'var(--cred-text-secondary)' }}>
                                  <FaClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                  {bid.EstimatedCompletionDays} days
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: bid.Status === 'accepted' ? 'rgba(46, 204, 113, 0.2)' :
                                           bid.Status === 'rejected' ? 'rgba(231, 76, 60, 0.2)' :
                                           bid.Status === 'withdrawn' ? 'rgba(149, 165, 166, 0.2)' :
                                           'rgba(255, 193, 7, 0.2)',
                            color: bid.Status === 'accepted' ? 'var(--cred-success)' :
                                   bid.Status === 'rejected' ? '#e74c3c' :
                                   bid.Status === 'withdrawn' ? '#95a5a6' :
                                   '#f39c12'
                          }}>
                            {bid.Status.toUpperCase()}
                          </span>
                        </div>
                        {bid.Proposal && (
                          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                            {bid.Proposal}
                          </p>
                        )}
                        {bid.Status === 'pending' && (
                          <button
                            onClick={() => withdrawBid(bid.BidID)}
                            className="cred-btn"
                            style={{ width: '100%', backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.3)' }}
                          >
                            Withdraw Bid
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="cred-card glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Place Your Bid</h2>
              <button
                onClick={() => setShowBidModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cred-text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <FaDollarSign style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
                <input
                  type="number"
                  step="0.01"
                  value={bidForm.bidAmount}
                  onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                  placeholder="Bid Amount *"
                  required
                  className="cred-input"
                  style={{ paddingLeft: '50px', width: '100%' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <FaPercent style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
                <input
                  type="number"
                  step="0.01"
                  value={bidForm.commissionPercentage}
                  onChange={(e) => setBidForm({ ...bidForm, commissionPercentage: e.target.value })}
                  placeholder="Commission Percentage"
                  className="cred-input"
                  style={{ paddingLeft: '50px', width: '100%' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <FaClock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
                <input
                  type="number"
                  value={bidForm.estimatedCompletionDays}
                  onChange={(e) => setBidForm({ ...bidForm, estimatedCompletionDays: e.target.value })}
                  placeholder="Estimated Completion (days)"
                  className="cred-input"
                  style={{ paddingLeft: '50px', width: '100%' }}
                />
              </div>

              <textarea
                value={bidForm.proposal}
                onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })}
                placeholder="Your proposal (describe how you'll help sell this listing) *"
                required
                rows="5"
                className="cred-input"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />

              <button type="submit" className="cred-btn" style={{ width: '100%' }}>
                Submit Bid
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpertDashboard;
