import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ListingCard from '../components/ListingCard';

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = '';
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        token = localStorage.getItem('token');
      }
    } catch (e) {
      token = '';
    }
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {}
    }
    if (userId) {
      API.get(`/api/classifieds/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setListings(res.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-bg-blue-accent">
      <div className="page-ribbon">My Listings</div>
      <div className="home-listings-content">
        {loading ? (
          <div>Loading...</div>
        ) : listings.length === 0 ? (
          <div>No listings found.</div>
        ) : (
          listings.map(listing => {
            let displayPrice = (listing.ExpectedPrice !== undefined && listing.ExpectedPrice !== null && listing.ExpectedPrice !== '') ? listing.ExpectedPrice : 'N/A';
            return (
              <ListingCard
                key={listing.ListingID}
                listing={{
                  ListingID: listing.ListingID,
                  title: listing.Title,
                  description: listing.Description,
                  ListingImages: listing.ListingImages,
                  ImageURL: listing.ImageURL,
                  owner: listing.User
                    ? {
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
                  Category: listing.Category
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyListings;