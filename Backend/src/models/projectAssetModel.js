const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createProjectAssets(assets = []) {
  if (!Array.isArray(assets) || !assets.length) return;

  const db = getDB();
  const values = [];
  const placeholders = assets.map(() => '(?,?,?,?,?,?,?)').join(', ');

  for (const asset of assets) {
    values.push(
      asset.uuid || uuidv4(),
      asset.project_id,
      asset.asset_type || 'image',
      asset.original_name || null,
      asset.file_path || null,
      asset.created_by || null,
      asset.updated_by || null,
    );
  }

  await db.execute(
    `INSERT INTO project_assets (uuid, project_id, asset_type, original_name, file_path, created_by, updated_by) VALUES ${placeholders}`,
    values
  );
}

module.exports = { createProjectAssets };