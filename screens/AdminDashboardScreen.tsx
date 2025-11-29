import React, { useState, useEffect, useContext } from 'react';
import { AppContext, AppContextType } from '../App';
import Card from '../components/Card';
import { adminGetAllUsers, adminUpdateUserRole, AdminUserView } from '../services/dataService';

const AdminDashboardScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData } = context;
    const [users, setUsers] = useState<AdminUserView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');

    const isSuperAdmin = userData?.role === 'superadmin';
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';

    const showFeedback = (message: string) => {
        setFeedback(message);
        setTimeout(() => setFeedback(''), 3000);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userList = await adminGetAllUsers();
            setUsers(userList);
        } catch (e: any) {
            setError("Failed to fetch user data. You may not have permission.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (targetUserId: string, newRole: 'user' | 'admin') => {
        const result = await adminUpdateUserRole(targetUserId, newRole);
        if (result.success) {
            setUsers(prevUsers =>
                prevUsers.map(u => (u.id === targetUserId ? { ...u, role: newRole } : u))
            );
            showFeedback('User role updated successfully.');
        } else {
            showFeedback(result.error || 'Failed to update role.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className={textColor}>Loading users...</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <Card>
                <p className="text-red-500 text-center">{error}</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {feedback && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-deep-purple text-white px-4 py-2 rounded-full shadow-lg z-20 animate-toast-in-out">
                    {feedback}
                </div>
            )}
            <Card className="text-center">
                <h2 className={`text-xl font-bold ${textColor}`}>Admin Dashboard</h2>
                <p className={`${subTextColor} mt-1`}>Total Users: {users.length}</p>
            </Card>

            <Card>
                <div className="space-y-2">
                    {users.map(user => (
                        <div key={user.id} className={`p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center ${isDawn ? 'bg-slate-50' : 'bg-slate-900/40'}`}>
                            <div>
                                <p className={`font-semibold ${textColor}`}>{user.name}</p>
                                <p className={`text-sm ${subTextColor}`}>{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'superadmin' ? 'bg-yellow-400 text-yellow-900' : user.role === 'admin' ? 'bg-teal-400 text-teal-900' : 'bg-slate-300 text-slate-800'}`}>
                                    {user.role}
                                </span>
                                {isSuperAdmin && user.role !== 'superadmin' && user.id !== userData.id && (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                                        className={`p-1 border rounded-md text-xs ${isDawn ? 'bg-white border-slate-300' : 'bg-slate-700 border-slate-600 text-white'}`}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboardScreen;