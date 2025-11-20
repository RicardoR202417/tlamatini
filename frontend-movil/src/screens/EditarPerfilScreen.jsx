import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, ActivityIndicator, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import StorageService from '../services/StorageService';
import ApiService from '../api/ApiService';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import DatePickerModal from '../components/DatePickerModal';
import {
  FormContainer,
  ContentContainer,
  HeaderContainer,
  FormTitle,
  FormSubtitle,
  InputContainer,
  InputLabel,
  TextInput,
  ButtonContainer,
  PrimaryButton,
  PrimaryButtonText,
  ErrorMessage,
  LoadingContainer
} from '../styles/AuthForms.styles';
import styled from 'styled-components/native';

// Estilos específicos
const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 10;
  z-index: 1000;
`;

const BackIcon = styled.Text`
  font-size: 24px;
  color: #3EAB37;
  font-weight: bold;
`;

const SecondaryButton = styled.TouchableOpacity`
  border: 2px solid #3EAB37;
  border-radius: 12px;
  padding: 16px;
  align-items: center;
  background-color: transparent;
`;

const SecondaryButtonText = styled.Text`
  color: #3EAB37;
  font-size: 16px;
  font-weight: bold;
`;

const GenderContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const GenderOption = styled.TouchableOpacity`
  padding: 10px 16px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.selected ? '#3EAB37' : '#ddd'};
  background-color: ${props => props.selected ? '#3EAB37' : '#fff'};
`;

const GenderText = styled.Text`
  color: ${props => props.selected ? '#fff' : '#333'};
  font-size: 14px;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;

const DateSelectorContainer = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 8px;
`;

const DateInput = styled.TextInput`
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  background-color: #fff;
  text-align: center;
`;

const DateLabel = styled.Text`
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-bottom: 4px;
`;

const EditarPerfilScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    celular: '',
    direccion: '',
    // Campos profesionales
    especialidad: '',
    cedula_profesional: ''
  });
  const [userType, setUserType] = useState('beneficiario');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      console.log('=== LOAD USER DATA DEBUG ===');
      console.log('UserData from storage:', userData);
      
      if (userData) {
        const newFormData = {
          nombres: userData.nombres || '',
          apellidos: userData.apellidos || '',
          fecha_nacimiento: userData.fecha_nacimiento || '',
          genero: userData.genero || '',
          celular: userData.celular || '',
          direccion: userData.direccion || '',
          // Campos profesionales
          especialidad: userData.profesional?.especialidad || '',
          cedula_profesional: userData.profesional?.cedula_profesional || ''
        };

        console.log('Setting formData to:', newFormData);

        setFormData(newFormData);
        setUserType(userData.tipo_usuario || 'beneficiario');
      }
      console.log('=== END LOAD USER DATA DEBUG ===');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Error al cargar datos del usuario');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (formData.fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha_nacimiento)) {
      newErrors.fecha_nacimiento = 'Formato de fecha inválido (YYYY-MM-DD)';
    }

    if (formData.celular && formData.celular.length < 10) {
      newErrors.celular = 'El celular debe tener al menos 10 dígitos';
    }

    if (formData.direccion && formData.direccion.length > 500) {
      newErrors.direccion = 'La dirección es muy larga (máximo 500 caracteres)';
    }

    // Validaciones para profesionales
    if (userType === 'profesional') {
      if (formData.especialidad && formData.especialidad.length > 200) {
        newErrors.especialidad = 'La especialidad es muy larga (máximo 200 caracteres)';
      }

      if (formData.cedula_profesional && !/^\d{6,10}$/.test(formData.cedula_profesional)) {
        newErrors.cedula_profesional = 'La cédula debe tener entre 6 y 10 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await StorageService.getAccessToken();
      if (!token) {
        setErrorMessage('Sesión expirada. Por favor inicia sesión de nuevo.');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const updateData = {};
      
      // Campos requeridos - SIEMPRE incluir (ya validados anteriormente)
      updateData.nombres = formData.nombres.trim();
      updateData.apellidos = formData.apellidos.trim();
      
      // Campos opcionales - solo incluir si tienen valor, sino enviar null
      if (formData.fecha_nacimiento && formData.fecha_nacimiento.trim()) {
        updateData.fecha_nacimiento = formData.fecha_nacimiento.trim();
      } else {
        updateData.fecha_nacimiento = null;
      }
      
      if (formData.genero && formData.genero.trim()) {
        updateData.genero = formData.genero.trim();
      } else {
        updateData.genero = null;
      }
      
      if (formData.celular && formData.celular.trim()) {
        updateData.celular = formData.celular.trim();
      } else {
        updateData.celular = null;
      }
      
      if (formData.direccion && formData.direccion.trim()) {
        updateData.direccion = formData.direccion.trim();
      } else {
        updateData.direccion = null;
      }

      // Campos profesionales - Solo para profesionales
      if (userType === 'profesional') {
        if (formData.especialidad && formData.especialidad.trim()) {
          updateData.especialidad = formData.especialidad.trim();
        } else {
          updateData.especialidad = null;
        }
        
        if (formData.cedula_profesional && formData.cedula_profesional.trim()) {
          updateData.cedula_profesional = formData.cedula_profesional.trim();
        } else {
          updateData.cedula_profesional = null;
        }
      }

      const response = await ApiService.updateProfile(updateData, token);

      // Actualizar datos locales con la respuesta completa del servidor
      await StorageService.saveUserData(response.user);

      setLoading(false);
      setShowSuccessModal(true);

    } catch (error) {
      setLoading(false);
      console.error('Error al actualizar perfil:', error);
      
      if (error.errors && error.errors.length > 0) {
        const backendErrors = {};
        error.errors.forEach(err => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        setErrorMessage(error.message || 'Error al actualizar perfil');
        setShowErrorModal(true);
      }
    }
  };

  const handleSuccessModalPress = () => {
    setShowSuccessModal(false);
    // Navegar inmediatamente sin delay
    setTimeout(() => {
      navigation.goBack();
    }, 100); // Pequeño delay para que se cierre el modal suavemente
  };

  const handleErrorModalPress = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const confirmDate = (formattedDate) => {
    updateField('fecha_nacimiento', formattedDate);
    setShowDatePicker(false);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (initialLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#3EAB37" />
        <Text style={{ marginTop: 16, color: '#3EAB37' }}>Cargando información...</Text>
      </LoadingContainer>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <FormContainer contentContainerStyle={{ flexGrow: 1 }}>
        <StatusBar style="dark" />
        
        {/* Botón de regreso */}
        <BackButton onPress={goBack}>
          <BackIcon>←</BackIcon>
        </BackButton>
      
      <ContentContainer>
        <HeaderContainer>
          <FormTitle style={{ color: '#3EAB37' }}>Editar Perfil</FormTitle>
          <FormSubtitle>Completa tu información personal</FormSubtitle>
        </HeaderContainer>

        <InputContainer>
          <InputLabel>Nombres *</InputLabel>
          <TextInput
            placeholder="Tus nombres"
            value={formData.nombres}
            onChangeText={(value) => updateField('nombres', value)}
          />
          {errors.nombres && <ErrorMessage>{errors.nombres}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Apellidos *</InputLabel>
          <TextInput
            placeholder="Tus apellidos"
            value={formData.apellidos}
            onChangeText={(value) => updateField('apellidos', value)}
          />
          {errors.apellidos && <ErrorMessage>{errors.apellidos}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Fecha de Nacimiento</InputLabel>
          <Text style={{ 
            fontSize: 12, 
            color: '#888', 
            marginBottom: 8 
          }}>
            Toca para seleccionar tu fecha de nacimiento
          </Text>
          
          <TouchableOpacity
            onPress={showDatePickerModal}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 16,
              backgroundColor: '#fff',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              color: formData.fecha_nacimiento ? '#333' : '#999' 
            }}>
              {formData.fecha_nacimiento || 'Seleccionar fecha'}
            </Text>
            <Text style={{ fontSize: 16, color: '#3EAB37' }}>📅</Text>
          </TouchableOpacity>

          <DatePickerModal
            visible={showDatePicker}
            onClose={closeDatePicker}
            onConfirm={confirmDate}
            initialDate={formData.fecha_nacimiento}
          />
          
          {errors.fecha_nacimiento && <ErrorMessage>{errors.fecha_nacimiento}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Género</InputLabel>
          <GenderContainer>
            {['masculino', 'femenino', 'no binario', 'prefiero no decirlo'].map((option) => (
              <GenderOption
                key={option}
                selected={formData.genero === option}
                onPress={() => updateField('genero', option)}
              >
                <GenderText selected={formData.genero === option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </GenderText>
              </GenderOption>
            ))}
          </GenderContainer>
          {errors.genero && <ErrorMessage>{errors.genero}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Celular</InputLabel>
          <Text style={{ 
            fontSize: 12, 
            color: '#888', 
            marginBottom: 8 
          }}>
            Incluye código de área (ejemplo: 5512345678)
          </Text>
          <TextInput
            placeholder="5512345678"
            value={formData.celular}
            onChangeText={(value) => updateField('celular', value)}
            keyboardType="phone-pad"
            maxLength={15}
          />
          {errors.celular && <ErrorMessage>{errors.celular}</ErrorMessage>}
        </InputContainer>

        <InputContainer>
          <InputLabel>Dirección</InputLabel>
          <Text style={{ 
            fontSize: 12, 
            color: '#888', 
            marginBottom: 8 
          }}>
            Incluye calle, número, colonia y ciudad
          </Text>
          <TextInput
            placeholder="Calle Principal 123, Colonia Centro, Ciudad"
            value={formData.direccion}
            onChangeText={(value) => updateField('direccion', value)}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />
          {errors.direccion && <ErrorMessage>{errors.direccion}</ErrorMessage>}
        </InputContainer>

        {/* Campos profesionales - Solo para profesionales */}
        {userType === 'profesional' && (
          <>
            <InputContainer>
              <InputLabel>Especialidad Profesional</InputLabel>
              <Text style={{ 
                fontSize: 12, 
                color: '#888', 
                marginBottom: 8 
              }}>
                Tu área de especialización (psicología, trabajo social, etc.)
              </Text>
              <TextInput
                placeholder="Ej: Psicología Clínica, Trabajo Social"
                value={formData.especialidad}
                onChangeText={(value) => updateField('especialidad', value)}
                maxLength={200}
              />
              {errors.especialidad && <ErrorMessage>{errors.especialidad}</ErrorMessage>}
            </InputContainer>

            <InputContainer>
              <InputLabel>Cédula Profesional</InputLabel>
              <Text style={{ 
                fontSize: 12, 
                color: '#888', 
                marginBottom: 8 
              }}>
                Tu número de cédula profesional (solo números)
              </Text>
              <TextInput
                placeholder="1234567890"
                value={formData.cedula_profesional}
                onChangeText={(value) => updateField('cedula_profesional', value)}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.cedula_profesional && <ErrorMessage>{errors.cedula_profesional}</ErrorMessage>}
            </InputContainer>
          </>
        )}

        <ButtonContainer>
          <PrimaryButton 
            onPress={handleUpdateProfile}
            disabled={loading}
            style={{ backgroundColor: loading ? '#ccc' : '#3EAB37' }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <PrimaryButtonText>Guardar Cambios</PrimaryButtonText>
            )}
          </PrimaryButton>

          <SecondaryButton onPress={goBack} style={{ marginTop: 12 }}>
            <SecondaryButtonText>Cancelar</SecondaryButtonText>
          </SecondaryButton>
        </ButtonContainer>

        <Text style={{ 
          fontSize: 12, 
          color: '#888', 
          textAlign: 'center',
          marginTop: 20,
          paddingHorizontal: 20
        }}>
          Los campos marcados con * son obligatorios.{'\n'}
          {userType === 'profesional' ? 
            'Como profesional, tu especialidad y cédula ayudan a los beneficiarios a conocer tu experiencia.' :
            'Tu información está protegida y solo será visible para los profesionales cuando agendes una cita.'
          }
        </Text>
      </ContentContainer>

      <SuccessModal
        visible={showSuccessModal}
        title="¡Perfil actualizado!"
        message="Tu información ha sido actualizada correctamente."
        buttonText="Continuar"
        onPress={handleSuccessModalPress}
      />

      <ErrorModal
        visible={showErrorModal}
        title="Error al actualizar"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={handleErrorModalPress}
      />
    </FormContainer>
    </KeyboardAvoidingView>
  );
};

export default EditarPerfilScreen;
