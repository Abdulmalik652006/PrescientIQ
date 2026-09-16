/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Validate email address
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Validate phone number (US format)
 */
export const isValidPhone = (phone) => {
  const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  return regex.test(phone)
}

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate password strength
 * Returns { valid: boolean, score: number, feedback: string }
 */
export const validatePassword = (password) => {
  let score = 0
  let feedback = []

  if (!password) {
    return { valid: false, score: 0, feedback: ['Password is required'] }
  }

  // Length check
  if (password.length < 8) {
    feedback.push('At least 8 characters')
  } else {
    score += 1
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one uppercase letter')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one lowercase letter')
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one number')
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one special character')
  }

  const valid = score >= 4
  const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score] || 'Very Weak'

  return {
    valid,
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ['Password is strong']
  }
}

/**
 * Validate a number range
 */
export const isInRange = (value, min, max) => {
  if (typeof value !== 'number') return false
  return value >= min && value <= max
}

/**
 * Validate a date is not in the past
 */
export const isFutureDate = (date) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  return d > new Date()
}

/**
 * Validate a date is not in the future
 */
export const isPastDate = (date) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  return d < new Date()
}

/**
 * Validate a string length
 */
export const isValidLength = (str, min, max) => {
  if (typeof str !== 'string') return false
  const length = str.length
  return length >= min && length <= max
}

/**
 * Validate a credit card number (basic)
 */
export const isValidCreditCard = (number) => {
  const regex = /^[0-9]{13,19}$/
  return regex.test(number.replace(/\s/g, ''))
}

/**
 * Validate a zip code (US)
 */
export const isValidZipCode = (zip) => {
  const regex = /^[0-9]{5}(-[0-9]{4})?$/
  return regex.test(zip)
}

/**
 * Validate a social security number (US)
 */
export const isValidSSN = (ssn) => {
  const regex = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/
  return regex.test(ssn)
}

/**
 * Validate a username (alphanumeric, underscores, dashes, 3-20 chars)
 */
export const isValidUsername = (username) => {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/
  return regex.test(username)
}

/**
 * Validate a domain name
 */
export const isValidDomain = (domain) => {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  return regex.test(domain)
}

/**
 * Create a validator object for form validation
 */
export const createValidator = (rules) => {
  return (values) => {
    const errors = {}
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = values[field]
      
      fieldRules.forEach(rule => {
        const error = rule(value)
        if (error) {
          errors[field] = error
        }
      })
    })
    
    return errors
  }
}

/**
 * Common validation rules
 */
export const validators = {
  required: (message = 'This field is required') => (value) => {
    if (isEmpty(value)) return message
    return null
  },
  
  email: (message = 'Invalid email address') => (value) => {
    if (!isEmpty(value) && !isValidEmail(value)) return message
    return null
  },
  
  phone: (message = 'Invalid phone number') => (value) => {
    if (!isEmpty(value) && !isValidPhone(value)) return message
    return null
  },
  
  url: (message = 'Invalid URL') => (value) => {
    if (!isEmpty(value) && !isValidUrl(value)) return message
    return null
  },
  
  minLength: (min, message) => (value) => {
    if (typeof value === 'string' && value.length < min) {
      return message || `Must be at least ${min} characters`
    }
    return null
  },
  
  maxLength: (max, message) => (value) => {
    if (typeof value === 'string' && value.length > max) {
      return message || `Must be at most ${max} characters`
    }
    return null
  },
  
  min: (min, message) => (value) => {
    if (typeof value === 'number' && value < min) {
      return message || `Must be at least ${min}`
    }
    return null
  },
  
  max: (max, message) => (value) => {
    if (typeof value === 'number' && value > max) {
      return message || `Must be at most ${max}`
    }
    return null
  },
  
  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!isEmpty(value) && !regex.test(value)) return message
    return null
  }
}