
export const MAX_CHARACTER = 120;

export const DESCRIPTION_MAX_LENGTH = 1000;

export const MAX_EMAIL_LOCAL_PART = 64;

export const MAX_PHONE_NUMBER_DIGIT = 15;

export const WORKSPACE_KEY_LENGTH = 63;

export const MAX_AGE_LIMIT = 100;

export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 120,
};

export const IMAGE_UPLOAD_ACCEPTED = '.png,.jpeg,.jpg';

export const CV_UPLOAD_ACCEPTED = '.pdf';

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const EMAIL_LOCAL_PART_REGEX = /^(([\w]+(\.[\w]+)*)|(".+"))$/;

export const EMAIL_DOMAIN_REGEX = /^@\w+([.-]?\w+)*(\.\w{2,})+$/;

export const RFC_EMAIL_REGEX = /^\w+([.-]\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/g;

export const SLACK_VALIDATION_REGEX = /^[^`!@#$%^&*~\\+=|><?:“]*$/g;

export const BACKLOG_VALIDATION_REGEX = /^[a-z0-9][a-z0-9.-]+[a-z0-9]$/g;

export const CURRENT_WORKING_TIME = '3000-01-01T00:00:00.000Z';

export const DAY_OF_MONTH_PICKER = 15;
