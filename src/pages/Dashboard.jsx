import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { addMemberToProject, removeMemberFromProject, getAllUsers } from '../services/api'; 
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({}); 

    const userRole = localStorage.getItem('role'); 
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchProjects();
        if (userRole === 'ADMIN') {
            fetchUsers();
        }
    }, [userRole]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const users = await getAllUsers();
            setAllUsers(users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { name, description, user: { id: userId || 1 } });
            setName('');
            setDescription('');
            await fetchProjects(); 
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project.");
        }
    };

    const handleDeleteProject = async (id) => {
        if (userRole !== 'ADMIN') return alert("Access Denied");
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(project => project.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleAddMember = async (projectId) => {
        const targetUserId = selectedUsers[projectId];
        if (!targetUserId) {
            alert("Please select a user from the dropdown first.");
            return; 
        }

        try {
            await addMemberToProject(projectId, targetUserId);
            fetchProjects(); 
            setSelectedUsers(prev => ({ ...prev, [projectId]: '' })); 
        } catch (error) {
            console.error("Error adding member:", error);
            alert("Failed to add user.");
        }
    };

    const handleRemoveMember = async (projectId, targetUserId) => {
        if (!window.confirm("Are you sure you want to remove this user from the team?")) return;
        try {
            await removeMemberFromProject(projectId, targetUserId);
            fetchProjects(); 
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };

    const handleDropdownChange = (projectId, value) => {
        setSelectedUsers(prev => ({ ...prev, [projectId]: value }));
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Projects</h1>
                <button onClick={logout} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            {userRole === 'ADMIN' && (
                <form onSubmit={handleCreate} style={{ marginBottom: '2rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', flex: '1' }} />
                    <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '8px', flex: '2' }} />
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Create Project
                    </button>
                </form>
            )}

            {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f8f9fa', borderRadius: '12px', color: '#666', border: '1px dashed #ccc' }}>
                    <h3 style={{ marginBottom: '10px', color: '#333' }}>No Projects Found</h3>
                    <p style={{ fontStyle: 'italic', maxWidth: '400px', margin: '0 auto' }}>
                        Please wait for managers to list projects and add team members. Once assigned, your projects will appear here.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {projects.map(p => {
                        const availableUsersToAdd = allUsers.filter(
                            user => !p.members?.some(member => member.id === user.id)
                        );

                        // --- Access Logic ---
                        const isMember = p.members?.some(member => member.id === parseInt(userId));
                        const hasAccess = userRole === 'ADMIN' || isMember;

                        return (
                            <div key={p.id} style={{ 
                                position: 'relative', // Necessary for the "Access Denied" overlay
                                border: '1px solid #ddd', 
                                padding: '1.5rem', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                                display: 'flex', 
                                flexDirection: 'column',
                                overflow: 'hidden' // Keeps the blur inside the card
                            }}>
                                
                                {/* --- BLUR OVERLAY FOR RESTRICTED USERS --- */}
                                {!hasAccess && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(6px)', // The blur effect
                                        zIndex: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</span>
                                        <h4 style={{ margin: 0, color: '#d9534f' }}>Access Denied</h4>
                                        <p style={{ fontSize: '12px', color: '#666', padding: '0 10px' }}>You are not a member of this team.</p>
                                    </div>
                                )}

                                {/* Card Content (Will be blurred by overlay above if !hasAccess) */}
                                <h3>{p.name}</h3>
                                <p style={{ color: '#666', minHeight: '3em' }}>{p.description || "No description provided."}</p>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', marginBottom: '1rem', alignItems: 'center' }}>
                                    {hasAccess && (
                                        <button onClick={() => navigate(`/project/${p.id}`)} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                            View Tasks
                                        </button>
                                    )}

                                    {userRole === 'ADMIN' && (
                                        <button onClick={() => handleDeleteProject(p.id)} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>
                                            Delete
                                        </button>
                                    )}
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Team Members</h4>
                                    
                                    {userRole === 'ADMIN' && (
                                        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                                            <select 
                                                value={selectedUsers[p.id] || ''} 
                                                onChange={(e) => handleDropdownChange(p.id, e.target.value)}
                                                style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="">-- Select User --</option>
                                                {availableUsersToAdd.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.email}
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={() => handleAddMember(p.id)} 
                                                style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                disabled={!selectedUsers[p.id]} 
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                    
                                    <ul style={{ listStyleType: 'none', padding: 0, marginTop: '10px', fontSize: '14px' }}>
                                        {p.members && p.members.length > 0 ? (
                                            p.members.map(member => (
                                                <li key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', background: '#f8f9fa', padding: '6px 10px', borderRadius: '4px' }}>
                                                    <span>{member.email}</span>
                                                    {userRole === 'ADMIN' && (
                                                        <button onClick={() => handleRemoveMember(p.id, member.id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', padding: '0 5px' }}>X</button>
                                                    )}
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ color: '#999', fontStyle: 'italic' }}>No team members yet.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;