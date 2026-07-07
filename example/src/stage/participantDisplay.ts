import type { StageParticipant } from 'amazon-ivs-react-native-sdk';

/** A short, readable display label for a participant. */
export function displayName(p: StageParticipant): string {
  return p.userId || p.attributes.username || p.participantId;
}

/** Up-to-two-letter initials for the placeholder avatar. */
export function initials(p: StageParticipant): string {
  const source = p.userId || p.attributes.username || p.participantId;
  const parts = source
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters =
    parts.length >= 2 ? parts[0]![0]! + parts[1]![0]! : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Whether we should render live video for a participant: they're publishing an
 * unmuted video stream. Includes the local participant — their tile shows a
 * self-view of the camera we publish.
 */
export function showsVideo(p: StageParticipant): boolean {
  return p.hasVideo && !p.videoMuted;
}
