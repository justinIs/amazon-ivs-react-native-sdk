import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * TurboModule spec for device-level IVS APIs that don't require a view.
 *
 * Codegen constraint: spec method return/param types must be codegen-friendly
 * (Object arrays, not custom interfaces). `enumerateDevices` therefore returns
 * `Object[]`; the ergonomic `DeviceInfo[]` shape is applied in `index.tsx`.
 */
export interface Spec extends TurboModule {
  /** Version string of the underlying native IVS broadcast SDK. */
  getSdkVersion(): Promise<string>;
  /** Enumerate local cameras and microphones. Resolves to `DeviceInfo`-shaped objects. */
  enumerateDevices(): Promise<Object[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('IvsRealtime');
