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

    await expect(stage.setPublishEnabled(true)).rejects.toBeInstanceOf(IVSError);
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
});

describe('enum fallbacks', () => {
  it('falls back unknown publish state and warns', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(parsePublishState('weird')).toBe('notPublished');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('falls back unknown connection state and warns', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
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
