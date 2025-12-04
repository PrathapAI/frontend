import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { FaClipboardCheck, FaTrash, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function SupervisorDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/listings', { 
          headers: { Authorization: `Bearer ${token}` }
        });
        setListings(res.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        alert('Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [refreshTrigger]);

  const handleActivate = async (listingId) => {
    if (!window.confirm('Are you sure you want to activate this listing?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.put(`/listings/${listingId}`, 
        { IsActive: true },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Listing activated successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Activate error:', err);
      alert('Failed to activate listing');
    }
  };

  const handleDeactivate = async (listingId) => {
    if (!window.confirm('Are you sure you want to deactivate this listing?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.put(`/listings/${listingId}`, 
        { IsActive: false },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Listing deactivated successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Deactivate error:', err);
      alert('Failed to deactivate listing');
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Listing deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete listing');
    }
  };

  const handleViewDetails = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="cred-container" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--cred-border)'
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <FaClipboardCheck style={{ fontSize: '32px', color: 'var(--cred-accent)' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: 0,
              background: 'linear-gradient(135deg, var(--cred-accent) 0%, var(--cred-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              supervisor dashboard.
            </h1>
          </div>
          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', margin: 0 }}>
            ad verification and management
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cred-text-secondary)' }}>
            <div className="cred-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '20px' }}>loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="cred-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaClipboardCheck style={{ fontSize: '48px', color: 'var(--cred-text-tertiary)', marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', color: 'var(--cred-text-secondary)', marginBottom: '8px' }}>
              no listings found.
            </p>
          </div>
        ) : (
          <div className="cred-card" style={{ overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--cred-accent)' }}>
              Listing Verification ({listings.length} total)
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cred-bg)', borderBottom: '2px solid var(--cred-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Owner</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Posted</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--cred-text-primary)' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--cred-text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.ListingID} style={{ borderBottom: '1px solid var(--cred-border)' }}>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>
                      {listing.ListingID}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-primary)', fontWeight: 600, maxWidth: '250px' }}>
                      {listing.Title}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>
                      {listing.User?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>
                      {listing.Category?.CategoryName || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>
                      {listing.ExpectedPrice ? `₹${listing.ExpectedPrice}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)', fontSize: '13px' }}>
                      {listing.CreateDate ? new Date(listing.CreateDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {listing.IsActive ? (
                        <span style={{ 
                          color: '#27ae60', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontSize: '14px'
                        }}>
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <span style={{ 
                          color: '#e74c3c', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontSize: '14px'
                        }}>
                          <FaTimesCircle /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDetails(listing.ListingID)}
                          style={{
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaEye /> View
                        </button>
                        {listing.IsActive ? (
                          <button
                            onClick={() => handleDeactivate(listing.ListingID)}
                            style={{
                              background: '#fff',
                              color: '#000',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(listing.ListingID)}
                            style={{
                              background: '#fff',
                              color: '#000',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(listing.ListingID)}
                          style={{
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupervisorDashboard;
