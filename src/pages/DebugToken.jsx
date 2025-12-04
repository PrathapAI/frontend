import React, { useEffect, useState } from 'react';

function DebugToken() {
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTokenData(payload);
      } catch (error) {
        setTokenData({ error: 'Failed to decode token' });
      }
    } else {
      setTokenData({ error: 'No token found' });
    }
  }, []);

  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '100px auto',
      background: '#1a1a1a',
      borderRadius: '12px',
      color: '#fff'
    }}>
      <h1>Token Debug Information</h1>
      <pre style={{
        background: '#0f0f0f',
        padding: '20px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        color: '#00d09c'
      }}>
        {JSON.stringify(tokenData, null, 2)}
      </pre>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Instructions:</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>If you don't see a <code style={{ background: '#0f0f0f', padding: '2px 6px', borderRadius: '4px' }}>role</code> field above, you need to:</li>
          <li>Logout (click logout button)</li>
          <li>Login again with your credentials</li>
          <li>Check this page again - you should see <code style={{ background: '#0f0f0f', padding: '2px 6px', borderRadius: '4px' }}>role: "admin"</code></li>
        </ol>
        
        <h2 style={{ marginTop: '30px' }}>Set Your Role in Database:</h2>
        <p>Run this SQL command (replace with your actual phone or email):</p>
        <pre style={{
          background: '#0f0f0f',
          padding: '15px',
          borderRadius: '8px',
          color: '#3498db',
          fontSize: '13px'
        }}>
{`UPDATE "Users" 
SET "Role" = 'admin' 
WHERE "PhoneNumber" = '9866846600';`}
        </pre>
        <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
          (Or use your Email instead of PhoneNumber)
        </p>
      </div>
    </div>
  );
}

export default DebugToken;
