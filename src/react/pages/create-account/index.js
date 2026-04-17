import React, { useState, useMemo } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import { env } from '@env';
import { colors } from '@controleonline/../../src/styles/colors';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import styles from './index.styles';

export default function CreateAccountPage() {

  const isManager = env.APP_TYPE === 'MANAGER';
  const isShop = env.APP_TYPE === 'SHOP';

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
      alert(error);
      return;
    }

    setLoading(true);

    try {

      const payload = {
        people: {
          document: Formatter.onlyNumbers(people.document),
          name: people.name,
          alias: people.alias,
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
          name: company.name,
          alias: company.alias,
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
        throw new Error(json.message || 'Erro ao criar conta');

      alert('Conta criada com sucesso!');

    } catch (e) {

      alert(e.message);

    } finally {

      setLoading(false);

    }

  };

  if (!isManager && !isShop) {

    return (
      <View style={styles.center}>

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

      <ScrollView contentContainerStyle={styles.container}>

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
            <Text style={styles.typeText}>
              Pessoa Física
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'PJ' && styles.typeButtonActive,
            ]}
            onPress={() => setType('PJ')}
          >
            <Text style={styles.typeText}>
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
          value={people.name}
          onChangeText={v => setPeople({ ...people, name: v })}
        />

        <TextInput
          style={styles.input}
          placeholder="Como quer ser chamado?"
          value={people.alias}
          onChangeText={v => setPeople({ ...people, alias: v })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
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
              value={company.name}
              onChangeText={v =>
                setCompany({ ...company, name: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Nome fantasia"
              value={company.alias}
              onChangeText={v =>
                setCompany({ ...company, alias: v })
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
          value={people.user}
          onChangeText={v =>
            setPeople({ ...people, user: v })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
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
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Criar conta</Text>
          }

        </TouchableOpacity>

      </ScrollView>

    );

  }

}
