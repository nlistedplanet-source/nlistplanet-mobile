import React, { useEffect, useState } from 'react';
import { storage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
  const { user, token: contextToken, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const rawToken = localStorage.getItem('token');
    const parsedToken = storage.get('token');
    const rawUser = localStorage.getItem('user');
    const parsedUser = storage.get('user');

    setDebugInfo({
      rawToken,
      parsedToken,
      tokenType: typeof parsedToken,
      tokenLength: parsedToken?.length || 0,
      rawUser,
      parsedUser: JSON.stringify(parsedUser, null, 2),
      contextToken,
      contextUser: JSON.stringify(user, null, 2),
      isAuthenticated,
      allLocalStorageKeys: Object.keys(localStorage),
    });
  }, [user, contextToken, isAuthenticated]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>🔍 Auth Debug Info</h1>
      
      <h2>📦 LocalStorage - Raw Token:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {debugInfo.rawToken || 'NULL'}
      </pre>

      <h2>🔓 Parsed Token (via storage.get):</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {debugInfo.parsedToken || 'NULL'}
      </pre>

      <h2>📊 Token Info:</h2>
      <ul>
        <li><strong>Type:</strong> {debugInfo.tokenType}</li>
        <li><strong>Length:</strong> {debugInfo.tokenLength}</li>
        <li><strong>First 20 chars:</strong> {debugInfo.parsedToken?.substring(0, 20)}...</li>
      </ul>

      <h2>👤 LocalStorage - Raw User:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {debugInfo.rawUser || 'NULL'}
      </pre>

      <h2>👤 Parsed User:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {debugInfo.parsedUser}
      </pre>

      <h2>🎯 Context Values:</h2>
      <ul>
        <li><strong>isAuthenticated:</strong> {String(debugInfo.isAuthenticated)}</li>
        <li><strong>Context Token:</strong> {debugInfo.contextToken || 'NULL'}</li>
      </ul>

      <h2>🔑 All LocalStorage Keys:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify(debugInfo.allLocalStorageKeys, null, 2)}
      </pre>

      <h2>🧪 Test API Call:</h2>
      <button 
        onClick={async () => {
          try {
            const token = storage.get('token');
            const response = await fetch(process.env.REACT_APP_API_URL + '/portfolio/stats', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            alert('Response: ' + JSON.stringify(data, null, 2));
          } catch (error) {
            alert('Error: ' + error.message);
          }
        }}
        style={{ padding: '10px 20px', fontSize: '14px' }}
      >
        Test Portfolio Stats API
      </button>
    </div>
  );
};

export default DebugAuth;
