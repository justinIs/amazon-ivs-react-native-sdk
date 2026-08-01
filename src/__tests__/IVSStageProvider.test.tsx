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
  useAudioRoute,
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

function remoteParticipant(
  id: string,
  overrides: Record<string, unknown> = {}
) {
  return {
    participantId: id,
    userId: `user-${id}`,
    isLocal: false,
    attributes: { username: id },
    publishState: 'published',
    subscribeState: 'subscribed',
    streams: [
      {
        mediaType: 'video',
        isMuted: false,
        deviceType: 'camera',
        urn: `v-${id}`,
      },
    ],
    ...overrides,
  };
}

describe('IVSStageProvider referential stability', () => {
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

  async function renderWithParticipant(seen: unknown[]) {
    render(
      <IVSStageProvider>
        <Probe onParticipants={(p) => seen.push(p)} />
      </IVSStageProvider>
    );
    await waitFor(() =>
      expect(mockNative().module.listParticipants).toHaveBeenCalled()
    );
    await act(async () => {
      mockNative().emit.participantJoined(remoteParticipant('r1'));
    });
    await waitFor(() => {
      const last = seen[seen.length - 1] as Array<{ participantId: string }>;
      expect(last?.some((p) => p.participantId === 'r1')).toBe(true);
    });
  }

  it('unchanged participants keep identity when another participant joins', async () => {
    const seen: unknown[] = [];
    await renderWithParticipant(seen);
    const before = (
      seen[seen.length - 1] as Array<{ participantId: string }>
    ).find((p) => p.participantId === 'r1');

    await act(async () => {
      mockNative().emit.participantJoined(remoteParticipant('r2'));
    });

    await waitFor(() => {
      const last = seen[seen.length - 1] as Array<{ participantId: string }>;
      expect(last.some((p) => p.participantId === 'r2')).toBe(true);
    });
    const after = (
      seen[seen.length - 1] as Array<{ participantId: string }>
    ).find((p) => p.participantId === 'r1');
    expect(after).toBe(before);
  });

  it('value-equal update for the named participant preserves identity (fresh streams array)', async () => {
    const seen: unknown[] = [];
    await renderWithParticipant(seen);
    const before = (
      seen[seen.length - 1] as Array<{ participantId: string }>
    ).find((p) => p.participantId === 'r1');

    // Fresh payload objects — same values, new references. This is what a
    // freshly-mapped native event always looks like.
    await act(async () => {
      mockNative().emit.participantUpdated(remoteParticipant('r1'));
    });

    const after = (
      seen[seen.length - 1] as Array<{ participantId: string }>
    ).find((p) => p.participantId === 'r1');
    expect(after).toBe(before);
  });

  it('value change for the named participant yields a new identity', async () => {
    const seen: unknown[] = [];
    await renderWithParticipant(seen);
    const before = (
      seen[seen.length - 1] as Array<{ participantId: string }>
    ).find((p) => p.participantId === 'r1');

    await act(async () => {
      mockNative().emit.participantUpdated(
        remoteParticipant('r1', { publishState: 'notPublished' })
      );
    });

    await waitFor(() => {
      const last = seen[seen.length - 1] as Array<{
        participantId: string;
        publishState: string;
      }>;
      const p = last.find((x) => x.participantId === 'r1')!;
      expect(p.publishState).toBe('notPublished');
      expect(p).not.toBe(before);
    });
  });

  it('stream mute toggle yields a new identity', async () => {
    const seen: unknown[] = [];
    await renderWithParticipant(seen);
    const before = (
      seen[seen.length - 1] as Array<{ participantId: string }>
    ).find((p) => p.participantId === 'r1');

    await act(async () => {
      mockNative().emit.streamsChanged({
        participantId: 'r1',
        streams: [
          {
            mediaType: 'video',
            isMuted: true,
            deviceType: 'camera',
            urn: 'v-r1',
          },
        ],
      });
    });

    await waitFor(() => {
      const last = seen[seen.length - 1] as Array<{
        participantId: string;
        streams: Array<{ isMuted: boolean }>;
      }>;
      const p = last.find((x) => x.participantId === 'r1')!;
      expect(p.streams[0]!.isMuted).toBe(true);
      expect(p).not.toBe(before);
    });
  });

  it('participantUpdated upserts a participant not seen before', async () => {
    const seen: unknown[] = [];
    render(
      <IVSStageProvider>
        <Probe onParticipants={(p) => seen.push(p)} />
      </IVSStageProvider>
    );
    await waitFor(() =>
      expect(mockNative().module.listParticipants).toHaveBeenCalled()
    );

    await act(async () => {
      mockNative().emit.participantUpdated(remoteParticipant('r9'));
    });

    await waitFor(() => {
      const last = seen[seen.length - 1] as Array<{ participantId: string }>;
      expect(last.some((p) => p.participantId === 'r9')).toBe(true);
    });
  });
});

describe('IVSStageProvider audio route and errors', () => {
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

  it('audioRouteChanged updates useAudioRoute', async () => {
    const routes: unknown[] = [];
    function RouteProbe() {
      routes.push(useAudioRoute().audioRoute);
      return null;
    }
    render(
      <IVSStageProvider>
        <RouteProbe />
      </IVSStageProvider>
    );
    await waitFor(() =>
      expect(mockNative().module.listParticipants).toHaveBeenCalled()
    );

    await act(async () => {
      mockNative().emit.audioRoute({
        output: 'bluetooth',
        activeOutput: 'bluetooth',
        availableOutputs: ['speaker', 'earpiece', 'bluetooth'],
      });
    });

    await waitFor(() => {
      const last = routes[routes.length - 1] as { activeOutput: string };
      expect(last.activeOutput).toBe('bluetooth');
    });
  });

  it('stage error event surfaces in context and clearError resets it', async () => {
    const errors: unknown[] = [];
    let clear: () => void = () => undefined;
    function ErrorProbe() {
      const { error, clearError } = useStage();
      errors.push(error);
      clear = clearError;
      return null;
    }
    render(
      <IVSStageProvider>
        <ErrorProbe />
      </IVSStageProvider>
    );
    await waitFor(() =>
      expect(mockNative().module.listParticipants).toHaveBeenCalled()
    );

    await act(async () => {
      mockNative().emit.error({
        code: 'network',
        message: 'connection dropped',
        isFatal: false,
      });
    });

    await waitFor(() => {
      const last = errors[errors.length - 1] as { code?: string } | null;
      expect(last?.code).toBe('network');
    });

    await act(async () => {
      clear();
    });
    expect(errors[errors.length - 1]).toBeNull();
  });
});
