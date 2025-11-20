import React, { useState } from 'react';
import { StatusBar, Alert, ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
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

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    tipo_usuario: 'beneficiario'
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

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

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

    if (formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
    }

    if (formData.tipo_usuario === 'administrador') {
      newErrors.tipo_usuario = 'No se permite el registro como administrador';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await ApiService.register({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        contraseña: formData.contraseña,
        tipo_usuario: formData.tipo_usuario
      });

      // Guardar tokens y datos del usuario
      await StorageService.saveTokens(response.token, response.refresh_token);
      await StorageService.saveUserData(response.user);

      setLoading(false);
      
      // Navegar según tipo de usuario registrado
      const { tipo_usuario } = response.user;
      console.log('Usuario registrado:', response.user);
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
        setErrorMessage(error.message || 'Error al registrar usuario');
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
      // Fallback al login si hay algún problema
      navigation.navigate('Login');
    }
  };

  // Manejar cierre del modal de error
  const handleErrorModalPress = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // Manejar registro con Google
  const handleGoogleRegister = () => {
    // TODO: Implementar Firebase Auth con Google
    console.log('Registro con Google');
    Alert.alert('Próximamente', 'Registro con Google será implementado');
  };

  // Navegar a login
  const navigateToLogin = () => {
    navigation.navigate('Login');
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
          <FormTitle>Crear Cuenta</FormTitle>
          <FormSubtitle>Únete a la comunidad TLAMATINI</FormSubtitle>
        </HeaderContainer>

        <InputContainer>
          <InputLabel>Nombres</InputLabel>
          <TextInput
            placeholder="Tus nombres"
            value={formData.nombres}
            onChangeText={(value) => updateField('nombres', value)}
          />
          {errors.nombres && <ErrorMessage>{errors.nombres}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Apellidos</InputLabel>
          <TextInput
            placeholder="Tus apellidos"
            value={formData.apellidos}
            onChangeText={(value) => updateField('apellidos', value)}
          />
          {errors.apellidos && <ErrorMessage>{errors.apellidos}</ErrorMessage>}
        </InputContainer>

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
            placeholder="Mínimo 8 caracteres"
            value={formData.contraseña}
            onChangeText={(value) => updateField('contraseña', value)}
            secureTextEntry
          />
          {errors.contraseña && <ErrorMessage>{errors.contraseña}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Confirmar Contraseña</InputLabel>
          <TextInput
            placeholder="Repite tu contraseña"
            value={formData.confirmarContraseña}
            onChangeText={(value) => updateField('confirmarContraseña', value)}
            secureTextEntry
          />
          {errors.confirmarContraseña && <ErrorMessage>{errors.confirmarContraseña}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Tipo de Usuario</InputLabel>
          <Text style={{ 
            fontSize: 14, 
            color: '#666', 
            marginBottom: 10, 
            lineHeight: 20 
          }}>
            Selecciona tu rol en la plataforma:
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: '#888', 
            marginBottom: 15, 
            lineHeight: 18 
          }}>
            • <Text style={{ fontWeight: 'bold', color: '#3EAB37' }}>Beneficiario:</Text> Participa en programas de la asociación y agenda citas con profesionales.{'\n'}
            • <Text style={{ fontWeight: 'bold', color: '#3EAB37' }}>Profesional:</Text> Ofrece servicios especializados y agenda citas con beneficiarios.
          </Text>
          
          {/* Selector personalizado con botones */}
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: formData.tipo_usuario === 'beneficiario' ? '#3EAB37' : 'white',
                borderWidth: 2,
                borderColor: formData.tipo_usuario === 'beneficiario' ? '#3EAB37' : '#ddd',
                borderRadius: 12,
                padding: 15,
                marginBottom: 10,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => updateField('tipo_usuario', 'beneficiario')}
            >
              <Text style={{ 
                fontSize: 24, 
                marginRight: 12,
                color: formData.tipo_usuario === 'beneficiario' ? 'white' : '#3EAB37'
              }}>
                👥
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: formData.tipo_usuario === 'beneficiario' ? 'white' : '#333',
                  marginBottom: 4
                }}>
                  Beneficiario
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: formData.tipo_usuario === 'beneficiario' ? '#f0f0f0' : '#666'
                }}>
                  Participa en programas y agenda citas
                </Text>
              </View>
              {formData.tipo_usuario === 'beneficiario' && (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#3EAB37', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: formData.tipo_usuario === 'profesional' ? '#3EAB37' : 'white',
                borderWidth: 2,
                borderColor: formData.tipo_usuario === 'profesional' ? '#3EAB37' : '#ddd',
                borderRadius: 12,
                padding: 15,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => updateField('tipo_usuario', 'profesional')}
            >
              <Text style={{ 
                fontSize: 24, 
                marginRight: 12,
                color: formData.tipo_usuario === 'profesional' ? 'white' : '#3EAB37'
              }}>
                💼
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: formData.tipo_usuario === 'profesional' ? 'white' : '#333',
                  marginBottom: 4
                }}>
                  Profesional
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: formData.tipo_usuario === 'profesional' ? '#f0f0f0' : '#666'
                }}>
                  Ofrece servicios especializados
                </Text>
              </View>
              {formData.tipo_usuario === 'profesional' && (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#3EAB37', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {errors.tipo_usuario && <ErrorMessage>{errors.tipo_usuario}</ErrorMessage>}
        </InputContainer>

        <ButtonContainer>
          <PrimaryButton onPress={handleRegister}>
            <PrimaryButtonText>Crear Cuenta</PrimaryButtonText>
          </PrimaryButton>

          <GoogleButton onPress={handleGoogleRegister}>
            <GoogleButtonText>Registrarse con Google</GoogleButtonText>
          </GoogleButton>
        </ButtonContainer>

        <LinkContainer>
          <LinkText>
            ¿Ya tienes cuenta?{' '}
            <Link onPress={navigateToLogin}>Inicia sesión aquí</Link>
          </LinkText>
        </LinkContainer>
      </ContentContainer>

      <SuccessModal
        visible={showSuccessModal}
        title="¡Cuenta creada!"
        message={`Te has registrado exitosamente como ${userType === 'beneficiario' ? 'Beneficiario' : 'Profesional'}. ¡Bienvenido a TLAMATINI!`}
        buttonText="Comenzar"
        onPress={handleSuccessModalPress}
      />

      <ErrorModal
        visible={showErrorModal}
        title="Error en el registro"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={handleErrorModalPress}
      />
    </FormContainer>
  );
};

export default RegisterScreen;
