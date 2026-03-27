// forge/src/cli/util/display.ts
export function heading(text: string): string {
  return `\n  ${text}\n  ${'─'.repeat(text.length)}\n`;
}

export function bullet(text: string, indent = 2): string {
  return `${' '.repeat(indent)}• ${text}`;
}

export function success(text: string): string {
  return `  ✓ ${text}`;
}

export function error(text: string): string {
  return `  ✗ ${text}`;
}

export function info(text: string): string {
  return `  ℹ ${text}`;
}
