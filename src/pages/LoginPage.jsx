import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [portal, setPortal] = useState(null); // 'MANAGER' or 'MEMBER'
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            if (isRegistering && portal === 'MEMBER') {
                // Registration only allowed for Members
                await api.post('/users/register', { email, password });
                alert('Registration successful! Please log in.');
                setIsRegistering(false);
            } else {
                const response = await api.post('/auth/login', { email, password });
                
                // Security Check: If a Member tries to login through the Manager portal
                if (portal === 'MANAGER' && response.data.role !== 'ADMIN') {
                    setError('Access Denied: You do not have Manager privileges.');
                    return;
                }

                login({
                    token: response.data.token,
                    role: response.data.role, 
                    id: response.data.id
                }); 
                
                navigate('/');
            }
        } catch (err) {
            setError('Authentication failed. Check your credentials.');
        }
    };

    // --- PORTAL SELECTION VIEW ---
    if (!portal) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', fontFamily: 'sans-serif' }}>
                <h1 style={{ marginBottom: '2rem' }}>Task Management System</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Please select your workspace to continue</p>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div 
                        onClick={() => setPortal('MANAGER')}
                        style={{ padding: '40px', border: '2px solid #007bff', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', width: '150px', transition: '0.3s' }}
                    >
                        <span style={{ fontSize: '3rem' }}>💼</span>
                        <h3 style={{ color: '#007bff' }}>Manager Portal</h3>
                    </div>

                    <div 
                        onClick={() => setPortal('MEMBER')}
                        style={{ padding: '40px', border: '2px solid #28a745', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', width: '150px', transition: '0.3s' }}
                    >
                        <span style={{ fontSize: '3rem' }}>👥</span>
                        <h3 style={{ color: '#28a745' }}>Member Portal</h3>
                    </div>
                </div>
            </div>
        );
    }

    // --- LOGIN/REGISTER FORM VIEW ---
    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <button 
                onClick={() => { setPortal(null); setIsRegistering(false); setError(''); }} 
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '1rem' }}
            >
                ← Back to Portal Selection
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2rem' }}>{portal === 'MANAGER' ? '💼' : '👥'}</span>
                <h2 style={{ margin: '10px 0' }}>
                    {isRegistering ? 'Create Member Account' : `Sign In to ${portal === 'MANAGER' ? 'Manager' : 'Member'} Portal`}
                </h2>
            </div>
            
            {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#fff2f2', padding: '10px', borderRadius: '5px' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit" 
                    style={{ 
                        padding: '12px', 
                        fontSize: '16px', 
                        cursor: 'pointer', 
                        backgroundColor: portal === 'MANAGER' ? '#007bff' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    {isRegistering ? 'Register' : 'Enter Workspace'}
                </button>
            </form>
            
            {/* --- UPDATED: Conditional Footer based on Portal --- */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {portal === 'MEMBER' ? (
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isRegistering ? 'Already have an account? Log In' : 'New member? Register here'}
                    </button>
                ) : (
                    <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', border: '1px solid #eee' }}>
                        🔒 <strong>Manager Registration Disabled</strong><br />
                        Please contact the System Admin to request Manager-level access.
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;