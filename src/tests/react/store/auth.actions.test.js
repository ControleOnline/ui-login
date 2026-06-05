const {jest} = require('@jest/globals')

const {beforeEach, describe, expect, it} = global

jest.mock('@controleonline/ui-common/src/api', () => ({
  api: {
    fetch: jest.fn(),
  },
}))

const {api} = require('@controleonline/ui-common/src/api')
const actions = require('../../../store/modules/auth/actions')
const types = require('../../../store/modules/auth/mutation_types')

const createStorage = initialEntries => {
  const store = new Map(Object.entries(initialEntries || {}))

  return {
    getItem: jest.fn(key => (store.has(key) ? store.get(key) : null)),
    removeItem: jest.fn(key => store.delete(key)),
    setItem: jest.fn((key, value) => store.set(key, String(value))),
  }
}

describe('auth restoreSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clears only the invalid session and keeps other local data', async () => {
    const session = {
      id: 9,
      people: 15,
      api_key: 'expired-token',
      active: 1,
    }

    global.localStorage = createStorage({
      device: JSON.stringify({id: 'device-1'}),
      session: JSON.stringify(session),
    })

    api.fetch.mockRejectedValueOnce(new Error('Access denied'))

    const commit = jest.fn()

    await actions.restoreSession({commit})

    expect(api.fetch).toHaveBeenCalledWith('people/15', {})
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('session')
    expect(global.localStorage.getItem('device')).toBe(
      JSON.stringify({id: 'device-1'}),
    )
    expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_USER, null)
    expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_IS_LOGGED, false)
    expect(commit).toHaveBeenLastCalledWith(
      types.LOGIN_SET_SESSION_CHECKED,
      true,
    )
  })

  it('restores the session only after validation succeeds', async () => {
    const session = {
      id: 7,
      people: 21,
      api_key: 'valid-token',
      active: 1,
    }

    global.localStorage = createStorage({
      session: JSON.stringify(session),
    })

    api.fetch.mockResolvedValueOnce({response: {data: {active: true}}})

    const commit = jest.fn()

    const restored = await actions.restoreSession({commit})

    expect(restored).toEqual(session)
    expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_USER, session)
    expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_IS_LOGGED, true)
    expect(commit).toHaveBeenLastCalledWith(
      types.LOGIN_SET_SESSION_CHECKED,
      true,
    )
  })

  it('restores the session using people details endpoint', async () => {
    const session = {
      id: 8,
      people: 33,
      api_key: 'valid-token',
      active: 1,
    }

    global.localStorage = createStorage({
      session: JSON.stringify(session),
    })

    api.fetch.mockResolvedValueOnce({id: 33, enable: true})

    const commit = jest.fn()

    const restored = await actions.restoreSession({commit})

    expect(restored).toEqual(session)
    expect(api.fetch).toHaveBeenCalledTimes(1)
    expect(api.fetch).toHaveBeenCalledWith('people/33', {})
    expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_USER, session)
    expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_IS_LOGGED, true)
  })
})
