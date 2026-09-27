import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { Users, Trash2, Shield, User, Search, RefreshCw } from 'lucide-react';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(r => { setUsers(r.data.data || []); setFiltered(r.data.data || []); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)));
  }, [search, users]);

  const toggleRole = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      await api.put(`/admin/users/${u.id}/role`, { role: newRole });
      toast.success(`${u.fullName} is now ${newRole}`);
      load();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Manage Users</span></h1>
        <p>{users.length} registered users on the platform</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="user-search"
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No users found
                  </td>
                </tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {u.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-info'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        id={`toggle-role-${u.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleRole(u)}
                        title={u.role === 'ADMIN' ? 'Demote to Student' : 'Promote to Admin'}
                      >
                        {u.role === 'ADMIN' ? <User size={14} /> : <Shield size={14} />}
                        {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        id={`delete-user-${u.id}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmDelete(u)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Delete User</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ marginBottom: '24px' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete.fullName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                id="confirm-delete-user"
                className="btn btn-danger"
                onClick={() => deleteUser(confirmDelete.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
