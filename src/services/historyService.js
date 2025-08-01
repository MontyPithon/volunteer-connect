export async function fetchHistory(volunteerId) {
  const res = await fetch(`/api/history/${volunteerId}`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}
