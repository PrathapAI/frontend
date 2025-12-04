import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { FaUserShield, FaUser, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'listings'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, listingsRes] = await Promise.all([
          API.get('/crud/users', { headers: { Authorization: `Bearer ${token}` }}),
          API.get('/listings', { headers: { Authorization: `Bearer ${token}` }})
        ]);
        setUsers(usersRes.data);
        setListings(listingsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        alert('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const handleUserActivate = async (userId) => {
    if (!window.confirm('Are you sure you want to activate this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.put(`/crud/users/${userId}`, 
        { IsActive: true },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('User activated successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Activate error:', err);
      alert('Failed to activate user');
    }
  };

  const handleUserDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.put(`/crud/users/${userId}`, 
        { IsActive: false },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('User deactivated successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Deactivate error:', err);
      alert('Failed to deactivate user');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/crud/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user');
    }
  };

  const handleListingActivate = async (listingId) => {
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

  const handleListingDeactivate = async (listingId) => {
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

  const handleListingDelete = async (listingId) => {
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
            <FaUserShield style={{ fontSize: '32px', color: 'var(--cred-accent)' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: 0,
              background: 'linear-gradient(135deg, var(--cred-accent) 0%, var(--cred-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              admin dashboard.
            </h1>
          </div>
          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', margin: 0 }}>
            manage users and listings
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              background: activeTab === 'users' ? 'var(--cred-accent)' : 'var(--cred-card)',
              color: activeTab === 'users' ? '#000' : 'var(--cred-text-primary)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FaUser style={{ marginRight: '8px' }} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            style={{
              background: activeTab === 'listings' ? 'var(--cred-accent)' : 'var(--cred-card)',
              color: activeTab === 'listings' ? '#000' : 'var(--cred-text-primary)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Listings
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cred-text-secondary)' }}>
            <div className="cred-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '20px' }}>loading data...</p>
          </div>
        ) : activeTab === 'users' ? (
          <div className="cred-card" style={{ overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--cred-accent)' }}>User Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cred-bg)', borderBottom: '2px solid var(--cred-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Username</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--cred-text-primary)' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--cred-text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.UserID} style={{ borderBottom: '1px solid var(--cred-border)' }}>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>{user.UserID}</td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-primary)', fontWeight: 600 }}>{user.Username}</td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>{user.Email}</td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>{user.PhoneNumber || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {user.IsActive ? (
                        <span style={{ color: '#27ae60', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <span style={{ color: '#e74c3c', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FaTimesCircle /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {user.IsActive ? (
                          <button
                            onClick={() => handleUserDeactivate(user.UserID)}
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
                            onClick={() => handleUserActivate(user.UserID)}
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
                          onClick={() => handleUserDelete(user.UserID)}
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
        ) : (
          <div className="cred-card" style={{ overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--cred-accent)' }}>Listing Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cred-bg)', borderBottom: '2px solid var(--cred-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Owner</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--cred-text-primary)' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--cred-text-primary)' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--cred-text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.ListingID} style={{ borderBottom: '1px solid var(--cred-border)' }}>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>{listing.ListingID}</td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-primary)', fontWeight: 600 }}>{listing.Title}</td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>{listing.User?.name || 'N/A'}</td>
                    <td style={{ padding: '12px', color: 'var(--cred-text-secondary)' }}>
                      {listing.ExpectedPrice ? `₹${listing.ExpectedPrice}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {listing.IsActive ? (
                        <span style={{ color: '#27ae60', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <span style={{ color: '#e74c3c', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FaTimesCircle /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {listing.IsActive ? (
                          <button
                            onClick={() => handleListingDeactivate(listing.ListingID)}
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
                            onClick={() => handleListingActivate(listing.ListingID)}
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
                          onClick={() => handleListingDelete(listing.ListingID)}
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

export default AdminDashboard;
