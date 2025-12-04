import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/features';
import { FaStar, FaRegStar } from 'react-icons/fa';

function ReviewSection({ listingId, userId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const { data } = await reviewsAPI.getListingReviews(listingId);
      setReviews(data.reviews);
      setAverageRating(parseFloat(data.averageRating));
      setTotalReviews(parseInt(data.totalReviews));
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('Please login to submit a review');
      return;
    }

    setLoading(true);
    try {
      await reviewsAPI.createReview({
        ListingID: listingId,
        UserID: userId,
        Rating: newReview.rating,
        Comment: newReview.comment
      });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: '#f39c12' }}>
        {i < rating ? <FaStar /> : <FaRegStar />}
      </span>
    ));
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
      <h3>Reviews ({totalReviews})</h3>
      
      {totalReviews > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>
            {renderStars(Math.round(averageRating))}
          </div>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            {averageRating.toFixed(1)} out of 5 ({totalReviews} reviews)
          </p>
        </div>
      )}

      {/* Submit Review Form */}
      {userId && (
        <form onSubmit={submitReview} style={{ marginBottom: '30px', padding: '15px', background: 'white', borderRadius: '8px' }}>
          <h4>Write a Review</h4>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Rating:</label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
              style={{ padding: '8px', width: '100px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Comment:</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience..."
              style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div>
        {reviews.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div
              key={review.ReviewID}
              style={{
                padding: '15px',
                background: 'white',
                marginBottom: '15px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <strong>{review.User?.Username || 'Anonymous'}</strong>
                  <div style={{ marginTop: '5px' }}>{renderStars(review.Rating)}</div>
                </div>
                <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  {new Date(review.ReviewDate).toLocaleDateString()}
                </span>
              </div>
              {review.Comment && <p style={{ margin: 0, color: '#2c3e50' }}>{review.Comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewSection;
