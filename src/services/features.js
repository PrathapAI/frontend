import API from './api';

// Reviews API
export const reviewsAPI = {
  // Get all reviews for a listing
  getListingReviews: (listingId) => API.get(`/reviews/listing/${listingId}`),
  
  // Get user's reviews
  getUserReviews: (userId) => API.get(`/reviews/user/${userId}`),
  
  // Create a review
  createReview: (reviewData) => API.post('/reviews', reviewData),
  
  // Update a review
  updateReview: (reviewId, data) => API.put(`/reviews/${reviewId}`, data),
  
  // Delete a review
  deleteReview: (reviewId) => API.delete(`/reviews/${reviewId}`)
};

// Favorites API
export const favoritesAPI = {
  // Get user's favorites
  getUserFavorites: (userId) => API.get(`/favorites/user/${userId}`),
  
  // Check if listing is favorited
  checkFavorite: (userId, listingId) => API.get(`/favorites/check/${userId}/${listingId}`),
  
  // Add to favorites
  addFavorite: (userId, listingId) => API.post('/favorites', { UserID: userId, ListingID: listingId }),
  
  // Remove from favorites
  removeFavorite: (userId, listingId) => API.delete(`/favorites/user/${userId}/listing/${listingId}`)
};

// Messages API
export const messagesAPI = {
  // Get user's messages
  getUserMessages: (userId, type = 'all') => API.get(`/messages/user/${userId}?type=${type}`),
  
  // Get conversation between users
  getConversation: (userId, otherUserId) => API.get(`/messages/conversation/${userId}/${otherUserId}`),
  
  // Get messages about a listing
  getListingMessages: (listingId) => API.get(`/messages/listing/${listingId}`),
  
  // Send a message
  sendMessage: (messageData) => API.post('/messages', messageData),
  
  // Delete a message
  deleteMessage: (messageId) => API.delete(`/messages/${messageId}`)
};

// Notifications API
export const notificationsAPI = {
  // Get user's notifications
  getUserNotifications: (userId, unreadOnly = false) => 
    API.get(`/notifications/user/${userId}${unreadOnly ? '?unreadOnly=true' : ''}`),
  
  // Get unread count
  getUnreadCount: (userId) => API.get(`/notifications/user/${userId}/unread-count`),
  
  // Mark as read
  markAsRead: (notificationId) => API.put(`/notifications/${notificationId}/read`),
  
  // Mark all as read
  markAllAsRead: (userId) => API.put(`/notifications/user/${userId}/read-all`),
  
  // Delete notification
  deleteNotification: (notificationId) => API.delete(`/notifications/${notificationId}`),
  
  // Clear all notifications
  clearAll: (userId) => API.delete(`/notifications/user/${userId}/clear`)
};

// Search History API
export const searchHistoryAPI = {
  // Get user's search history
  getUserSearchHistory: (userId, limit = 20) => 
    API.get(`/search-history/user/${userId}?limit=${limit}`),
  
  // Save search query
  saveSearch: (userId, searchQuery) => 
    API.post('/search-history', { UserID: userId, SearchQuery: searchQuery }),
  
  // Clear search history
  clearSearchHistory: (userId) => API.delete(`/search-history/user/${userId}`),
  
  // Delete specific search
  deleteSearch: (searchId) => API.delete(`/search-history/${searchId}`)
};

export default {
  reviews: reviewsAPI,
  favorites: favoritesAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
  searchHistory: searchHistoryAPI
};
