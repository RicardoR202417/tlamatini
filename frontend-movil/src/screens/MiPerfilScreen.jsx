import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import ApiService from '../api/ApiService';
import ConfirmModal from '../components/ConfirmModal';
import ErrorModal from '../components/ErrorModal';
import {
  Container,
  ScrollContainer,
  ContentContainer,
  HeaderContainer,
  WelcomeText,
  SubtitleText,
  SectionContainer,
  SectionTitle,
  SectionDescription,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
  Divider
} from '../styles/BeneficiarioHome.styles';
import styled from 'styled-components/native';

// Estilos específicos para esta pantalla
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
  color: #6366f1;
  font-weight: bold;
`;

const ProfileCard = styled.View`
  background-color: white;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 20px;
  shadow-color: #3EAB37;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 8;
  align-items: center;
  border-width: 1px;
  border-color: rgba(62, 171, 55, 0.1);
`;

const ProfileAvatar = styled.View`
  width: 90px;
  height: 90px;
  border-radius: 45px;
  background-color: #3EAB37;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  shadow-color: #3EAB37;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
  border-width: 3px;
  border-color: rgba(255, 255, 255, 0.2);
`;

const AvatarText = styled.Text`
  font-size: 32px;
  color: white;
  font-weight: bold;
`;

const ProfileName = styled.Text`
  font-size: 26px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: 0.5px;
`;

const ProfileEmail = styled.Text`
  font-size: 16px;
  color: #3EAB37;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 500;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom-width: 1px;
  border-bottom-color: rgba(62, 171, 55, 0.1);
`;

const InfoLabel = styled.Text`
  font-size: 16px;
  color: #4a5568;
  font-weight: 600;
`;

const InfoValue = styled.Text`
  font-size: 16px;
  color: #2d3748;
  font-weight: 700;
  max-width: 180px;
  text-align: right;
`;

const MiPerfilScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    contrasena_actual: '',
    nueva_contrasena: '',
    confirmar_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    
    // Listener para recargar datos cuando regrese de editar perfil
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Primero obtener el token
      const token = await StorageService.getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Sesión expirada');
        navigation.navigate('Login');
        return;
      }

      console.log('=== MI PERFIL DEBUG ===');
      console.log('Obteniendo datos del perfil desde el servidor...');
      
      // Obtener datos actualizados del servidor
      const response = await ApiService.getProfile(token);
      console.log('Respuesta del servidor:', response);
      
      if (response.user) {
        // Actualizar el storage con los datos más recientes
        await StorageService.saveUserData(response.user);
        setUserData(response.user);
        console.log('Datos del perfil actualizados:', response.user);
      } else {
        throw new Error('No se recibieron datos del usuario');
      }
      
      console.log('=== END MI PERFIL DEBUG ===');
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback: intentar cargar desde storage local
      try {
        const localUser = await StorageService.getUserData();
        if (localUser) {
          setUserData(localUser);
          console.log('Datos cargados desde storage local como fallback');
        } else {
          Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
          navigation.goBack();
        }
      } catch (localError) {
        console.error('Error con storage local:', localError);
        Alert.alert('Error', 'Error al cargar el perfil');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditarPerfil');
  };

  const handleChangePassword = () => {
    setPasswordData({
      contrasena_actual: '',
      nueva_contrasena: '',
      confirmar_password: ''
    });
    setPasswordErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.contrasena_actual.trim()) {
      errors.contrasena_actual = 'La contraseña actual es requerida';
    }

    if (!passwordData.nueva_contrasena.trim()) {
      errors.nueva_contrasena = 'La nueva contraseña es requerida';
    } else if (passwordData.nueva_contrasena.length < 8) {
      errors.nueva_contrasena = 'La nueva contraseña debe tener al menos 8 caracteres';
    }

    if (!passwordData.confirmar_password.trim()) {
      errors.confirmar_password = 'Debe confirmar la nueva contraseña';
    } else if (passwordData.nueva_contrasena !== passwordData.confirmar_password) {
      errors.confirmar_password = 'Las contraseñas nuevas no coinciden';
    }

    if (passwordData.contrasena_actual === passwordData.nueva_contrasena) {
      errors.nueva_contrasena = 'La nueva contraseña debe ser diferente a la actual';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const confirmChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      const token = await StorageService.getAccessToken();
      if (!token) {
        setErrorMessage('Sesión expirada. Por favor inicia sesión de nuevo.');
        setShowErrorModal(true);
        setPasswordLoading(false);
        return;
      }

      await ApiService.changePassword({
        contrasena_actual: passwordData.contrasena_actual,
        nueva_contrasena: passwordData.nueva_contrasena
      }, token);
      
      setPasswordLoading(false);
      setShowPasswordModal(false);
      
      Alert.alert(
        '¡Contraseña actualizada!',
        'Tu contraseña ha sido cambiada exitosamente. Por seguridad, te recomendamos cerrar sesión y volver a ingresar.',
        [
          {
            text: 'Continuar',
            onPress: () => {}
          },
          {
            text: 'Cerrar Sesión',
            onPress: () => performLogout(),
            style: 'destructive'
          }
        ]
      );

    } catch (error) {
      setPasswordLoading(false);
      console.error('Error cambiando contraseña:', error);
      
      // Manejar errores específicos del backend
      if (error.errors && error.errors.length > 0) {
        const backendErrors = {};
        error.errors.forEach(err => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setPasswordErrors(backendErrors);
      } else {
        setErrorMessage(error.message || 'Error al cambiar la contraseña. Intenta de nuevo.');
        setShowErrorModal(true);
        setShowPasswordModal(false);
      }
    }
  };

  const cancelChangePassword = () => {
    setShowPasswordModal(false);
    setPasswordData({
      contrasena_actual: '',
      nueva_contrasena: '',
      confirmar_password: ''
    });
    setPasswordErrors({});
  };

  const updatePasswordField = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeleteConfirmation('');
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      setErrorMessage('Debe escribir exactamente "ELIMINAR" para confirmar la eliminación.');
      setShowErrorModal(true);
      return;
    }

    setDeleteLoading(true);
    try {
      const token = await StorageService.getAccessToken();
      if (!token) {
        setErrorMessage('Sesión expirada. Por favor inicia sesión de nuevo.');
        setShowErrorModal(true);
        setDeleteLoading(false);
        return;
      }

      await ApiService.deleteAccount(token);
      
      // Limpiar datos locales después de eliminación exitosa
      await StorageService.clearAuthData();
      
      setShowDeleteModal(false);
      setDeleteLoading(false);
      
      // Mostrar mensaje de confirmación y navegar al welcome
      Alert.alert(
        'Cuenta eliminada',
        'Tu cuenta ha sido eliminada exitosamente. Lamentamos verte partir.',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }
        ],
        { cancelable: false }
      );

    } catch (error) {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      console.error('Error eliminando cuenta:', error);
      setErrorMessage(error.message || 'Error al eliminar la cuenta. Intenta de nuevo.');
      setShowErrorModal(true);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    performLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const performLogout = async () => {
    try {
      const refreshToken = await StorageService.getRefreshToken();
      
      // Intentar logout en el servidor
      if (refreshToken) {
        try {
          await ApiService.logout(refreshToken);
        } catch (error) {
          // Aunque falle el logout en el servidor, seguimos con el logout local
          console.warn('Error en logout del servidor:', error);
        }
      }

      // Limpiar datos locales
      await StorageService.clearAuthData();
      
      // Navegar a pantalla de bienvenida
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      setErrorMessage('Error al cerrar sesión. Intenta de nuevo.');
      setShowErrorModal(true);
    }
  };

  const handleErrorModalPress = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <Container>
        <StatusBar backgroundColor="#6366f1" barStyle="light-content" />
        <ContentContainer>
          <WelcomeText>Cargando perfil...</WelcomeText>
        </ContentContainer>
      </Container>
    );
  }

  const getInitials = (nombres, apellidos) => {
    const firstInitial = nombres ? nombres.charAt(0).toUpperCase() : '';
    const lastInitial = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <Container>
      <StatusBar backgroundColor="#6366f1" barStyle="light-content" />
      
      {/* Botón de regreso */}
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderContainer style={{ backgroundColor: '#6366f1' }}>
          <WelcomeText>Mi Perfil</WelcomeText>
          <SubtitleText>
            Gestiona tu información personal y configuraciones de cuenta.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Tarjeta de perfil principal */}
          <ProfileCard>
            <ProfileAvatar>
              <AvatarText>{getInitials(userData?.nombres, userData?.apellidos)}</AvatarText>
            </ProfileAvatar>
            <ProfileName>{userData?.nombres} {userData?.apellidos}</ProfileName>
            <ProfileEmail>{userData?.correo}</ProfileEmail>
          </ProfileCard>

          {/* Información del usuario */}
          <SectionContainer>
            <SectionTitle>Información Personal</SectionTitle>
            <ServiceCard>
              <InfoRow>
                <InfoLabel>Nombres:</InfoLabel>
                <InfoValue>{userData?.nombres || 'No especificado'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Apellidos:</InfoLabel>
                <InfoValue>{userData?.apellidos || 'No especificado'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Correo:</InfoLabel>
                <InfoValue>{userData?.correo || 'No especificado'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Tipo de Usuario:</InfoLabel>
                <InfoValue style={{ textTransform: 'capitalize' }}>
                  {userData?.tipo_usuario || 'No especificado'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Fecha de Nacimiento:</InfoLabel>
                <InfoValue>
                  {userData?.fecha_nacimiento ? 
                    new Date(userData.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-ES') 
                    : 'Sin definir'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Género:</InfoLabel>
                <InfoValue style={{ textTransform: 'capitalize' }}>
                  {userData?.genero || 'Sin definir'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Celular:</InfoLabel>
                <InfoValue>
                  {userData?.celular || 'Sin definir'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow style={{ borderBottomWidth: 0 }}>
                <InfoLabel>Dirección:</InfoLabel>
                <InfoValue style={{ 
                  maxWidth: '60%',
                  textAlign: 'right'
                }}>
                  {userData?.direccion || 'Sin definir'}
                </InfoValue>
              </InfoRow>
            </ServiceCard>
          </SectionContainer>

          {/* Información profesional - Solo para profesionales */}
          {userData?.tipo_usuario === 'profesional' && userData?.profesional && (
            <SectionContainer>
              <SectionTitle>Información Profesional</SectionTitle>
              <ServiceCard>
                <InfoRow>
                  <InfoLabel>Especialidad:</InfoLabel>
                  <InfoValue>{userData?.profesional?.especialidad || 'Sin definir'}</InfoValue>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel>Cédula Profesional:</InfoLabel>
                  <InfoValue>{userData?.profesional?.cedula_profesional || 'Sin definir'}</InfoValue>
                </InfoRow>
                
                <InfoRow style={{ borderBottomWidth: 0 }}>
                  <InfoLabel>Estado de Documentos:</InfoLabel>
                  <InfoValue style={{ 
                    color: userData?.profesional?.documento_url ? '#3EAB37' : '#e53e3e',
                    fontWeight: 'bold'
                  }}>
                    {userData?.profesional?.documento_url ? 'Cargados' : 'Pendientes'}
                  </InfoValue>
                </InfoRow>
              </ServiceCard>
            </SectionContainer>
          )}

          {/* Configuraciones de cuenta */}
          <SectionContainer>
            <SectionTitle>Configuración de Cuenta</SectionTitle>
            
            <ServiceCard onPress={handleEditProfile}>
              <ServiceIcon>✏️</ServiceIcon>
              <ServiceTitle>Editar Información</ServiceTitle>
              <ServiceDescription>Actualiza tu información personal</ServiceDescription>
            </ServiceCard>

            <ServiceCard onPress={handleChangePassword}>
              <ServiceIcon>🔒</ServiceIcon>
              <ServiceTitle>Cambiar Contraseña</ServiceTitle>
              <ServiceDescription>Modifica tu contraseña de acceso</ServiceDescription>
            </ServiceCard>
          </SectionContainer>

          <Divider />

          {/* Botones de acción */}
          <SectionContainer>
            <SecondaryButton 
              onPress={handleLogout}
              style={{ 
                borderColor: '#e53e3e',
                backgroundColor: 'rgba(229, 62, 62, 0.05)',
                borderWidth: 2,
                shadowColor: '#e53e3e',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                marginBottom: 16
              }}
            >
              <SecondaryButtonText style={{ 
                color: '#e53e3e', 
                fontWeight: '600',
                letterSpacing: 0.5
              }}>
                Cerrar Sesión
              </SecondaryButtonText>
            </SecondaryButton>

            {/* Botón discreto de eliminar cuenta */}
            <TouchableOpacity 
              onPress={handleDeleteAccount}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: 'transparent',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                marginTop: 8
              }}
            >
              <Text style={{ 
                fontSize: 14, 
                color: '#9ca3af',
                fontWeight: '500',
                textDecorationLine: 'underline'
              }}>
                Eliminar mi cuenta
              </Text>
            </TouchableOpacity>
          </SectionContainer>

          {/* Información adicional */}
          <SectionContainer>
            <SectionDescription style={{ textAlign: 'center', fontStyle: 'italic' }}>
              ¿Necesitas ayuda con tu cuenta?{'\n'}
              Contacta a soporte técnico: soporte@tlamatini.org
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>

      {/* Modal de confirmación de logout */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        icon="🚪"
      />

      <ErrorModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={handleErrorModalPress}
      />

      {/* Modal personalizado de eliminación de cuenta */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteAccount}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10
          }}>
            {/* Icono de advertencia */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
              <Text style={{ 
                fontSize: 22, 
                fontWeight: 'bold', 
                color: '#dc2626',
                textAlign: 'center',
                marginBottom: 8
              }}>
                Eliminar Cuenta
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#dc2626',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ¡Esta acción no se puede deshacer!
              </Text>
            </View>

            {/* Mensaje de advertencia */}
            <Text style={{ 
              fontSize: 15, 
              color: '#374151',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 20
            }}>
              Al eliminar tu cuenta se borrará permanentemente:
              {'\n\n'}• Toda tu información personal
              {'\n'}• Historial de citas y consultas
              {'\n'}• Datos profesionales (si aplica)
              {'\n'}• Inscripciones a actividades
              {'\n\n'}Esta información NO se podrá recuperar.
            </Text>

            {/* Campo de confirmación */}
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: 8
            }}>
              Para confirmar, escriba exactamente "ELIMINAR":
            </Text>
            
            <TextInput
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="Escriba ELIMINAR aquí"
              style={{
                borderWidth: 2,
                borderColor: deleteConfirmation === 'ELIMINAR' ? '#dc2626' : '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {/* Botones */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={cancelDeleteAccount}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  padding: 14,
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  color: '#374151'
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDeleteAccount}
                disabled={deleteConfirmation !== 'ELIMINAR' || deleteLoading}
                style={{
                  flex: 1,
                  backgroundColor: deleteConfirmation === 'ELIMINAR' && !deleteLoading ? '#dc2626' : '#d1d5db',
                  borderRadius: 8,
                  padding: 14,
                  alignItems: 'center'
                }}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    Eliminar Cuenta
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de cambio de contraseña */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelChangePassword}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10
            }}>
              {/* Header del modal */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔒</Text>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#3EAB37',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  Cambiar Contraseña
                </Text>
                <Text style={{ 
                  fontSize: 15, 
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 20
                }}>
                  Actualiza tu contraseña para mantener tu cuenta segura
                </Text>
              </View>

              {/* Campo de contraseña actual */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Contraseña Actual
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: passwordErrors.contrasena_actual ? '#dc2626' : '#d1d5db',
                  borderRadius: 12,
                  backgroundColor: '#f9fafb'
                }}>
                  <TextInput
                    value={passwordData.contrasena_actual}
                    onChangeText={(value) => updatePasswordField('contrasena_actual', value)}
                    placeholder="Escribe tu contraseña actual"
                    secureTextEntry={!showCurrentPassword}
                    style={{
                      flex: 1,
                      padding: 14,
                      fontSize: 16,
                      color: '#374151'
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ padding: 14 }}
                  >
                    <Ionicons 
                      name={showCurrentPassword ? 'eye-off' : 'eye'} 
                      size={22} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordErrors.contrasena_actual && (
                  <Text style={{
                    fontSize: 14,
                    color: '#dc2626',
                    marginTop: 4,
                    fontWeight: '500'
                  }}>
                    {passwordErrors.contrasena_actual}
                  </Text>
                )}
              </View>

              {/* Campo de nueva contraseña */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Nueva Contraseña
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: passwordErrors.nueva_contrasena ? '#dc2626' : '#d1d5db',
                  borderRadius: 12,
                  backgroundColor: '#f9fafb'
                }}>
                  <TextInput
                    value={passwordData.nueva_contrasena}
                    onChangeText={(value) => updatePasswordField('nueva_contrasena', value)}
                    placeholder="Escribe tu nueva contraseña"
                    secureTextEntry={!showNewPassword}
                    style={{
                      flex: 1,
                      padding: 14,
                      fontSize: 16,
                      color: '#374151'
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={{ padding: 14 }}
                  >
                    <Ionicons 
                      name={showNewPassword ? 'eye-off' : 'eye'} 
                      size={22} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={{
                  fontSize: 13,
                  color: '#6b7280',
                  marginTop: 4,
                  fontStyle: 'italic'
                }}>
                  Mínimo 8 caracteres
                </Text>
                {passwordErrors.nueva_contrasena && (
                  <Text style={{
                    fontSize: 14,
                    color: '#dc2626',
                    marginTop: 4,
                    fontWeight: '500'
                  }}>
                    {passwordErrors.nueva_contrasena}
                  </Text>
                )}
              </View>

              {/* Campo de confirmar nueva contraseña */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Confirmar Nueva Contraseña
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: passwordErrors.confirmar_password ? '#dc2626' : '#d1d5db',
                  borderRadius: 12,
                  backgroundColor: '#f9fafb'
                }}>
                  <TextInput
                    value={passwordData.confirmar_password}
                    onChangeText={(value) => updatePasswordField('confirmar_password', value)}
                    placeholder="Repite tu nueva contraseña"
                    secureTextEntry={!showConfirmPassword}
                    style={{
                      flex: 1,
                      padding: 14,
                      fontSize: 16,
                      color: '#374151'
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ padding: 14 }}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={22} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordErrors.confirmar_password && (
                  <Text style={{
                    fontSize: 14,
                    color: '#dc2626',
                    marginTop: 4,
                    fontWeight: '500'
                  }}>
                    {passwordErrors.confirmar_password}
                  </Text>
                )}
              </View>

              {/* Botones de acción */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={cancelChangePassword}
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#e5e7eb'
                  }}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmChangePassword}
                  disabled={passwordLoading || !passwordData.contrasena_actual || !passwordData.nueva_contrasena || !passwordData.confirmar_password}
                  style={{
                    flex: 1,
                    backgroundColor: (!passwordLoading && passwordData.contrasena_actual && passwordData.nueva_contrasena && passwordData.confirmar_password) ? '#3EAB37' : '#d1d5db',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: (!passwordLoading && passwordData.password_actual && passwordData.nueva_password && passwordData.confirmar_password) ? '#3EAB37' : '#d1d5db'
                  }}
                >
                  {passwordLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      Cambiar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Información de seguridad */}
              <View style={{
                marginTop: 20,
                padding: 16,
                backgroundColor: '#f0fdf4',
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#3EAB37'
              }}>
                <Text style={{
                  fontSize: 13,
                  color: '#15803d',
                  lineHeight: 18,
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  💡 Tu nueva contraseña será efectiva inmediatamente. Por seguridad, considera cerrar sesión y volver a ingresar.
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Container>
  );
};

export default MiPerfilScreen;
