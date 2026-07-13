import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Organization from '../models/Organization.js';

// Helper to check user privileges for a task
const checkTaskPrivileges = async (task, userId) => {
  const project = await Project.findById(task.project);
  const organization = await Organization.findById(project.organization);
  const membership = organization.members.find(m => m.user.toString() === userId.toString());
  
  const isAssignee = task.assignee && task.assignee.toString() === userId.toString();
  const isManagerOrAdmin = membership && (membership.role === 'admin' || membership.role === 'manager');
  const isProjectMember = project.members.includes(userId);

  return { isAssignee, isManagerOrAdmin, isProjectMember };
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignee, priority, dueDate } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.members.includes(req.user._id)) {
       return res.status(403).json({ message: 'Not a member of this project' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignee,
      priority,
      dueDate
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
                            .populate('assignee', 'name avatarUrl')
                            .populate('comments.user', 'name avatarUrl');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (any project member)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const privileges = await checkTaskPrivileges(task, req.user._id);
    if (!privileges.isProjectMember) return res.status(403).json({ message: 'Not authorized' });

    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (assignee/manager/admin only)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const privileges = await checkTaskPrivileges(task, req.user._id);
    if (!privileges.isAssignee && !privileges.isManagerOrAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit full task details' });
    }

    const { title, description, priority, dueDate, assignee } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignee) task.assignee = assignee;

    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const privileges = await checkTaskPrivileges(task, req.user._id);
    if (!privileges.isProjectMember) return res.status(403).json({ message: 'Not authorized' });

    task.comments.push({ user: req.user._id, text });
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload file attachment to task
// @route   POST /api/tasks/:id/upload
// @access  Private
export const uploadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const privileges = await checkTaskPrivileges(task, req.user._id);
    if (!privileges.isProjectMember) return res.status(403).json({ message: 'Not authorized' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const attachmentUrl = `/uploads/${req.file.filename}`;
    task.attachments.push({ filename: req.file.originalname, url: attachmentUrl });
    await task.save();

    res.status(201).json({ message: 'File uploaded', url: attachmentUrl, filename: req.file.originalname });
  } catch (error) {
    next(error);
  }
};
