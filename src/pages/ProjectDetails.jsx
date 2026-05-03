import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    
    // --- UPDATED: This now only holds members of THIS project ---
    const [projectMembers, setProjectMembers] = useState([]); 
    
    const [title, setTitle] = useState('');
    const [assignedToId, setAssignedToId] = useState(''); 
    const [dueDate, setDueDate] = useState(''); 

    const userRole = localStorage.getItem('role');

    useEffect(() => {
        fetchTasks();
        fetchProjectData(); // Fetch project details to get the member list
    }, [id]);

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/tasks/project/${id}`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };

    // --- NEW: Fetch project details to get the specific team members ---
    const fetchProjectData = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            // Assuming your Project entity has a 'members' list
            setProjectMembers(response.data.members || []);
        } catch (error) {
            console.error("Error fetching project members", error);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        
        if (!assignedToId) {
            return alert("Please select a team member assigned to this project.");
        }

        try {
            await api.post(`/tasks/project/${id}/assign/${assignedToId}`, { 
                title, 
                dueDate: dueDate || null
            });
            setTitle('');
            setAssignedToId('');
            setDueDate('');
            fetchTasks();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Access Denied: Only Admins can create and assign tasks.");
            } else {
                alert("Error adding task. Please try again.");
            }
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status?status=${newStatus}`);
            fetchTasks();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Access Denied: You can only update tasks assigned to you.");
            } else {
                alert("Error updating status.");
            }
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Access Denied: Only Admins can delete tasks.");
            } else {
                alert("Error deleting task.");
            }
        }
    };

    const isOverdue = (date, status) => {
        if (!date || status === 'COMPLETED') return false;
        return new Date(date) < new Date().setHours(0,0,0,0);
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>← Back to Projects</button>
            
            <h2>Project Tasks</h2>
            
            {userRole === 'ADMIN' && (
                <form onSubmit={handleAddTask} style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <input 
                        placeholder="Task title" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                        style={{ padding: '8px', flex: '1 1 200px' }}
                    />
                    
                    {/* --- UPDATED: Dropdown now uses projectMembers instead of all users --- */}
                    <select 
                        value={assignedToId} 
                        onChange={e => setAssignedToId(e.target.value)}
                        style={{ padding: '8px' }}
                        required
                    >
                        <option value="">Assign To Member...</option>
                        {projectMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.email}</option>
                        ))}
                    </select>

                    <input 
                        type="date" 
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)}
                        style={{ padding: '8px' }}
                    />

                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Add Task
                    </button>
                </form>
            )}

            {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#666', border: '1px dashed #ccc' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#444' }}>No Tasks Available</h3>
                    <p style={{ margin: 0, fontStyle: 'italic' }}>Please wait for a task to be added and assigned to you.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                    {tasks.map(t => {
                        const overdue = isOverdue(t.dueDate, t.status);
                        return (
                            <div key={t.id} style={{ 
                                padding: '1rem', 
                                border: overdue ? '2px solid #dc3545' : '1px solid #ddd', 
                                borderRadius: '8px',
                                backgroundColor: overdue ? '#fff5f5' : (t.status === 'COMPLETED' ? '#f8f9fa' : 'white')
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none', fontWeight: 'bold' }}>
                                        {t.title}
                                    </span>
                                    {overdue && <span style={{ color: '#dc3545', fontSize: '0.8rem', fontWeight: 'bold' }}>OVERDUE</span>}
                                </div>
                                
                                <div style={{ fontSize: '0.85rem', color: '#666', margin: '8px 0' }}>
                                    👤 {t.assignedTo ? t.assignedTo.email : 'Unassigned'} | 📅 Due: {t.dueDate || 'N/A'}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                    {t.status !== 'COMPLETED' && (
                                        <button 
                                            onClick={() => updateStatus(t.id, 'COMPLETED')}
                                            style={{ padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Done
                                        </button>
                                    )}
                                    
                                    {userRole === 'ADMIN' && (
                                        <button 
                                            onClick={() => deleteTask(t.id)}
                                            style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;