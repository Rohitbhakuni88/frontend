import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]); // Added for Team Assignment
    const [title, setTitle] = useState('');
    const [assignedToId, setAssignedToId] = useState(''); // New state
    const [dueDate, setDueDate] = useState(''); // New state

    useEffect(() => {
        fetchTasks();
        fetchUsers(); // Load team members on mount
    }, [id]);

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/tasks/project/${id}`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { 
                title, 
                status: 'PENDING', 
                project: { id: parseInt(id) },
                // Sending new fields to backend
                assignedTo: assignedToId ? { id: parseInt(assignedToId) } : null,
                dueDate: dueDate || null
            });
            setTitle('');
            setAssignedToId('');
            setDueDate('');
            fetchTasks();
        } catch (error) {
            alert("Error adding task");
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status?status=${newStatus}`);
            fetchTasks();
        } catch (error) {
            alert("Error updating status");
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            alert("Error deleting task");
        }
    };

    // Requirement: Overdue tracking logic
    const isOverdue = (date, status) => {
        if (!date || status === 'COMPLETED') return false;
        return new Date(date) < new Date().setHours(0,0,0,0);
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>← Back to Projects</button>
            
            <h2>Project Tasks</h2>
            
            <form onSubmit={handleAddTask} style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <input 
                    placeholder="Task title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    style={{ padding: '8px', flex: '1 1 200px' }}
                />
                
                {/* Team Assignment Dropdown */}
                <select 
                    value={assignedToId} 
                    onChange={e => setAssignedToId(e.target.value)}
                    style={{ padding: '8px' }}
                >
                    <option value="">Assign To...</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.email}</option>
                    ))}
                </select>

                {/* Due Date Picker */}
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
                                <button 
                                    onClick={() => deleteTask(t.id)}
                                    style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectDetails;