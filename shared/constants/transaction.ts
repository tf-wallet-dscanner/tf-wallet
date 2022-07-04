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

/**
 * In EIP-2718 typed transaction envelopes were specified, with the very first
 * typed envelope being 'legacy' and describing the shape of the base
 * transaction params that were hitherto the only transaction type sent on
 * Ethereum.
 *
 * @typedef {Object} TransactionEnvelopeTypes
 * @property {'0x0'} LEGACY - A legacy transaction, the very first type.
 * @property {'0x1'} ACCESS_LIST - EIP-2930 defined the access list transaction
 *  type that allowed for specifying the state that a transaction would act
 *  upon in advance and theoretically save on gas fees.
 * @property {'0x2'} FEE_MARKET - The type introduced comes from EIP-1559,
 *  Fee Market describes the addition of a baseFee to blocks that will be
 *  burned instead of distributed to miners. Transactions of this type have
 *  both a maxFeePerGas (maximum total amount in gwei per gas to spend on the
 *  transaction) which is inclusive of the maxPriorityFeePerGas (maximum amount
 *  of gwei per gas from the transaction fee to distribute to miner).
 */

/**
 * @type {TransactionEnvelopeTypes}
 */
 export const TRANSACTION_ENVELOPE_TYPES = {
  LEGACY: '0x0',
  ACCESS_LIST: '0x1',
  FEE_MARKET: '0x2',
};