const { query } = require('../config/database');
const { generateId, paginate, calculateTotalPages } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// Get all thesis with pagination and filters
const getTheses = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, program, year, search } = req.query;

    const { limit: pageLimit, offset, page: currentPage } = paginate(page, limit);

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (department) {
      conditions.push('department = ?');
      params.push(department);
    }

    if (program) {
      conditions.push('program = ?');
      params.push(program);
    }

    if (year) {
      conditions.push('year = ?');
      params.push(parseInt(year));
    }

    if (search) {
      conditions.push('(LOWER(title) LIKE LOWER(?) OR LOWER(authors) LIKE LOWER(?))');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM thesis ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const dataQuery = `SELECT * FROM thesis ${whereClause} ORDER BY year DESC, title ASC LIMIT ? OFFSET ?`;
    const theses = await query(dataQuery, [...params, pageLimit, offset]);

    // Parse JSON fields
    const formattedTheses = theses.map(thesis => ({
      ...thesis,
      authors: thesis.authors ? JSON.parse(thesis.authors) : [],
      advisors: thesis.advisors ? JSON.parse(thesis.advisors) : []
    }));

    res.json({
      data: formattedTheses,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: calculateTotalPages(total, pageLimit)
    });
  } catch (error) {
    console.error('Get theses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single thesis
const getThesis = async (req, res) => {
  try {
    const { id } = req.params;

    const theses = await query('SELECT * FROM thesis WHERE id = ?', [id]);

    if (theses.length === 0) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    const thesis = theses[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.json(thesis);
  } catch (error) {
    console.error('Get thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create thesis
const createThesis = async (req, res) => {
  try {
    const { title, abstract, authors, advisors, department, program, year } = req.body;

    // Validation
    if (!title || !department) {
      return res.status(400).json({ error: 'Title and department are required' });
    }

    // Generate ID
    const id = generateId();

    // Handle file upload (Cloudinary provides full URL in req.file.path)
    let pdfUrl = null;
    if (req.file) {
      pdfUrl = req.file.path; // Cloudinary URL
    }

    // Parse authors and advisors if they're strings (from FormData)
    const authorsData = typeof authors === 'string' ? JSON.parse(authors) : (authors || []);
    const advisorsData = typeof advisors === 'string' ? JSON.parse(advisors) : (advisors || []);

    // Insert thesis
    await query(
      'INSERT INTO thesis (id, title, abstract, authors, advisors, department, program, year, pdfUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        title,
        abstract || null,
        JSON.stringify(authorsData),
        JSON.stringify(advisorsData),
        department,
        program || null,
        year || null,
        pdfUrl
      ]
    );

    // Get created thesis
    const newThesis = await query('SELECT * FROM thesis WHERE id = ?', [id]);
    const thesis = newThesis[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.status(201).json(thesis);
  } catch (error) {
    console.error('Create thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update thesis
const updateThesis = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract, authors, advisors, department, program, year } = req.body;

    // Check if thesis exists
    const existingTheses = await query('SELECT * FROM thesis WHERE id = ?', [id]);

    if (existingTheses.length === 0) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    const existingThesis = existingTheses[0];

    // Build update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (abstract !== undefined) {
      updates.push('abstract = ?');
      values.push(abstract);
    }
    if (authors !== undefined) {
      const authorsData = typeof authors === 'string' ? JSON.parse(authors) : authors;
      updates.push('authors = ?');
      values.push(JSON.stringify(authorsData));
    }
    if (advisors !== undefined) {
      const advisorsData = typeof advisors === 'string' ? JSON.parse(advisors) : advisors;
      updates.push('advisors = ?');
      values.push(JSON.stringify(advisorsData));
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (program !== undefined) {
      updates.push('program = ?');
      values.push(program);
    }
    if (year !== undefined) {
      updates.push('year = ?');
      values.push(year);
    }

    // Handle file upload (Cloudinary)
    if (req.file) {
      // Note: Old Cloudinary files can be deleted from Cloudinary dashboard if needed
      // Or implement Cloudinary deletion using cloudinary.uploader.destroy(public_id)
      // For now, we'll just update with new URL

      updates.push('pdfUrl = ?');
      values.push(req.file.path); // Cloudinary URL
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await query(
      `UPDATE thesis SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated thesis
    const updatedThesis = await query('SELECT * FROM thesis WHERE id = ?', [id]);
    const thesis = updatedThesis[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.json(thesis);
  } catch (error) {
    console.error('Update thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete thesis
const deleteThesis = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if thesis exists
    const existingTheses = await query('SELECT * FROM thesis WHERE id = ?', [id]);

    if (existingTheses.length === 0) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    const thesis = existingTheses[0];

    // Delete PDF file if exists
    if (thesis.pdfUrl) {
      const filePath = path.join(__dirname, '..', thesis.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await query('DELETE FROM thesis WHERE id = ?', [id]);

    res.json({ message: 'Thesis deleted successfully' });
  } catch (error) {
    console.error('Delete thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unique years from thesis
const getUniqueYears = async (req, res) => {
  try {
    const { department } = req.query;

    let queryStr = 'SELECT DISTINCT year FROM thesis WHERE year IS NOT NULL';
    const params = [];

    if (department) {
      queryStr += ' AND department = ?';
      params.push(department);
    }

    queryStr += ' ORDER BY year DESC';

    const results = await query(queryStr, params);
    const years = results.map(row => row.year);

    res.json(years);
  } catch (error) {
    console.error('Get unique years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTheses,
  getThesis,
  createThesis,
  updateThesis,
  deleteThesis,
  getUniqueYears
};
