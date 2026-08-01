import type {
  AudioOutput,
  CameraPosition,
  DevicePosition,
  DeviceType,
  MediaType,
  ParticipantPublishState,
  ParticipantSubscribeState,
  PermissionStatus,
  StageConnectionState,
  SubscribeType,
} from './types';

function warnUnknown(field: string, value: string): void {
  // eslint-disable-next-line no-console
  console.warn(
    `[amazon-ivs-react-native-sdk] Unknown ${field} value from native: ${JSON.stringify(value)}`
  );
}

export function parseConnectionState(value: string): StageConnectionState {
  switch (value) {
    case 'disconnected':
    case 'connecting':
    case 'connected':
      return value;
    default:
      warnUnknown('connectionState', value);
      return 'disconnected';
  }
}

export function parsePublishState(value: string): ParticipantPublishState {
  switch (value) {
    case 'notPublished':
    case 'attemptingPublish':
    case 'published':
      return value;
    // Tolerate snake_case from older native POCs during migration.
    case 'not_published':
      return 'notPublished';
    case 'attempting_publish':
      return 'attemptingPublish';
    default:
      warnUnknown('publishState', value);
      return 'notPublished';
  }
}

export function parseSubscribeState(value: string): ParticipantSubscribeState {
  switch (value) {
    case 'notSubscribed':
    case 'attemptingSubscribe':
    case 'subscribed':
      return value;
    case 'not_subscribed':
      return 'notSubscribed';
    case 'attempting_subscribe':
      return 'attemptingSubscribe';
    default:
      warnUnknown('subscribeState', value);
      return 'notSubscribed';
  }
}

export function parseMediaType(value: string): MediaType {
  switch (value) {
    case 'audio':
    case 'video':
      return value;
    default:
      warnUnknown('mediaType', value);
      return 'video';
  }
}

export function parseDeviceType(value: string): DeviceType {
  switch (value) {
    case 'camera':
    case 'microphone':
    case 'userImage':
    case 'userAudio':
    case 'unknown':
      return value;
    default:
      warnUnknown('deviceType', value);
      return 'unknown';
  }
}

export function parseDevicePosition(value: string): DevicePosition {
  switch (value) {
    case 'front':
    case 'back':
    case 'usb':
    case 'bluetooth':
    case 'aux':
    case 'unknown':
      return value;
    default:
      warnUnknown('devicePosition', value);
      return 'unknown';
  }
}

export function parseCameraPosition(value: string): CameraPosition {
  switch (value) {
    case 'front':
    case 'back':
      return value;
    default:
      warnUnknown('cameraPosition', value);
      return 'front';
  }
}

export function parsePermissionStatus(value: string): PermissionStatus {
  switch (value) {
    case 'granted':
    case 'denied':
    case 'restricted':
    case 'undetermined':
      return value;
    default:
      warnUnknown('permissionStatus', value);
      return 'undetermined';
  }
}

export function parseSubscribeType(value: string): SubscribeType {
  switch (value) {
    case 'none':
    case 'audio-only':
    case 'audio-video':
      return value;
    default:
      warnUnknown('subscribeType', value);
      return 'none';
  }
}

export function parseAudioOutput(value: string): AudioOutput {
  switch (value) {
    case 'auto':
    case 'speaker':
    case 'earpiece':
    case 'bluetooth':
    case 'wired':
      return value;
    default:
      warnUnknown('audioOutput', value);
      return 'auto';
  }
}

export function parseActiveAudioOutput(
  value: string
): Exclude<AudioOutput, 'auto'> {
  switch (value) {
    case 'speaker':
    case 'earpiece':
    case 'bluetooth':
    case 'wired':
      return value;
    default:
      warnUnknown('activeOutput', value);
      return 'speaker';
  }
}
