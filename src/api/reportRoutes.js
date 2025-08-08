const express = require('express');
const router  = express.Router();
const PDFDocument = require('pdfkit');
const db = require('./db');


function normalizeFormat(value) {
  const fmt = (value || 'json').toLowerCase();
  return fmt === 'csv' || fmt === 'pdf' ? fmt : 'json';
}

function parseDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function queryRows(text, params = []) {
  const client = await db.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

function sendCsv(res, rows, filename = 'report.csv') {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  if (!rows || rows.length === 0) return res.send('');
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map(h => escape(row[h])).join(','));
  res.send(lines.join('\n'));
}

function sendPdf(res, rows, filename = 'report.pdf', title = 'Report') {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
  doc.info.Title = title;
  doc.pipe(res);
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  if (!rows || rows.length === 0) {
    doc.fontSize(12).text('No data.');
    doc.end();
    return;
  }
  const headers = Object.keys(rows[0]);
  doc.fontSize(12).text(headers.join(' | '));
  doc.moveDown(0.5);
  for (const row of rows) {
    const line = headers.map(h => (row[h] === null || row[h] === undefined) ? '' : String(row[h])).join(' | ');
    doc.text(line);
  }
  doc.end();
}

async function buildVolunteerReport({ start, end, userId }) {
  const startDate = parseDateOrNull(start);
  const endDate = parseDateOrNull(end);
  const filters = [];
  const params = [];
  if (userId) { params.push(userId); filters.push(`vh.user_id = $${params.length}`); }
  if (startDate) { params.push(startDate); filters.push(`ed.event_date >= $${params.length}`); }
  if (endDate) { params.push(endDate); filters.push(`ed.event_date <= $${params.length}`); }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = await queryRows(
    `SELECT 
       uc.user_id AS volunteer_id,
       up.full_name AS name,
       uc.email,
       COUNT(vh.event_id) FILTER (WHERE vh.status IN ('Attended','Confirmed')) AS events_participated,
       AVG(NULLIF(vh.performance_rating,0)) AS avg_rating,
       MIN(ed.event_date) AS first_participation,
       MAX(ed.event_date) AS last_participation
     FROM UserCredentials uc
     LEFT JOIN UserProfile up ON up.user_id = uc.user_id
     LEFT JOIN VolunteerHistory vh ON vh.user_id = uc.user_id
     LEFT JOIN EventDetails ed ON ed.event_id = vh.event_id
     ${where}
     GROUP BY uc.user_id, up.full_name, uc.email
     ORDER BY last_participation DESC NULLS LAST`,
    params
  );
  return rows.map(r => ({
    volunteer_id: r.volunteer_id,
    name: r.name,
    email: r.email,
    events_participated: Number(r.events_participated || 0),
    avg_rating: r.avg_rating ? Number(r.avg_rating).toFixed(2) : null,
    first_participation: r.first_participation,
    last_participation: r.last_participation,
  }));
}


router.get('/volunteers', async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    const format = normalizeFormat(req.query.format);
    const data = await buildVolunteerReport({ start, end, userId });
    if (format === 'csv') return sendCsv(res, data, 'volunteers.csv');
    if (format === 'pdf') return sendPdf(res, data, 'volunteers.pdf', 'Volunteers Report');
    return res.json({ data });
  } catch (err) {
    console.error('Volunteer report error:', err);
    res.status(500).json({ error: 'Failed to generate volunteer report' });
  }
});


module.exports = router;


