import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, View } from 'react-native';
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
  QuickActionsContainer,
  QuickActionButton,
  QuickActionIcon,
  QuickActionText,
  PrimaryButton,
  PrimaryButtonText,
  Divider,
  StatusIndicator,
  StatusText
} from '../styles/BeneficiarioHome.styles';

const ProfesionalHomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      if (user && user.tipo_usuario === 'profesional') {
        setUserData(user);
      } else {
        // Si no es profesional o no hay datos, redirigir al login
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

  // Secciones principales para profesionales
  const secciones = [
    {
      id: 'mi-agenda',
      icon: '📅',
      title: 'Mi Agenda',
      description: 'Citas programadas y consultas pendientes',
      subtitle: 'Gestiona tus citas con beneficiarios',
      color: '#3EAB37'
    },
    {
      id: 'historial-consultas',
      icon: '📋',
      title: 'Historial de Consultas',
      description: 'Registro completo de sesiones realizadas',
      subtitle: 'Consulta el historial de tus pacientes',
      color: '#2563eb'
    },
    {
      id: 'mis-servicios',
      icon: '🩺',
      title: 'Mis Servicios Profesionales',
      description: 'Administra los servicios que ofreces',
      subtitle: 'Configura tu perfil profesional',
      color: '#7c3aed'
    },
    {
      id: 'actividades-voluntariados',
      icon: '🤝',
      title: 'Actividades y Voluntariados',
      description: 'Participa en programas comunitarios',
      subtitle: 'Únete a actividades sociales',
      color: '#059669'
    },
    {
      id: 'donaciones',
      icon: '🎁',
      title: 'Apóyanos / Donaciones',
      description: 'Contribuye con la organización',
      subtitle: 'Ayúdanos a ayudar a más personas',
      color: '#dc2626'
    }
  ];

  // Navegación a secciones
  const handleSeccionPress = (seccion) => {
    switch (seccion.id) {
      case 'mi-agenda':
        // 👇 ahora va a la pantalla de gestión de citas del profesional
        navigation.navigate('CitasPendientesProfesional');
        break;
      
      case 'historial-consultas':
        navigation.navigate('HistorialConsultas');
        break;
      
      case 'mis-servicios':
        navigation.navigate('ServiciosProfesionales');
        break;
      
      case 'actividades-voluntariados':
        navigation.navigate('Actividades');
        break;
      
      case 'donaciones':
        navigation.navigate('Donaciones');
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
        <HeaderContainer style={{ backgroundColor: '#3EAB37' }}>
          <WelcomeText>¡Hola Profesional!</WelcomeText>
          <UserNameText>{userData?.nombres} {userData?.apellidos}</UserNameText>
          <SubtitleText>
            Administra tus servicios profesionales, gestiona tu agenda y participa en actividades comunitarias.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
{/* Acciones rápidas */}
<QuickActionsContainer style={{ flexDirection: 'column' }}>
  {/* Primera fila - 3 botones */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
    <QuickActionButton style={{ width: '31%' }} onPress={() => navigation.navigate('MiPerfil')}>
      <QuickActionIcon>👤</QuickActionIcon>
      <QuickActionText>Mi Perfil</QuickActionText>
    </QuickActionButton>
    
    <QuickActionButton style={{ width: '31%' }} onPress={() => navigation.navigate('CitasPendientesProfesional')}>
      <QuickActionIcon>📅</QuickActionIcon>
      <QuickActionText>Mi Agenda</QuickActionText>
    </QuickActionButton>

    <QuickActionButton style={{ width: '31%' }} onPress={() => navigation.navigate('HistorialConsultas')}>
      <QuickActionIcon>📋</QuickActionIcon>
      <QuickActionText>Consultas</QuickActionText>
    </QuickActionButton>
  </View>

  {/* Segunda fila - 2 botones */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
    <QuickActionButton style={{ width: '48%' }} onPress={() => navigation.navigate('MisInscripciones')}>
      <QuickActionIcon>📑</QuickActionIcon>
      <QuickActionText>Mis Actividades</QuickActionText>
    </QuickActionButton>

    <QuickActionButton style={{ width: '48%' }} onPress={() => navigation.navigate('Avisos')}>
      <QuickActionIcon>🔔</QuickActionIcon>
      <QuickActionText>Avisos</QuickActionText>
    </QuickActionButton>
  </View>
</QuickActionsContainer>

          {/* Secciones principales */}
          <SectionContainer>
            <SectionTitle>Panel Profesional</SectionTitle>
            <SectionDescription>
              Accede a todas las herramientas para gestionar tu práctica profesional en TLAMATINI.
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

          {/* Información profesional */}
          <SectionContainer>
            <SectionTitle>Información Importante</SectionTitle>
            <SectionDescription style={{ textAlign: 'center', lineHeight: 20 }}>
              Como profesional de TLAMATINI, tu labor es fundamental para brindar apoyo de calidad a nuestros beneficiarios. 
              {'\n\n'}Recuerda mantener tu perfil profesional actualizado y cumplir con los horarios de atención establecidos.
            </SectionDescription>
          </SectionContainer>

          {/* Botón de contacto y ayuda */}
          <SectionContainer>
            <PrimaryButton onPress={() => navigation.navigate('Contacto')}>
              <PrimaryButtonText>Contacto y Ayuda</PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default ProfesionalHomeScreen;
