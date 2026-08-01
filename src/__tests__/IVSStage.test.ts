jest.mock('../spec/NativeAmazonIvsRealTime', () => {
  const { createMockNative } = require('./mockNative');
  const mock = createMockNative();
  // Stash on global for assertions
  (global as any).__ivsMock = mock;
  return { __esModule: true, default: mock.module };
});

import { IVSStage } from '../core/IVSStage';
import { IVSError } from '../core/IVSError';
import { parsePublishState, parseConnectionState } from '../core/enums';
import type { MockNative } from './mockNative';

function mockNative(): MockNative {
  return (global as any).__ivsMock as MockNative;
}

describe('IVSStage', () => {
  beforeEach(() => {
    IVSStage._resetActiveStageForTests();
    jest.clearAllMocks();
    const mock = mockNative();
    mock.state.connectionState = 'disconnected';
    mock.state.publishEnabled = false;
    mock.state.publishState = 'notPublished';
    mock.state.audioOutput = 'auto';
    mock.state.participants = [];
  });

  afterEach(() => {
    IVSStage._resetActiveStageForTests();
  });

  it('transitions join → connected → leave', async () => {
    const stage = new IVSStage();
    const states: string[] = [];
    stage.on('connectionStateChanged', (e) => states.push(e.state));

    await stage.join('token-a');
    expect(mockNative().module.joinStage).toHaveBeenCalledWith('token-a', {
      publish: false,
    });
    expect(states).toEqual(['connecting', 'connected']);

    await stage.leave();
    expect(mockNative().module.leaveStage).toHaveBeenCalled();
    expect(states).toContain('disconnected');
    stage.dispose();
  });

  it('does not throw when constructing a second instance while one is live', () => {
    const a = new IVSStage();
    expect(() => new IVSStage()).not.toThrow();
    a.dispose();
  });

  it('rejects join with stage-in-use while incumbent stays joined', async () => {
    const a = new IVSStage();
    const b = new IVSStage();
    await a.join('token-a');

    await expect(b.join('token-b')).rejects.toMatchObject({
      code: 'stage-in-use',
    });
    expect(IVSStage._getActiveStageForTests()).toBe(a);

    a.dispose();
    b.dispose();
  });

  it('dispose removes subscriptions and later calls reject with disposed', async () => {
    const stage = new IVSStage();
    stage.dispose();
    await expect(stage.join('t')).rejects.toMatchObject({ code: 'disposed' });
    await expect(stage.leave()).rejects.toMatchObject({ code: 'disposed' });
  });

  it('renewToken changes local participantId and preserves userId/attributes', async () => {
    const stage = new IVSStage();
    const left: string[] = [];
    const joined: string[] = [];
    stage.on('participantLeft', (e) => left.push(e.participantId));
    stage.on('participantJoined', (e) => joined.push(e.participantId));

    await stage.join('token-a');
    await stage.renewToken('token-b');

    expect(left).toEqual(['local-1']);
    expect(joined).toEqual(['local-1', 'local-2']);
    const participants = await stage.listParticipants();
    const local = participants.find((p) => p.isLocal)!;
    expect(local.participantId).toBe('local-2');
    expect(local.userId).toBe('user-1');
    expect(local.attributes).toEqual({ username: 'Alice' });
    stage.dispose();
  });

  it('rolls back optimistic setPublishEnabled on rejection', async () => {
    const stage = new IVSStage();
    await stage.join('token-a');
    (mockNative().module.setPublishEnabled as jest.Mock).mockRejectedValueOnce({
      code: 'device-unavailable',
      message: 'no camera',
    });

    await expect(stage.setPublishEnabled(true)).rejects.toBeInstanceOf(
      IVSError
    );
    const state = await stage.readState();
    expect(state.publishEnabled).toBe(false);
    stage.dispose();
  });

  it('rolls back optimistic setMicrophoneEnabled on rejection', async () => {
    const stage = new IVSStage();
    (
      mockNative().module.setMicrophoneEnabled as jest.Mock
    ).mockRejectedValueOnce({
      message: 'fail',
    });
    await expect(stage.setMicrophoneEnabled(false)).rejects.toBeInstanceOf(
      IVSError
    );
    stage.dispose();
  });

  it('rolls back optimistic setCameraEnabled on rejection', async () => {
    const stage = new IVSStage();
    (mockNative().module.setCameraEnabled as jest.Mock).mockRejectedValueOnce({
      message: 'fail',
    });
    await expect(stage.setCameraEnabled(false)).rejects.toBeInstanceOf(
      IVSError
    );
    stage.dispose();
  });

  it('join with publish:true is the only combined path', async () => {
    const stage = new IVSStage();
    await stage.join('token-a', { publish: true });
    expect(mockNative().module.joinStage).toHaveBeenCalledWith('token-a', {
      publish: true,
    });
    stage.dispose();
  });

  it('prepareDevices defaults to camera and microphone', async () => {
    const stage = new IVSStage();
    await stage.prepareDevices();
    expect(mockNative().module.prepareDevices).toHaveBeenCalledWith({
      camera: true,
      microphone: true,
    });
    await stage.prepareDevices({ camera: false });
    expect(mockNative().module.prepareDevices).toHaveBeenLastCalledWith({
      camera: false,
      microphone: true,
    });
    stage.dispose();
  });

  it('setSubscribeType and setAudioOutput pass through', async () => {
    const stage = new IVSStage();
    await stage.setSubscribeType('remote-1', 'audio-only');
    expect(mockNative().module.setSubscribeType).toHaveBeenCalledWith(
      'remote-1',
      'audio-only'
    );
    await stage.setAudioOutput('speaker');
    expect(mockNative().module.setAudioOutput).toHaveBeenCalledWith('speaker');
    const route = await stage.getAudioRoute();
    expect(route.output).toBe('speaker');
    expect(route.activeOutput).toBe('speaker');
    stage.dispose();
  });

  it('readState maps and refreshes cached local intent', async () => {
    const stage = new IVSStage();
    await stage.join('token-a', { publish: true });
    const state = await stage.readState();
    expect(state).toMatchObject({
      connectionState: 'connected',
      publishEnabled: true,
      publishState: 'published',
      cameraPosition: 'front',
      audioOutput: 'auto',
    });
    stage.dispose();
  });
});

describe('deprecated aliases delegate to the new API', () => {
  beforeEach(() => {
    IVSStage._resetActiveStageForTests();
    jest.clearAllMocks();
  });

  afterEach(() => {
    IVSStage._resetActiveStageForTests();
  });

  it('setPublishing calls setPublishEnabled', async () => {
    const stage = new IVSStage();
    await stage.setPublishing(true);
    expect(mockNative().module.setPublishEnabled).toHaveBeenCalledWith(true);
    stage.dispose();
  });

  it('setMicrophoneMuted inverts into setMicrophoneEnabled', async () => {
    const stage = new IVSStage();
    await stage.setMicrophoneMuted(true);
    expect(mockNative().module.setMicrophoneEnabled).toHaveBeenCalledWith(
      false
    );
    await stage.setMicrophoneMuted(false);
    expect(mockNative().module.setMicrophoneEnabled).toHaveBeenLastCalledWith(
      true
    );
    stage.dispose();
  });

  it('switchCamera without args flips, with position sets', async () => {
    const stage = new IVSStage();
    await stage.switchCamera();
    expect(mockNative().module.flipCamera).toHaveBeenCalled();
    await stage.switchCamera('back');
    expect(mockNative().module.setCameraPosition).toHaveBeenCalledWith('back');
    stage.dispose();
  });
});

describe('module-level helpers', () => {
  it('getSdkVersion and getCapabilities pass through', async () => {
    const { getSdkVersion, getCapabilities } = require('../core/IVSStage');
    await expect(getSdkVersion()).resolves.toBe('1.43.0');
    await expect(getCapabilities()).resolves.toMatchObject({
      audioRouting: true,
      screenShare: false,
    });
  });

  it('permission requests parse the native status', async () => {
    const {
      requestCameraPermission,
      getMicrophonePermission,
    } = require('../core/IVSStage');
    await expect(requestCameraPermission()).resolves.toBe('granted');
    await expect(getMicrophonePermission()).resolves.toBe('undetermined');
  });

  it('enumerateDevices maps type and position through parsers', async () => {
    const { enumerateDevices } = require('../core/IVSStage');
    (mockNative().module.enumerateDevices as jest.Mock).mockResolvedValueOnce([
      {
        deviceId: 'cam-1',
        urn: 'urn:cam-1',
        friendlyName: 'Front Camera',
        type: 'camera',
        position: 'front',
        isDefault: true,
      },
    ]);
    const devices = await enumerateDevices();
    expect(devices).toEqual([
      {
        deviceId: 'cam-1',
        urn: 'urn:cam-1',
        friendlyName: 'Front Camera',
        type: 'camera',
        position: 'front',
        isDefault: true,
      },
    ]);
  });
});

describe('enum fallbacks', () => {
  it('falls back unknown publish state and warns', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    expect(parsePublishState('weird')).toBe('notPublished');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('falls back unknown connection state and warns', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    expect(parseConnectionState('weird')).toBe('disconnected');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('IVSError.fromUnknown', () => {
  it('maps known codes', () => {
    const err = IVSError.fromUnknown({
      code: 'token-expired',
      message: 'expired',
    });
    expect(err.code).toBe('token-expired');
    expect(err.message).toBe('expired');
  });

  it('uses not-linked for missing native module path', () => {
    const err = new IVSError(
      'not-linked',
      "'amazon-ivs-react-native-sdk' native module is not linked. Rebuild the app after installing the package."
    );
    expect(err.code).toBe('not-linked');
    expect(err.message).toMatch(/rebuild/i);
  });
});
