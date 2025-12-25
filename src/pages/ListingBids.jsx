import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaDollarSign, FaPercent, FaClock, FaUser } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import '../styles/cred-theme.css';
import '../styles/mobile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ListingBids() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchBids();
  }, [listingId]);

  const fetchBids = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/experts/listings/${listingId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(response.data.bids);

      const listingRes = await axios.get(`${API_URL}/listings/${listingId}`);
      setListing(listingRes.data);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching bids:', err);
      if (err.response?.status === 401 || err.response?.status === 404) {
        alert('You do not have permission to view this listing\'s bids');
        navigate('/mylistings');
      }
      setLoading(false);
    }
  };

  const acceptBid = async (bidId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to accept this bid? All other bids will be rejected.')) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/experts/bids/${bidId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Bid accepted successfully! The expert will be notified.');
      fetchBids();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept bid');
    }
  };

  const rejectBid = async (bidId) => {
    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `${API_URL}/api/experts/bids/${bidId}/reject`,
        { reviewNotes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Bid rejected');
      setSelectedBid(null);
      setReviewNotes('');
      setShowRejectModal(false);
      fetchBids();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject bid');
    }
  };

  const openRejectModal = (bid) => {
    setSelectedBid(bid);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--cred-text-secondary)' }}>Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="cred-page" style={{ padding: '20px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <BackButton />

        {/* Listing Info */}
        {listing && (
          <div className="cred-card glass" style={{ padding: '24px', marginTop: '20px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>
              {listing.Title}
            </h1>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px' }}>Price</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cred-accent)' }}>${listing.Price}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px' }}>Category</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{listing.Category?.CategoryName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px' }}>Total Bids</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{bids.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bids Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            Expert Bids ({bids.length})
          </h2>
        </div>

        {/* Bids List */}
        {bids.length === 0 ? (
          <div className="cred-card glass" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--cred-text-secondary)', fontSize: '16px' }}>
              No bids received yet. Experts will be notified about your listing.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bids.map((bid) => (
              <div key={bid.BidID} className="cred-card glass" style={{ padding: '24px' }}>
                {/* Expert Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--cred-accent), var(--cred-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                      {bid.Expert?.firstName?.[0]}{bid.Expert?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>
                        {bid.Expert?.firstName} {bid.Expert?.lastName}
                        {bid.Expert?.isVerified && (
                          <FaCheckCircle style={{ color: 'var(--cred-success)', marginLeft: '8px', fontSize: '14px', verticalAlign: 'middle' }} />
                        )}
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--cred-text-secondary)' }}>
                        {bid.Expert?.expertiseArea} Expert • {bid.Expert?.yearsOfExperience || 0} years experience
                      </p>
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

                {/* Bid Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <FaDollarSign style={{ marginRight: '4px' }} /> Bid Amount
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>${bid.BidAmount}</p>
                  </div>
                  {bid.CommissionPercentage && (
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <FaPercent style={{ marginRight: '4px' }} /> Commission
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{bid.CommissionPercentage}%</p>
                    </div>
                  )}
                  {bid.EstimatedCompletionDays && (
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <FaClock style={{ marginRight: '4px' }} /> Completion
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{bid.EstimatedCompletionDays} days</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--cred-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{bid.Expert?.rating || 0}/5.0</p>
                  </div>
                </div>

                {/* Proposal */}
                {bid.Proposal && (
                  <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--cred-accent)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cred-text-tertiary)', marginBottom: '8px', fontWeight: 600 }}>Proposal:</p>
                    <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{bid.Proposal}</p>
                  </div>
                )}

                {/* Expert Bio */}
                {bid.Expert?.bio && (
                  <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cred-text-tertiary)', marginBottom: '8px', fontWeight: 600 }}>About Expert:</p>
                    <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{bid.Expert.bio}</p>
                  </div>
                )}

                {/* Review Notes (if rejected) */}
                {bid.ReviewNotes && (
                  <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(231, 76, 60, 0.1)', borderRadius: '12px', borderLeft: '3px solid #e74c3c' }}>
                    <p style={{ fontSize: '0.875rem', color: '#e74c3c', marginBottom: '8px', fontWeight: 600 }}>Rejection Reason:</p>
                    <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{bid.ReviewNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {bid.Status === 'pending' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      onClick={() => acceptBid(bid.BidID)}
                      className="cred-btn"
                      style={{ backgroundColor: 'rgba(46, 204, 113, 0.2)', border: '1px solid rgba(46, 204, 113, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FaCheckCircle /> Accept Bid
                    </button>
                    <button
                      onClick={() => openRejectModal(bid)}
                      className="cred-btn"
                      style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FaTimesCircle /> Reject Bid
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedBid && (
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
          <div className="cred-card glass" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Reject Bid</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cred-text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                <FaTimesCircle />
              </button>
            </div>

            <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Provide a reason for rejecting this bid (optional):
            </p>

            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g., Price is too high, timeline doesn't work, etc."
              rows="4"
              className="cred-input"
              style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: '20px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setShowRejectModal(false)}
                className="cred-btn"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => rejectBid(selectedBid.BidID)}
                className="cred-btn"
                style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.3)' }}
              >
                Reject Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingBids;
