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
