// fluxo: usuario-permissao | etapa: login-shell
// Wiki: https://github.com/ControleOnline/ui-users/wiki
const {expect, test} = require('playwright/test');

const capture = async (page, testInfo, name) => {
  await testInfo.attach(name, {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
};

const openLoginPage = async (page, testInfo) => {
  await page.goto('/');

  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Senha')).toBeVisible();
  await expect(page.getByText('Entrar', {exact: true})).toBeVisible();
  await capture(page, testInfo, 'login-initial');
};

test.describe('browser smoke', () => {
  test('loads the login shell and keeps the route visible in the browser', async ({page}, testInfo) => {
    await openLoginPage(page, testInfo);

    await expect(
      page.getByText('Entre com suas credenciais para acessar'),
    ).toBeVisible();
    await expect(page).toHaveURL(/sign-in-page/);
  });

  test('navigates to create account and returns to login', async ({page}, testInfo) => {
    await openLoginPage(page, testInfo);

    await page.getByText('Criar conta', {exact: true}).click();

    await expect(page).toHaveURL(/create-account/);
    await expect(
      page
        .locator('div')
        .filter({hasText: /^Criar Conta$/})
        .first(),
    ).toBeVisible();
    await capture(page, testInfo, 'create-account');

    await page.goBack();

    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByText('Entrar', {exact: true})).toBeVisible();
    await capture(page, testInfo, 'login-return');
  });

  test('shows the create-account form in the browser', async ({page}, testInfo) => {
    await openLoginPage(page, testInfo);

    await page.getByText('Criar conta', {exact: true}).click();

    await expect(page).toHaveURL(/create-account/);
    await expect(
      page
        .locator('div')
        .filter({hasText: /^Criar Conta$/})
        .first(),
    ).toBeVisible();
    await expect(page.getByPlaceholder('CPF')).toBeVisible();
    await expect(page.getByPlaceholder('Usuário')).toBeVisible();
    await capture(page, testInfo, 'create-account-form');
  });
});
