const pricingModel = require('../models/pricingModel');

async function listPricing(req, res) {
  try {
    const plans = await pricingModel.getAllPricing();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing plans', error: error.message });
  }
}

async function getPricing(req, res) {
  try {
    const { id } = req.params;
    const plan = await pricingModel.getPricingById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Pricing plan not found' });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching pricing by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pricing plan', error: error.message });
  }
}

async function createPricing(req, res) {
  try {
    const actor = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const plan = await pricingModel.createPricing({
      ...req.body,
      created_by: actor,
      updated_by: actor,
    });
    res.status(201).json({ success: true, message: 'Pricing plan created successfully', data: plan });
  } catch (error) {
    console.error('Error creating pricing:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create pricing plan' });
  }
}

async function updatePricing(req, res) {
  try {
    const { id } = req.params;
    const actor = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const plan = await pricingModel.updatePricing(id, {
      ...req.body,
      updated_by: actor,
    });
    res.status(200).json({ success: true, message: 'Pricing plan updated successfully', data: plan });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update pricing plan' });
  }
}

async function deletePricing(req, res) {
  try {
    const { id } = req.params;
    await pricingModel.deletePricing(id);
    res.status(200).json({ success: true, message: 'Pricing plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to delete pricing plan' });
  }
}

module.exports = {
  listPricing,
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
};
