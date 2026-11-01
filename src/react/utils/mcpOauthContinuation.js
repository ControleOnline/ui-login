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

/**
 * Read OAuth query keys from a URL search string (e.g. window.location.search).
 * React Navigation web often does not map query string into route.params.
 */
export const readMcpOauthParamsFromSearch = search => {
  if (typeof search !== 'string' || search === '') {
    return {}
  }

  try {
    const query = search.startsWith('?') ? search.slice(1) : search
    const sp = new URLSearchParams(query)
    const params = {}
    OAUTH_QUERY_KEYS.forEach(key => {
      const value = firstString(sp.get(key))
      if (value) params[key] = value
    })
    return params
  } catch {
    return {}
  }
}

/**
 * Prefer route params; fill missing OAuth keys from the browser query string.
 */
export const resolveMcpOauthParams = (routeParams, locationSearch = '') => {
  const fromRoute = normalizeMcpOauthParams(routeParams)
  const fromSearch = readMcpOauthParamsFromSearch(locationSearch)
  return normalizeMcpOauthParams({...fromSearch, ...fromRoute})
}

export const isCompleteMcpOauthParams = params => {
  const oauthParams = normalizeMcpOauthParams(params)
  return (
    oauthParams.response_type === 'code' &&
    Boolean(oauthParams.client_id) &&
    Boolean(oauthParams.redirect_uri) &&
    Boolean(oauthParams.state) &&
    Boolean(oauthParams.code_challenge) &&
    oauthParams.code_challenge_method === 'S256' &&
    Boolean(oauthParams.scope)
  )
}

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
  if (!isCompleteMcpOauthParams(oauthParams)) {
    return null
  }

  Object.entries(oauthParams).forEach(([key, value]) =>
    managerUrl.searchParams.set(key, value),
  )

  return managerUrl.toString()
}

export const resolveMcpOauthSignInReturnUrl = (route, managerApp) => {
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
