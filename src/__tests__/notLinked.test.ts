/**
 * Behavior when the native TurboModule is not linked: constructing an
 * IVSStage must never throw (providers construct during render); every
 * native-backed call rejects with `not-linked`.
 */
jest.mock('../spec/NativeAmazonIvsRealTime', () => ({
  __esModule: true,
  default: null,
}));

import { IVSStage, getSdkVersion, getCameraPermission } from '../core/IVSStage';

describe('unlinked native module', () => {
  afterEach(() => {
    IVSStage._resetActiveStageForTests();
  });

  it('IVSStage constructor never throws', () => {
    expect(() => new IVSStage()).not.toThrow();
  });

  it('on() works without native and returns an unsubscribe function', () => {
    const stage = new IVSStage();
    const unsubscribe = stage.on('connectionStateChanged', () => undefined);
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
    stage.dispose();
  });

  it('join rejects with not-linked', async () => {
    const stage = new IVSStage();
    await expect(stage.join('token')).rejects.toMatchObject({
      code: 'not-linked',
    });
    stage.dispose();
  });

  it('leave and readState reject with not-linked', async () => {
    const stage = new IVSStage();
    await expect(stage.leave()).rejects.toMatchObject({ code: 'not-linked' });
    await expect(stage.readState()).rejects.toMatchObject({
      code: 'not-linked',
    });
    stage.dispose();
  });

  it('module-level helpers reject with not-linked', async () => {
    await expect(getSdkVersion()).rejects.toMatchObject({
      code: 'not-linked',
    });
    await expect(getCameraPermission()).rejects.toMatchObject({
      code: 'not-linked',
    });
  });

  it('dispose is safe without native subscriptions', () => {
    const stage = new IVSStage();
    expect(() => stage.dispose()).not.toThrow();
    expect(() => stage.dispose()).not.toThrow();
  });
});
