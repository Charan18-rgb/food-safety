import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CameraManager } from '../src/camera/CameraManager.js';
import {
  CameraPermissionDeniedError,
  CameraNotFoundError,
  CameraInUseError,
  CameraNotSupportedError
} from '../src/errors.js';

describe('CameraManager Lifecycle', () => {
  let manager: CameraManager;
  let mockTrack: { stop: ReturnType<typeof vi.fn>; getCapabilities?: ReturnType<typeof vi.fn> };
  let mockStream: { getTracks: () => unknown[]; getVideoTracks: () => unknown[] };
  let mockVideo: HTMLVideoElement;

  beforeEach(() => {
    manager = new CameraManager();
    mockTrack = {
      stop: vi.fn(),
      getCapabilities: vi.fn().mockReturnValue({ torch: true })
    };
    mockStream = {
      getTracks: () => [mockTrack],
      getVideoTracks: () => [mockTrack]
    };
    mockVideo = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      setAttribute: vi.fn(),
      srcObject: null
    } as unknown as HTMLVideoElement;
  });

  it('should start rear camera and attach stream to video element', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: mockGetUserMedia
      }
    });

    const stream = await manager.startCamera(mockVideo, { facingMode: 'environment' });

    expect(stream).toBe(mockStream);
    expect(mockVideo.srcObject).toBe(mockStream);
    expect(mockVideo.play).toHaveBeenCalled();
    expect(manager.isPlaying()).toBe(true);
    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({
          facingMode: { ideal: 'environment' }
        })
      })
    );

    vi.unstubAllGlobals();
  });

  it('should throw CameraPermissionDeniedError when user denies permission', async () => {
    const permErr = new Error('Permission denied');
    permErr.name = 'NotAllowedError';

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(permErr)
      }
    });

    await expect(manager.startCamera(mockVideo)).rejects.toThrow(CameraPermissionDeniedError);
    vi.unstubAllGlobals();
  });

  it('should throw CameraNotFoundError when no camera device exists', async () => {
    const notFoundErr = new Error('Device not found');
    notFoundErr.name = 'NotFoundError';

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(notFoundErr)
      }
    });

    await expect(manager.startCamera(mockVideo)).rejects.toThrow(CameraNotFoundError);
    vi.unstubAllGlobals();
  });

  it('should throw CameraInUseError when camera is locked by another process', async () => {
    const inUseErr = new Error('Camera in use');
    inUseErr.name = 'NotReadableError';

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(inUseErr)
      }
    });

    await expect(manager.startCamera(mockVideo)).rejects.toThrow(CameraInUseError);
    vi.unstubAllGlobals();
  });

  it('should throw CameraNotSupportedError when mediaDevices is missing (e.g. non-HTTPS)', async () => {
    vi.stubGlobal('navigator', {});

    await expect(manager.startCamera(mockVideo)).rejects.toThrow(CameraNotSupportedError);
    vi.unstubAllGlobals();
  });

  it('should stop all media stream tracks and clear video srcObject on stopCamera', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      }
    });

    await manager.startCamera(mockVideo);
    expect(manager.isPlaying()).toBe(true);

    manager.stopCamera();

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(mockVideo.pause).toHaveBeenCalled();
    expect(mockVideo.srcObject).toBeNull();
    expect(manager.isPlaying()).toBe(false);

    vi.unstubAllGlobals();
  });
});
