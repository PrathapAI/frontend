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
    <div 
      className="listing-card"
      onClick={() => navigate(`/listing/${listing.ListingID || listing.id}`)}
      style={{
      maxWidth: '100%',
      margin: '0',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      background: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 280,
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      border: '1px solid #e0e0e0'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}>
      {/* Image Section - Top */}
      <div style={{ width: '100%', height: '180px', position: 'relative', background: '#f5f5f5', overflow: 'hidden' }}>
        {/* Phone number overlay on image */}
        {showPhone && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            background: 'rgba(0, 0, 0, 0.85)', 
            color: '#fff', 
            padding: '15px 25px', 
            borderRadius: '12px', 
            fontSize: 16, 
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
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Slider controls if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, fontSize: 14, cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={e => { 
                    e.stopPropagation(); 
                    setCurrentImage((currentImage - 1 + images.length) % images.length); 
                  }}
                  aria-label="Previous image"
                >&lt;</button>
                <button
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, fontSize: 14, cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={e => { 
                    e.stopPropagation(); 
                    setCurrentImage((currentImage + 1) % images.length); 
                  }}
                  aria-label="Next image"
                >&gt;</button>
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '2px 8px', fontSize: 11, color: '#fff', fontWeight: 600 }}>
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
          </>
        )}
        {!showImages && (
          <button
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', zIndex: 7, boxShadow: '0 2px 8px rgba(25,118,210,0.3)' }}
            onClick={(e) => {
              e.stopPropagation();
              setShowImages(true);
            }}
          >Show Images</button>
        )}
        
        {/* Action buttons for owner - Top right of image */}
        {isOwner && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '4px', zIndex: 2 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{
                background: '#e74c3c',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
            >
              <FaTrash size={10} />
            </button>
          </div>
        )}
      </div>
      
      {/* Content Section - Bottom */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* Price */}
        {price && (
          <div style={{ fontSize: 18, fontWeight: 700, color: '#000' }}>
            {price}
          </div>
        )}
        
        {/* Title */}
        <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#002f34',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {title}
        </div>
        
        {/* Campaign dates if applicable */}
        {campaignDates && (
          <div style={{ fontSize: 12, fontWeight: 500, color: '#3498db' }}>
            {campaignDates}
          </div>
        )}
        
        {/* Location */}
        <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 'auto' }}>
          {address}
        </div>
        
        {/* Posted date */}
        <div style={{ fontSize: 11, color: '#999', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
          {postedDate ? new Date(postedDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      
      {/* Call and Message buttons - only show on hover or when needed */}
      {!isOwner && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          gap: '8px',
          padding: '8px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}
        className="card-action-buttons"
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        >
          <button
            style={{
              background: '#1565c0',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              flex: 1,
              transition: 'background 0.2s'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowPhone(prev => !prev);
            }}
          >Call</button>
          <button
            style={{
              background: '#ff9800',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              flex: 1,
              transition: 'background 0.2s'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleMessageClick();
            }}
          >Message</button>
        </div>
      )}
      
      
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