const path = require("path");
const completedProjectModel = require("../models/completedProjectModel");
const clientModel = require("../models/clientModel");

function getUploadedFilePath(req) {
  if (req.file) {
    const uploadRoot = path.join(__dirname, "../../uploads");
    const relativePath = path.relative(uploadRoot, req.file.path).split(path.sep).join("/");
    return `/uploads/${relativePath}`;
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadRoot = path.join(__dirname, "../../uploads");
    const relativePath = path.relative(uploadRoot, req.files[0].path).split(path.sep).join("/");
    return `/uploads/${relativePath}`;
  }

  if (req.files && req.files.image && req.files.image[0]) {
    const uploadRoot = path.join(__dirname, "../../uploads");
    const relativePath = path.relative(uploadRoot, req.files.image[0].path).split(path.sep).join("/");
    return `/uploads/${relativePath}`;
  }

  return req.body.image || null;
}

async function listCompletedProjects(req, res) {
  try {
    const { search, category, status, clientId, client_id } = req.query;
    const projects = await completedProjectModel.getAllCompletedProjects({
      search,
      category,
      status,
      clientId: clientId || client_id,
    });
    res.status(200).json({ success: true, data: projects, count: projects.length });
  } catch (error) {
    console.error("Error listing completed projects:", error);
    res.status(500).json({ success: false, message: "Failed to fetch completed projects", error: error.message });
  }
}

async function getCompletedProject(req, res) {
  try {
    const { id } = req.params;
    const isNumeric = !Number.isNaN(Number(id));
    const project = isNumeric
      ? await completedProjectModel.getCompletedProjectById(id)
      : await completedProjectModel.getCompletedProjectByUUID(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Completed project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("Error fetching completed project:", error);
    res.status(500).json({ success: false, message: "Failed to fetch completed project", error: error.message });
  }
}

async function createCompletedProject(req, res) {
  try {
    const imagePath = getUploadedFilePath(req);
    const body = { ...req.body };

    const projectName = body.project_name || body.projectName || body.name;
    if (!projectName || !projectName.trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    let clientId = body.client_id || body.clientId || null;
    let clientName = body.client_name || body.clientName || null;
    let clientDetails = body.client_details || body.clientDetails || null;

    if (clientId && (!clientName || !clientDetails)) {
      try {
        const client = await clientModel.findClientById(clientId);
        if (client) {
          if (!clientName) clientName = client.client_name;
          if (!clientDetails) {
            clientDetails = {
              client_name: client.client_name,
              company_name: client.company_name,
              email: client.email,
              phone_number: client.phone_number,
              contact_person: client.contact_person,
            };
          }
        }
      } catch (err) {
        console.warn("Could not fetch client details for project:", err.message);
      }
    }

    const payload = {
      project_name: projectName.trim(),
      category: body.category || null,
      image: imagePath,
      description: body.description || null,
      url: body.url || body.project_url || null,
      client_id: clientId ? Number(clientId) : null,
      client_name: clientName,
      client_details: clientDetails,
      status: body.status || "Completed",
      technologies: body.technologies || null,
      completion_date: body.completion_date || null,
      created_by: req.user?.id || req.user?.uuid || body.created_by || null,
      updated_by: req.user?.id || req.user?.uuid || body.updated_by || null,
    };

    const created = await completedProjectModel.createCompletedProject(payload);
    res.status(201).json({ success: true, message: "Completed project created successfully", data: created });
  } catch (error) {
    console.error("Error creating completed project:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create completed project" });
  }
}

async function updateCompletedProject(req, res) {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    const uploadedPath = getUploadedFilePath(req);

    const isNumeric = !Number.isNaN(Number(id));
    const existing = isNumeric
      ? await completedProjectModel.getCompletedProjectById(id)
      : await completedProjectModel.getCompletedProjectByUUID(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Completed project not found" });
    }

    let clientId = body.client_id !== undefined ? (body.client_id ? Number(body.client_id) : null) : existing.client_id;
    let clientName = body.client_name !== undefined ? body.client_name : existing.client_name;
    let clientDetails = body.client_details !== undefined ? body.client_details : existing.client_details;

    if (clientId && clientId !== existing.client_id && (!clientName || !clientDetails)) {
      try {
        const client = await clientModel.findClientById(clientId);
        if (client) {
          clientName = client.client_name;
          clientDetails = {
            client_name: client.client_name,
            company_name: client.company_name,
            email: client.email,
            phone_number: client.phone_number,
            contact_person: client.contact_person,
          };
        }
      } catch (err) {
        console.warn("Could not fetch updated client info:", err.message);
      }
    }

    const payload = {
      project_name: body.project_name || body.projectName || body.name || existing.project_name,
      category: body.category !== undefined ? body.category : existing.category,
      image: uploadedPath !== null && uploadedPath !== undefined ? uploadedPath : existing.image,
      description: body.description !== undefined ? body.description : existing.description,
      url: body.url !== undefined ? body.url : (body.project_url !== undefined ? body.project_url : existing.url),
      client_id: clientId,
      client_name: clientName,
      client_details: clientDetails,
      status: body.status || existing.status || "Completed",
      technologies: body.technologies !== undefined ? body.technologies : existing.technologies,
      completion_date: body.completion_date !== undefined ? body.completion_date : existing.completion_date,
      updated_by: req.user?.id || req.user?.uuid || body.updated_by || null,
    };

    const updated = await completedProjectModel.updateCompletedProject(id, payload);
    res.status(200).json({ success: true, message: "Completed project updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating completed project:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update completed project" });
  }
}

async function deleteCompletedProject(req, res) {
  try {
    const { id } = req.params;
    const deleted = await completedProjectModel.deleteCompletedProject(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Completed project not found or already deleted" });
    }
    res.status(200).json({ success: true, message: "Completed project deleted successfully" });
  } catch (error) {
    console.error("Error deleting completed project:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete completed project" });
  }
}

module.exports = {
  listCompletedProjects,
  getCompletedProject,
  createCompletedProject,
  updateCompletedProject,
  deleteCompletedProject,
};
