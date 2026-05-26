const DEFAULT_API_URL = 'https://applestoremvp-moatazmohamedcr852-png9450-k23af9ba.leapcell.de';

export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
