import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import ChatWindow from './ChatWindow';
import API from '../services/api';

function ListingCard({ listing, isOwner = false, onDeleteSuccess, onDeactivate, onActivate }) {
  console.log('ListingCard listing:', listing);
  console.log('ListingCard ImageURL:', listing.ImageURL);
  console.log('ListingCard image:', listing.image);
  const [showPhone, setShowPhone] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  // Robust field mapping
  const title = listing.title || listing.Title || '';
  // Get all images from ListingImages array (or fallback to single ImageURL)
  const images = Array.isArray(listing.ListingImages) && listing.ListingImages.length > 0
    ? listing.ListingImages.map(img => img.ImageURL)
    : listing.ImageURL
      ? [listing.ImageURL]
      : ['/default-no-image.png'];
  const [currentImage, setCurrentImage] = useState(0);
  const [showImages, setShowImages] = useState(true);
  // Remove category and subcategory name display
  // const categoryName = ...
  // const subcategoryFull = ...
  const ownerName = listing.owner?.name || listing.User?.name || listing.User?.Username || 'N/A';
  // Phone number removed
  const postedDate = listing.postedDate || listing.CreateDate;
  
  const getPriceDisplay = () => {
    // For Business Campaign, don't show price
    if (listing.Listing_Type === 'Business Campaign') {
      return null;
    }
    
    const priceValue = (listing.price !== undefined && listing.price !== null && listing.price !== '') ? String(listing.price) : (listing.ExpectedPrice !== undefined && listing.ExpectedPrice !== null && listing.ExpectedPrice !== '') ? String(listing.ExpectedPrice) : 'N/A';
    if (priceValue === 'N/A') {
      return 'N/A';
    }
    if (listing.Listing_Type === 'Business Offers') {
      return `${priceValue}% off`;
    }
    return `₹ ${priceValue}`;
  };

  const getCampaignDates = () => {
    if (listing.Listing_Type === 'Business Campaign' && (listing.CampaignStartDate || listing.CampaignEndDate)) {
      const startDate = listing.CampaignStartDate ? new Date(listing.CampaignStartDate).toLocaleDateString() : 'N/A';
      const endDate = listing.CampaignEndDate ? new Date(listing.CampaignEndDate).toLocaleDateString() : 'N/A';
      return `${startDate} - ${endDate}`;
    }
    return null;
  };

  const price = getPriceDisplay();
  const campaignDates = getCampaignDates();
  
  const address = listing.address
    || (listing.Location && (
      [listing.Location.mandal, listing.Location.village]
        .filter(Boolean)
        .join(', ') || 'Location N/A'
    ))
    || [listing.mandal, listing.village]
        .filter(Boolean)
        .join(', ') || 'Location N/A';

  // Get current user ID from token
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const handleMessageClick = () => {
    const userId = getUserId();
    if (!userId) {
      alert('Please login to send messages');
      return;
    }

    const recipientId = listing.User?.UserID || listing.owner?.UserID || listing.UserID;
    if (!recipientId) {
      console.log('Listing data:', listing);
      console.log('listing.User:', listing.User);
      console.log('listing.owner:', listing.owner);
      console.log('listing.UserID:', listing.UserID);
      alert('Owner information not available. Check console for details.');
      return;
    }

    if (userId === recipientId) {
      alert('You cannot send a message to yourself');
      return;
    }

    setShowChat(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/listings/${listing.ListingID}`);
      alert('Listing deleted successfully');
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '32px auto',
      borderRadius: 20,
      boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
      overflow: 'hidden',
      background: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: 320,
      position: 'relative'
    }}>
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top left: Posted date only */}
        <div className="listing-date" style={{ position: 'absolute', top: 20, left: 20, textAlign: 'left', zIndex: 2 }}>
          <div style={{ fontSize: 12, color: '#888' }}>
            Posted on {postedDate ? new Date(postedDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        {/* Action buttons for owner - Top right */}
        {isOwner && (
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '8px', zIndex: 2 }}>
            {listing.IsActive && onDeactivate && (
              <button
                onClick={() => onDeactivate(listing.ListingID)}
                style={{
                  background: '#f39c12',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(243,156,18,0.3)',
                  transition: 'background 0.2s, transform 0.1s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e67e22'}
                onMouseOut={e => e.currentTarget.style.background = '#f39c12'}
              >
                Deactivate
              </button>
            )}
            {!listing.IsActive && onActivate && (
              <button
                onClick={() => onActivate(listing.ListingID)}
                style={{
                  background: '#27ae60',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(39,174,96,0.3)',
                  transition: 'background 0.2s, transform 0.1s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#229954'}
                onMouseOut={e => e.currentTarget.style.background = '#27ae60'}
              >
                Activate
              </button>
            )}
            <button
              onClick={handleDelete}
              style={{
                background: '#e74c3c',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(231,76,60,0.3)',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#c0392b'}
              onMouseOut={e => e.currentTarget.style.background = '#e74c3c'}
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
        {/* Title at top center */}
        <div
          className="listing-title"
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 10,
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline',
            marginTop: 50
          }}
          onClick={() => navigate(`/listing/${listing.ListingID || listing.id}`)}
        >
          {title}
        </div>
        {price && (
          <div className="listing-price" style={{ fontSize: 22, fontWeight: 700, color: '#e65100', marginBottom: 8, textAlign: 'center' }}>
            {price}
          </div>
        )}
        {campaignDates && (
          <div style={{ fontSize: 18, fontWeight: 600, color: '#3498db', marginBottom: 8, textAlign: 'center' }}>
            Campaign: {campaignDates}
          </div>
        )}
        {/* Address row */}
        <div className="listing-address" style={{ fontSize: 15, color: '#555', marginBottom: 12, fontWeight: 500, textAlign: 'center' }}>
          {address}
        </div>
        {/* Bottom row absolutely positioned to bottom of card */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 32px 18px 32px',
          width: '100%',
          background: 'rgba(255,255,255,0.97)',
          zIndex: 3
        }}>
          <div style={{ fontSize: 15, color: '#1976d2', fontWeight: 600 }}>
            Availability: <span style={{ color: '#222' }}>{listing.availability ? String(listing.availability) : 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <button
              style={{
                background: '#1565c0',
                color: '#111',
                border: 'none',
                borderRadius: 16,
                padding: '14px 36px',
                fontWeight: 'bold',
                fontSize: '1.12rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(21,101,192,0.10)',
                letterSpacing: '0.03em',
                transition: 'background 0.2s, border 0.2s',
                opacity: 1
              }}
              onClick={() => setShowPhone(prev => !prev)}
            >Call</button>
            <button
              style={{
                background: '#ff9800',
                color: '#111',
                border: 'none',
                borderRadius: 16,
                padding: '14px 36px',
                fontWeight: 'bold',
                fontSize: '1.12rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255,152,0,0.10)',
                letterSpacing: '0.03em',
                transition: 'background 0.2s, border 0.2s',
                opacity: 1
              }}
              onClick={handleMessageClick}
            >Message</button>
          </div>
        </div>
      </div>
      <div style={{ flex: '0 0 260px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3d1515ff', borderLeft: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
        {/* Phone number overlay on image */}
        {showPhone && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            background: 'rgba(0, 0, 0, 0.85)', 
            color: '#fff', 
            padding: '20px 30px', 
            borderRadius: '12px', 
            fontSize: 20, 
            fontWeight: 700, 
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            📞 {listing.owner?.phone ? String(listing.owner.phone) : 'Not available'}
          </div>
        )}
        {showImages && (
          <>
            <img
              src={images[currentImage]}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#fff', display: 'block' }}
            />
            {/* Slider controls if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.7, zIndex: 5 }}
                  onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + images.length) % images.length); }}
                  aria-label="Previous image"
                >&lt;</button>
                <button
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.7, zIndex: 5 }}
                  onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % images.length); }}
                  aria-label="Next image"
                >&gt;</button>
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 12, padding: '2px 12px', fontSize: 14, color: '#1976d2', fontWeight: 600, opacity: 0.85 }}>
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
            {/* Close button overlay */}
            <button
              style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.8, zIndex: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              onClick={() => setShowImages(false)}
              aria-label="Close image"
            >&times;</button>
          </>
        )}
        {!showImages && (
          <button
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1976d2', color: '#111', border: 'none', borderRadius: 16, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.95, zIndex: 7, boxShadow: '0 2px 8px rgba(25,118,210,0.10)' }}
            onClick={() => setShowImages(true)}
          >Show Images</button>
        )}
      </div>
      
      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          otherUserId={listing.owner?.UserID || listing.User?.UserID || listing.UserID}
          otherUserName={listing.owner?.name || listing.User?.name || listing.User?.Username || 'User'}
          listingId={listing.ListingID || listing.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default ListingCard;