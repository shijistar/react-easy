import type { Control } from '@storybook/addon-docs/blocks';

/** Infers the appropriate control type for a prop based on its JSDoc type information. */
export function inferControlFromDocgenType(typeInfo?: { name?: string; value?: string }): {
  control?: Control;
  options?: (string | number | boolean)[];
} {
  const originName = typeInfo?.name === 'other' ? String(typeInfo?.value) : String(typeInfo?.name ?? '');
  const name = originName.replace('| undefined', '').replace('| null', '').trim();

  if (name === 'boolean') return { control: 'boolean' };
  if (name === 'number') return { control: 'number' };
  if (name === 'string') return { control: 'text' };

  const splits = name.split('|').map((s) => s.trim());
  const isLiteralUnionType = splits.every(isLiteralType);
  if (name === 'enum' || name === 'union' || isLiteralUnionType) {
    const options = isLiteralUnionType ? splits : extractLiteralOptions(typeInfo?.value);

    if (options.length > 0) {
      const onlyBoolean = options.length === 2 && options.includes(true) && options.includes(false);
      if (onlyBoolean) return { control: 'boolean', options };
      return {
        control: options.length <= 3 ? 'radio' : 'select',
        options,
      };
    }
    return { control: 'object' };
  }

  if (name.includes('array') || name.includes('object') || name.includes('record')) {
    return { control: 'object' };
  }

  // function 类型不自动设置 control，避免产生无意义输入控件
  if (name.includes('function') || name.includes('func')) {
    return {};
  }

  return { control: 'object' };
}

/** Extracts literal options from a raw JSDoc type value. */
function extractLiteralOptions(raw: unknown): (string | number | boolean)[] {
  if (!Array.isArray(raw)) return [];

  const options: (string | number | boolean)[] = [];

  raw.forEach((item) => {
    const itemValue =
      typeof item === 'object' && item !== null && 'value' in item
        ? String((item as { value?: unknown }).value)
        : String(item);

    const normalized = itemValue.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') return;

    if (normalized === 'true') {
      options.push(true);
      return;
    }
    if (normalized === 'false') {
      options.push(false);
      return;
    }

    if (
      (normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")) ||
      (normalized.startsWith('`') && normalized.endsWith('`'))
    ) {
      options.push(normalized.slice(1, -1));
      return;
    }

    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber)) {
      options.push(asNumber);
      return;
    }

    options.push(normalized);
  });

  return Array.from(new Set(options));
}

export function standardizeJsDocDefaultValue(defaultValue: string) {
  if (
    (defaultValue.startsWith("'") && defaultValue.endsWith("'")) ||
    (defaultValue.startsWith('"') && defaultValue.endsWith('"')) ||
    (defaultValue.startsWith('`') && defaultValue.endsWith('`'))
  ) {
    return `"${defaultValue.slice(1, -1)}"`;
  }
  return defaultValue;
}

function isLiteralType(type?: string) {
  if (type === 'true' || type === 'false') {
    return true;
  }
  if (type?.match(/^['"`].*['"`]$/)) {
    return true;
  }
  if (type?.match(/^\d+n?$/)) {
    return true;
  }
  return false;
}
