const TraineeAssignmentModel = require('../models/traineeAssignmentModel');
const { getDB } = require('../config/db');

// Create or Reassign Trainee
exports.assignTrainee = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.user_id || req.user?.username || req.body.assigned_by || 'system';
    const assignmentData = { ...req.body, assigned_by: userId, created_by: userId, updated_by: userId };
    
    // Validate required fields
    if (!assignmentData.trainee_id || !assignmentData.employee_id) {
      return res.status(400).json({ success: false, message: 'Trainee ID and Employee ID are required' });
    }

    // Check if the trainee already has an active assignment
    const currentAssignment = await TraineeAssignmentModel.getActiveAssignmentByTraineeId(assignmentData.trainee_id);
    
    // If reassignment, mark previous as completed
    if (currentAssignment) {
      // If assigning to the exact same employee, maybe just ignore or return success
      if (currentAssignment.employee_id === assignmentData.employee_id) {
        return res.status(400).json({ success: false, message: 'Trainee is already actively assigned to this employee.' });
      }
      
      await TraineeAssignmentModel.markPreviousAssignmentsCompleted(assignmentData.trainee_id, userId);
    }

    // Keep every existing task with the employee receiving the trainee.
    await TraineeAssignmentModel.reassignTaskAssignments(
      assignmentData.trainee_id,
      assignmentData.employee_id,
      userId
    );

    // Create the new assignment
    const insertId = await TraineeAssignmentModel.createAssignment(assignmentData);

    res.status(201).json({
      success: true,
      message: 'Trainee assigned successfully',
      data: { id: insertId }
    });
  } catch (error) {
    console.error('Error assigning trainee:', error);
    res.status(500).json({ success: false, message: 'Server error assigning trainee' });
  }
};

// Get History
exports.getAssignmentHistory = async (req, res) => {
  try {
    const { traineeId } = req.params;
    const history = await TraineeAssignmentModel.getAssignmentHistory(traineeId);
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching history' });
  }
};

// Get Available Employees (with active trainee count)
exports.getAvailableEmployees = async (req, res) => {
  try {
    const db = getDB();
    
    // Fetch all active employees
    const [employees] = await db.execute(`
      SELECT 
        employee_id, employee_code, first_name, last_name, official_email, mobile_number, designation
      FROM employees 
      WHERE employment_status = 'Active' OR employment_status IS NULL
    `);

    // Fetch active assignment counts
    const counts = await TraineeAssignmentModel.getActiveAssignmentsCountPerEmployee();
    const countMap = {};
    counts.forEach(c => {
      countMap[c.employee_id] = c.trainee_count;
    });

    const result = employees.map(emp => ({
      ...emp,
      employee_name: [emp.first_name, emp.last_name].filter(Boolean).join(' '),
      email: emp.official_email,
      phone: emp.mobile_number,
      department: emp.designation || '',
      active_trainee_count: countMap[emp.employee_id] || 0
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching available employees:', error);
    res.status(500).json({ success: false, message: 'Server error fetching available employees' });
  }
};
// Get all trainee IDs that currently have an active assignment
exports.getActiveTraineeIds = async (req, res) => {
  try {
    const ids = await TraineeAssignmentModel.getActiveTraineeIds();
    res.status(200).json({ success: true, data: ids });
  } catch (error) {
    console.error('Error fetching active trainee ids:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
