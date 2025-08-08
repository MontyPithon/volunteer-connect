import React, { useState, useMemo } from 'react';
import { fetchReport, downloadReport } from '../services/reports';

const TYPES = [
  { value: 'volunteers', label: 'Volunteer activities' },
  { value: 'events', label: 'Event management' },
];


export default function ReportsPage() {
  const [type, setType] = useState('volunteers');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [eventId, setEventId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const showEventId = type !== 'volunteers'; // events & assignments can filter by eventId

  async function handlePreview(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const data = await fetchReport(type, { start, end, eventId: showEventId ? eventId : undefined });
      setRows(data);
    } catch (error) {
      setErr(error?.response?.data?.error || 'Failed to load report preview');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(format) {
    setErr('');
    try {
      await downloadReport(type, { start, end, eventId: showEventId ? eventId : undefined, format });
    } catch (error) {
      setErr(error?.response?.data?.error || `Failed to download ${format.toUpperCase()}`);
    }
  }

  // Build table columns from the previewed data
  const columns = useMemo(() => {
    if (!rows?.length) return [];
    const keys = Object.keys(rows[0]);
    return keys;
  }, [rows]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reporting</h1>

      <form onSubmit={handlePreview} className="bg-white rounded-2xl shadow p-4 mb-6 grid gap-4 md:grid-cols-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Report Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="border rounded-lg p-2">
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Start Date (optional)</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border rounded-lg p-2" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">End Date (optional)</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border rounded-lg p-2" />
        </div>

        {showEventId && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Event ID (optional)</label>
            <input type="number" value={eventId} onChange={e => setEventId(e.target.value)} className="border rounded-lg p-2" />
          </div>
        )}

        <div className="md:col-span-4 flex items-center gap-3">
          <button type="submit" disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Loading…' : 'Preview'}
          </button>

          <button type="button" onClick={() => handleDownload('csv')}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900">
            Download CSV
          </button>

          <button type="button" onClick={() => handleDownload('pdf')}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900">
            Download PDF
          </button>

          {err && <span className="text-red-600 ml-2">{err}</span>}
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Preview</h2>
        {rows?.length === 0 ? (
          <div className="text-gray-500">No data. Click <b>Preview</b> to fetch.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {columns.map(c => (
                    <th key={c} className="text-left border-b p-2 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="odd:bg-gray-50">
                    {columns.map(c => (
                      <td key={c} className="p-2 align-top">
                        {r[c] === null || r[c] === undefined ? '' : String(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
