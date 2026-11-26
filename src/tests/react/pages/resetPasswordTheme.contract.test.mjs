import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const page = fs.readFileSync(
  new URL('../../../react/pages/reset-password/index.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('reset-password reuses the sign-in token names and has no hardcoded color fallback', () => {
  assert.match(page, /resolveSignInTheme/);
  assert.match(page, /backgroundColor: theme\.inputBackground,/);
  assert.match(page, /borderColor: theme\.inputBorder,/);
  assert.match(page, /helpTitle: \{[^}]*color: theme\.textPrimary/);
  assert.match(page, /helpLine: \{[^}]*color: theme\.textSecondary/);
  assert.doesNotMatch(page, /#[0-9a-fA-F]{3,8}\b|rgba?\(|labelText|mutedText/);
});
