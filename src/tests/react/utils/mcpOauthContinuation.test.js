import {
  buildMcpOauthConsentUrl,
  readMcpOauthParamsFromSearch,
  resolveMcpOauthParams,
  resolveMcpOauthSignInReturnUrl,
  isCompleteMcpOauthParams,
} from '../../../react/utils/mcpOauthContinuation'

const oauthParams = {
  response_type: 'code',
  client_id: 'signed-client-id',
  redirect_uri: 'http://localhost:4321/callback',
  state: 'opaque-state',
  code_challenge: 'a'.repeat(43),
  code_challenge_method: 'S256',
  scope: 'mcp:read',
  resource: 'https://api.example.test/mcp',
}

describe('MCP OAuth browser continuation', () => {
  it('builds the consent URL on MANAGER_APP and preserves only OAuth parameters', () => {
    const url = new URL(
      buildMcpOauthConsentUrl(
        {...oauthParams, api_key: 'must-not-be-forwarded'},
        'https://manager.example/base',
      ),
    )

    expect(url.origin).toBe('https://manager.example')
    expect(url.pathname).toBe('/mcp/oauth/consent')
    expect(url.searchParams.get('redirect_uri')).toBe(oauthParams.redirect_uri)
    expect(url.searchParams.get('resource')).toBe(oauthParams.resource)
    expect(url.searchParams.has('api_key')).toBe(false)
  })

  it('does not allow OAuth parameters to choose the consent origin', () => {
    const url = new URL(
      buildMcpOauthConsentUrl(
        {...oauthParams, manager_app: 'https://attacker.example'},
        'https://manager.example',
      ),
    )

    expect(url.origin).toBe('https://manager.example')
  })

  it('reads OAuth params from the browser query string', () => {
    const search = new URLSearchParams(oauthParams).toString()
    expect(readMcpOauthParamsFromSearch(`?${search}`)).toEqual(oauthParams)
    expect(isCompleteMcpOauthParams(readMcpOauthParamsFromSearch(`?${search}`))).toBe(
      true,
    )
  })

  it('fills incomplete route params from the query string', () => {
    const search = new URLSearchParams(oauthParams).toString()
    expect(resolveMcpOauthParams({}, `?${search}`)).toEqual(oauthParams)
    expect(
      resolveMcpOauthParams({client_id: 'from-route'}, `?${search}`).client_id,
    ).toBe('from-route')
  })

  it('restores the consent flow after the login page reloads', () => {
    expect(
      resolveMcpOauthSignInReturnUrl(
        {
          params: {
            redirectRoute: 'McpOAuthConsentPage',
            redirectParams: JSON.stringify(oauthParams),
          },
        },
        'https://manager.example',
      ),
    ).toContain('https://manager.example/mcp/oauth/consent?')
  })

  it('ignores unrelated sign-in redirects', () => {
    expect(
      resolveMcpOauthSignInReturnUrl(
        {redirectRoute: 'HomePage', redirectParams: JSON.stringify(oauthParams)},
        'https://manager.example',
      ),
    ).toBeNull()
  })
})
