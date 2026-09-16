/**
 * Format a number with commas
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null || isNaN(num)) return '—'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format a percentage
 */
export const formatPercentage = (num, decimals = 1) => {
  if (num === undefined || num === null || isNaN(num)) return '—'
  return `${Number(num).toFixed(decimals)}%`
}

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date
 */
export const formatDate = (date, format = 'MMM dd, yyyy') => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  const options = {
    'MMM dd, yyyy': { month: 'short', day: '2-digit', year: 'numeric' },
    'MM/dd/yyyy': { month: '2-digit', day: '2-digit', year: 'numeric' },
    'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'full': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }
  
  return new Intl.DateTimeFormat('en-US', options[format] || options['MMM dd, yyyy']).format(d)
}

/**
 * Format time
 */
export const formatTime = (date, format = 'short') => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  const options = {
    'short': { hour: '2-digit', minute: '2-digit' },
    'long': { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  }
  
  return new Intl.DateTimeFormat('en-US', options[format] || options['short']).format(d)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

/**
 * Abbreviate a number (e.g., 1.2K, 3.4M)
 */
export const abbreviateNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '—'
  
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  
  return num.toString()
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Title case a string
 */
export const titleCase = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Slugify a string
 */
export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a random ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Parse JSON safely
 */
export const safeJSONParse = (str, fallback = null) => {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}