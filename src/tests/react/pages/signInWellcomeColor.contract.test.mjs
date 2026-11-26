import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const styles = fs.readFileSync(
  new URL('../../../react/pages/sign-in/index.styles.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('sign-in welcome text uses its own theme color and falls back to textSecondary (#1515)', () => {
  assert.match(styles, /loginLabelWellcome: themeColors\.loginLabelWellcome/);
  assert.match(styles, /subtitle: \{[^}]*color: theme\.loginLabelWellcome \|\| theme\.textSecondary/);
});
