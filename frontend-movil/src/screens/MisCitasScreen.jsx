<<<<<<< HEAD
// src/screens/MisCitasScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar, Alert, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import ApiService from '../api/ApiService';
import StorageService from '../services/StorageService';

=======
import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import StandardHeader from '../components/StandardHeader';
>>>>>>> 948f9c500233500c81fd37398de74f76150664ba
import {
  Container,
  ScrollContainer,
  ContentContainer,
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
  color: #059669;
  font-weight: bold;
`;

const EmptyStateCard = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 40px 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 6;
  align-items: center;
`;

const EmptyStateIcon = styled.Text`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyStateTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
  text-align: center;
`;

const EmptyStateDescription = styled.Text`
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  line-height: 24px;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
  gap: 10px;
`;

const FilterButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${props => (props.active ? '#059669' : 'white')};
  border: 2px solid #059669;
  border-radius: 12px;
  padding: 12px;
  align-items: center;
`;

const FilterText = styled.Text`
  color: ${props => (props.active ? 'white' : '#059669')};
  font-weight: bold;
  font-size: 14px;
`;

const LoadingWrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const LoadingText = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  color: #4b5563;
`;

// ====================== Helpers ======================

const mapEstadoBackendToUI = (estado) => {
  // Backend: pendiente | confirmada | cancelada | atendida
  // UI: pendiente, confirmada, cancelada, completada
  if (estado === 'atendida') return 'completada';
  return estado || 'pendiente';
};

const getStatusColor = (estadoUI) => {
  switch (estadoUI) {
    case 'confirmada':
      return '#059669';
    case 'pendiente':
      return '#d97706';
    case 'completada':
      return '#6b7280';
    case 'cancelada':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};

const getStatusText = (estadoUI) => {
  switch (estadoUI) {
    case 'confirmada':
      return 'Confirmada';
    case 'pendiente':
      return 'Pendiente';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return estadoUI;
  }
};

const getServiceIcon = (servicio) => {
  if (!servicio) return '📅';
  switch (servicio.toLowerCase()) {
    case 'psicología':
    case 'psicologia':
      return '🧭';
    case 'nutrición':
    case 'nutricion':
      return '🍎';
    case 'enfermería':
    case 'enfermeria':
      return '🩺';
    case 'asesoría legal':
    case 'asesoria legal':
      return '📋';
    default:
      return '📅';
  }
};

const splitFechaHora = (iso) => {
  if (!iso || typeof iso !== 'string') return { fecha: 'Fecha por definir', hora: '' };

  // si viene como "2025-11-21T10:00:00"
  if (iso.includes('T')) {
    const [f, h] = iso.split('T');
    const hora = h?.slice(0, 5) || '';
    return { fecha: f, hora };
  }

  // fallback: regresar todo como fecha
  return { fecha: iso, hora: '' };
};

// ====================== Screen ======================

const MisCitasScreen = ({ navigation, route }) => {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [beneficiarioId, setBeneficiarioId] = useState(
    route?.params?.beneficiarioId || null
  );

  // 1. Cargar usuario (si no viene por params) y luego citas
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        let id = beneficiarioId;
        if (!id) {
          const user = await StorageService.getUserData?.();
          id = user?.id_usuario;
          setBeneficiarioId(id);
        }

        if (!id) {
          Alert.alert(
            'Sesión',
            'No se pudo obtener el usuario. Vuelve a iniciar sesión.'
          );
          setLoading(false);
          return;
        }

        const data = await ApiService.getCitasBeneficiario(id);

        // mapeo a modelo de la UI
        const mapped = (Array.isArray(data) ? data : []).map((cita) => {
          const estadoUI = mapEstadoBackendToUI(cita.estado);
          const { fecha, hora } = splitFechaHora(
            cita.fecha_solicitada || cita.fecha_hora || cita.fecha
          );

          return {
            id: String(cita.id_cita || cita.id),
            servicio:
              cita.servicio ||
              cita.tipo_servicio ||
              cita.especialidad ||
              'Consulta',
            profesional:
              cita.nombre_profesional ||
              cita.profesional_nombre ||
              cita.nombre_medico ||
              `Profesional #${cita.id_profesional}`,
            fecha,
            hora,
            estado: estadoUI,
            tipo: cita.tipo_consulta || cita.modalidad || 'presencial',
            ubicacion:
              cita.ubicacion ||
              cita.lugar ||
              'Centro TLAMATINI (por confirmar)'
          };
        });

        setCitas(mapped);
      } catch (err) {
        console.error('Error al cargar citas:', err);
        Alert.alert(
          'Error',
          err.message || 'No se pudieron cargar tus citas. Intenta más tarde.'
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const goBack = () => navigation.goBack();

  const filteredCitas = useMemo(() => {
    switch (activeFilter) {
      case 'pendientes':
        return citas.filter(
          (cita) => cita.estado === 'pendiente' || cita.estado === 'confirmada'
        );
      case 'completadas':
        return citas.filter((cita) => cita.estado === 'completada');
      default:
        return citas;
    }
  }, [activeFilter, citas]);

  const handleCitaPress = (cita) => {
    Alert.alert(
      `Cita de ${cita.servicio}`,
      `Profesional: ${cita.profesional}\nFecha: ${cita.fecha}\nHora: ${cita.hora}\nTipo: ${cita.tipo}\nUbicación: ${cita.ubicacion}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver Detalles',
          onPress: () => {
            // TODO: Navegar a pantalla de detalle de cita
            console.log('Ver detalles de cita:', cita.id);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <Container>
        <StatusBar backgroundColor="#059669" barStyle="light-content" />
        <BackButton onPress={goBack}>
          <BackIcon>←</BackIcon>
        </BackButton>

        <ScrollContainer showsVerticalScrollIndicator={false}>
          <HeaderContainer style={{ backgroundColor: '#059669' }}>
            <WelcomeText>Mis Citas</WelcomeText>
            <SubtitleText>
              Gestiona y revisa todas tus citas médicas y de servicios profesionales.
            </SubtitleText>
          </HeaderContainer>

          <LoadingWrapper>
            <ActivityIndicator size="large" color="#059669" />
            <LoadingText>Cargando tus citas...</LoadingText>
          </LoadingWrapper>
        </ScrollContainer>
      </Container>
    );
  }

  return (
<<<<<<< HEAD
    <Container>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />

      {/* Botón de regreso */}
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>

=======
    <Container>      
>>>>>>> 948f9c500233500c81fd37398de74f76150664ba
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header estándar con botón de regreso */}
        <StandardHeader
          backgroundColor="#059669"
          title="Mis Citas"
          description="Gestiona y revisa todas tus citas médicas y de servicios profesionales."
          showBackButton={true}
          onBackPress={goBack}
        />

        <ContentContainer>
          {/* Filtros */}
          <SectionContainer>
            <SectionTitle>Filtrar Citas</SectionTitle>
            <FilterContainer>
              <FilterButton
                active={activeFilter === 'todas'}
                onPress={() => setActiveFilter('todas')}
              >
                <FilterText active={activeFilter === 'todas'}>Todas</FilterText>
              </FilterButton>

              <FilterButton
                active={activeFilter === 'pendientes'}
                onPress={() => setActiveFilter('pendientes')}
              >
                <FilterText active={activeFilter === 'pendientes'}>
                  Próximas
                </FilterText>
              </FilterButton>

              <FilterButton
                active={activeFilter === 'completadas'}
                onPress={() => setActiveFilter('completadas')}
              >
                <FilterText active={activeFilter === 'completadas'}>
                  Historial
                </FilterText>
              </FilterButton>
            </FilterContainer>
          </SectionContainer>

          {/* Lista de citas o estado vacío */}
          {filteredCitas.length > 0 ? (
            <SectionContainer>
              <SectionTitle>
                {activeFilter === 'todas' && 'Todas las Citas'}
                {activeFilter === 'pendientes' && 'Próximas Citas'}
                {activeFilter === 'completadas' && 'Historial de Citas'}
              </SectionTitle>

              {filteredCitas.map((cita) => (
                <ActivityCard
                  key={cita.id}
                  onPress={() => handleCitaPress(cita)}
                  style={{ marginBottom: 15 }}
                >
                  <ActivityIcon>{getServiceIcon(cita.servicio)}</ActivityIcon>
                  <ActivityInfo style={{ flex: 1 }}>
                    <ActivityTitle>{cita.servicio}</ActivityTitle>
                    <ActivityDescription>
                      👨‍⚕️ {cita.profesional}
                    </ActivityDescription>
                    <ActivityDescription>
                      📅 {cita.fecha}
                      {cita.hora ? ` • ${cita.hora}` : ''}
                    </ActivityDescription>
                    <ActivityDescription>📍 {cita.ubicacion}</ActivityDescription>
                    <StatusIndicator
                      color={getStatusColor(cita.estado)}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}
                    >
                      <StatusText>{getStatusText(cita.estado)}</StatusText>
                    </StatusIndicator>
                  </ActivityInfo>
                </ActivityCard>
              ))}
            </SectionContainer>
          ) : (
            <EmptyStateCard>
              <EmptyStateIcon>📅</EmptyStateIcon>
              <EmptyStateTitle>
                {activeFilter === 'todas' && 'No tienes citas registradas'}
                {activeFilter === 'pendientes' && 'No tienes citas próximas'}
                {activeFilter === 'completadas' && 'No tienes citas en el historial'}
              </EmptyStateTitle>
              <EmptyStateDescription>
                {activeFilter === 'todas' &&
                  'Solicita tu primera cita con nuestros profesionales para comenzar tu atención personalizada.'}
                {activeFilter === 'pendientes' &&
                  'Todas tus citas están al día. ¡Programa una nueva cuando lo necesites!'}
                {activeFilter === 'completadas' &&
                  'Aún no has completado ninguna cita. Una vez que lo hagas, aparecerán aquí.'}
              </EmptyStateDescription>
            </EmptyStateCard>
          )}

          {/* Botón de acción */}
          <SectionContainer>
            <PrimaryButton
              onPress={() =>
                navigation.navigate('NuevaCita', { beneficiarioId })
              }
              style={{ backgroundColor: '#059669' }}
            >
              <PrimaryButtonText>Solicitar Nueva Cita</PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>

          {/* Información de ayuda */}
          <SectionContainer>
            <SectionDescription
              style={{ textAlign: 'center', fontStyle: 'italic' }}
            >
              💡 Tip: Puedes cancelar o reagendar tus citas hasta 24 horas antes de
              la fecha programada.
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default MisCitasScreen;
