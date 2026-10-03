import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native'
import {useStore} from '@store'
import styles from './index.styles'
import {api} from '@controleonline/ui-common/src/api'
import {env as APP_ENV} from '@env'
import {
  buildMcpOauthConsentUrl,
  normalizeMcpOauthParams,
} from '../../utils/mcpOauthContinuation'

const getCallbackHost = value => {
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}

export default function McpOAuthConsentPage({navigation, route}) {
  const authStore = useStore('auth')
  const {isLogged, sessionChecked} = authStore.getters
  const authActions = authStore.actions
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const oauthParams = useMemo(
    () => normalizeMcpOauthParams(route?.params),
    [route?.params],
  )
  const consentUrl = useMemo(
    () => buildMcpOauthConsentUrl(oauthParams, APP_ENV?.MANAGER_APP),
    [oauthParams],
  )

  useEffect(() => {
    if (!sessionChecked) {
      authActions.restoreSession().catch(() => authActions.logIn(null))
    }
  }, [authActions, sessionChecked])

  useEffect(() => {
    if (Platform.OS !== 'web' || !consentUrl || typeof window === 'undefined') {
      return
    }

    const expected = new URL(consentUrl)
    const current = new URL(window.location.href)
    if (
      current.origin !== expected.origin ||
      current.pathname !== expected.pathname ||
      current.search !== expected.search
    ) {
      window.location.replace(expected.toString())
    }
  }, [consentUrl])

  const signIn = useCallback(() => {
    navigation.navigate('SignInPage', {
      redirectRoute: 'McpOAuthConsentPage',
      redirectParams: JSON.stringify(oauthParams),
    })
  }, [navigation, oauthParams])

  const decide = useCallback(
    async decision => {
      if (!consentUrl || busy) return
      setBusy(true)
      setStatus('')

      try {
        const response = await api.fetch('/oauth/authorize', {
          method: 'POST',
          body: {...oauthParams, decision},
        })
        const redirectTo = response?.redirect_to

        if (typeof redirectTo !== 'string') {
          throw new Error('A API não retornou o endereço seguro de retorno.')
        }

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.assign(redirectTo)
          return
        }

        setStatus('Abra esta tela em um navegador para concluir a conexão.')
      } catch (error) {
        setStatus(error?.message || 'Não foi possível concluir a autorização.')
      } finally {
        setBusy(false)
      }
    },
    [busy, consentUrl, oauthParams],
  )

  const callbackHost = getCallbackHost(oauthParams.redirect_uri)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>ControleOnline · Conexão MCP</Text>
          <Text style={styles.title}>Autorizar consultas?</Text>
          {!consentUrl ? (
            <Text style={styles.body}>
              A solicitação de autorização está incompleta ou é inválida. Feche
              esta tela e inicie a conexão novamente no aplicativo MCP.
            </Text>
          ) : !sessionChecked ? (
            <ActivityIndicator />
          ) : !isLogged ? (
            <>
              <Text style={styles.body}>
                Entre na sua conta ControleOnline para revisar esta solicitação.
                Sua senha e a chave de API nunca são enviadas ao aplicativo MCP.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={signIn}
                style={[styles.button, styles.approve]}>
                <Text style={styles.approveText}>Entrar na conta</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.body}>
                {oauthParams.client_name || 'Um aplicativo MCP'} solicita
                acesso de consulta à sua conta. As consultas continuarão
                limitadas às empresas que seu usuário pode acessar. Esta
                autorização não permite criar, alterar ou excluir dados.
              </Text>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Aplicativo</Text>
                <Text style={styles.detailText}>
                  {oauthParams.client_name || 'Aplicativo MCP'}
                </Text>
                <Text style={styles.detailLabel}>Retorno registrado</Text>
                <Text style={styles.detailText}>{callbackHost}</Text>
                <Text style={styles.detailLabel}>Permissão solicitada</Text>
                <Text style={styles.detailText}>
                  Consulta de vendas, faturas e produtos nas empresas que seu
                  usuário pode acessar ({oauthParams.scope}).
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => decide('deny')}
                  style={[styles.button, styles.deny]}>
                  <Text style={styles.denyText}>Não autorizar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => decide('approve')}
                  style={[styles.button, styles.approve]}>
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.approveText}>Autorizar consulta</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
