import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import StorageService from '../services/StorageService';
import {
  Container,
  ScrollContainer,
  ContentContainer,
  HeaderContainer,
  WelcomeText,
  UserNameText,
  SubtitleText,
  SectionContainer,
  SectionTitle,
  SectionDescription,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
  ActivityCard,
  ActivityIcon,
  ActivityInfo,
  ActivityTitle,
  ActivityDescription,
  DonationCard,
  DonationHeader,
  DonationIcon,
  DonationTitle,
  DonationDescription,
  QuickActionsContainer,
  QuickActionButton,
  QuickActionIcon,
  QuickActionText,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
  Divider,
  StatusIndicator,
  StatusText
} from '../styles/BeneficiarioHome.styles';

const DashboardBeneficiario = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      if (user && user.tipo_usuario === 'beneficiario') {
        setUserData(user);
      } else {
        // Si no es beneficiario o no hay datos, redirigir al login
        Alert.alert('Error', 'Acceso no autorizado');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Secciones principales de navegación
  const secciones = [
    {
      id: 'servicios-profesionales',
      icon: '⚕️',
      title: 'Servicios Profesionales',
      description: 'Psicología, Nutrición, Enfermería y Asesoría Legal',
      subtitle: 'Solicita citas con nuestros profesionales',
      color: '#3EAB37'
    },
    {
      id: 'actividades-sociales',
      icon: '🤝',
      title: 'Actividades y Programas',
      description: 'Banco de Alimentos, Talleres y Senderismo',
      subtitle: 'Participa en nuestras actividades comunitarias',
      color: '#2563eb'
    },
    {
      id: 'donaciones',
      icon: '🎁',
      title: 'Apóyanos / Donaciones',
      description: 'Monetarias, en Especie y Deducibles',
      subtitle: 'Ayúdanos a ayudar a más personas',
      color: '#dc2626'
    }
  ];

  // Navegación a secciones
  const handleSeccionPress = (seccion) => {
    switch (seccion.id) {
      case 'servicios-profesionales':
        // TODO: Navegar a pantalla de servicios profesionales
        Alert.alert(
          'Servicios Profesionales',
          'Navegando a la pantalla de servicios profesionales...',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => {
                console.log('Navegando a servicios profesionales');
                // navigation.navigate('ServiciosProfesionales');
                Alert.alert('Próximamente', 'Pantalla de Servicios Profesionales será implementada');
              }
            }
          ]
        );
        break;
      
      case 'actividades-sociales':
        // TODO: Navegar a pantalla de actividades sociales
        Alert.alert(
          'Actividades y Programas',
          'Navegando a la pantalla de actividades y programas sociales...',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => {
                console.log('Navegando a actividades sociales');
                // navigation.navigate('ActividadesSociales');
                Alert.alert('Próximamente', 'Pantalla de Actividades y Programas será implementada');
              }
            }
          ]
        );
        break;
      
      case 'donaciones':
        // TODO: Navegar a pantalla de donaciones
        Alert.alert(
          'Apóyanos / Donaciones',
          'Navegando a la pantalla de donaciones...',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => {
                console.log('Navegando a donaciones');
                // navigation.navigate('Donaciones');
                Alert.alert('Próximamente', 'Pantalla de Donaciones será implementada');
              }
            }
          ]
        );
        break;
      
      default:
        Alert.alert('Error', 'Sección no encontrada');
    }
  };

  if (loading) {
    return (
      <Container>
        <StatusBar backgroundColor="#3EAB37" barStyle="light-content" />
        <ContentContainer>
          <WelcomeText>Cargando...</WelcomeText>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar backgroundColor="#3EAB37" barStyle="light-content" />
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header con bienvenida personalizada */}
        <HeaderContainer>
          <WelcomeText>¡Bienvenido!</WelcomeText>
          <UserNameText>{userData?.nombres} {userData?.apellidos}</UserNameText>
          <SubtitleText>
            Explora los servicios y programas disponibles para mejorar tu bienestar y calidad de vida.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Acciones rápidas */}
          <QuickActionsContainer>
            <QuickActionButton onPress={() => Alert.alert('Próximamente', 'Mi perfil será implementado')}>
              <QuickActionIcon>👤</QuickActionIcon>
              <QuickActionText>Mi Perfil</QuickActionText>
            </QuickActionButton>
            
            <QuickActionButton onPress={() => Alert.alert('Próximamente', 'Historial será implementado')}>
              <QuickActionIcon>📋</QuickActionIcon>
              <QuickActionText>Mis Citas</QuickActionText>
            </QuickActionButton>
            
            <QuickActionButton onPress={() => Alert.alert('Próximamente', 'Notificaciones será implementado')}>
              <QuickActionIcon>🔔</QuickActionIcon>
              <QuickActionText>Avisos</QuickActionText>
            </QuickActionButton>
          </QuickActionsContainer>

          {/* Secciones principales */}
          <SectionContainer>
            <SectionTitle>Servicios Disponibles</SectionTitle>
            <SectionDescription>
              Explora todas las opciones de apoyo y servicios que tenemos para ti.
            </SectionDescription>
            
            {secciones.map((seccion) => (
              <ServiceCard 
                key={seccion.id} 
                onPress={() => handleSeccionPress(seccion)}
              >
                <ServiceIcon>{seccion.icon}</ServiceIcon>
                <ServiceTitle>{seccion.title}</ServiceTitle>
                <ServiceDescription>{seccion.description}</ServiceDescription>
                <SectionDescription style={{ marginTop: 8, marginBottom: 0, fontStyle: 'italic' }}>
                  {seccion.subtitle}
                </SectionDescription>
                <StatusIndicator color={seccion.color}>
                  <StatusText>Explorar</StatusText>
                </StatusIndicator>
              </ServiceCard>
            ))}
          </SectionContainer>

          <Divider />

          {/* Botón de navegación principal */}
          <SectionContainer>
            <PrimaryButton onPress={() => Alert.alert('Próximamente', 'Centro de ayuda será implementado')}>
              <PrimaryButtonText>¿Necesitas Ayuda?</PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default DashboardBeneficiario;
