import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ListingBids() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

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
      // Fetch bids for this listing
      const response = await axios.get(`${API_URL}/api/experts/listings/${listingId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(response.data.bids);

      // Fetch listing details
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
      fetchBids(); // Refresh bids
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept bid');
    }
  };

  const rejectBid = async (bidId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to reject this bid?')) {
      return;
    }

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
      fetchBids();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject bid');
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading bids...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/mylistings')}
        style={{
          padding: '8px 16px',
          marginBottom: '20px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← Back to My Listings
      </button>

      <h1>Expert Bids</h1>
      {listing && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2>{listing.Title}</h2>
          <p>{listing.Description}</p>
          <p><strong>Listed Price:</strong> ${listing.ExpectedPrice}</p>
        </div>
      )}

      {bids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>No bids received yet. Experts in your area will be notified about your listing.</p>
        </div>
      ) : (
        <div>
          <h2>Received Bids ({bids.length})</h2>
          <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
            {bids.map((bid) => (
              <div
                key={bid.BidID}
                style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: bid.Status === 'accepted' ? '#d4edda' : bid.Status === 'rejected' ? '#f8d7da' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3>
                      {bid.Expert.FirstName} {bid.Expert.LastName}
                      {bid.Expert.IsVerified && <span style={{ color: 'green', marginLeft: '10px' }}>✓ Verified</span>}
                    </h3>
                    <p><strong>Expertise:</strong> {bid.Expert.ExpertiseArea}</p>
                    <p><strong>Experience:</strong> {bid.Expert.YearsOfExperience} years</p>
                    <p><strong>Rating:</strong> {bid.Expert.Rating}/5.0 ({bid.Expert.SuccessfulSales} successful sales)</p>
                    <p><strong>Location:</strong> {bid.Expert.Location?.village}, {bid.Expert.Location?.district}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>${bid.BidAmount}</p>
                    {bid.CommissionPercentage && (
                      <p style={{ color: '#666' }}>+ {bid.CommissionPercentage}% commission</p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <h4>Proposal:</h4>
                  <p style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                    {bid.Proposal}
                  </p>
                </div>

                {bid.EstimatedCompletionDays && (
                  <p><strong>Estimated completion:</strong> {bid.EstimatedCompletionDays} days</p>
                )}

                <div style={{ marginTop: '10px' }}>
                  <p>
                    <strong>Status: </strong>
                    <span style={{
                      color: bid.Status === 'accepted' ? 'green' : bid.Status === 'rejected' ? 'red' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {bid.Status.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Submitted:</strong> {new Date(bid.CreatedAt).toLocaleString()}</p>
                </div>

                {bid.Expert.Bio && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', color: '#007bff' }}>View Expert Bio</summary>
                    <p style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      {bid.Expert.Bio}
                    </p>
                  </details>
                )}

                {bid.Status === 'pending' && (
                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => acceptBid(bid.BidID)}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Accept Bid
                    </button>
                    <button
                      onClick={() => setSelectedBid(bid.BidID)}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject Bid
                    </button>
                  </div>
                )}

                {bid.ReviewNotes && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                    <strong>Review Notes:</strong> {bid.ReviewNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedBid && (
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
            <h3>Reject Bid</h3>
            <p>Provide optional feedback to the expert:</p>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows="4"
              placeholder="Optional: Let the expert know why you're rejecting..."
              style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => rejectBid(selectedBid)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setSelectedBid(null);
                  setReviewNotes('');
                }}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingBids;
