import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import StandardHeader from '../components/StandardHeader';
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
  StatusIndicator,
  StatusText
} from '../styles/BeneficiarioHome.styles';
import styled from 'styled-components/native';

const ServiciosProfesionalesScreen = ({ navigation }) => {
  // Servicios Profesionales disponibles
  const serviciosProfesionales = [
    {
      id: 'psicologia',
      icon: '�',
      title: 'Psicología',
      description: 'Consultas psicológicas, terapia individual y familiar, apoyo emocional personalizado.',
      disponible: true
    },
    {
      id: 'nutricion',
      icon: '🍎',
      title: 'Nutrición',
      description: 'Planes alimentarios personalizados, consultas nutricionales y seguimiento dietético.',
      disponible: true
    },
    {
      id: 'enfermeria',
      icon: '🩺',
      title: 'Enfermería',
      description: 'Atención médica básica, cuidados de salud y monitoreo de signos vitales.',
      disponible: true
    },
    {
      id: 'derecho',
      icon: '📋',
      title: 'Asesoría Legal',
      description: 'Consultas jurídicas, asesoría legal gratuita y orientación en trámites legales.',
      disponible: false
    }
  ];

  const handleServicioPress = (servicio) => {
    if (servicio.disponible) {
      // TODO: Implementar navegación a solicitud de cita
      console.log(`Solicitando servicio: ${servicio.title}`);
    }
  };

  return (
    <Container>
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <StandardHeader
          backgroundColor="#3EAB37"
          title="Servicios Profesionales"
          subtitle="Centro de Atención Especializada"
          description="Solicita citas con nuestros profesionales especializados para recibir atención personalizada."
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        
        <ContentContainer>
          {/* Información general */}
          <SectionContainer>
            <SectionTitle>Servicios Disponibles</SectionTitle>
            <SectionDescription>
              Nuestro equipo de profesionales está aquí para brindarte el apoyo que necesitas. 
              Selecciona el servicio que requieres para solicitar una cita.
            </SectionDescription>
          </SectionContainer>

          {/* Lista de servicios */}
          {serviciosProfesionales.map((servicio) => (
            <ServiceCard 
              key={servicio.id} 
              onPress={() => handleServicioPress(servicio)}
              style={{ opacity: servicio.disponible ? 1 : 0.6 }}
            >
              <ServiceIcon>{servicio.icon}</ServiceIcon>
              <ServiceTitle>{servicio.title}</ServiceTitle>
              <ServiceDescription>{servicio.description}</ServiceDescription>
              <StatusIndicator color={servicio.disponible ? '#3EAB37' : '#9CA3AF'}>
                <StatusText>{servicio.disponible ? 'Disponible' : 'Próximamente'}</StatusText>
              </StatusIndicator>
            </ServiceCard>
          ))}

          {/* Botón de acción */}
          <SectionContainer>
            <PrimaryButton onPress={() => console.log('Contactar soporte')}>
              <PrimaryButtonText>¿Tienes Dudas? Contáctanos</PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default ServiciosProfesionalesScreen;
