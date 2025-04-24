/**
 * Application-wide constants
 */

// Credit costs for AI features
exports.CREDIT_COSTS = {
  COMPETENCY_ANALYSIS: 5,
  CAREER_EXPLORER: 3,
  RESUME_OPTIMIZER: 4,
  SKILL_ASSESSMENT: 2,
};

// Status constants
exports.APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
};

// Pagination defaults
exports.PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

// User roles
exports.USER_ROLES = {
  ADMIN: 'admin',
  CONSULTANT: 'consultant',
  BENEFICIARY: 'beneficiary',
};

// Document types
exports.DOCUMENT_TYPES = {
  CV: 'cv',
  COVER_LETTER: 'cover_letter',
  DIPLOMA: 'diploma',
  CERTIFICATION: 'certification',
  OTHER: 'other',
};
