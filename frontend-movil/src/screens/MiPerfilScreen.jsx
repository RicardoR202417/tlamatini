import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import StorageService from '../services/StorageService';
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
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 6;
  align-items: center;
`;

const ProfileAvatar = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #6366f1;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const AvatarText = styled.Text`
  font-size: 32px;
  color: white;
  font-weight: bold;
`;

const ProfileName = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
  text-align: center;
`;

const ProfileEmail = styled.Text`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 16px;
  text-align: center;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
`;

const InfoLabel = styled.Text`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.Text`
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
`;

const MiPerfilScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      if (user) {
        setUserData(user);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // TODO: Implementar edición de perfil
    Alert.alert('Próximamente', 'La edición de perfil será implementada en una futura actualización');
  };

  const handleChangePassword = () => {
    // TODO: Implementar cambio de contraseña
    Alert.alert('Próximamente', 'El cambio de contraseña será implementado próximamente');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAuthData();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          }
        }
      ]
    );
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
              
              <InfoRow style={{ borderBottomWidth: 0 }}>
                <InfoLabel>Tipo de Usuario:</InfoLabel>
                <InfoValue style={{ textTransform: 'capitalize' }}>
                  {userData?.tipo_usuario || 'No especificado'}
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
            <PrimaryButton 
              onPress={handleEditProfile}
              style={{ backgroundColor: '#6366f1' }}
            >
              <PrimaryButtonText>Editar Perfil</PrimaryButtonText>
            </PrimaryButton>
            
            <SecondaryButton 
              onPress={handleLogout}
              style={{ borderColor: '#dc2626', marginTop: 12 }}
            >
              <SecondaryButtonText style={{ color: '#dc2626' }}>
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
    </Container>
  );
};

export default MiPerfilScreen;
