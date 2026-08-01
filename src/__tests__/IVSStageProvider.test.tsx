jest.mock('../spec/NativeAmazonIvsRealTime', () => {
  const { createMockNative } = require('./mockNative');
  const mock = createMockNative();
  (global as any).__ivsMock = mock;
  return { __esModule: true, default: mock.module };
});

import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { IVSStage } from '../core/IVSStage';
import { IVSStageProvider } from '../react/IVSStageProvider';
import {
  useParticipants,
  useParticipantStreams,
  useStage,
} from '../react/hooks';
import type { MockNative } from './mockNative';

function mockNative(): MockNative {
  return (global as any).__ivsMock as MockNative;
}

function Probe({ onParticipants }: { onParticipants: (p: unknown) => void }) {
  const participants = useParticipants();
  onParticipants(participants);
  return null;
}

function StreamsProbe({
  id,
  onStreams,
}: {
  id: string;
  onStreams: (s: unknown) => void;
}) {
  onStreams(useParticipantStreams(id));
  return null;
}

describe('IVSStageProvider reconcile', () => {
  beforeEach(() => {
    IVSStage._resetActiveStageForTests();
    jest.clearAllMocks();
    const mock = mockNative();
    mock.state.connectionState = 'disconnected';
    mock.state.participants = [];
  });

  afterEach(() => {
    IVSStage._resetActiveStageForTests();
  });

  it('does not lose events arriving before listParticipants snapshot', async () => {
    let resolveList: (v: unknown) => void = () => undefined;
    (mockNative().module.listParticipants as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        })
    );
    (mockNative().module.readState as jest.Mock).mockResolvedValueOnce({
      connectionState: 'disconnected',
      publishEnabled: false,
      publishState: 'notPublished',
      microphoneEnabled: true,
      cameraEnabled: true,
      cameraPosition: 'front',
      audioOutput: 'auto',
    });

    const seen: unknown[] = [];
    render(
      <IVSStageProvider>
        <Probe onParticipants={(p) => seen.push(p)} />
      </IVSStageProvider>
    );

    // Wait until provider has subscribed (listParticipants called) but
    // snapshot is still pending — then emit so the event is buffered.
    await waitFor(() =>
      expect(mockNative().module.listParticipants).toHaveBeenCalled()
    );

    await act(async () => {
      mockNative().emit.participantJoined({
        participantId: 'remote-1',
        userId: 'bob',
        isLocal: false,
        attributes: {},
        publishState: 'published',
        subscribeState: 'subscribed',
        streams: [],
      });
    });

    await act(async () => {
      resolveList([]);
    });

    await waitFor(() => {
      const last = seen[seen.length - 1] as Array<{ participantId: string }>;
      expect(last?.some((p) => p.participantId === 'remote-1')).toBe(true);
    });
  });

  it('participantLeft removes and streamsChanged replaces wholesale', async () => {
    const seen: Array<Array<{ participantId: string; streams: unknown[] }>> =
      [];
    render(
      <IVSStageProvider>
        <Probe onParticipants={(p) => seen.push(p as (typeof seen)[number])} />
      </IVSStageProvider>
    );

    await waitFor(() =>
      expect(mockNative().module.listParticipants).toHaveBeenCalled()
    );

    await act(async () => {
      mockNative().emit.participantJoined({
        participantId: 'r1',
        userId: 'bob',
        isLocal: false,
        attributes: {},
        publishState: 'published',
        subscribeState: 'subscribed',
        streams: [
          {
            mediaType: 'video',
            isMuted: false,
            deviceType: 'camera',
            urn: 'u1',
          },
        ],
      });
    });

    await waitFor(() => {
      const last = seen[seen.length - 1]!;
      expect(last.some((p) => p.participantId === 'r1')).toBe(true);
    });

    await act(async () => {
      mockNative().emit.streamsChanged({
        participantId: 'r1',
        streams: [
          {
            mediaType: 'audio',
            isMuted: true,
            deviceType: 'microphone',
            urn: 'a1',
          },
        ],
      });
    });

    await waitFor(() => {
      const last = seen[seen.length - 1]!;
      const p = last.find((x) => x.participantId === 'r1')!;
      expect(p.streams).toHaveLength(1);
      expect((p.streams[0] as { mediaType: string }).mediaType).toBe('audio');
    });

    await act(async () => {
      mockNative().emit.participantLeft({ participantId: 'r1' });
    });
    await waitFor(() => {
      const last = seen[seen.length - 1]!;
      expect(last.some((p) => p.participantId === 'r1')).toBe(false);
    });
  });

  it('hook selectors return values for missing participant', async () => {
    const streamRefs: unknown[] = [];
    function StageProbe() {
      useStage();
      return (
        <StreamsProbe id="missing" onStreams={(s) => streamRefs.push(s)} />
      );
    }
    render(
      <IVSStageProvider>
        <StageProbe />
      </IVSStageProvider>
    );
    await waitFor(() => expect(streamRefs.length).toBeGreaterThan(0));
    expect(streamRefs[streamRefs.length - 1]).toEqual([]);
  });
});
