import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { App, Checkbox, Flex, Form, Modal, notification, Select, Typography } from 'antd';
import EasyConfigProvider from '../components/ConfigProvider';
import ReactEasyContext from '../components/ConfigProvider/context';
import { StreamTimeSlicerClass, type StreamTimeSlicerOptions } from '../utils/stream';
import useRefFunction from './useRefFunction';
import useRefValue from './useRefValue';
import useT from './useT';

export interface UseUserMediaProps {
  /**
   * - **EN:** The media constraints for the audio and video stream.
   * - **CN:** 媒体流的媒体约束。
   */
  media: Pick<MediaStreamConstraints, 'audio' | 'video'>;
  /**
   * - **EN:** Whether to enable PCM output, only effective when recording audio. Please use
   *   `onPcmStreamChunk` callback to get PCM data. Default is `false`.
   * - **CN:** 是否启用 PCM 输出，仅在录制音频时有效。请使用 `onPcmStreamChunk` 回调获取 PCM 数据。默认`false`
   */
  pcmAudioOptions?: {
    /**
     * - **EN:** The audio context options for the PCM output.
     * - **CN:** PCM 输出的音频上下文选项。
     */
    audioContext?: AudioContextOptions;
    /**
     * - **EN:** The worklet options for the PCM output.
     * - **CN:** PCM 输出的工作线程选项。
     */
    workletOptions?: AudioWorkletNodeOptions;
  };
  /**
   * - **EN:** Callback function that is triggered when the recording starts, providing the media
   *   stream.
   * - **CN:** 开始录制时触发的回调函数，提供媒体流。
   *
   * @param {MediaStream} stream - The media stream.
   */
  onStartRecording?: (stream: MediaStream) => void;
  /**
   * - **EN:** Callback function that is triggered when the recording stops.
   * - **CN:** 停止录制时触发的回调函数。
   */
  onStopRecording?: () => void;
  /**
   * - **EN:** Callback function that is triggered when a new chunk of media data is available.
   * - **CN:** 当录制媒体流时，每个时间分片会触发一次 `onStreamChunk` 回调，提供媒体数据块。
   *
   * > 注意音频流编码格式为：audio/webm;codecs=opus。如果希望获取 PCM 数据，请使用 `onPcmData` 回调。
   *
   * @param {Blob} chunk - The media data chunk (MIME: audio/webm;codecs=opus) | 媒体数据块 (MIME:
   *   audio/webm;codecs=opus)
   */
  onStreamChunk?: (chunk: Blob) => void;
  /**
   * - **EN:** Callback for raw PCM float data (per render quantum)
   * - **CN:** 获取原始 PCM 浮点数据的回调（每个渲染量子）
   *
   * @param data Monophonic or polyphonic spliced data | 单声道或多声道拼接数据
   * @param sampleRate Sample rate | 采样率
   */
  onPcmStreamChunk?: (channels: Float32Array[], sampleRate: number) => void;
  /**
   * - **EN:** Whether to disable this hook.
   * - **CN:** 是否禁用此工具
   */
  disabled?: boolean;
  /**
   * - **EN:** The slicing mode for the audio and video stream.
   * - **CN:** 媒体流的切片模式。
   */
  streamSliceMode?: StreamTimeSlicerOptions['sliceMode'];
  /**
   * - **EN:** The slicing value (milliseconds or bytes) for the audio and video stream, when
   *   `streamSliceMode` is `time`, it represents milliseconds, and when it is `size`, it represents
   *   bytes.
   * - **CN:** 媒体流切片的切片值（毫秒或字节），当 `streamSliceMode` 为 `time` 时表示毫秒，为 `size` 时表示字节。
   */
  streamSliceValue?: StreamTimeSlicerOptions['value'];
  /**
   * - **EN:** The silence detection threshold (0-1) for the audio stream, below which the audio is
   *   considered silent. Default is `0`.
   * - **CN:** 音频流的静音检测阈值（0-1），低于该值音频被视为静音。默认值为 `0`。
   */
  soundDetectionThreshold?: number;
  /**
   * - **EN:** The timeout duration (milliseconds) for detecting sound input. If no sound is detected
   *   within this period, the user will be prompted to re-select the audio device. Default is
   *   `3000`.
   * - **CN:** 检测是否有声音输入的超时时间（毫秒），如果在该时间段内没有检测到声音，则会提示用户重新选择音频设备。默认值为 `3000`。
   */
  soundDetectionTimeout?: number;
}

const useUserMedia = (props: UseUserMediaProps): UseUserMediaResult => {
  const {
    media,
    pcmAudioOptions,
    disabled,
    streamSliceMode = 'time',
    streamSliceValue,
    soundDetectionThreshold = 0,
    soundDetectionTimeout = 3000,
    onStartRecording,
    onStopRecording,
    onStreamChunk,
    onPcmStreamChunk,
  } = props;
  const context = useContext(ReactEasyContext);
  const { lang } = context;
  const contextRef = useRefValue(context);
  const t = useT();
  const app = App.useApp();
  // @ts-expect-error: because app may return a stub object when App is not used
  const modal = app.modal?.confirm ? app.modal : Modal;
  const modalRef = useRefValue(modal);
  const [requestMicrophoneEnUrl, setRequestMicrophoneEnUrl] = useState<string>();
  const [requestMicrophoneZhUrl, setRequestMicrophoneZhUrl] = useState<string>();
  const [resetMicrophoneEnUrl, setResetMicrophoneEnUrl] = useState<string>();
  const [resetMicrophoneZhUrl, setResetMicrophoneZhUrl] = useState<string>();
  const [requestCameraEnUrl, setRequestCameraEnUrl] = useState<string>();
  const [requestCameraZhUrl, setRequestCameraZhUrl] = useState<string>();
  const [resetCameraEnUrl, setResetCameraEnUrl] = useState<string>();
  const [resetCameraZhUrl, setResetCameraZhUrl] = useState<string>();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream>();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const stopSoundListeningRef = useRef<(() => void) | undefined>(undefined);
  const closePcmRef = useRef<(() => void) | undefined>(undefined);
  const includeAudio = !!media.audio;
  const exactAudioDeviceIdRef = useRef<string | undefined>(undefined);
  const rafRef = useRef<number>(0);
  const isSpeakingRef = useRef(false);
  const silenceVolumeThresholdRef = useRefValue(soundDetectionThreshold);
  const silenceDetectDurationRef = useRefValue(soundDetectionTimeout);
  const soundDetectStart = useRef<number>(0);
  const pcmSampleRateRef = useRef<number>(0);
  const onPcmStreamChunkRef = useRefValue(onPcmStreamChunk);
  const pcmStreamSlicerRef = useRef(
    new StreamTimeSlicerClass({
      sliceMode: streamSliceMode,
      value: streamSliceValue || 0,
      onSlice: (channels) => {
        onPcmStreamChunkRef.current?.(channels, pcmSampleRateRef.current);
      },
    })
  );
  const deviceType = useMemo(
    () => (media.video ? t('hooks.useUserMedia.camera') : t('hooks.useUserMedia.microphone')),
    [media, t]
  );
  const featureName = useMemo(
    () => (media.video ? t('hooks.featureName.camera') : t('hooks.featureName.microphone')),
    [media, t]
  );

  const showDeniedPopup = () => {
    const resetMicrophoneUrl = lang === 'zh-CN' ? resetMicrophoneZhUrl : resetMicrophoneEnUrl;
    const resetCameraUrl = lang === 'zh-CN' ? resetCameraZhUrl : resetCameraEnUrl;
    modal.error({
      title: t('hooks.useUserMedia.devicePermission', { deviceType }),
      width: 500,
      content: (
        <div>
          <Typography.Paragraph></Typography.Paragraph>
          <Typography.Paragraph>
            <Typography.Text strong type="danger">
              {t('hooks.useUserMedia.deniedPermission', { deviceType, featureName })}
            </Typography.Text>
          </Typography.Paragraph>
          <Typography.Paragraph>{t('hooks.useUserMedia.reopenPermissionGuide', { deviceType })}</Typography.Paragraph>
          <img
            src={media.video ? resetCameraUrl : resetMicrophoneUrl}
            alt="microphone-permission"
            style={{ width: 380 }}
          />
        </div>
      ),
    });
  };
  const recordStream = async () => {
    let stream: MediaStream;
    try {
      const options = media;
      if (media.audio) {
        if (exactAudioDeviceIdRef.current) {
          if (media.audio === true) {
            options.audio = { deviceId: { exact: exactAudioDeviceIdRef.current } };
          } else {
            options.audio = { deviceId: { exact: exactAudioDeviceIdRef.current }, ...media.audio };
          }
        }
      }
      stream = await navigator.mediaDevices.getUserMedia(options);
      setMediaStream(stream);
      onStartRecording?.(stream);

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onStreamChunk?.(event.data);
        }
      };
      if (streamSliceMode === 'time' && streamSliceValue) {
        recorder.start(streamSliceValue);
      } else {
        recorder.start();
      }
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Capture PCM data if enabled
      if (options.audio && onPcmStreamChunkRef.current) {
        try {
          const ctx = new AudioContext(pcmAudioOptions?.audioContext);
          pcmSampleRateRef.current = ctx.sampleRate;
          // Safari might need resume
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          const sourceNode = ctx.createMediaStreamSource(stream);
          let node: AudioWorkletNode | undefined;

          closePcmRef.current = () => {
            node?.port.close();
            node?.disconnect();
            sourceNode.disconnect();
            ctx.close().catch(() => {
              // Ignore errors
            });
          };

          const setupWorklet = async () => {
            try {
              // Load the worklet module
              await ctx.audioWorklet.addModule(generatePcmCaptureProcessorModule());
              node = new AudioWorkletNode(ctx, 'pcm-capture', pcmAudioOptions?.workletOptions);
              node.port.onmessage = (e: MessageEvent) => {
                if (e.data?.type === 'pcm') {
                  const channels = e.data.channels as Float32Array[];
                  pcmStreamSlicerRef.current.push(channels);
                }
              };
              sourceNode.connect(node);
            } catch (err) {
              fallbackScriptProcessor({ ctx, sourceNode, streamSlicer: pcmStreamSlicerRef.current });
            }
          };

          if ('audioWorklet' in ctx) {
            setupWorklet();
          } else {
            fallbackScriptProcessor({ ctx, sourceNode, streamSlicer: pcmStreamSlicerRef.current });
          }
        } catch (e) {
          console.error('setup pcm worklet failed', e);
        }
      }
      return recorder;
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        showDeniedPopup();
        notification.error({ message: t('hooks.useUserMedia.deniedPermission', { deviceType, featureName }) });
        throw new Error(t('hooks.useUserMedia.deniedPermission', { deviceType, featureName }));
      }
      notification.error({ message: t('hooks.useUserMedia.notSupport') });
      throw new Error(t('hooks.useUserMedia.notSupport'));
    }
  };

  const startRecording = useRefFunction(async () => {
    if (disabled) {
      throw new Error(t('hooks.useUserMedia.disabledWarning'));
    }
    if (isRecording) {
      throw new Error(t('hooks.useUserMedia.isRecordingNow'));
    }
    if (!navigator.mediaDevices?.getUserMedia || !navigator.permissions?.query) {
      notification.error({
        message: t('hooks.useUserMedia.notSupport'),
      });
      throw new Error(t('hooks.useUserMedia.notSupport'));
    }
    try {
      const result = await window.navigator.permissions.query({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: media.video ? ('camera' as any) : ('microphone' as any),
      });
      if (result.state === 'denied') {
        showDeniedPopup();
        notification.error({ message: t('hooks.useUserMedia.deniedPermission', { deviceType, featureName }) });
        throw new Error(t('hooks.useUserMedia.deniedPermission', { deviceType, featureName }));
      } else {
        if (result.state === 'prompt') {
          const requestMicrophoneUrl = lang === 'zh-CN' ? requestMicrophoneZhUrl : requestMicrophoneEnUrl;
          const requestCameraUrl = lang === 'zh-CN' ? requestCameraZhUrl : requestCameraEnUrl;
          return new Promise<MediaRecorder>((resolve, reject) => {
            modal.warning({
              title: t('hooks.useUserMedia.devicePermission', { deviceType }),
              content: (
                <div>
                  <Typography.Paragraph></Typography.Paragraph>
                  <Typography.Paragraph>
                    <Typography.Text strong>{t('hooks.useUserMedia.requestTip1', { deviceType })}</Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph>{t('hooks.useUserMedia.requestTip2', { featureName })}</Typography.Paragraph>
                  <div>
                    <img
                      src={media.video ? requestCameraUrl : requestMicrophoneUrl}
                      alt="microphone-permission"
                      style={{ width: 380 }}
                    />
                  </div>
                </div>
              ),
              onOk: () => {
                try {
                  recordStream()
                    .then((recorder) => {
                      resolve(recorder);
                    })
                    .catch((error) => {
                      reject(error);
                    });
                } catch (error) {
                  console.error(error);
                  reject(error);
                }
              },
              width: 500,
            });
          });
        } else {
          return await recordStream();
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  const stopRecording = useRefFunction(() => {
    mediaRecorder?.stop();
    mediaStream?.getTracks().forEach((t) => t.stop());
    setMediaStream(undefined);
    setIsRecording(false);
    isSpeakingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    stopSoundListeningRef.current?.();
    closePcmRef.current?.();
    onStopRecording?.();
  });

  // Wait for sound. If keep silent for a while, show a modal to let user reselect audio device
  const waitForSound = useRefFunction((mediaStream: MediaStream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(mediaStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    soundDetectStart.current = Date.now();
    const data = new Uint8Array(analyser.fftSize);
    const cancelDetect = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      stopSoundListeningRef.current?.();
    };
    const loop = () => {
      analyser.getByteTimeDomainData(data);
      // Calculate RMS
      let sum = 0;
      for (const value of data) {
        const v = (value - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length); // 0~1
      if (rms > silenceVolumeThresholdRef.current) {
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true;
          cancelDetect();
          return;
        }
      } else {
        if (Date.now() > soundDetectStart.current + silenceDetectDurationRef.current) {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            const audioInputs = devices.filter((d) => d.kind === 'audioinput');
            modalRef.current.confirm({
              title: t('hooks.useUserMedia.soundDetectTitle'),
              content: (
                <EasyConfigProvider {...contextRef.current}>
                  <SaveAudioDeviceForm
                    devices={audioInputs}
                    mediaStream={mediaStream}
                    onDeviceChange={(deviceId) => (exactAudioDeviceIdRef.current = deviceId)}
                  />
                </EasyConfigProvider>
              ),
              width: 500,
              onOk: () => {
                if (exactAudioDeviceIdRef.current) {
                  stopRecording();
                  setTimeout(() => {
                    startRecording();
                  });
                }
              },
              onCancel: () => {
                cancelDetect();
              },
            });
          });

          cancelDetect();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    stopSoundListeningRef.current = () => {
      analyser.disconnect();
      source.disconnect();
      ctx.close().catch(() => {
        // Ignore errors
      });
      stopSoundListeningRef.current = undefined;
    };
  });

  // Component destroy
  useEffect(() => {
    return stopRecording;
  }, []);

  // Stop recording when disabled has been changed
  useEffect(() => {
    if (disabled && isRecording) {
      stopRecording();
    }
  }, [disabled, isRecording]);

  // Update PCM stream slicer time slice when input sample rate changes
  useEffect(() => {
    if (streamSliceValue && pcmStreamSlicerRef.current.value !== streamSliceValue) {
      pcmStreamSlicerRef.current.value = streamSliceValue;
    }
  }, [streamSliceValue]);

  // Detect sound activity (only for audio or media with audio)
  useEffect(() => {
    if (includeAudio && mediaStream && !isSpeakingRef.current) {
      try {
        waitForSound(mediaStream);
      } catch (e) {
        console.warn('Audio volume detecting failed:', e);
      }
    }
    return () => {
      stopSoundListeningRef.current?.();
    };
  }, [includeAudio, mediaStream, t]);

  useEffect(() => {
    import('../assets/request-microphone-en.js').then((module) => {
      setRequestMicrophoneEnUrl(module.default);
    });
    import('../assets/request-microphone-zh.js').then((module) => {
      setRequestMicrophoneZhUrl(module.default);
    });
    import('../assets/reset-microphone-en.js').then((module) => {
      setResetMicrophoneEnUrl(module.default);
    });
    import('../assets/reset-microphone-zh.js').then((module) => {
      setResetMicrophoneZhUrl(module.default);
    });
    import('../assets/request-camera-en.js').then((module) => {
      setRequestCameraEnUrl(module.default);
    });
    import('../assets/request-camera-zh.js').then((module) => {
      setRequestCameraZhUrl(module.default);
    });
    import('../assets/reset-camera-en.js').then((module) => {
      setResetCameraEnUrl(module.default);
    });
    import('../assets/reset-camera-zh.js').then((module) => {
      setResetCameraZhUrl(module.default);
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};

export interface UseUserMediaResult {
  /**
   * - **EN** Whether the media stream is currently being recorded
   * - **CN** 是否正在录制媒体流
   */
  isRecording: boolean;
  /**
   * - **EN** Start recording the media stream
   * - **CN** 开始录制媒体流
   */
  startRecording: () => Promise<MediaRecorder>;
  /**
   * - **EN** Stop recording the media stream
   * - **CN** 停止录制媒体流
   */
  stopRecording: () => void;
  /**
   * - **EN** Get the media stream being recorded, returns the stream if recording, otherwise returns
   *   `undefined`
   * - **CN** 获取正在录制的媒体流，如果正在录制则返回该流，否则返回 `undefined`
   */
  mediaStream?: MediaStream;
}

function SaveAudioDeviceForm(props: {
  devices: MediaDeviceInfo[];
  mediaStream: MediaStream;
  onDeviceChange: (deviceId: string) => void;
}) {
  const { devices, mediaStream, onDeviceChange } = props;
  const [form] = Form.useForm();
  const t = useT();
  const { lang } = useContext(ReactEasyContext);
  const [saveAudioDeviceEnUrl1, setSaveAudioDeviceEnUrl1] = useState<string>();
  const [saveAudioDeviceEnUrl2, setSaveAudioDeviceEnUrl2] = useState<string>();
  const [saveAudioDeviceZhUrl1, setSaveAudioDeviceZhUrl1] = useState<string>();
  const [saveAudioDeviceZhUrl2, setSaveAudioDeviceZhUrl2] = useState<string>();
  const [saveDefaultAudioDevicePermanently, setSaveDefaultAudioDevicePermanently] = useState(false);
  const audioInputs = useMemo(() => devices.filter((d) => d.kind === 'audioinput'), [devices]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    () => mediaStream.getAudioTracks()[0]?.getSettings()?.deviceId ?? audioInputs[0]?.deviceId
  );

  const openDataImageInNewTab = useRefFunction((dataUrl: string | undefined) => {
    if (!dataUrl) return;
    const [meta, b64] = dataUrl.split(',');
    const mime = meta.match(/data:(.*);base64/)?.[1] || 'image/png';
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url);
  });

  useEffect(() => {
    import('../assets/save-default-audio1-en.js').then((module) => {
      setSaveAudioDeviceEnUrl1(module.default);
    });
    import('../assets/save-default-audio2-en.js').then((module) => {
      setSaveAudioDeviceEnUrl2(module.default);
    });
    import('../assets/save-default-audio1-zh.js').then((module) => {
      setSaveAudioDeviceZhUrl1(module.default);
    });
    import('../assets/save-default-audio2-zh.js').then((module) => {
      setSaveAudioDeviceZhUrl2(module.default);
    });
  }, []);

  return (
    <Form layout="vertical" form={form}>
      <Typography.Paragraph></Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>{t('hooks.useUserMedia.soundDetectDescription')}</Typography.Text>
      </Typography.Paragraph>
      <Form.Item label={t('hooks.useUserMedia.chooseMicrophoneDevice')}>
        <Select
          options={audioInputs.map((input) => ({
            label: input.label,
            value: input.deviceId,
          }))}
          defaultValue={selectedDeviceId}
          onChange={(id) => {
            setSelectedDeviceId(id);
            onDeviceChange(id);
          }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Checkbox onChange={(e) => setSaveDefaultAudioDevicePermanently(e.target.checked)}>
          {t('hooks.useUserMedia.rememberDefaultAudioDevice')}
        </Checkbox>
      </Form.Item>
      {saveDefaultAudioDevicePermanently && (
        <div>
          <Typography.Paragraph>
            <Typography.Text>{t('hooks.useUserMedia.rememberDefaultAudioDeviceTip')}</Typography.Text>
          </Typography.Paragraph>
          <Flex gap={8} align="flex-start">
            <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openDataImageInNewTab(lang === 'zh-CN' ? saveAudioDeviceZhUrl1 : saveAudioDeviceEnUrl1);
                }}
              >
                <img
                  src={lang === 'zh-CN' ? saveAudioDeviceZhUrl1 : saveAudioDeviceEnUrl1}
                  alt="the first step to save default audio device"
                  style={{ width: '100%', height: 'auto' }}
                />
              </a>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openDataImageInNewTab(lang === 'zh-CN' ? saveAudioDeviceZhUrl2 : saveAudioDeviceEnUrl2);
                }}
              >
                <img
                  src={lang === 'zh-CN' ? saveAudioDeviceZhUrl2 : saveAudioDeviceEnUrl2}
                  alt="the second step to save default audio device"
                  style={{ width: '100%', height: 'auto' }}
                />
              </a>
            </div>
          </Flex>
        </div>
      )}
    </Form>
  );
}

function generatePcmCaptureProcessorModule() {
  const workletCode = `
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const channelsIn = inputs[0];
    if (channelsIn && channelsIn[0]) {
      const channels = channelsIn.map((ch) => {
        const copy = new Float32Array(ch.length);
        copy.set(ch);
        return copy;
      });
      this.port.postMessage({ type: 'pcm', channels }, channels.map(ch => ch.buffer));
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCaptureProcessor);
`;

  // Create a Blob from the worklet code and return its URL
  const blob = new Blob([workletCode], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

function fallbackScriptProcessor(options: {
  ctx: AudioContext;
  sourceNode: MediaStreamAudioSourceNode;
  streamSlicer: StreamTimeSlicerClass;
}) {
  const { ctx, sourceNode, streamSlicer } = options;
  const bufferSize = 128;
  const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
  processor.onaudioprocess = (ev) => {
    const channels = [];
    for (let i = 0; i < ev.inputBuffer.numberOfChannels; i++) {
      const input = ev.inputBuffer.getChannelData(i);
      const copy = new Float32Array(input.length);
      copy.set(input);
      channels.push(copy);
    }
    streamSlicer.push(channels);
  };
  sourceNode.connect(processor);
  // 可不输出：processor.connect(ctx!.destination)；不连接 destination 在部分浏览器会被自动 GC，可连到 destination 或 gain(0)
  const gain = ctx.createGain();
  gain.gain.value = 0;
  processor.connect(gain).connect(ctx.destination);
}

export default useUserMedia;
