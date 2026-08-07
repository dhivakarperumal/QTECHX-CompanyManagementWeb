const express = require("express");
const router = express.Router();
const { upload } = require("../config/multerConfig");
const traineeTaskController = require("../controllers/traineeTaskController");
const { authenticate } = require("../security/authMiddleware");

const taskUpload = upload.single("task_document");
const assignmentUpload = upload.single("assignment_document");

// Trainee Tasks
router.get("/trainee-tasks", authenticate, traineeTaskController.getTraineeTasks);
router.post("/trainee-tasks", authenticate, taskUpload, traineeTaskController.createTraineeTask);
router.put("/trainee-tasks/:uuid", authenticate, taskUpload, traineeTaskController.updateTraineeTask);
router.delete("/trainee-tasks/:uuid", authenticate, traineeTaskController.deleteTraineeTask);

// Trainee Task Assignments
router.get("/trainee-task-assignments", authenticate, traineeTaskController.getAssignments);
router.post("/trainee-task-assignments", authenticate, assignmentUpload, traineeTaskController.assignTask);
router.put("/trainee-task-assignments/:uuid", authenticate, assignmentUpload, traineeTaskController.updateAssignment);
router.delete("/trainee-task-assignments/:uuid", authenticate, traineeTaskController.deleteAssignment);

module.exports = router;
