const express = require("express");
const router = express.Router();
const { upload } = require("../config/multerConfig");
const traineeTaskController = require("../controllers/traineeTaskController");
const verifyToken = require("../security/authMiddleware");

const taskUpload = upload.single("task_document");

// Trainee Tasks
router.get("/trainee-tasks", traineeTaskController.getTraineeTasks);
router.post("/trainee-tasks", taskUpload, traineeTaskController.createTraineeTask);
router.put("/trainee-tasks/:uuid", taskUpload, traineeTaskController.updateTraineeTask);
router.delete("/trainee-tasks/:uuid", traineeTaskController.deleteTraineeTask);

// Trainee Task Assignments
router.get("/trainee-task-assignments", traineeTaskController.getAssignments);
router.post("/trainee-task-assignments", traineeTaskController.assignTask);
router.put("/trainee-task-assignments/:uuid", traineeTaskController.updateAssignment);
router.delete("/trainee-task-assignments/:uuid", traineeTaskController.deleteAssignment);

module.exports = router;
