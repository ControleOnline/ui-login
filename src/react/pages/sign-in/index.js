import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useFocusEffect} from '@react-navigation/native';

import {useStores} from '@store';

export default function SignIn({navigation}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const authStore = useStores(state => state.auth);
  const getters = authStore.getters;
  const actions = authStore.actions;
  const {isLogged} = getters;

  useFocusEffect(
    useCallback(() => {
      if (actions.isLogged()) {
        navigation.navigate('HomePage');
      }
    }, [isLogged]),
  );

  const handleSignIn = () => {
    actions
      .signIn({
        username: username,
        password: password,
      })
      .then(data => {
        navigation.navigate('HomePage');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View
        animation="fadeInLeft"
        delay={500}
        style={styles.wrapHeaderLogin}>
        <Text style={styles.headerLoginTitle}>Bem-vindo(a)</Text>
      </Animatable.View>
      <Animatable.View
        animation="fadeInUp"
        delay={600}
        style={styles.containerLogin}>
        <TextInput
          placeholderTextColor="#666"
          style={[styles.textInput, {color: '#666'}]}
          placeholder="Usuário"
          onChangeText={text => setUsername(text)}
        />
        <TextInput
          placeholderTextColor="#666"
          style={[styles.textInput, {color: '#666'}]}
          placeholder="Senha"
          secureTextEntry={true}
          onChangeText={text => setPassword(text)}
        />
        <TouchableOpacity style={styles.boxLoginButton} onPress={handleSignIn}>
          <Text style={styles.boxLoginButtonText}>Acessar</Text>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5587',
    justifyContent: 'center',
  },
  wrapHeaderLogin: {
    paddingStart: '5%',
    marginTop: '14%',
    marginBottom: '8%',
  },
  headerLoginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  containerLogin: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: 30,
    paddingTop: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  textInput: {
    backgroundColor: '#f4f4f4',
    marginBottom: 10,
    padding: 15,
    borderRadius: 7,
  },
  boxLoginButton: {
    alignItems: 'center',
    backgroundColor: '#1B5587',
    padding: 15,
    borderRadius: 7,
  },
  boxLoginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
