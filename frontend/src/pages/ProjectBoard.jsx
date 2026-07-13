import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { Plus, X } from 'lucide-react';

const ProjectBoard = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  // Task Details Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks/project/${id}`);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        projectId: id
      });
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/tasks/${selectedTask._id}/comments`, { text: commentText });
      setCommentText('');
      fetchTasks();
      // Need to update selectedTask too to show new comment immediately
      const { data } = await api.get(`/tasks/project/${id}`);
      setTasks(data);
      const updatedTask = data.find(t => t._id === selectedTask._id);
      setSelectedTask(updatedTask);
    } catch (error) {
      alert('Error adding comment');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      await api.post(`/tasks/${selectedTask._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      fetchTasks();
      // Update selectedTask
      const { data } = await api.get(`/tasks/project/${id}`);
      setTasks(data);
      const updatedTask = data.find(t => t._id === selectedTask._id);
      setSelectedTask(updatedTask);
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading file');
    }
  };

  if (loading) return <div className="text-center py-10">Loading board...</div>;

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 border-gray-200 text-gray-700' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { id: 'done', title: 'Done', color: 'bg-green-50 border-green-100 text-green-700' }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col relative">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
        </div>
        <button 
          onClick={() => setShowTaskModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Task
        </button>
      </header>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} className="min-w-[320px] w-full max-w-sm flex flex-col">
            <div className={`px-4 py-3 rounded-t-xl border-t border-l border-r font-medium flex justify-between items-center ${col.color}`}>
              <span>{col.title}</span>
              <span className="bg-white bg-opacity-50 text-xs px-2 py-1 rounded-full">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-b-xl p-3 flex flex-col gap-3 overflow-y-auto">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task._id} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {task.priority}
                    </span>
                    {task.attachments?.length > 0 && (
                      <span className="text-xs text-gray-400">📎 {task.attachments.length}</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 leading-snug">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                    <div className="flex -space-x-2">
                      {task.assignee ? (
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold border-2 border-white" title={task.assignee.name}>
                          {task.assignee.name.charAt(0)}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs border-2 border-white">
                          ?
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      {columns.filter(c => c.id !== task.status).map(c => (
                        <button
                          key={c.id}
                          onClick={() => updateTaskStatus(task._id, c.id)}
                          className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          → {c.title.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Create Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white font-medium py-2 rounded-lg hover:bg-brand-700">
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  selectedTask.priority === 'high' ? 'bg-red-100 text-red-700' :
                  selectedTask.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {selectedTask.priority}
                </span>
                <span className="text-sm font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 uppercase">
                  {selectedTask.status.replace('-', ' ')}
                </span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
              </div>

              {/* Attachments */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                {selectedTask.attachments?.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {selectedTask.attachments.map((file, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <span className="mr-2">📎</span>
                        <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          {file.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No attachments yet.</p>
                )}
                
                <form onSubmit={handleFileUpload} className="flex gap-2 items-center">
                  <input 
                    type="file" 
                    onChange={e => setUploadFile(e.target.files[0])} 
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                  <button type="submit" disabled={!uploadFile} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200 disabled:opacity-50">Upload</button>
                </form>
              </div>

              {/* Comments */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Comments ({selectedTask.comments?.length || 0})</h3>
                <div className="space-y-4 mb-4">
                  {selectedTask.comments?.map((comment, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleAddComment} className="mt-4">
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows="2"
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button type="submit" disabled={!commentText.trim()} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectBoard;
