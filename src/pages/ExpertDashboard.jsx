import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ExpertDashboard() {
  const navigate = useNavigate();
  const [expertData, setExpertData] = useState(null);
  const [availableListings, setAvailableListings] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [activeTab, setActiveTab] = useState('listings'); // listings, bids, profile
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
      // Fetch available listings
      const listingsRes = await axios.get(`${API_URL}/api/experts/listings/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableListings(listingsRes.data.listings);

      // Fetch expert's bids
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
      fetchData(token); // Refresh data
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
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="expert-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Expert Dashboard</h1>
          {expertData && (
            <p>
              Welcome, {expertData.firstName} {expertData.lastName} - {expertData.expertiseArea} Expert
              {expertData.isVerified && <span style={{ color: 'green', marginLeft: '10px' }}>✓ Verified</span>}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      {expertData && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Rating</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{expertData.rating || 0}/5.0</p>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Successful Sales</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{expertData.successfulSales || 0}</p>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Active Bids</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{myBids.filter(b => b.Status === 'pending').length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'listings' ? '3px solid #007bff' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'listings' ? 'bold' : 'normal'
          }}
        >
          Available Listings ({availableListings.length})
        </button>
        <button
          onClick={() => setActiveTab('bids')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'bids' ? '3px solid #007bff' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'bids' ? 'bold' : 'normal'
          }}
        >
          My Bids ({myBids.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'listings' && (
        <div>
          <h2>Available Listings in Your Area</h2>
          {availableListings.length === 0 ? (
            <p>No available listings at the moment.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {availableListings.map((listing) => (
                <div key={listing.ListingID} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                  <h3>{listing.Title}</h3>
                  <p>{listing.Description}</p>
                  <p><strong>Price:</strong> ${listing.ExpectedPrice}</p>
                  <p><strong>Location:</strong> {listing.Location?.village}, {listing.Location?.district}</p>
                  <p><strong>Posted by:</strong> {listing.User?.Username}</p>
                  
                  {listing.ExpertBids && listing.ExpertBids.length > 0 ? (
                    <p style={{ color: 'orange' }}>You already bid on this listing</p>
                  ) : (
                    <button
                      onClick={() => openBidModal(listing)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Place Bid
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bids' && (
        <div>
          <h2>My Bids</h2>
          {myBids.length === 0 ? (
            <p>You haven't placed any bids yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {myBids.map((bid) => (
                <div key={bid.BidID} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                  <h3>{bid.Listing?.Title}</h3>
                  <p><strong>Your Bid:</strong> ${bid.BidAmount}</p>
                  <p><strong>Proposal:</strong> {bid.Proposal}</p>
                  <p><strong>Status:</strong> <span style={{
                    color: bid.Status === 'accepted' ? 'green' : bid.Status === 'rejected' ? 'red' : 'orange'
                  }}>{bid.Status.toUpperCase()}</span></p>
                  <p><strong>Submitted:</strong> {new Date(bid.CreatedAt).toLocaleDateString()}</p>
                  
                  {bid.Status === 'pending' && (
                    <button
                      onClick={() => withdrawBid(bid.BidID)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
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

      {/* Bid Modal */}
      {showBidModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>Place Your Bid</h2>
            <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label>Bid Amount (Your Service Fee) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={bidForm.bidAmount}
                  onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div>
                <label>Commission Percentage (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bidForm.commissionPercentage}
                  onChange={(e) => setBidForm({ ...bidForm, commissionPercentage: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div>
                <label>Your Proposal *</label>
                <textarea
                  value={bidForm.proposal}
                  onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })}
                  required
                  rows="4"
                  placeholder="Explain how you will help sell this listing..."
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div>
                <label>Estimated Completion Days</label>
                <input
                  type="number"
                  value={bidForm.estimatedCompletionDays}
                  onChange={(e) => setBidForm({ ...bidForm, estimatedCompletionDays: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Bid
                </button>
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpertDashboard;
