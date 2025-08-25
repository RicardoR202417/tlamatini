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
  ActivityCard,
  ActivityIcon,
  ActivityInfo,
  ActivityTitle,
  ActivityDescription,
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
  color: #2563eb;
  font-weight: bold;
`;

const ActividadesSocialesScreen = ({ navigation }) => {
  // Actividades y Programas Sociales
  const actividadesSociales = [
    {
      id: 'banco-alimentos',
      icon: '🍞',
      title: 'Banco de Alimentos',
      description: 'Distribución semanal de despensas básicas',
      horario: 'Sábados 9:00 AM - 12:00 PM',
      ubicacion: 'Centro Comunitario TLAMATINI',
      disponible: true
    },
    {
      id: 'senderismo',
      icon: '🥾',
      title: 'Senderismo Terapéutico',
      description: 'Actividades al aire libre para bienestar físico y mental',
      horario: 'Domingos 7:00 AM - 11:00 AM',
      ubicacion: 'Parque Ecológico Municipal',
      disponible: true
    },
    {
      id: 'talleres',
      icon: '🎨',
      title: 'Talleres Creativos',
      description: 'Manualidades, arte terapia y expresión creativa',
      horario: 'Miércoles 4:00 PM - 6:00 PM',
      ubicacion: 'Aula de Arte TLAMATINI',
      disponible: true
    },
    {
      id: 'capacitacion',
      icon: '📚',
      title: 'Capacitación Laboral',
      description: 'Cursos de oficios y desarrollo de habilidades profesionales',
      horario: 'Lunes a Viernes 2:00 PM - 5:00 PM',
      ubicacion: 'Centro de Capacitación',
      disponible: false
    },
    {
      id: 'deportes',
      icon: '⚽',
      title: 'Actividades Deportivas',
      description: 'Fútbol, básquetbol y actividades recreativas grupales',
      horario: 'Martes y Jueves 5:00 PM - 7:00 PM',
      ubicacion: 'Cancha Deportiva Municipal',
      disponible: true
    }
  ];

  const handleActividadPress = (actividad) => {
    if (actividad.disponible) {
      // TODO: Implementar inscripción a actividad
      console.log(`Inscribiéndose a: ${actividad.title}`);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <StatusBar backgroundColor="#2563eb" barStyle="light-content" />
      
      {/* Botón de regreso */}
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderContainer style={{ backgroundColor: '#2563eb' }}>
          <WelcomeText>Actividades y Programas</WelcomeText>
          <SubtitleText>
            Únete a nuestras actividades comunitarias y programas sociales diseñados para tu bienestar.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Información general */}
          <SectionContainer>
            <SectionTitle>Programas Disponibles</SectionTitle>
            <SectionDescription>
              Participa en nuestras actividades comunitarias. Todas son gratuitas y están diseñadas 
              para promover el bienestar físico, mental y social de nuestra comunidad.
            </SectionDescription>
          </SectionContainer>

          {/* Lista de actividades */}
          {actividadesSociales.map((actividad) => (
            <ActivityCard 
              key={actividad.id} 
              onPress={() => handleActividadPress(actividad)}
              style={{ 
                opacity: actividad.disponible ? 1 : 0.6,
                marginBottom: 15
              }}
            >
              <ActivityIcon>{actividad.icon}</ActivityIcon>
              <ActivityInfo>
                <ActivityTitle>{actividad.title}</ActivityTitle>
                <ActivityDescription>{actividad.description}</ActivityDescription>
                {actividad.disponible && (
                  <>
                    <ActivityDescription style={{ fontWeight: 'bold', marginTop: 5 }}>
                      📅 {actividad.horario}
                    </ActivityDescription>
                    <ActivityDescription style={{ color: '#2563eb' }}>
                      📍 {actividad.ubicacion}
                    </ActivityDescription>
                  </>
                )}
                <StatusIndicator 
                  color={actividad.disponible ? '#2563eb' : '#9CA3AF'}
                  style={{ marginTop: 8 }}
                >
                  <StatusText>{actividad.disponible ? 'Inscripción Abierta' : 'Próximamente'}</StatusText>
                </StatusIndicator>
              </ActivityInfo>
            </ActivityCard>
          ))}

          {/* Botón de acción */}
          <SectionContainer>
            <PrimaryButton 
              onPress={() => console.log('Ver calendario completo')}
              style={{ backgroundColor: '#2563eb' }}
            >
              <PrimaryButtonText>Ver Calendario Completo</PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default ActividadesSocialesScreen;
