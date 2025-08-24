import React, { useState } from 'react';
import { StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../api/ApiService';
import StorageService from '../services/StorageService';
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
  PickerContainer,
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
      Alert.alert('Éxito', 'Registro completado exitosamente', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.navigate('Login');
          }
        }
      ]);

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
        Alert.alert('Error', error.message || 'Error al registrar usuario');
      }
    }
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
            source={{ uri: 'https://via.placeholder.com/80x80/FFFFFF/3EAB37?text=LOGO' }}
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
          <PickerContainer>
            <Picker
              selectedValue={formData.tipo_usuario}
              onValueChange={(value) => updateField('tipo_usuario', value)}
            >
              <Picker.Item label="Beneficiario" value="beneficiario" />
              <Picker.Item label="Profesional" value="profesional" />
            </Picker>
          </PickerContainer>
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
    </FormContainer>
  );
};

export default RegisterScreen;
