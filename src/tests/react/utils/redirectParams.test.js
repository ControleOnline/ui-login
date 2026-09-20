const {
  sanitizeParamObject,
  normalizeRedirectParams,
  resolveRedirectRoute,
  getDefaultPostLoginRoute,
  getSignInPostLoginRoute,
} = require('../../../react/utils/redirectParams');

describe('redirectParams', () => {
  it('sanitizeParamObject drops blacklisted keys', () => {
    expect(
      sanitizeParamObject({store: 'auth', foo: 1, redirectRoute: 'X'}),
    ).toEqual({foo: 1});
  });

  it('sanitizeParamObject returns undefined for empty or invalid', () => {
    expect(sanitizeParamObject(null)).toBeUndefined();
    expect(sanitizeParamObject({store: 'auth'})).toBeUndefined();
  });

  it('normalizeRedirectParams parses JSON string and sanitizes', () => {
    expect(
      normalizeRedirectParams(JSON.stringify({store: 'auth', id: 9})),
    ).toEqual({id: 9});
  });

  it('resolveRedirectRoute skips ProfilePage family', () => {
    expect(
      resolveRedirectRoute(['HomePage', 'ProfilePage'], 'ProfilePage'),
    ).toBeNull();
    expect(
      resolveRedirectRoute(['HomePage', 'ShopProfilePage'], 'ProfilePage'),
    ).toBeNull();
  });

  it('getSignInPostLoginRoute prefers HomePage when redirect is skipped', () => {
    const navigation = {
      getState: () => ({routeNames: ['SignInPage', 'HomePage', 'ProfilePage']}),
    };
    expect(
      getSignInPostLoginRoute(navigation, {params: {redirectRoute: 'ProfilePage'}}),
    ).toBe('HomePage');
  });
});

  it('always returns HomePage when no redirect and empty routeNames', () => {
    const navigation = {getState: () => ({routeNames: ['SignInPage']})};
    expect(getSignInPostLoginRoute(navigation, {params: {}})).toBe('HomePage');
    expect(getDefaultPostLoginRoute(navigation)).toBe('HomePage');
  });

  it('getSignInPostLoginRoute ignores missing redirectRoute and goes Home', () => {
    const navigation = {
      getState: () => ({routeNames: ['SignInPage', 'HomePage', 'CrmIndex']}),
    };
    expect(getSignInPostLoginRoute(navigation, {})).toBe('HomePage');
    expect(getSignInPostLoginRoute(navigation, {params: null})).toBe('HomePage');
  });

describe('post-login route stability (app-community#461)', () => {
  it('getSignInPostLoginRoute never returns SignInPage', () => {
    const navigation = {
      getState: () => ({routeNames: ['SignInPage', 'HomePage', 'CrmIndex']}),
    };
    const route = {params: {redirectRoute: 'SignInPage'}};
    expect(getSignInPostLoginRoute(navigation, route)).toBe('HomePage');
  });

  it('getDefaultPostLoginRoute prefers HomePage over SignInPage', () => {
    const navigation = {
      getState: () => ({routeNames: ['SignInPage', 'HomePage']}),
    };
    expect(getDefaultPostLoginRoute(navigation)).toBe('HomePage');
  });

  it('resolveRedirectRoute rejects SignInPage as target', () => {
    expect(
      resolveRedirectRoute(['SignInPage', 'HomePage'], 'SignInPage'),
    ).toBeNull();
  });
});
