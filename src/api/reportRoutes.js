const express = require('express');
const router  = express.Router();
const PDFDocument = require('pdfkit');
const db = require('./db');

//  helpers 
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

//  CSV / PDF formatting 
function sendCsv(res, rows, filename = 'report.csv', fields = null) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  if (!rows || rows.length === 0) return res.send('\uFEFF');

  const dateKeys = new Set(['event_date','first_participation','last_participation','assigned_on']);
  const keys = fields && fields.length ? fields : Object.keys(rows[0]);

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0,10);
  };

  const lines = [];
  lines.push(keys.join(','));
  for (const row of rows) {
    const vals = keys.map(k => {
      let v = row[k];
      if (dateKeys.has(k)) v = fmtDate(v);
      return escape(v);
    });
    lines.push(vals.join(','));
  }
  return res.send('\uFEFF' + lines.join('\n'));
}

function sendPdf(res, rows, filename = 'report.pdf', title = 'Report', columns = null, meta = {}) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ size: 'LETTER', margin: 36, bufferPages: true });

  // Pipe first
  doc.pipe(res);

  // Header
  doc.fontSize(16).text(title);
  const parts = [];
  if (meta.generatedAt) parts.push(`Generated: ${meta.generatedAt}`);
  if (meta.start) parts.push(`Start: ${meta.start}`);
  if (meta.end) parts.push(`End: ${meta.end}`);
  if (meta.eventId) parts.push(`Event ID: ${meta.eventId}`);
  if (meta.userId) parts.push(`User ID: ${meta.userId}`);
  if (parts.length) {
    doc.moveDown(0.2);
    doc.fontSize(9).fillColor('#555').text(parts.join('   '));
    doc.fillColor('black');
  }
  doc.moveDown(0.5);

  // No data
  if (!rows || rows.length === 0) {
    doc.fontSize(12).text('No data.');
    doc.end();
    return;
  }

  // Columns
  const defaultKeys = Object.keys(rows[0]);
  const cols = (columns && columns.length ? columns.map(c => (typeof c === 'string' ? { key:c, label:c } : c))
                                          : defaultKeys.map(k => ({ key:k, label:k })));
  const totalWidth = 540;
  const equalWidth = Math.floor(totalWidth / cols.length);
  cols.forEach(c => { if (!c.width) c.width = equalWidth; if (!c.align) c.align = 'left'; });

  // Header row
  const left = 36, right = 576;
  const headerY = doc.y + 4;
  doc.rect(left, headerY, right - left, 20).fill('#f3f4f6').fillColor('black');
  doc.fontSize(10);
  let x = left;
  cols.forEach(c => {
    doc.text(c.label, x + 4, headerY + 5, { width: c.width - 8, align: c.align });
    x += c.width;
  });
  doc.moveTo(left, headerY + 20).lineTo(right, headerY + 20).stroke();
  doc.y = headerY + 24;

  const fmtDate = v => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0,10);
  };
  const dateKeys = new Set(['event_date','first_participation','last_participation','assigned_on']);

  // Rows + pagination + zebra
  let rowIndex = 0;
  for (const r of rows) {
    if (doc.y > 740) {
      doc.addPage();
      const headerY2 = 36 + 24;
      doc.rect(left, headerY2, right - left, 20).fill('#f3f4f6').fillColor('black');
      let x2 = left;
      cols.forEach(c => {
        doc.text(c.label, x2 + 4, headerY2 + 5, { width: c.width - 8, align: c.align });
        x2 += c.width;
      });
      doc.moveTo(left, headerY2 + 20).lineTo(right, headerY2 + 20).stroke();
      doc.y = headerY2 + 24;
    }
    if (rowIndex % 2 === 0) doc.rect(left, doc.y - 2, right - left, 18).fill('#fafafa').fillColor('black');

    let x3 = left;
    cols.forEach(c => {
      let val = r[c.key];
      if (dateKeys.has(c.key)) val = fmtDate(val);
      if (val === null || val === undefined) val = '';
      doc.text(String(val), x3 + 4, doc.y + 2, { width: c.width - 8, align: c.align });
      x3 += c.width;
    });
    doc.moveDown(1.1);
    rowIndex++;
  }

  // Footer
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const page = i + 1;
    doc.fontSize(8).fillColor('#666')
      .text(`${title} — Page ${page} of ${range.count}`, 36, 760, { width: 540, align: 'center' })
      .fillColor('black');
  }

  doc.end();
}

//  REPORT BUILDERS 

// Volunteer activities (ONE row per volunteer, only people with a name)
async function buildVolunteerActivities({ start, end, userId }) {
  const startDate = parseDateOrNull(start);
  const endDate = parseDateOrNull(end);

  const filters = [];
  const params = [];

  // Filter by event date range and optional user
  if (startDate) { params.push(startDate); filters.push(`ed.event_date >= $${params.length}`); }
  if (endDate)   { params.push(endDate);   filters.push(`ed.event_date <= $${params.length}`); }
  if (userId)    { params.push(userId);    filters.push(`uc.user_id = $${params.length}`); }

  // volunteers with a non-empty name
  const nameClause = `TRIM(up.full_name) <> ''`;
  const where = [nameClause].concat(filters).length
    ? `WHERE ${[nameClause].concat(filters).join(' AND ')}`
    : `WHERE ${nameClause}`;

  const rows = await queryRows(
    `SELECT
       uc.user_id                          AS volunteer_id,
       up.full_name                        AS name,
       uc.email,
       COUNT(DISTINCT ed.event_id)         AS total_events,
       MIN(ed.event_date)                  AS first_participation,
       MAX(ed.event_date)                  AS last_participation,
       COALESCE(
         json_agg(
           json_build_object(
             'event_id',   ed.event_id,
             'event_name', ed.event_name,
             'event_date', ed.event_date,
             'status',     vh.status,
             'rating',     vh.performance_rating
           )
           ORDER BY ed.event_date DESC
         ) FILTER (WHERE ed.event_id IS NOT NULL),
         '[]'
       ) AS participation
     FROM usercredentials uc
     JOIN userprofile           up ON up.user_id = uc.user_id
     LEFT JOIN volunteerhistory vh ON vh.user_id = uc.user_id
     LEFT JOIN eventdetails     ed ON ed.event_id = vh.event_id
     ${where}
     GROUP BY uc.user_id, up.full_name, uc.email
     ORDER BY up.full_name ASC`,
    params
  );

  const fmt = v => (v ? new Date(v).toISOString().slice(0,10) : '');
  const summarize = (arr) =>
    arr.map(e => {
      const parts = [];
      parts.push(`${fmt(e.event_date)} – ${e.event_name || ''}`.trim());
      const meta = [];
      if (e.status) meta.push(e.status);
      if (e.rating != null) meta.push(String(e.rating));
      if (meta.length) parts.push(`(${meta.join(', ')})`);
      return parts.join(' ');
    }).join(' | ');

  return rows.map(r => {
    const list = Array.isArray(r.participation) ? r.participation : [];
    return {
      volunteer_id: r.volunteer_id,
      name: r.name,
      email: r.email,
      total_events: Number(r.total_events || 0),
      first_participation: r.first_participation,
      last_participation:  r.last_participation,
      participation: list,                
      participation_summary: summarize(list) 
    };
  });
}

// Event management (events + volunteers assigned)
async function buildEventManagement({ start, end, eventId }) {
  const startDate = parseDateOrNull(start);
  const endDate = parseDateOrNull(end);
  const filters = [];
  const params = [];
  if (eventId)   { params.push(eventId);   filters.push(`ed.event_id = $${params.length}`); }
  if (startDate) { params.push(startDate); filters.push(`ed.event_date >= $${params.length}`); }
  if (endDate)   { params.push(endDate);   filters.push(`ed.event_date <= $${params.length}`); }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const rows = await queryRows(
    `SELECT 
       ed.event_id,
       ed.event_name,
       ed.event_date,
       ed.location,
       uc.user_id       AS volunteer_id,
       up.full_name     AS volunteer_name,
       uc.email,
       vh.status,
       vh.performance_rating,
       vh.feedback
     FROM eventdetails ed
     LEFT JOIN volunteerhistory vh ON vh.event_id = ed.event_id
     LEFT JOIN usercredentials  uc ON uc.user_id = vh.user_id
     LEFT JOIN userprofile      up ON up.user_id = uc.user_id
     ${where}
     ORDER BY ed.event_date DESC, ed.event_name ASC NULLS LAST, volunteer_name ASC NULLS LAST`,
    params
  );

  return rows.map(r => ({
    event_id: r.event_id,
    event_name: r.event_name,
    event_date: r.event_date,
    location: r.location,
    volunteer_id: r.volunteer_id,
    volunteer_name: r.volunteer_name,
    email: r.email,
    status: r.status,
    performance_rating: r.performance_rating,
    feedback: r.feedback,
  }));
}

//  ROUTES 
router.get('/volunteers', async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    const format = normalizeFormat(req.query.format);
    const data = await buildVolunteerActivities({ start, end, userId });

    if (format === 'csv') {
      const filename = ['volunteer_activities', start ? `from_${start}` : null, end ? `to_${end}` : null, userId ? `user_${userId}` : null]
        .filter(Boolean).join('_') || 'volunteer_activities';
      return sendCsv(res, data, `${filename}.csv`,
        [
          'volunteer_id',
          'name',
          'email',
          'total_events',
          'first_participation',
          'last_participation',
          'participation_summary'
        ]
      );
    }

    if (format === 'pdf') {
      const filename = ['volunteer_activities', start ? `from_${start}` : null, end ? `to_${end}` : null, userId ? `user_${userId}` : null]
        .filter(Boolean).join('_') || 'volunteer_activities';
      return sendPdf(res, data, `${filename}.pdf`, 'Volunteer Activities', [
        { key:'volunteer_id',        label:'Vol ID',     width:45,  align:'right' },
        { key:'name',                label:'Name',       width:120 },
        { key:'email',               label:'Email',      width:150 },
        { key:'total_events',        label:'# Events',   width:60,  align:'right' },
        { key:'first_participation', label:'First',      width:60 },
        { key:'last_participation',  label:'Last',       width:60 },
        { key:'participation_summary', label:'Participation (date – event [status, rating])', width:300 },
      ], { start, end, userId, generatedAt: new Date().toISOString().slice(0,16).replace('T',' ') });
    }

    return res.json({ data });
  } catch (err) {
    console.error('Volunteer activities error:', err);
    res.status(500).json({ error: 'Failed to generate volunteer activities report' });
  }
});

router.get('/events', async (req, res) => {
  try {
    const { start, end, eventId } = req.query;
    const format = normalizeFormat(req.query.format);
    const data = await buildEventManagement({ start, end, eventId });

    if (format === 'csv') {
      const filename = ['event_management', start ? `from_${start}` : null, end ? `to_${end}` : null, eventId ? `event_${eventId}` : null]
        .filter(Boolean).join('_') || 'event_management';
      return sendCsv(res, data, `${filename}.csv`,
        ['event_id','event_name','event_date','location','volunteer_id','volunteer_name','email','status','performance_rating','feedback']
      );
    }
    if (format === 'pdf') {
      const filename = ['event_management', start ? `from_${start}` : null, end ? `to_${end}` : null, eventId ? `event_${eventId}` : null]
        .filter(Boolean).join('_') || 'event_management';
      return sendPdf(res, data, `${filename}.pdf`, 'Event Management', [
        { key:'event_id',       label:'Event ID', width:60, align:'right' },
        { key:'event_name',     label:'Event',    width:170 },
        { key:'event_date',     label:'Date',     width:70 },
        { key:'location',       label:'Location', width:110 },
        { key:'volunteer_id',   label:'Vol ID',   width:50, align:'right' },
        { key:'volunteer_name', label:'Volunteer',width:130 },
        { key:'email',          label:'Email',    width:150 },
        { key:'status',         label:'Status',   width:60 },
        { key:'performance_rating', label:'Rating', width:50, align:'right' },
        { key:'feedback',       label:'Feedback', width:120 },
      ], { start, end, eventId, generatedAt: new Date().toISOString().slice(0,16).replace('T',' ') });
    }

    return res.json({ data });
  } catch (err) {
    console.error('Event management error:', err);
    res.status(500).json({ error: 'Failed to generate event management report' });
  }
});

module.exports = router;
