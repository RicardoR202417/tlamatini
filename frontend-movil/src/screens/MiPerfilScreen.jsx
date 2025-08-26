import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
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
    // TODO: Implementar cambio de contraseña
    Alert.alert('Próximamente', 'El cambio de contraseña será implementado próximamente');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
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
                elevation: 3
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
    </Container>
  );
};

export default MiPerfilScreen;
