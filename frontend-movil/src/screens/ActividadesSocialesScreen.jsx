import React, { useState, useEffect, useContext } from 'react';
import { StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
import { obtenerActividades } from '../services/actividadesService';
import { UserContext } from '../context/UserContext';

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
  const { user, token } = useContext(UserContext);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  // Cargar actividades cuando monta el componente
  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerActividades();
      setActividades(response.data || []);
      setIsMock(!!response.isMock);
    } catch (err) {
      console.error('Error al cargar actividades:', err);
      setError(err.message);
      Alert.alert('Error', 'No se pudieron cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleActividadPress = (actividad) => {
    // Navegar a la pantalla de detalles
    navigation.navigate('DetalleActividad', { actividad });
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

          {/* Indicador de carga */}
          {loading && (
            <SectionContainer>
              <ActivityIndicator size="large" color="#2563eb" />
            </SectionContainer>
          )}

          {/* Mensaje de error */}
          {error && !loading && (
            <SectionContainer>
              <ActivityDescription style={{ color: '#dc2626', marginBottom: 10 }}>
                Error: {error}
              </ActivityDescription>
              <PrimaryButton onPress={cargarActividades}>
                <PrimaryButtonText>Reintentar</PrimaryButtonText>
              </PrimaryButton>
            </SectionContainer>
          )}

          {/* Banner cuando se usan datos mock */}
          {!loading && isMock && (
            <SectionContainer>
              <SectionDescription style={{ color: '#92400e' }}>
                Estás viendo datos de ejemplo porque el servidor no respondió.
              </SectionDescription>
            </SectionContainer>
          )}

          {/* Lista de actividades */}
          {!loading && actividades && actividades.length > 0 ? (
            actividades.map((actividad) => {
              const iconMap = {
                'banco_alimentos': '🍞',
                'senderismo_terapeutico': '🥾',
                'terapia_psicologica': '💭',
                'talleres': '🎨',
                'capacitacion': '📚',
                'deportes': '⚽'
              };
              
              const icon = iconMap[actividad.tipo] || '📌';
              const fecha = new Date(actividad.fecha);
              const fechaFormato = fecha.toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });

              return (
                <ActivityCard 
                  key={actividad.id_actividad} 
                  onPress={() => handleActividadPress(actividad)}
                  style={{ marginBottom: 15 }}
                >
                  <ActivityIcon>{icon}</ActivityIcon>
                  <ActivityInfo>
                    <ActivityTitle>{actividad.titulo}</ActivityTitle>
                    <ActivityDescription>{actividad.descripcion}</ActivityDescription>
                    {actividad.horario_inicio && (
                      <ActivityDescription style={{ fontWeight: 'bold', marginTop: 5 }}>
                        📅 {fechaFormato} - {actividad.horario_inicio}
                      </ActivityDescription>
                    )}
                    {actividad.ubicacion && (
                      <ActivityDescription style={{ color: '#2563eb' }}>
                        📍 {actividad.ubicacion}
                      </ActivityDescription>
                    )}
                    <StatusIndicator 
                      color="#2563eb"
                      style={{ marginTop: 8 }}
                    >
                      <StatusText>Inscripción Abierta</StatusText>
                    </StatusIndicator>
                  </ActivityInfo>
                </ActivityCard>
              );
            })
          ) : !loading && actividades && actividades.length === 0 ? (
            <SectionContainer>
              <ActivityDescription style={{ textAlign: 'center', color: '#6B7280' }}>
                No hay actividades disponibles en este momento.
              </ActivityDescription>
            </SectionContainer>
          ) : null}

          {/* Botón de acción */}
          {!loading && (
            <SectionContainer>
              <PrimaryButton 
                onPress={cargarActividades}
                style={{ backgroundColor: '#2563eb' }}
              >
                <PrimaryButtonText>Actualizar</PrimaryButtonText>
              </PrimaryButton>
            </SectionContainer>
          )}
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default ActividadesSocialesScreen;
