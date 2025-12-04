import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/features';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch {}
  }

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchNotifications();
    fetchUnreadCount();
  }, [userId, showUnreadOnly]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationsAPI.getUserNotifications(userId, showUnreadOnly);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationsAPI.getUnreadCount(userId);
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.NotificationID === notificationId ? { ...n, IsRead: true } : n
      ));
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, IsRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.NotificationID !== notificationId));
      fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    
    try {
      await notificationsAPI.clearAll(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      alert('Failed to clear notifications');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="cred-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--cred-border)',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaBell style={{ fontSize: '32px', color: 'var(--cred-orange)' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: 0,
              background: 'linear-gradient(135deg, var(--cred-orange) 0%, var(--cred-pink) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              alerts.
            </h1>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--cred-pink)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 700
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={showUnreadOnly ? 'cred-btn' : 'cred-btn-secondary'}
              style={{
                padding: '10px 20px',
                fontSize: '14px'
              }}
            >
              {showUnreadOnly ? 'show all' : 'unread only'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="cred-btn"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  background: 'var(--cred-accent)'
                }}
              >
                mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="cred-btn-danger"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px'
                }}
              >
                clear all
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="cred-card" style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'var(--cred-card)'
          }}>
            <FaBell style={{ fontSize: '48px', color: 'var(--cred-text-tertiary)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', color: 'var(--cred-text-secondary)' }}>no notifications</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(notif => (
              <div
                key={notif.NotificationID}
                className="cred-card"
                style={{
                  padding: '20px',
                  background: notif.IsRead ? 'var(--cred-card)' : 'rgba(0, 208, 156, 0.1)',
                  borderLeft: notif.IsRead ? '3px solid var(--cred-border)' : '3px solid var(--cred-accent)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}
              >
                <div style={{ flex: 1 }}>
                  {notif.NotificationType && (
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'var(--cred-blue)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '12px'
                    }}>
                      {notif.NotificationType}
                    </div>
                  )}
                  <p style={{ margin: '10px 0', color: 'var(--cred-text)', fontSize: '15px' }}>{notif.Message}</p>
                  <span style={{ fontSize: '12px', color: 'var(--cred-text-tertiary)' }}>
                    {new Date(notif.Timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!notif.IsRead && (
                    <button
                      onClick={() => markAsRead(notif.NotificationID)}
                      style={{
                        background: 'var(--cred-accent)',
                        border: 'none',
                        color: '#000',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={e => e.target.style.background = 'var(--cred-accent-hover)'}
                      onMouseOut={e => e.target.style.background = 'var(--cred-accent)'}
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.NotificationID)}
                    style={{
                      background: 'var(--cred-pink)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => e.target.style.background = '#c0392b'}
                    onMouseOut={e => e.target.style.background = 'var(--cred-pink)'}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default Notifications;
