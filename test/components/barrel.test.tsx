import { describe, expect, it } from 'vitest';
import * as Components from '../../src/components';
import * as Hooks from '../../src/hooks';
import * as Utils from '../../src/utils';

describe('components barrel', () => {
  it('re-exports components', () => {
    expect(Object.keys(Components).sort()).toEqual([
      'BreakLines',
      'ColumnSetting',
      'ConfigProvider',
      'ConfirmAction',
      'ContextMenu',
      'DeleteConfirmAction',
      'EditableText',
      'EllipsisLink',
      'EllipsisParagraph',
      'EllipsisText',
      'EllipsisTitle',
      'FloatDrawer',
      'FormItemControl',
      'Loading',
      'ModalAction',
      'OverflowTags',
      'PulseAnimation',
      'ReactEasyContext',
      'VirtualTextViewer',
      'createIconfont',
      'withConfirmAction',
      'withDefaultConfirmActionProps',
      'withDefaultModalActionProps',
      'withDeleteConfirmAction',
      'withModalAction',
    ]);
  });
  it('re-exports hooks', () => {
    expect(Object.keys(Hooks).sort()).toEqual([
      'useAudioPlayer',
      'useDebounce',
      'useLocalStorage',
      'useMovable',
      'useProcessingText',
      'useRefFunction',
      'useRefValue',
      'useRowSelection',
      'useSSE',
      'useSplitter',
      'useStompSocket',
      'useStreamDownloader',
      'useUserMedia',
      'useValidator',
      'useValidatorBuilder',
      'useValidators',
    ]);
  });
  it('re-exports utils', () => {
    expect(Object.keys(Utils).sort()).toEqual([
      'AudioPlayer',
      'StreamDownloadError',
      'StreamDownloader',
      'StreamTimeSlicerClass',
      'advancedDecrypt',
      'advancedEncrypt',
      'arrayBufferToBase64',
      'base64ToArrayBuffer',
      'base64ToString',
      'decryptAES',
      'decryptWithCryptoJS',
      'encryptAES',
      'encryptWithCryptoJS',
      'getColorLuminance',
      'random',
      'randomChars',
      'readTextAnyEncoding',
      'stringToBase64',
    ]);
  });
});
