import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa';

function About() {
  return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="cred-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--cred-border)'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 900, 
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, var(--cred-accent) 0%, var(--cred-blue) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            about campaign★
          </h1>
          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Your trusted platform for buying and selling products locally
          </p>
        </div>

        {/* About Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          
          {/* What We Do */}
          <div className="cred-card">
            <h2 style={{ color: 'var(--cred-accent)', marginBottom: '16px', fontSize: '1.5rem' }}>
              What We Do
            </h2>
            <p style={{ color: 'var(--cred-text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
              Campaign★ is a modern classified ads platform that connects buyers and sellers in your local community. 
              Whether you're looking to sell your old furniture, find a new apartment, or discover great deals on electronics, 
              we make it simple and secure.
            </p>
            <p style={{ color: 'var(--cred-text-secondary)', lineHeight: '1.8' }}>
              Our platform offers a seamless experience with advanced search capabilities, secure messaging, 
              and user-friendly listing management.
            </p>
          </div>

          {/* Our Mission */}
          <div className="cred-card">
            <h2 style={{ color: 'var(--cred-accent)', marginBottom: '16px', fontSize: '1.5rem' }}>
              Our Mission
            </h2>
            <p style={{ color: 'var(--cred-text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
              We believe in creating a trusted marketplace where local communities can connect, trade, and thrive. 
              Our mission is to make buying and selling as easy as possible while maintaining the highest standards 
              of safety and user experience.
            </p>
            <p style={{ color: 'var(--cred-text-secondary)', lineHeight: '1.8' }}>
              We're committed to building a platform that empowers individuals and small businesses to reach their 
              local audience effectively.
            </p>
          </div>

          {/* Key Features */}
          <div className="cred-card">
            <h2 style={{ color: 'var(--cred-accent)', marginBottom: '16px', fontSize: '1.5rem' }}>
              Key Features
            </h2>
            <ul style={{ color: 'var(--cred-text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>📱 Easy-to-use listing creation</li>
              <li style={{ marginBottom: '8px' }}>🔍 Advanced search and filters</li>
              <li style={{ marginBottom: '8px' }}>💬 Secure in-app messaging</li>
              <li style={{ marginBottom: '8px' }}>⭐ User ratings and reviews</li>
              <li style={{ marginBottom: '8px' }}>❤️ Save favorite listings</li>
              <li style={{ marginBottom: '8px' }}>🔔 Real-time notifications</li>
              <li style={{ marginBottom: '8px' }}>📊 Analytics for sellers</li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="cred-card" style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: 'var(--cred-accent)', 
            marginBottom: '32px', 
            fontSize: '2rem',
            textAlign: 'center'
          }}>
            Get in Touch
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            
            {/* Email */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '16px',
              padding: '20px',
              background: 'var(--cred-card)',
              borderRadius: '12px',
              border: '1px solid var(--cred-border)'
            }}>
              <FaEnvelope style={{ fontSize: '24px', color: 'var(--cred-accent)', marginTop: '4px' }} />
              <div>
                <h3 style={{ color: 'var(--cred-text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>
                  Email
                </h3>
                <a 
                  href="mailto:support@campaignstar.com" 
                  style={{ 
                    color: 'var(--cred-text-secondary)', 
                    textDecoration: 'none',
                    wordBreak: 'break-word'
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--cred-accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--cred-text-secondary)'}
                >
                  support@campaignstar.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '16px',
              padding: '20px',
              background: 'var(--cred-card)',
              borderRadius: '12px',
              border: '1px solid var(--cred-border)'
            }}>
              <FaPhone style={{ fontSize: '24px', color: 'var(--cred-accent)', marginTop: '4px' }} />
              <div>
                <h3 style={{ color: 'var(--cred-text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>
                  Phone
                </h3>
                <a 
                  href="tel:+919866846600" 
                  style={{ 
                    color: 'var(--cred-text-secondary)', 
                    textDecoration: 'none'
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--cred-accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--cred-text-secondary)'}
                >
                  +91 98668 46600
                </a>
              </div>
            </div>

            {/* Address */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '16px',
              padding: '20px',
              background: 'var(--cred-card)',
              borderRadius: '12px',
              border: '1px solid var(--cred-border)'
            }}>
              <FaMapMarkerAlt style={{ fontSize: '24px', color: 'var(--cred-accent)', marginTop: '4px' }} />
              <div>
                <h3 style={{ color: 'var(--cred-text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>
                  Location
                </h3>
                <p style={{ color: 'var(--cred-text-secondary)', margin: 0, lineHeight: '1.6' }}>
                  Hyderabad, India
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div style={{ 
            marginTop: '40px', 
            paddingTop: '32px', 
            borderTop: '1px solid var(--cred-border)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--cred-text-primary)', marginBottom: '20px', fontSize: '1.2rem' }}>
              Follow Us
            </h3>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--cred-text-secondary)', 
                  fontSize: '28px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--cred-accent)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--cred-text-secondary)'}
              >
                <FaFacebook />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--cred-text-secondary)', 
                  fontSize: '28px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--cred-accent)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--cred-text-secondary)'}
              >
                <FaLinkedin />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--cred-text-secondary)', 
                  fontSize: '28px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--cred-accent)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--cred-text-secondary)'}
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ 
          textAlign: 'center', 
          padding: '32px 20px',
          color: 'var(--cred-text-tertiary)',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 Campaign★. All rights reserved. Built with ❤️ for local communities.
          </p>
        </div>

      </div>
    </div>
  );
}

export default About;
