const OAUTH_QUERY_KEYS = [
  'response_type',
  'client_id',
  'client_name',
  'redirect_uri',
  'state',
  'code_challenge',
  'code_challenge_method',
  'scope',
  'resource',
]

const firstString = value => {
  if (Array.isArray(value)) return firstString(value[0])
  return typeof value === 'string' ? value.trim() : ''
}

export const normalizeMcpOauthParams = params =>
  OAUTH_QUERY_KEYS.reduce((normalized, key) => {
    const value = firstString(params?.[key])
    if (value) normalized[key] = value
    return normalized
  }, {})

export const buildMcpOauthConsentUrl = (params, managerApp) => {
  let managerUrl
  try {
    managerUrl = new URL(String(managerApp || ''))
  } catch {
    return null
  }

  if (!['https:', 'http:'].includes(managerUrl.protocol) || !managerUrl.host) {
    return null
  }

  managerUrl.pathname = '/mcp/oauth/consent'
  managerUrl.search = ''
  managerUrl.hash = ''

  const oauthParams = normalizeMcpOauthParams(params)
  if (
    oauthParams.response_type !== 'code' ||
    !oauthParams.client_id ||
    !oauthParams.redirect_uri ||
    !oauthParams.state ||
    !oauthParams.code_challenge ||
    oauthParams.code_challenge_method !== 'S256' ||
    !oauthParams.scope
  ) {
    return null
  }

  Object.entries(oauthParams).forEach(([key, value]) =>
    managerUrl.searchParams.set(key, value),
  )

  return managerUrl.toString()
}

export const resolveMcpOauthSignInReturnUrl = (route, managerApp) => {
  // React Navigation supplies these values in route.params. Accept the
  // parameter object itself as well to keep the helper convenient in callers
  // and tests that already extracted it.
  const routeParams = route?.params || route
  if (routeParams?.redirectRoute !== 'McpOAuthConsentPage') return null

  let params = routeParams.redirectParams
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params)
    } catch {
      return null
    }
  }

  return buildMcpOauthConsentUrl(params, managerApp)
}
