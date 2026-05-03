import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Identify the user's role for access control
    const userRole = localStorage.getItem('role'); 
    // Optional: Grab the user ID if your backend requires it for project creation
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { 
                name, 
                description, 
                // We changed the variable name in Project.java to 'user' earlier!
                // (Note: If your Spring Boot service extracts the user from the JWT automatically, 
                // you can actually remove this 'user' field entirely.)
                user: { id: userId || 1 } 
            });
            setName('');
            setDescription('');
            await fetchProjects(); 
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project.");
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
        
        try {
            // 1. Send the delete request to the backend
            await api.delete(`/projects/${id}`);
            
            // 2. Optimistic UI Update: Instantly remove the project from the screen
            // This is much faster than calling fetchProjects() again!
            setProjects(projects.filter(project => project.id !== id));
            
        } catch (error) {
            console.error("Delete error:", error);
            if (error.response && error.response.status === 403) {
                alert("Access Denied: Only Admins can delete projects.");
            } else {
                alert("An error occurred while trying to delete the project.");
            }
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Projects</h1>
                <button onClick={logout} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            <form onSubmit={handleCreate} style={{ marginBottom: '2rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                    placeholder="Project Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    style={{ padding: '8px', flex: '1' }}
                />
                <input 
                    placeholder="Description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    style={{ padding: '8px', flex: '2' }}
                />
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Create Project
                </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {projects.map(p => (
                    <div key={p.id} style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3>{p.name}</h3>
                        <p style={{ color: '#666', minHeight: '3em' }}>{p.description || "No description provided."}</p>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                            <button 
                                onClick={() => navigate(`/project/${p.id}`)}
                                style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                View Tasks
                            </button>

                            {/* ROLE-BASED UI: Only show the Delete button if the user is an ADMIN */}
                            {userRole === 'ADMIN' && (
                                <button 
                                    onClick={() => handleDeleteProject(p.id)}
                                    style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;