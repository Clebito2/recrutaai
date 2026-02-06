/**
 * Date utilities for São Paulo timezone (America/Sao_Paulo, UTC-3)
 */

/**
 * Format a date to São Paulo timezone
 * @param {Date|Timestamp} date - Date object or Firestore Timestamp
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDateSP(date, options = {}) {
    // Convert Firestore Timestamp to Date if needed
    const dateObj = date?.toDate ? date.toDate() : date;

    if (!dateObj || !(dateObj instanceof Date)) {
        return '—';
    }

    const defaultOptions = {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    };

    return dateObj.toLocaleDateString('pt-BR', defaultOptions);
}

/**
 * Format a date with time to São Paulo timezone
 * @param {Date|Timestamp} date - Date object or Firestore Timestamp
 * @returns {string} Formatted date and time string
 */
export function formatDateTimeSP(date) {
    const dateObj = date?.toDate ? date.toDate() : date;

    if (!dateObj || !(dateObj instanceof Date)) {
        return '—';
    }

    return dateObj.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get current date in São Paulo timezone
 * @returns {Date} Current date
 */
export function nowSP() {
    return new Date();
}

/**
 * Format relative time (e.g., "2 dias atrás", "Hoje")
 * @param {Date|Timestamp} date - Date object or Firestore Timestamp
 * @returns {string} Relative time string
 */
export function formatRelativeTimeSP(date) {
    const dateObj = date?.toDate ? date.toDate() : date;

    if (!dateObj || !(dateObj instanceof Date)) {
        return '—';
    }

    const now = new Date();
    const diff = now - dateObj;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;

    return formatDateSP(dateObj);
}
