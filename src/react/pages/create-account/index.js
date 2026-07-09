import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import { env } from '@env';
import {app_type} from '@appType';
import {
  formatDisplayUppercase,
  uppercaseText,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {useStore} from '@store';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import {resolveSignInTheme} from '../sign-in/index.styles';
import {createStyles} from './index.styles';

const resolveApiErrorMessage = payload =>
  payload?.['hydra:description'] ||
  payload?.message ||
  payload?.error ||
  payload?.['hydra:title'] ||
  'Erro ao criar conta';

export default function CreateAccountPage({navigation, route}) {
  const {showError, showSuccess} = useMessage();
  const themeStore = useStore('theme');
  const themeGetters = themeStore?.getters || {};
  const {colors: themeColors} = themeGetters;
  const theme = useMemo(() => resolveSignInTheme(themeColors), [themeColors]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isManager = app_type === 'MANAGER';
  const isShop = app_type === 'SHOP';

  const [type, setType] = useState('PF');
  const [loading, setLoading] = useState(false);

  const [people, setPeople] = useState({
    document: '',
    name: '',
    alias: '',
    email: '',
    ddi: '55',
    ddd: '',
    phone: '',
    user: '',
    password: '',
  });

  const [company, setCompany] = useState({
    document: '',
    name: '',
    alias: '',
  });

  const managerUrl = useMemo(() => {
    return `${env.MANAGER_APP}/create-account`;
  }, []);

  const validateForm = () => {

    if (!people.name)
      return 'Informe o nome';

    if (!Formatter.validateEmail(people.email))
      return 'Email inválido';

    if (!Formatter.validateCPF(people.document))
      return 'CPF inválido';

    if (!people.ddd || !people.phone)
      return 'Telefone inválido';

    if (!people.user)
      return 'Informe o usuário';

    if (!people.password || people.password.length < 6)
      return 'Senha deve ter pelo menos 6 caracteres';

    if (type === 'PJ') {

      if (!Formatter.validateCNPJ(company.document))
        return 'CNPJ inválido';

      if (!company.name)
        return 'Informe o nome da empresa';

    }

    return null;

  };

  const handleCreateAccount = async () => {

    const error = validateForm();

    if (error) {
      showError(error);
      return;
    }

    setLoading(true);

    try {

      const payload = {
        people: {
          document: Formatter.onlyNumbers(people.document),
          name: formatDisplayUppercase(people.name),
          alias: formatDisplayUppercase(people.alias),
          email: people.email,
          phone: {
            ddi: people.ddi,
            ddd: Formatter.onlyNumbers(people.ddd),
            phone: Formatter.onlyNumbers(people.phone),
          },
          user: {
            user: people.user,
            password: people.password,
          },
        },
      };

      if (type === 'PJ') {

        payload.company = {
          document: Formatter.onlyNumbers(company.document),
          name: formatDisplayUppercase(company.name),
          alias: formatDisplayUppercase(company.alias),
        };

      }

      const response = await fetch(
        `${env.API_ENTRYPOINT}/create-account`,
        {
          method: 'POST',
          headers: {
            'app-domain': env.DOMAIN,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await response.json();

      if (!response.ok)
        throw new Error(resolveApiErrorMessage(json));

      showSuccess(
        json?.message ||
          'Cadastro criado com sucesso. Confira seu e-mail para ativar a conta.',
      );

      setTimeout(() => {
        navigation?.navigate?.('SignInPage', {
          redirectRoute: route?.params?.redirectRoute,
          redirectParams: route?.params?.redirectParams,
        });
      }, 1200);

    } catch (e) {

      showError(e.message);

    } finally {

      setLoading(false);

    }

  };

  if (!isManager && !isShop) {

    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.pageBackground} />

        <Text style={styles.title}>
          Criar conta
        </Text>

        <Text style={styles.subtitle}>
          Escaneie o QR Code para criar sua conta no aplicativo Manager
        </Text>

        <QRCode
          value={managerUrl}
          size={240}
        />

        <Text style={styles.qrText}>
          {managerUrl}
        </Text>

      </View>
    );

  } else {

    return (

      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.pageBackground} />

        <Text style={styles.title}>
          Criar Conta
        </Text>

        <View style={styles.typeSelector}>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'PF' && styles.typeButtonActive,
            ]}
            onPress={() => setType('PF')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'PF' && styles.typeTextActive,
              ]}>
              Pessoa Física
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              styles.typeButtonLast,
              type === 'PJ' && styles.typeButtonActive,
            ]}
            onPress={() => setType('PJ')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'PJ' && styles.typeTextActive,
              ]}>
              Pessoa Jurídica
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.section}>
          Dados da Pessoa
        </Text>

        <TextInput
          style={styles.input}
          placeholder="CPF"
          placeholderTextColor={theme.inputPlaceholderText}
          keyboardType="numeric"
          maxLength={11+3} // 11 dígitos + máscara
          value={people.document}
          onChangeText={v =>
            setPeople({ ...people, document: Formatter.maskCPF(v) })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor={theme.inputPlaceholderText}
          value={people.name}
          onChangeText={v => setPeople({ ...people, name: uppercaseText(v) })}
        />

        <TextInput
          style={styles.input}
          placeholder="Como quer ser chamado?"
          placeholderTextColor={theme.inputPlaceholderText}
          value={people.alias}
          onChangeText={v => setPeople({ ...people, alias: uppercaseText(v) })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.inputPlaceholderText}
          keyboardType="email-address"
          value={people.email}
          onChangeText={v => setPeople({ ...people, email: v })}
        />

        <Text style={styles.section}>
          Telefone
        </Text>

        <View style={styles.phoneRow}>

          <TextInput
            style={[styles.input, styles.ddi]}
            placeholder="DDI"
            placeholderTextColor={theme.inputPlaceholderText}
            keyboardType="numeric"
            maxLength={3}
            value={people.ddi}
            onChangeText={v =>
              setPeople({ ...people, ddi: Formatter.onlyNumbers(v) })
            }
          />

          <TextInput
            style={[styles.input, styles.ddd]}
            placeholder="DDD"
            placeholderTextColor={theme.inputPlaceholderText}
            keyboardType="numeric"
            maxLength={2}
            value={people.ddd}
            onChangeText={v =>
              setPeople({ ...people, ddd: Formatter.onlyNumbers(v) })
            }
          />

          <TextInput
            style={[styles.input, styles.phone]}
            placeholder="Telefone"
            placeholderTextColor={theme.inputPlaceholderText}
            keyboardType="numeric"
            value={people.phone}
            onChangeText={v =>
              setPeople({ ...people, phone: Formatter.maskPhoneBR(v) })
            }
          />

        </View>

        {type === 'PJ' && (

          <>

            <Text style={styles.section}>
              Empresa
            </Text>

            <TextInput
              style={styles.input}
              placeholder="CNPJ"
              placeholderTextColor={theme.inputPlaceholderText}
              keyboardType="numeric"
              maxLength={14+4} // 14 dígitos + máscara
              value={company.document}
              onChangeText={v =>
                setCompany({ ...company, document: Formatter.maskCNPJ(v) })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Nome da empresa"
              placeholderTextColor={theme.inputPlaceholderText}
              value={company.name}
              onChangeText={v =>
                setCompany({ ...company, name: uppercaseText(v) })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Nome fantasia"
              placeholderTextColor={theme.inputPlaceholderText}
              value={company.alias}
              onChangeText={v =>
                setCompany({ ...company, alias: uppercaseText(v) })
              }
            />

          </>

        )}

        <Text style={styles.section}>
          Usuário
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor={theme.inputPlaceholderText}
          value={people.user}
          onChangeText={v =>
            setPeople({ ...people, user: v })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={theme.inputPlaceholderText}
          secureTextEntry
          value={people.password}
          onChangeText={v =>
            setPeople({ ...people, password: v })
          }
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateAccount}
          disabled={loading}
        >

          {loading
            ? <ActivityIndicator color={theme.buttonText} />
            : <Text style={styles.buttonText}>Criar conta</Text>
          }

        </TouchableOpacity>

      </ScrollView>

    );

  }

}
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores e evitar chamadas HTTP diretas quando o store ja resolver isso.
