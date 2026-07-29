const { AsyncLocalStorage } = require('async_hooks');
const projectPaymentModel = require('../models/projectPaymentModel');
const projectModel = require('../models/projectModel');

// Assuming als is somehow available or we rely on req.user which should be populated by middleware.
// Let's use req.user or fallback to a default admin name if not available.
// The index.js uses als to store user. We can use it if exported, but it's not exported from index.js.
// Since index.js mounts: app.use((req,res,next) => { let user = ... als.run(...) }) 
// But req.user is usually a better approach. Let's just use als from async_hooks, wait, we need the exact instance if we want to use ALS, but we can't share it easily unless it's in a separate file.
// Instead, let's extract user from req directly if possible, or assume the client sends the logged in username via req.body.paid_to. The instruction said "to is admin always that is logged in user name auto fill in the field", so the frontend will send it in `paid_to`.

async function createProjectPayment(req, res) {
  try {
    const { project_id, payment_mode, created_by, client_name, paid_to, amount_paid, reason_for_payment, date_of_payment, time_of_payment } = req.body;
    
    if (!project_id || !amount_paid || !date_of_payment || !time_of_payment) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify project exists
    const project = await projectModel.findProjectById(project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const paymentData = {
      project_id,
      project_name: project.project_name,
      client_name: client_name || project.client_name,
      paid_to,
      amount_paid,
      payment_mode,
      reason_for_payment,
      date_of_payment,
      time_of_payment,
      created_by // this will be userProfile.user_id
    };

    const newPayment = await projectPaymentModel.createProjectPayment(paymentData);
    
    // Add amount_paid to company_funds
    const db = require('../config/db').getDB();
    const [fundRows] = await db.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    const currentFund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
    const newFundTotal = currentFund + parseFloat(amount_paid);
    
    await db.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [newFundTotal, created_by]
    );

    // Get updated summary
    const summary = await projectPaymentModel.getProjectPaymentSummary(project_id);

    res.status(201).json({ 
      success: true, 
      message: 'Project payment recorded successfully', 
      data: newPayment,
      summary
    });
  } catch (error) {
    console.error('Error creating project payment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getProjectPayments(req, res) {
  try {
    const { projectId } = req.query;
    
    if (projectId) {
      const payments = await projectPaymentModel.getProjectPaymentsByProjectId(projectId);
      const summary = await projectPaymentModel.getProjectPaymentSummary(projectId);
      return res.status(200).json({ success: true, data: payments, summary });
    }
    
    const allPayments = await projectPaymentModel.getAllProjectPayments();
    res.status(200).json({ success: true, data: allPayments });
  } catch (error) {
    console.error('Error fetching project payments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getProjectPaymentSummary(req, res) {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }
    
    const summary = await projectPaymentModel.getProjectPaymentSummary(projectId);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching project payment summary:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  createProjectPayment,
  getProjectPayments,
  getProjectPaymentSummary
};
