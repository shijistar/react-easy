import type { PropsWithChildren } from 'react';
import ReactEasyContext, { defaultContextValue, type ReactEasyContextProps } from '../../src/components/ConfigProvider/context';
import reactEasyI18n, { resources, t } from '../../src/locales';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useAudioPlayer from '../../src/hooks/useAudioPlayer';
import useContextValidator from '../../src/hooks/useContextValidator';
import useLocalizedText from '../../src/hooks/useLocalizedText';
import useRefFunction from '../../src/hooks/useRefFunction';
import useRefValue from '../../src/hooks/useRefValue';
import useT from '../../src/hooks/useT';
import useValidator from '../../src/hooks/useValidator';
import useValidatorBuilder from '../../src/hooks/useValidatorBuilder';
import useValidators from '../../src/hooks/useValidators';
import AudioPlayer from '../../src/utils/AudioPlayer';

vi.mock('../../src/utils/AudioPlayer', () => {
  const MockAudioPlayer = vi.fn(function MockAudioPlayer(this: Record<string, unknown>, props?: unknown) {
    this.props = props;
    this.dispose = vi.fn();
  });

  return {
    default: MockAudioPlayer,
  };
});

function createWrapper(value?: Partial<ReactEasyContextProps>) {
  const contextValue: ReactEasyContextProps = {
    ...defaultContextValue,
    getPrefixCls: (suffixCls: string, customizePrefixCls?: string) => customizePrefixCls ?? `easy-${suffixCls}`,
    ...value,
  };

  return function Wrapper({ children }: PropsWithChildren) {
    return <ReactEasyContext.Provider value={contextValue}>{children}</ReactEasyContext.Provider>;
  };
}

describe('basic hooks', () => {
  beforeEach(async () => {
    reactEasyI18n.changeLanguage('en-US');
    reactEasyI18n.addResourceBundle('en-US', 'translation', resources['en-US'].translation, true, true);
  });

  it('useRefValue keeps a stable ref while updating current value', () => {
    const { result, rerender } = renderHook(({ value }) => useRefValue(value), {
      initialProps: { value: 1 },
    });
    const firstRef = result.current;

    expect(result.current.current).toBe(1);

    rerender({ value: 2 });

    expect(result.current).toBe(firstRef);
    expect(result.current.current).toBe(2);
  });

  it('useRefFunction keeps a stable reference and uses the latest callback', () => {
    const first = vi.fn((value: number) => value + 1);
    const second = vi.fn((value: number) => value + 10);
    const { result, rerender } = renderHook(({ fn }) => useRefFunction(fn), {
      initialProps: { fn: first },
    });
    const stableRef = result.current;

    expect(result.current(1)).toBe(2);
    expect(first).toHaveBeenCalledWith(1);

    rerender({ fn: second });

    expect(result.current).toBe(stableRef);
    expect(result.current(1)).toBe(11);
    expect(second).toHaveBeenCalledWith(1);
  });

  it('useRefFunction returns undefined when callback is missing', () => {
    const { result } = renderHook(() => useRefFunction(undefined));

    expect(result.current('ignored')).toBeUndefined();
  });

  it('useAudioPlayer creates one player instance and disposes it on unmount', () => {
    const props = { source: 'demo.mp3', volume: 0.7 };
    const { result, rerender, unmount } = renderHook(({ value }) => useAudioPlayer(value), {
      initialProps: { value: props },
    });
    const instance = result.current as unknown as { dispose: ReturnType<typeof vi.fn>; props: unknown };

    rerender({ value: { source: 'changed.mp3' } });

    expect(AudioPlayer).toHaveBeenCalledTimes(1);
    expect(AudioPlayer).toHaveBeenCalledWith(props);
    expect(result.current).toBe(instance);

    unmount();

    expect(instance.dispose).toHaveBeenCalledTimes(1);
  });

  it('useT returns the shared translation function from context language', () => {
    const wrapper = createWrapper({ lang: 'zh-CN' });
    const { result, rerender } = renderHook(() => useT(), { wrapper });

    expect(result.current).toBe(t);

    rerender();

    expect(result.current('validation.rule.number.message')).toBeTypeOf('string');
  });

  it('useLocalizedText returns original content when localize is missing', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLocalizedText('Plain text'), { wrapper });

    expect(result.current).toBe('Plain text');
  });

  it('useLocalizedText delegates to localize when provided', () => {
    const localize = vi.fn((content: unknown, args?: Record<string, unknown>) => `${String(content)}:${String(args?.value)}`);
    const wrapper = createWrapper({ localize });
    const { result } = renderHook(() => useLocalizedText('token', { value: 'x' }), { wrapper });

    expect(result.current).toBe('token:x');
    expect(localize).toHaveBeenCalledWith('token', { value: 'x' });
  });

  it('useContextValidator warns when used without ConfigProvider context', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = renderHook(() => useContextValidator());

    expect(result.current).toBe(defaultContextValue);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('useContextValidator returns custom context without warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = createWrapper({ lang: 'zh-CN' });
    const { result } = renderHook(() => useContextValidator(), { wrapper });

    expect(result.current.lang).toBe('zh-CN');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('useValidator builds a validator rule from props', () => {
    const wrapper = createWrapper();
    const props = { allowed: { letter: true, number: true, min: 2, max: 4 }, startsWith: { letter: true } };
    const { result } = renderHook(() => useValidator(props), { wrapper });

    expect(result.current.allowedOptions).toEqual(props.allowed);
    expect(result.current.startsWithOptions).toEqual(props.startsWith);
    expect(result.current.pattern.test('a1')).toBe(true);
    expect(result.current.pattern.test('1a')).toBe(false);
    expect(result.current.message).toContain('Allow');
  });

  it('useValidatorBuilder throws when include flags are missing', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidatorBuilder(), { wrapper });

    expect(() => result.current({ allowed: { special: ['!'] } })).toThrow('At least one field in the include option is true');
  });

  it('useValidatorBuilder covers startsWith, range length, single and multiple token branches', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidatorBuilder(), { wrapper });

    const rangedRule = result.current({
      allowed: { letter: true, number: true, hyphen: true, underscore: true, special: ['-', '_', '!'], min: 3, max: 6 },
      startsWith: { lowerLetter: true },
      flags: 'i',
    });
    const maxOnlyRule = result.current({
      allowed: { upperLetter: true, max: 3 },
    });
    const minOnlyRule = result.current({
      allowed: { letter: true, min: 2 },
    });
    const punctuationRule = result.current({
      allowed: { chinesePunctuation: true, lowerLetter: true, min: 1 },
    });
    const customTrueRule = result.current({
      allowed: { custom: true } as never,
    });

    expect(rangedRule.flags).toBe('i');
    expect(rangedRule.pattern.test('aA1')).toBe(true);
    expect(rangedRule.pattern.test('1A1')).toBe(false);
    expect(rangedRule.message).toContain('start with lowercase letter');
    expect(rangedRule.message).toContain('3~6 characters');
    expect(rangedRule.message).toContain('special characters (!)');
    expect(maxOnlyRule.message).toContain('up to 3 characters');
    expect(minOnlyRule.message).toContain('at least 2 characters');
    expect(punctuationRule.message).toContain('Chinese punctuation');
    expect(customTrueRule.message).toBe('Allow ');
  });

  it('useValidatorBuilder trims a leading separator when the locale separator is empty', async () => {
    reactEasyI18n.addResourceBundle(
      'en-US',
      'translation',
      {
        ...resources['en-US'].translation,
        'validation.rule.buildRule.token.separator': '',
      },
      true,
      true,
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidatorBuilder(), { wrapper });

    const rule = result.current({
      allowed: { letter: true },
      startsWith: {},
    });

    expect(rule.message.startsWith('Allow ')).toBe(true);
    expect(rule.message.startsWith('Allow ,')).toBe(false);
  });

  it('useValidators exposes builtin rules and dynamic factories', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidators(), { wrapper });

    expect(result.current.number.pattern.test('123')).toBe(true);
    expect(result.current.floatNumber.pattern.test('-1.2')).toBe(true);
    expect(result.current.email.pattern.test('a_中-b@example.com')).toBe(true);
    expect(result.current.ip.pattern.test('127.0.0.1')).toBe(true);
    expect(result.current.cnMobile.pattern.test('+86 13812345678')).toBe(true);
    expect(result.current.password.message).toBe('validation.rule.password.message');
    expect(result.current.code.pattern.test('a_1')).toBe(true);
    expect(result.current.codeMax20.pattern.test('a'.repeat(20))).toBe(true);
    expect(result.current.codeMax64.pattern.test(`a${'1'.repeat(63)}`)).toBe(true);
    expect(result.current.codeMax128.pattern.test(`a${'1'.repeat(127)}`)).toBe(true);
    expect(result.current.codeWithMax(5).pattern.test('a1234')).toBe(true);
    expect(result.current.name.pattern.test('中-name_1')).toBe(true);
    expect(result.current.nameMax20.pattern.test('中'.repeat(20))).toBe(true);
    expect(result.current.nameMax64.pattern.test('中'.repeat(64))).toBe(true);
    expect(result.current.nameMax128.pattern.test('中'.repeat(128))).toBe(true);
    expect(result.current.nameWithMax(5).pattern.test('中1_-a')).toBe(true);
    expect(result.current.strongName.pattern.test('中1_-a')).toBe(true);
    expect(result.current.strongNameMax64.pattern.test('a'.repeat(64))).toBe(true);
    expect(result.current.strongNameMax128.pattern.test(`中${'a'.repeat(127)}`)).toBe(true);
    expect(result.current.strongNameWithMax(5).pattern.test('a1234')).toBe(true);
  });
});
