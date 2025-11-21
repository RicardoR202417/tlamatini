import React, { useState, useEffect, useContext } from 'react';
import { StatusBar, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
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

// Estilos personalizados para tarjetas mejoradas
const StyledActivityCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #2563eb;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  elevation: 8;
  border-left-width: 4px;
  border-left-color: #2563eb;
  flex-direction: row;
  align-items: flex-start;
`;

const ActivityIconContainer = styled.View`
  background-color: #eff6ff;
  border-radius: 50px;
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const ActivityIconText = styled.Text`
  font-size: 28px;
`;

const ActivityContent = styled.View`
  flex: 1;
  padding-left: 8px;
`;

const ActivityTitleText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 6px;
`;

const ActivityDescriptionText = styled.Text`
  font-size: 14px;
  color: #6b7280;
  line-height: 20px;
  margin-bottom: 8px;
`;

const ActivityMetaContainer = styled.View`
  margin-top: 8px;
`;

const ActivityMeta = styled.Text`
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ActivityLocation = styled.Text`
  font-size: 13px;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ActivityBadge = styled.View`
  background-color: #dcfce7;
  border-radius: 12px;
  padding: 6px 12px;
  align-self: flex-start;
`;

const ActivityBadgeText = styled.Text`
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActividadesSocialesScreen = ({ navigation }) => {
  const { user, token } = useContext(UserContext);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarActividades();
    setRefreshing(false);
  };

  const handleActividadPress = (actividad) => {
    // Navegar a la pantalla de detalles
    navigation.navigate('DetalleActividad', { actividad });
  };

  return (
    <Container>
      <ScrollContainer 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        <StandardHeader
          backgroundColor="#2563eb"
          title="Actividades y Programas"
          subtitle="Programas Sociales Comunitarios"
          description="Únete a nuestras actividades comunitarias y programas sociales diseñados para tu bienestar."
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

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
                <StyledActivityCard 
                  key={actividad.id_actividad} 
                  onPress={() => handleActividadPress(actividad)}
                >
                  <ActivityIconContainer>
                    <ActivityIconText>{icon}</ActivityIconText>
                  </ActivityIconContainer>
                  
                  <ActivityContent>
                    <ActivityTitleText>{actividad.titulo}</ActivityTitleText>
                    <ActivityDescriptionText numberOfLines={2}>
                      {actividad.descripcion}
                    </ActivityDescriptionText>
                    
                    <ActivityMetaContainer>
                      {actividad.horario_inicio && (
                        <ActivityMeta>
                          📅 {fechaFormato} - {actividad.horario_inicio}
                        </ActivityMeta>
                      )}
                      {actividad.ubicacion && (
                        <ActivityLocation>
                          📍 {actividad.ubicacion}
                        </ActivityLocation>
                      )}
                      
                      <ActivityBadge>
                        <ActivityBadgeText>Inscripción Abierta</ActivityBadgeText>
                      </ActivityBadge>
                    </ActivityMetaContainer>
                  </ActivityContent>
                </StyledActivityCard>
              );
            })
          ) : !loading && actividades && actividades.length === 0 ? (
            <SectionContainer>
              <ActivityDescription style={{ textAlign: 'center', color: '#6B7280' }}>
                No hay actividades disponibles en este momento.
              </ActivityDescription>
            </SectionContainer>
          ) : null}
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default ActividadesSocialesScreen;
