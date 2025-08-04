import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admins')
      .then(res => {
        setAdmins(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: 32 }}>
      <h2 style={{ marginBottom: 24, color: '#1565c0' }}>Admin List</h2>
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 12, border: '1px solid #eee' }}>Photo</th>
              <th style={{ padding: 12, border: '1px solid #eee' }}>User ID</th>
              <th style={{ padding: 12, border: '1px solid #eee' }}>Username</th>
              <th style={{ padding: 12, border: '1px solid #eee' }}>Email</th>
              <th style={{ padding: 12, border: '1px solid #eee' }}>Location Key</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin._id}>
                <td style={{ padding: 12, border: '1px solid #eee', textAlign: 'center' }}>
                  {admin.photo ? <img src={admin.photo} alt="admin" style={{ width: 48, height: 48, borderRadius: '50%' }} /> : 'N/A'}
                </td>
                <td style={{ padding: 12, border: '1px solid #eee' }}>{admin.userid}</td>
                <td style={{ padding: 12, border: '1px solid #eee' }}>{admin.username}</td>
                <td style={{ padding: 12, border: '1px solid #eee' }}>{admin.email}</td>
                <td style={{ padding: 12, border: '1px solid #eee' }}>{admin.locationkey}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPage;
