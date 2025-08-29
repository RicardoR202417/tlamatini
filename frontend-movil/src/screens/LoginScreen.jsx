// src/screens/LoginScreen.jsx
import React, { useEffect, useState } from 'react';
import { StatusBar, Alert, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import ApiService from '../api/ApiService';
import StorageService from '../services/StorageService';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

import {
  FormContainer,
  ContentContainer,
  HeaderContainer,
  SmallLogo,
  FormTitle,
  FormSubtitle,
  InputContainer,
  InputLabel,
  TextInput,
  ButtonContainer,
  PrimaryButton,
  PrimaryButtonText,
  GoogleButton,
  GoogleButtonText,
  LinkContainer,
  LinkText,
  Link,
  ErrorMessage,
  LoadingContainer
} from '../styles/AuthForms.styles';

WebBrowser.maybeCompleteAuthSession();

const OWNER = 'thedemifiend';          // 👈 tu usuario de Expo (npx expo whoami)
const SLUG  = 'frontend-movil';        // 👈 el slug de tu app (app.json/app.config.js)
const EXPERIENCE = `@${OWNER}/${SLUG}`; // para el proxy
const REDIRECT   = `https://auth.expo.io/${EXPERIENCE}`; // REGISTRADO EN GOOGLE

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ correo: '', contraseña: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userType, setUserType] = useState('');

  // Web Client ID desde .env del frontend
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();

  // Hook ÚNICO — OIDC implícito (id_token) con proxy fijo
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId,
    iosClientId,
    androidClientId,
    redirectUri: REDIRECT, // 🔒 evita exp://
    // (cuando hagas build nativo podrás pasar androidClientId/iosClientId)
  });

  // Procesa la respuesta de Google
  useEffect(() => {
    (async () => {
      if (response?.type === 'success' && response.params?.id_token) {
        try {
          setLoading(true);
          const data = await ApiService.loginWithGoogle(response.params.id_token);
          await StorageService.saveTokens(data.token, data.refresh_token);
          await StorageService.saveUserData(data.user);
          setUserType(data.user?.tipo_usuario);
          setShowSuccessModal(true);
        } catch (err) {
          setErrorMessage(err?.message || 'No se pudo iniciar sesión con Google');
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'error') {
        setErrorMessage(response?.error?.message || 'Error en autenticación con Google');
        setShowErrorModal(true);
      }
    })();
  }, [response]);

  // Validación
  const validateForm = () => {
    const e = {};
    if (!formData.correo.trim()) e.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) e.correo = 'El correo no es válido';
    if (!formData.contraseña.trim()) e.contraseña = 'La contraseña es requerida';
    else if (formData.contraseña.length < 8) e.contraseña = 'La contraseña debe tener al menos 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Login usuario/contraseña
  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const r = await ApiService.login({ correo: formData.correo, contraseña: formData.contraseña });
      await StorageService.saveTokens(r.token, r.refresh_token);
      await StorageService.saveUserData(r.user);
      setUserType(r.user?.tipo_usuario);
      setShowSuccessModal(true);
    } catch (err) {
      if (err.errors?.length) {
        const be = {};
        err.errors.forEach(x => x.path && (be[x.path] = x.msg));
        setErrors(be);
      } else {
        setErrorMessage(err.message || 'Error al iniciar sesión');
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Login con Google (único handler)
  const handleGoogleLogin = async () => {
    if (!clientId) {
      Alert.alert('Configuración', 'Falta EXPO_PUBLIC_GOOGLE_CLIENT_ID en tu .env del frontend');
      return;
    }
    if (!request) {
      Alert.alert('Espera tantito', 'La solicitud de Google aún no está lista.');
      return;
    }

    // 👇 Fuerza el proxy y amarra la experiencia para que regrese a TU app
    const res = await promptAsync({
      useProxy: true,
      projectNameForProxy: EXPERIENCE, // 🔒 asegura que el proxy abra @owner/slug
    });

    // Depuración rápida del resultado
    if (res?.type === 'error') {
      Alert.alert('Google error', JSON.stringify(res, null, 2));
    }
  };

  const handleSuccessModalPress = () => {
    setShowSuccessModal(false);
    if (userType === 'beneficiario') navigation.navigate('BeneficiarioHome');
    else if (userType === 'profesional') navigation.navigate('ProfesionalHome');
    else Alert.alert('Error', 'Tipo de usuario no válido');
  };

  const handleErrorModalPress = () => { setShowErrorModal(false); setErrorMessage(''); };
  const navigateToRegister = () => navigation.navigate('Register');
  const updateField = (f, v) => { setFormData(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(p => ({ ...p, [f]: null })); };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#3EAB37" />
      </LoadingContainer>
    );
  }

  return (
    <FormContainer contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar style="dark" />
      <ContentContainer>
        <HeaderContainer>
          <SmallLogo source={require('../../assets/logo_blanco.jpg')} resizeMode="contain" />
          <FormTitle>Iniciar Sesión</FormTitle>
          <FormSubtitle>Bienvenido de vuelta a TLAMATINI</FormSubtitle>
        </HeaderContainer>

        <InputContainer>
          <InputLabel>Correo Electrónico</InputLabel>
          <TextInput
            placeholder="correo@ejemplo.com"
            value={formData.correo}
            onChangeText={(v) => updateField('correo', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.correo && <ErrorMessage>{errors.correo}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Contraseña</InputLabel>
          <TextInput
            placeholder="Tu contraseña"
            value={formData.contraseña}
            onChangeText={(v) => updateField('contraseña', v)}
            secureTextEntry
          />
          {errors.contraseña && <ErrorMessage>{errors.contraseña}</ErrorMessage>}
        </InputContainer>

        <LinkContainer style={{ alignItems: 'flex-end', marginBottom: 20 }}>
          <Link onPress={() => Alert.alert('Próximamente', 'Función de recuperación de contraseña será implementada')}>
            ¿Se te olvidó tu contraseña?
          </Link>
        </LinkContainer>

        <ButtonContainer>
          <PrimaryButton onPress={handleLogin}>
            <PrimaryButtonText>Iniciar Sesión</PrimaryButtonText>
          </PrimaryButton>
          <GoogleButton onPress={handleGoogleLogin}>
            <GoogleButtonText>Continuar con Google</GoogleButtonText>
          </GoogleButton>
        </ButtonContainer>

        <LinkContainer>
          <LinkText>¿No tienes cuenta? <Link onPress={navigateToRegister}>Regístrate aquí</Link></LinkText>
        </LinkContainer>
      </ContentContainer>

      <SuccessModal
        visible={showSuccessModal}
        title="¡Bienvenido!"
        message={`Inicio de sesión exitoso como ${userType === 'beneficiario' ? 'Beneficiario' : 'Profesional'}`}
        buttonText="Continuar"
        onPress={handleSuccessModalPress}
      />
      <ErrorModal
        visible={showErrorModal}
        title="Error de autenticación"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={handleErrorModalPress}
      />
    </FormContainer>
  );
};

export default LoginScreen;
