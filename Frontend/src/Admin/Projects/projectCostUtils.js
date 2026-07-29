export function calculateProjectTotal({ baseAmount, extensionAmount, isExtended }) {
  const base = Number.parseFloat(baseAmount || 0);
  const extension = Number.parseFloat(extensionAmount || 0);
  if (!Number.isFinite(base) || !Number.isFinite(extension)) {
    return 0;
  }
  return isExtended ? base + extension : base;
}
