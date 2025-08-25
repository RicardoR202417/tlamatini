import React, { useState } from 'react';
import { StatusBar, Alert, ActivityIndicator } from 'react-native';
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

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userType, setUserType] = useState('');

  // Validación de campos
  const validateForm = () => {
    const newErrors = {};

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.contraseña.trim()) {
      newErrors.contraseña = 'La contraseña es requerida';
    } else if (formData.contraseña.length < 8) {
      newErrors.contraseña = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await ApiService.login({
        correo: formData.correo,
        contraseña: formData.contraseña
      });

      // Guardar tokens y datos del usuario
      await StorageService.saveTokens(response.token, response.refresh_token);
      await StorageService.saveUserData(response.user);

      setLoading(false);
      
      // Navegar según tipo de usuario
      const { tipo_usuario } = response.user;
      console.log('Usuario autenticado:', response.user);
      console.log('Tipo de usuario:', tipo_usuario);
      
      // Mostrar modal de éxito personalizado
      setUserType(tipo_usuario);
      setShowSuccessModal(true);

    } catch (error) {
      setLoading(false);
      
      // Manejar errores de validación del backend
      if (error.errors && error.errors.length > 0) {
        const backendErrors = {};
        error.errors.forEach(err => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        // Mostrar modal de error personalizado
        setErrorMessage(error.message || 'Error al iniciar sesión');
        setShowErrorModal(true);
      }
    }
  };

  // Manejar éxito del modal
  const handleSuccessModalPress = () => {
    setShowSuccessModal(false);
    if (userType === 'beneficiario') {
      navigation.navigate('BeneficiarioHome');
    } else if (userType === 'profesional') {
      navigation.navigate('ProfesionalHome');
    } else {
      console.warn('Tipo de usuario no reconocido:', userType);
      Alert.alert('Error', 'Tipo de usuario no válido');
    }
  };

  // Manejar cierre del modal de error
  const handleErrorModalPress = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // Manejar login con Google
  const handleGoogleLogin = () => {
    // TODO: Implementar Firebase Auth con Google
    console.log('Login con Google');
    Alert.alert('Próximamente', 'Login con Google será implementado');
  };

  // Navegar a registro
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  // Actualizar campo
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

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
          <SmallLogo
            source={require('../../assets/logo_blanco.jpg')}
            resizeMode="contain"
          />
          <FormTitle>Iniciar Sesión</FormTitle>
          <FormSubtitle>Bienvenido de vuelta a TLAMATINI</FormSubtitle>
        </HeaderContainer>

        <InputContainer>
          <InputLabel>Correo Electrónico</InputLabel>
          <TextInput
            placeholder="correo@ejemplo.com"
            value={formData.correo}
            onChangeText={(value) => updateField('correo', value)}
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
            onChangeText={(value) => updateField('contraseña', value)}
            secureTextEntry
          />
          {errors.contraseña && <ErrorMessage>{errors.contraseña}</ErrorMessage>}
        </InputContainer>

        {/* Enlace de olvidé mi contraseña */}
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
          <LinkText>
            ¿No tienes cuenta?{' '}
            <Link onPress={navigateToRegister}>Regístrate aquí</Link>
          </LinkText>
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
