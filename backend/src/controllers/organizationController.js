import Organization from '../models/Organization.js';
import User from '../models/User.js';

// @desc    Create an organization
// @route   POST /api/organizations
// @access  Private
export const createOrganization = async (req, res, next) => {
  try {
    const { name } = req.body;
    const organization = await Organization.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: req.user.role === 'admin' ? 'admin' : 'manager' }] // Owner gets manager or admin
    });
    res.status(201).json(organization);
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizations for logged in user
// @route   GET /api/organizations
// @access  Private
export const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find({ 'members.user': req.user._id }).populate('members.user', 'name email avatarUrl');
    res.json(orgs);
  } catch (error) {
    next(error);
  }
};

// @desc    Invite member to organization
// @route   POST /api/organizations/:id/invite
// @access  Private (Admin/Manager only)
export const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const orgId = req.params.id;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user has rights
    const membership = organization.members.find(m => m.user.toString() === req.user._id.toString());
    if (!membership || (membership.role !== 'admin' && membership.role !== 'manager')) {
      const error = new Error('Not authorized to invite members');
      error.statusCode = 403;
      throw error;
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      const error = new Error('User to invite not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if already member
    if (organization.members.find(m => m.user.toString() === userToInvite._id.toString())) {
      const error = new Error('User is already a member');
      error.statusCode = 400;
      throw error;
    }

    organization.members.push({ user: userToInvite._id, role: role || 'member' });
    await organization.save();

    res.json({ message: 'User invited successfully', organization });
  } catch (error) {
    next(error);
  }
};
