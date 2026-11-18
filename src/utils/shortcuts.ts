import { KeyboardShortcuts } from '../types';

export interface ShortcutDefinition {
  id: keyof KeyboardShortcuts;
  label: string;
  description: string;
  defaultKey: string;
}

export const SHORTCUT_ITEMS: ShortcutDefinition[] = [
  {
    id: 'newExpense',
    label: 'Add new expense or lending',
    description: 'Quickly open the add transaction modal',
    defaultKey: 'N',
  },
  {
    id: 'settle',
    label: 'Settle up current balance',
    description: 'Open the settlement modal to clear balances',
    defaultKey: 'S',
  },
  {
    id: 'perspective',
    label: 'Switch user perspective (You ↔ Friend)',
    description: 'Flip viewing mode between you and your friend',
    defaultKey: 'P',
  },
  {
    id: 'toggleTheme',
    label: 'Toggle Dark / Light theme',
    description: 'Instantly toggle dark mode or light mode',
    defaultKey: 'T',
  },
  {
    id: 'shortcutsGuide',
    label: 'Show this keyboard shortcuts guide',
    description: 'Display this keyboard shortcuts sheet',
    defaultKey: '?',
  },
  {
    id: 'closeModal',
    label: 'Close any active modal or image preview',
    description: 'Dismiss open dialogs, previews, and popups',
    defaultKey: 'Escape',
  },
];

/**
 * Format a keyboard key string into human-readable badge text (e.g. 'Escape' -> 'Esc')
 */
export function formatKeyDisplay(key: string): string {
  if (!key) return '';
  const lower = key.toLowerCase();
  if (lower === 'escape' || lower === 'esc') return 'Esc';
  if (lower === ' ' || lower === 'space') return 'Space';
  if (lower === 'enter') return 'Enter';
  if (lower === 'backspace') return 'Backspace';
  if (lower === 'tab') return 'Tab';
  if (lower === 'arrowup') return '↑';
  if (lower === 'arrowdown') return '↓';
  if (lower === 'arrowleft') return '←';
  if (lower === 'arrowright') return '→';
  if (key === '?') return '?';
  if (key.length === 1) return key.toUpperCase();
  return key;
}

/**
 * Test whether a keyboard event key matches the configured shortcut key
 */
export function matchesKey(eventKey: string, configuredKey: string): boolean {
  if (!eventKey || !configuredKey) return false;
  const configuredLower = configuredKey.toLowerCase();
  const eventLower = eventKey.toLowerCase();

  if (configuredLower === 'escape' || configuredLower === 'esc') {
    return eventLower === 'escape';
  }
  if (configuredLower === ' ' || configuredLower === 'space') {
    return eventKey === ' ' || eventLower === 'space';
  }
  if (configuredKey === '?') {
    return eventKey === '?' || eventKey === '/';
  }
  return eventLower === configuredLower;
}
