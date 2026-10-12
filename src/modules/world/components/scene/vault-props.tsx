'use client';

import { VAULT_PROPS } from '../../config/props';
import KitModel from './kit-model';

// Only mounted once the vault is requested, so its kit loads lazily.
const VaultProps = () => (
  <>
    {VAULT_PROPS.map((placement, index) => (
      <KitModel key={index} kit="vault" placement={placement} />
    ))}
  </>
);

export default VaultProps;
