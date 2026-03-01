export function getGlobalValueFromUrl(key: string): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const globals = urlParams.get('globals');
  if (!globals) return undefined;

  const value = globals.split(';').find((item) => item.startsWith(`${key}:`));
  return value ? value.split(':')[1] : undefined;
}
