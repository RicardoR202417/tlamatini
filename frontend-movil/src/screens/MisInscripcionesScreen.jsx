import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { UserContext } from '../context/UserContext';
import { obtenerInscripcionesUsuario, obtenerActividadPorId } from '../services/actividadesService';
import StandardHeader from '../components/StandardHeader';
import {
  Container,
  ScrollContainer,
  ContentContainer,
  SectionContainer,
  SectionTitle,
  SectionDescription,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
  PrimaryButton,
  PrimaryButtonText
} from '../styles/BeneficiarioHome.styles';

// Estilos específicos para inscripciones
const InscripcionCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  margin-horizontal: 20px;
  shadow-color: #2563eb;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 6;
  border-left-width: 4px;
  border-left-color: #2563eb;
`;

const InscripcionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 24px;
`;

const InscripcionStatus = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const StatusBadge = styled.View`
  background-color: ${
    props => {
      switch(props.status?.toLowerCase()) {
        case 'activa': return '#22c55e';
        case 'pendiente': return '#f59e0b';
        case 'cancelada': return '#ef4444';
        case 'completada': return '#3b82f6';
        default: return '#6b7280';
      }
    }
  };
  padding: 4px 10px;
  border-radius: 12px;
  margin-right: 10px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InscripcionDate = styled.Text`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const InscripcionDescription = styled.Text`
  font-size: 14px;
  color: #4a5568;
  margin-top: 8px;
  line-height: 20px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.Text`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #2d3748;
  text-align: center;
  margin-bottom: 12px;
`;

const EmptyMessage = styled.Text`
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  line-height: 24px;
  margin-bottom: 24px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
`;

const LoadingText = styled.Text`
  margin-top: 16px;
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const MisInscripcionesScreen = ({ navigation }) => {
  const { user, token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadInscripciones();
  }, [user]);

  const loadInscripciones = async () => {
    try {
      setLoading(true);
      const res = await obtenerInscripcionesUsuario(user.id_usuario, token);
      if (res.success) {
        setInscripciones(res.data || []);
      }
    } catch (err) {
      console.error('Error al cargar inscripciones', err);
      Alert.alert('Error', err.message || 'No se pudieron cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const openActividad = async (idActividad) => {
    try {
      setLoading(true);
      const res = await obtenerActividadPorId(idActividad);
      if (res.success) {
        navigation.navigate('DetalleActividad', { actividad: res.data });
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener la actividad');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderInscripcionItem = ({ item }) => (
    <InscripcionCard onPress={() => openActividad(item.id_actividad)}>
      <InscripcionTitle>{item.nombre_actividad}</InscripcionTitle>
      
      <InscripcionStatus>
        <StatusBadge status={item.estado}>
          <StatusText>{item.estado}</StatusText>
        </StatusBadge>
        <InscripcionDate>Inscrito: {formatDate(item.fecha_inscripcion)}</InscripcionDate>
      </InscripcionStatus>
      
      <InscripcionDescription>
        Toca para ver más detalles de esta actividad
      </InscripcionDescription>
    </InscripcionCard>
  );

  const renderEmptyState = () => (
    <EmptyContainer>
      <EmptyIcon>📋</EmptyIcon>
      <EmptyTitle>Aún no tienes inscripciones</EmptyTitle>
      <EmptyMessage>
        Explora las actividades disponibles y úníte a las que más te interesen.
        ¡Comienza tu experiencia de aprendizaje!
      </EmptyMessage>
      <PrimaryButton onPress={() => navigation.navigate('BeneficiarioHome')}>
        <PrimaryButtonText>Explorar Actividades</PrimaryButtonText>
      </PrimaryButton>
    </EmptyContainer>
  );

  return (
    <Container>
      <StandardHeader
        backgroundColor="#2563eb"
        title="Mis Actividades"
        description="Gestiona tus inscripciones y mantente al día con tu progreso"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color="#2563eb" />
          <LoadingText>Cargando tus actividades...</LoadingText>
        </LoadingContainer>
      ) : (
        <FlatList
          data={inscripciones}
          keyExtractor={(item) => String(item.id_inscripcion)}
          renderItem={renderInscripcionItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 20,
            paddingBottom: 40
          }}
          style={{ backgroundColor: '#f9fafb' }}
        />
      )}
    </Container>
  );
};

export default MisInscripcionesScreen;
