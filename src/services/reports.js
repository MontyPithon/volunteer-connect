// src/services/reports.js
import axios from 'axios';

const BASE = 'http://localhost:5000/api/reports';

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.trim() !== '') q.append(k, v);
  });
  return q.toString();
}

// Preview (JSON)
export async function fetchReport(type, { start, end, eventId } = {}) {
  const qs = buildQuery({ start, end, eventId });
  const url = `${BASE}/${type}${qs ? `?${qs}` : ''}`;
  const { data } = await axios.get(url);
  // backend returns { data: [...] }
  return data?.data ?? [];
}

// Download CSV or PDF
export async function downloadReport(type, { start, end, eventId, format }) {
  const qs = buildQuery({ start, end, eventId, format });
  const url = `${BASE}/${type}${qs ? `?${qs}` : ''}`;

  const resp = await axios.get(url, { responseType: 'blob' });
  // Derive a filename from Content-Disposition or fallback
  const header = resp.headers['content-disposition'] || '';
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(header);
  const filename = match ? match[1].replaceAll('"', '') : `${type}.${format}`;

  const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
