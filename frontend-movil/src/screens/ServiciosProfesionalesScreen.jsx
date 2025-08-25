import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
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
  color: #3EAB37;
  font-weight: bold;
`;

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

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <StatusBar backgroundColor="#3EAB37" barStyle="light-content" />
      
      {/* Botón de regreso */}
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderContainer>
          <WelcomeText>Servicios Profesionales</WelcomeText>
          <SubtitleText>
            Solicita citas con nuestros profesionales especializados para recibir atención personalizada.
          </SubtitleText>
        </HeaderContainer>

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
