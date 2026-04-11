const MAX_DAYS_LEFT = 30;
const MIN_DAYS_LEFT = 1;

export function getDisplayDaysLeft(dateFound: string): number {
  const found = new Date(dateFound);
  const now = new Date();

  if (Number.isNaN(found.getTime())) {
    return MAX_DAYS_LEFT;
  }

  const diffMs = now.getTime() - found.getTime();
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const rawDaysLeft = MAX_DAYS_LEFT - daysPassed;

  return Math.min(MAX_DAYS_LEFT, Math.max(MIN_DAYS_LEFT, rawDaysLeft));
}

