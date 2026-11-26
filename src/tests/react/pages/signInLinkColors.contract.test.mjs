import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const styles = fs.readFileSync(
  new URL('../../../react/pages/sign-in/index.styles.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('sign-in links use their own theme colors and fall back to linkText (#1506)', () => {
  assert.match(styles, /loginLabelCreateAccount: themeColors\.loginLabelCreateAccount/);
  assert.match(styles, /loginLabelForgotPassword: themeColors\.loginLabelForgotPassword/);
  assert.match(styles, /forgotPasswordText: \{[^}]*color: theme\.loginLabelForgotPassword \|\| theme\.linkText/);
  assert.match(styles, /createAccountText: \{[^}]*color: theme\.loginLabelCreateAccount \|\| theme\.linkText/);
});
