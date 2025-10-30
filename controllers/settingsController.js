const { query } = require('../config/database');

// Get system settings
const getSettings = async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings LIMIT 1');

    if (settings.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update system settings
const updateSettings = async (req, res) => {
  try {
    const { schoolName, schoolLogo, headerBackground, aboutContent } = req.body;

    console.log('📝 Update settings request received:');
    console.log('  schoolName:', schoolName);
    console.log('  schoolLogo:', schoolLogo);
    console.log('  headerBackground:', headerBackground);
    console.log('  aboutContent:', aboutContent ? `${aboutContent.substring(0, 50)}...` : undefined);

    // Get existing settings
    const existingSettings = await query('SELECT * FROM settings LIMIT 1');

    if (existingSettings.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settingsId = existingSettings[0].id;

    // Build update query
    const updates = [];
    const values = [];

    if (schoolName !== undefined) {
      updates.push('schoolName = ?');
      values.push(schoolName);
    }
    if (schoolLogo !== undefined) {
      updates.push('schoolLogo = ?');
      values.push(schoolLogo || null);
    }
    if (headerBackground !== undefined) {
      updates.push('headerBackground = ?');
      values.push(headerBackground || null);
    }
    if (aboutContent !== undefined) {
      updates.push('aboutContent = ?');
      values.push(aboutContent);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(settingsId);

    console.log('🔄 Executing update query:', `UPDATE settings SET ${updates.join(', ')} WHERE id = ?`);
    console.log('📊 Values:', values);

    await query(
      `UPDATE settings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated settings
    const updatedSettings = await query('SELECT * FROM settings WHERE id = ?', [settingsId]);

    console.log('✅ Settings updated successfully');
    console.log('📤 Returning:', updatedSettings[0]);

    res.json(updatedSettings[0]);
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
