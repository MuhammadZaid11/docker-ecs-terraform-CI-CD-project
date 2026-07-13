import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, ListTodo, Plus, X } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');

  // Invite states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteOrgId, setInviteOrgId] = useState('');

  const fetchDashboardData = async () => {
    try {
      const orgRes = await api.get('/organizations');
      setOrganizations(orgRes.data);

      if (orgRes.data.length > 0) {
        // Just fetching projects for the first organization for simplicity in this dashboard view
        const projRes = await api.get(`/projects/org/${orgRes.data[0]._id}`);
        setProjects(projRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.post('/organizations', { name: orgName });
      setShowOrgModal(false);
      setOrgName('');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating organization');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { 
        name: projName, 
        description: projDesc, 
        organizationId: selectedOrgId || organizations[0]?._id 
      });
      setShowProjModal(false);
      setProjName('');
      setProjDesc('');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting project');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/organizations/${inviteOrgId}/invite`, { email: inviteEmail, role: inviteRole });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchDashboardData();
      alert('Invitation sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error inviting member');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6 relative">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Projects</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
        </div>
        {/* Simplified metric cards for ToDo/InProgress/Done */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ListTodo size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tasks</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Your Projects</h2>
              <button 
                onClick={() => setShowProjModal(true)}
                className="text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 flex items-center transition-colors"
              >
                <Plus size={16} className="mr-1" /> New Project
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No projects found. Create one!</div>
              ) : (
                projects.map(project => (
                  <div key={project._id} className="relative group block p-6 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <Link to={`/project/${project._id}`} className="block">
                      <h3 className="font-semibold text-gray-900 pr-8">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    </Link>
                    <button 
                      onClick={(e) => { e.preventDefault(); handleDeleteProject(project._id); }}
                      className="absolute right-4 top-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Project"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Organizations</h2>
              <button 
                onClick={() => setShowOrgModal(true)}
                className="text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 flex items-center transition-colors"
              >
                <Plus size={16} className="mr-1" /> New Org
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {organizations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No organizations found. Create one!</div>
              ) : (
                organizations.map(org => (
                  <div key={org._id} className="p-4 flex justify-between items-center group">
                    <div>
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{org.members.length} members</p>
                    </div>
                    <button 
                      onClick={() => { setInviteOrgId(org._id); setShowInviteModal(true); }}
                      className="text-xs bg-gray-100 hover:bg-brand-100 hover:text-brand-700 text-gray-600 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Create Organization</h3>
              <button onClick={() => setShowOrgModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateOrg} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white font-medium py-2 rounded-lg hover:bg-brand-700">
                Create Organization
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Create Project</h3>
              <button onClick={() => setShowProjModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an Organization</option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white font-medium py-2 rounded-lg hover:bg-brand-700">
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Invite Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleInviteMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white font-medium py-2 rounded-lg hover:bg-brand-700">
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
