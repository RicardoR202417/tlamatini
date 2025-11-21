import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import StandardHeader from '../components/StandardHeader';
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
  background-color: ${props => props.active ? '#059669' : 'white'};
  border: 2px solid #059669;
  border-radius: 12px;
  padding: 12px;
  align-items: center;
`;

const FilterText = styled.Text`
  color: ${props => props.active ? 'white' : '#059669'};
  font-weight: bold;
  font-size: 14px;
`;

const MisCitasScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('todas');
  
  // Datos de ejemplo de citas (en futuro vendrán del backend)
  const citasEjemplo = [
    {
      id: '1',
      servicio: 'Psicología',
      profesional: 'Dra. María González',
      fecha: '2025-08-28',
      hora: '10:00 AM',
      estado: 'confirmada',
      tipo: 'presencial',
      ubicacion: 'Consultorio 1, Centro TLAMATINI'
    },
    {
      id: '2',
      servicio: 'Nutrición',
      profesional: 'Lic. Carlos Ruiz',
      fecha: '2025-08-30',
      hora: '2:00 PM',
      estado: 'pendiente',
      tipo: 'virtual',
      ubicacion: 'Videollamada'
    },
    {
      id: '3',
      servicio: 'Enfermería',
      profesional: 'Enf. Ana López',
      fecha: '2025-08-25',
      hora: '9:00 AM',
      estado: 'completada',
      tipo: 'presencial',
      ubicacion: 'Consultorio 2, Centro TLAMATINI'
    }
  ];

  const [citas, setCitas] = useState([]);

  useEffect(() => {
    // Simular carga de citas (en futuro será llamada a API)
    loadCitas();
  }, []);

  const loadCitas = () => {
    // TODO: Implementar llamada a API para obtener citas del usuario
    setCitas(citasEjemplo);
  };

  const getFilteredCitas = () => {
    switch (activeFilter) {
      case 'pendientes':
        return citas.filter(cita => cita.estado === 'pendiente' || cita.estado === 'confirmada');
      case 'completadas':
        return citas.filter(cita => cita.estado === 'completada');
      default:
        return citas;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
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

  const getStatusText = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const getServiceIcon = (servicio) => {
    switch (servicio.toLowerCase()) {
      case 'psicología':
        return '🧭';
      case 'nutrición':
        return '🍎';
      case 'enfermería':
        return '🩺';
      case 'asesoría legal':
        return '📋';
      default:
        return '📅';
    }
  };

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

  const goBack = () => {
    navigation.goBack();
  };

  const filteredCitas = getFilteredCitas();

  return (
    <Container>      
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
                <FilterText active={activeFilter === 'pendientes'}>Próximas</FilterText>
              </FilterButton>
              
              <FilterButton 
                active={activeFilter === 'completadas'} 
                onPress={() => setActiveFilter('completadas')}
              >
                <FilterText active={activeFilter === 'completadas'}>Historial</FilterText>
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
                    <ActivityDescription>👨‍⚕️ {cita.profesional}</ActivityDescription>
                    <ActivityDescription>📅 {cita.fecha} • {cita.hora}</ActivityDescription>
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
                {activeFilter === 'todas' && 'Solicita tu primera cita con nuestros profesionales para comenzar tu atención personalizada.'}
                {activeFilter === 'pendientes' && 'Todas tus citas están al día. ¡Programa una nueva cuando lo necesites!'}
                {activeFilter === 'completadas' && 'Aún no has completado ninguna cita. Una vez que lo hagas, aparecerán aquí.'}
              </EmptyStateDescription>
            </EmptyStateCard>
          )}

          {/* Botón de acción */}
          <SectionContainer>
            <PrimaryButton 
              onPress={() => navigation.navigate('ServiciosProfesionales')}
              style={{ backgroundColor: '#059669' }}
            >
              <PrimaryButtonText>Solicitar Nueva Cita</PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>

          {/* Información de ayuda */}
          <SectionContainer>
            <SectionDescription style={{ textAlign: 'center', fontStyle: 'italic' }}>
              💡 Tip: Puedes cancelar o reagendar tus citas hasta 24 horas antes de la fecha programada.
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default MisCitasScreen;
