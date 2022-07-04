export const CaveatTypes = Object.freeze({
  restrictReturnedAccounts: 'restrictReturnedAccounts',
});

export const RestrictedMethods = Object.freeze({
  eth_accounts: 'eth_accounts',
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  snap_confirm: 'snap_confirm',
  snap_notify: 'snap_notify',
  snap_manageState: 'snap_manageState',
  'snap_getBip44Entropy_*': 'snap_getBip44Entropy_*',
  'wallet_snap_*': 'wallet_snap_*',
  ///: END:ONLY_INCLUDE_IN
});

// Methods / permissions in external packages that we are temporarily excluding.
export const ExcludedSnapPermissions: any = new Set([]);
///: END:ONLY_INCLUDE_IN