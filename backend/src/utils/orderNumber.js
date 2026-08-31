// Human-friendly order number, e.g. GM-20260831-4F82
export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `GM-${date}-${rand}`;
}
