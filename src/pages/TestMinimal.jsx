import React, { useState } from 'react';

function Test() {
  const [district, setDistrict] = useState([]);
  const [state, setState] = useState('');
  
  return (
    <div>
      {/* Selected State Display */}
      {state && (
        <div style={{ padding: '0 20px 12px 20px' }}>
          <div>State: {state}</div>
        </div>
      )}

      {/* Selected Districts Display */}
      {district.length > 0 && (
        <div style={{ padding: '0 20px 12px 20px' }}>
          <div>Districts</div>
        </div>
      )}
    </div>
  );
}

export default Test;
