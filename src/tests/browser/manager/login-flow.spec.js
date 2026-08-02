const {expect, test} = require('playwright/test');

const openLoginPage = async page => {
  await page.goto('/');

  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Senha')).toBeVisible();
  await expect(page.getByText('Entrar', {exact: true})).toBeVisible();
};

test.describe('browser smoke', () => {
  test('loads the login shell and keeps the route visible in the browser', async ({
    page,
  }) => {
    await openLoginPage(page);

    await expect(
      page.getByText('Entre com suas credenciais para acessar'),
    ).toBeVisible();
    await expect(page).toHaveURL(/sign-in-page/);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('img')).some(img => {
        const src = img.getAttribute('src') || '';
        return src.includes('app-domain=');
      }),
    );
  });

  test('navigates to create account and returns to login', async ({page}) => {
    await openLoginPage(page);

    await page.getByText('Criar conta', {exact: true}).click();

    await expect(page).toHaveURL(/create-account/);
    await expect(
      page
        .locator('div')
        .filter({hasText: /^Criar Conta$/})
        .first(),
    ).toBeVisible();

    await page.goBack();

    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByText('Entrar', {exact: true})).toBeVisible();
  });

  test('shows the create-account form in the browser', async ({page}) => {
    await openLoginPage(page);

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
  });
});
