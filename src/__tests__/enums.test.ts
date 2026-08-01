import {
  parseActiveAudioOutput,
  parseAudioOutput,
  parseCameraPosition,
  parseConnectionState,
  parseDevicePosition,
  parseDeviceType,
  parseMediaType,
  parsePermissionStatus,
  parsePublishState,
  parseSubscribeState,
  parseSubscribeType,
} from '../core/enums';

let warn: jest.SpyInstance;

beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('enum parsers: known values pass through without warning', () => {
  it('parseConnectionState', () => {
    expect(parseConnectionState('disconnected')).toBe('disconnected');
    expect(parseConnectionState('connecting')).toBe('connecting');
    expect(parseConnectionState('connected')).toBe('connected');
    expect(warn).not.toHaveBeenCalled();
  });

  it('parsePublishState (camelCase)', () => {
    expect(parsePublishState('notPublished')).toBe('notPublished');
    expect(parsePublishState('attemptingPublish')).toBe('attemptingPublish');
    expect(parsePublishState('published')).toBe('published');
    expect(warn).not.toHaveBeenCalled();
  });

  it('parseSubscribeState (camelCase)', () => {
    expect(parseSubscribeState('notSubscribed')).toBe('notSubscribed');
    expect(parseSubscribeState('attemptingSubscribe')).toBe(
      'attemptingSubscribe'
    );
    expect(parseSubscribeState('subscribed')).toBe('subscribed');
    expect(warn).not.toHaveBeenCalled();
  });

  it('parseMediaType / parseDeviceType / parseDevicePosition', () => {
    expect(parseMediaType('audio')).toBe('audio');
    expect(parseMediaType('video')).toBe('video');
    expect(parseDeviceType('camera')).toBe('camera');
    expect(parseDeviceType('microphone')).toBe('microphone');
    expect(parseDevicePosition('front')).toBe('front');
    expect(parseDevicePosition('bluetooth')).toBe('bluetooth');
    expect(warn).not.toHaveBeenCalled();
  });

  it('parseCameraPosition / parsePermissionStatus / parseSubscribeType', () => {
    expect(parseCameraPosition('back')).toBe('back');
    expect(parsePermissionStatus('restricted')).toBe('restricted');
    expect(parseSubscribeType('audio-only')).toBe('audio-only');
    expect(warn).not.toHaveBeenCalled();
  });

  it('parseAudioOutput / parseActiveAudioOutput', () => {
    expect(parseAudioOutput('auto')).toBe('auto');
    expect(parseAudioOutput('wired')).toBe('wired');
    expect(parseActiveAudioOutput('earpiece')).toBe('earpiece');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('enum parsers: snake_case migration tolerance (no warning)', () => {
  it('parsePublishState accepts old POC snake_case', () => {
    expect(parsePublishState('not_published')).toBe('notPublished');
    expect(parsePublishState('attempting_publish')).toBe('attemptingPublish');
    expect(warn).not.toHaveBeenCalled();
  });

  it('parseSubscribeState accepts old POC snake_case', () => {
    expect(parseSubscribeState('not_subscribed')).toBe('notSubscribed');
    expect(parseSubscribeState('attempting_subscribe')).toBe(
      'attemptingSubscribe'
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('enum parsers: unknown values fall back and warn once each', () => {
  const cases: Array<[string, (v: string) => string, string]> = [
    ['connectionState', parseConnectionState, 'disconnected'],
    ['publishState', parsePublishState, 'notPublished'],
    ['subscribeState', parseSubscribeState, 'notSubscribed'],
    ['mediaType', parseMediaType, 'video'],
    ['deviceType', parseDeviceType, 'unknown'],
    ['devicePosition', parseDevicePosition, 'unknown'],
    ['cameraPosition', parseCameraPosition, 'front'],
    ['permissionStatus', parsePermissionStatus, 'undetermined'],
    ['subscribeType', parseSubscribeType, 'none'],
    ['audioOutput', parseAudioOutput, 'auto'],
    ['activeOutput', parseActiveAudioOutput, 'speaker'],
  ];

  it.each(cases)('%s falls back with a warning', (field, parse, fallback) => {
    expect(parse('__bogus__')).toBe(fallback);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain(field);
    expect(warn.mock.calls[0]![0]).toContain('__bogus__');
  });
});
