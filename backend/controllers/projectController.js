const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const { status, clientId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (clientId) query.client = clientId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('client', 'clientName companyName')
        .populate('assignedTeam', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(query),
    ]);
    res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client')
      .populate('assignedTeam', 'name email phone')
      .populate('createdBy', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    const populated = await Project.findById(project._id)
      .populate('client', 'clientName companyName')
      .populate('assignedTeam', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) project[key] = req.body[key];
    });
    await project.save();
    const updated = await Project.findById(project._id)
      .populate('client', 'clientName companyName')
      .populate('assignedTeam', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
