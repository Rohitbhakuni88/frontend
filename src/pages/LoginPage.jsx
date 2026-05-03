import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useAuth(); // Grab the login function from our global context
    const navigate = useNavigate(); // React Router tool to change pages

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            if (isRegistering) {
                // Hitting your Spring Boot /register endpoint
                await api.post('/users/register', { email, password, role: 'ADMIN' });
                alert('Registration successful! Please log in.');
                setIsRegistering(false); // Switch back to login view
            } else {
                // Hitting your Spring Boot /login endpoint
                const response = await api.post('/auth/login', { email, password });
                
                // --- THE CRITICAL FIX IS HERE ---
                // We pass the token AND the role to the AuthContext
                login({
                    token: response.data.token,
                    role: response.data.role, 
                    id: response.data.id
                }); 
                
                navigate('/'); // Redirect to the Dashboard
            }
        } catch (err) {
            console.error(err);
            setError('Authentication failed. Check your credentials or server connection.');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>{isRegistering ? 'Create an Account' : 'Sign In'}</h2>
            
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                    {isRegistering ? 'Sign Up' : 'Log In'}
                </button>
            </form>
            
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                style={{ marginTop: '20px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isRegistering ? 'Already have an account? Log In' : 'Need an account? Register'}
            </button>
        </div>
    );
};

export default LoginPage;