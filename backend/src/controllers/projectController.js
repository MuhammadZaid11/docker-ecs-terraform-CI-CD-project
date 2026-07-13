import Project from '../models/Project.js';
import Organization from '../models/Organization.js';

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { name, description, organizationId } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is admin or manager of the org
    const membership = organization.members.find(m => m.user.toString() === req.user._id.toString());
    if (!membership || (membership.role !== 'admin' && membership.role !== 'manager')) {
      return res.status(403).json({ message: 'Not authorized to create project in this organization' });
    }

    const project = await Project.create({
      name,
      description,
      organization: organizationId,
      members: [req.user._id] // creator is automatically a member
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for an organization
// @route   GET /api/projects/org/:orgId
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ organization: req.params.orgId })
                                  .populate('members', 'name email avatarUrl');
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const organization = await Organization.findById(project.organization);
    const membership = organization.members.find(m => m.user.toString() === req.user._id.toString());
    
    if (!membership || (membership.role !== 'admin' && membership.role !== 'manager')) {
      return res.status(403).json({ message: 'Not authorized to delete project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};
