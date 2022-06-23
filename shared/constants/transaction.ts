/**
 * This type will work anywhere you expect a string that can be one of the
 * above transaction statuses.
 *
 * @typedef {TransactionStatuses[keyof TransactionStatuses]} TransactionStatusString
 */

/**
 * @type {TransactionStatuses}
 */
export const TRANSACTION_STATUSES = {
  UNAPPROVED: 'unapproved',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SIGNED: 'signed',
  SUBMITTED: 'submitted',
  FAILED: 'failed',
  DROPPED: 'dropped',
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
};
