import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import { env } from '@env';
import { colors } from '@controleonline/../../src/styles/colors';

export default function CreateAccountPage() {

    const isManager = env.APP_TYPE === 'MANAGER';

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

    const handleCreateAccount = async () => {

        setLoading(true);

        try {

            const payload = {
                people: {
                    document: people.document,
                    name: people.name,
                    alias: people.alias,
                    email: people.email,
                    phone: {
                        ddi: people.ddi,
                        ddd: people.ddd,
                        phone: people.phone,
                    },
                    user: {
                        user: people.user,
                        password: people.password,
                    },
                },
            };

            if (type === 'PJ') {
                payload.company = {
                    document: company.document,
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

            if (!response.ok) {
                throw new Error(json.message || 'Erro ao criar conta');
            }

            alert('Conta criada com sucesso!');

        } catch (e) {

            alert(e.message);

        } finally {

            setLoading(false);

        }
    };

    if (!isManager) {

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

    }

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
                value={people.document}
                onChangeText={v => setPeople({ ...people, document: v })}
            />

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={people.name}
                onChangeText={v => setPeople({ ...people, name: v })}
            />

            <TextInput
                style={styles.input}
                placeholder="Sobrenome / Alias"
                value={people.alias}
                onChangeText={v => setPeople({ ...people, alias: v })}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
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
                    value={people.ddi}
                    onChangeText={v => setPeople({ ...people, ddi: v })}
                />

                <TextInput
                    style={[styles.input, styles.ddd]}
                    placeholder="DDD"
                    value={people.ddd}
                    onChangeText={v => setPeople({ ...people, ddd: v })}
                />

                <TextInput
                    style={[styles.input, styles.phone]}
                    placeholder="Telefone"
                    value={people.phone}
                    onChangeText={v => setPeople({ ...people, phone: v })}
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
                        value={company.document}
                        onChangeText={v => setCompany({ ...company, document: v })}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nome da empresa"
                        value={company.name}
                        onChangeText={v => setCompany({ ...company, name: v })}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nome fantasia"
                        value={company.alias}
                        onChangeText={v => setCompany({ ...company, alias: v })}
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
                onChangeText={v => setPeople({ ...people, user: v })}
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={people.password}
                onChangeText={v => setPeople({ ...people, password: v })}
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

const styles = StyleSheet.create({

    container: {
        padding: 24,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 24,
    },

    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
    },

    section: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },

    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 12,
    },

    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },

    typeButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        borderRadius: 8,
        marginRight: 8,
    },

    typeButtonActive: {
        backgroundColor: colors.primary,
    },

    typeText: {
        color: '#000',
        fontWeight: '600',
    },

    phoneRow: {
        flexDirection: 'row',
    },

    ddi: {
        flex: 1,
        marginRight: 8,
    },

    ddd: {
        flex: 1,
        marginRight: 8,
    },

    phone: {
        flex: 3,
    },

    button: {
        marginTop: 30,
        backgroundColor: colors.primary,
        height: 54,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    qrText: {
        marginTop: 20,
        textAlign: 'center',
    },

});