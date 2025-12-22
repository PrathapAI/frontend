import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import { FaList } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import useAndroidBackButton from '../hooks/useAndroidBackButton';

function MyListings() {
  // Sync with Android back button
  useAndroidBackButton();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {}
    }
    if (userId) {
      API.get(`/listings/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setListings(res.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshTrigger]);

  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeactivate = async (listingId) => {
    if (!window.confirm('Are you sure you want to deactivate this listing?')) {
      return;
    }

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
      alert('Failed to deactivate listing. Please try again.');
    }
  };

  const handleActivate = async (listingId) => {
    if (!window.confirm('Are you sure you want to activate this listing?')) {
      return;
    }

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
      alert('Failed to activate listing. Please try again.');
    }
  };

  return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <BackButton />
      <div className="cred-container">
        {/* Page Header */}
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
            <FaList style={{ fontSize: '32px', color: 'var(--cred-accent)' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: 0,
              background: 'linear-gradient(135deg, var(--cred-accent) 0%, var(--cred-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              my listings.
            </h1>
          </div>
          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', margin: 0 }}>
            manage your posted ads
          </p>
        </div>

        {/* Listings Grid */}
        <div style={{ width: '100%' }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--cred-text-secondary)' 
            }}>
              <div className="cred-spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '20px' }}>loading your ads...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="cred-card" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'var(--cred-card)'
            }}>
              <FaList style={{ fontSize: '48px', color: 'var(--cred-text-tertiary)', marginBottom: '16px' }} />
              <p style={{ fontSize: '18px', color: 'var(--cred-text-secondary)', marginBottom: '8px' }}>no listings found.</p>
              <p style={{ fontSize: '14px', color: 'var(--cred-text-tertiary)' }}>start posting to see your ads here</p>
            </div>
          ) : (
            listings.map((listing, index) => {
              let displayPrice = (listing.ExpectedPrice !== undefined && listing.ExpectedPrice !== null && listing.ExpectedPrice !== '') ? listing.ExpectedPrice : 'N/A';
              return (
                <div key={listing.ListingID} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ListingCard
                    listing={{
                      ListingID: listing.ListingID,
                      title: listing.Title,
                      description: listing.Description,
                      ListingImages: listing.ListingImages,
                      ImageURL: listing.ImageURL,
                      owner: listing.User
                        ? {
                            UserID: listing.User.UserID,
                            name: listing.User.name
                          }
                        : undefined,
                      price: displayPrice,
                      state: listing.Location?.state,
                      district: listing.Location?.district,
                      mandal: listing.Location?.mandal,
                      village: listing.Location?.village,
                      availability: listing.availability,
                      postedDate: listing.CreateDate,
                      Category: listing.Category,
                      Listing_Type: listing.Listing_Type,
                      CampaignStartDate: listing.CampaignStartDate,
                      CampaignEndDate: listing.CampaignEndDate,
                      IsActive: listing.IsActive
                    }}
                    isOwner={true}
                    onDeleteSuccess={handleDeleteSuccess}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default MyListings;