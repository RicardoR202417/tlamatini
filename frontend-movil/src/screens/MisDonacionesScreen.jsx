import React, { useState, useContext, useEffect } from 'react';
import { StatusBar, Alert, ActivityIndicator, RefreshControl, Linking } from 'react-native';
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
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
  Divider
} from '../styles/BeneficiarioHome.styles';
import { UserContext } from '../context/UserContext';
import ApiService from '../api/ApiService';
import ErrorModal from '../components/ErrorModal';
import styled from 'styled-components/native';

// Estilos específicos
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

const DonacionCard = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 4;
`;

const DonacionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TipoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const TipoIcon = styled.Text`
  font-size: 24px;
  margin-right: 8px;
`;

const TipoInfo = styled.View`
  flex: 1;
`;

const TipoText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
`;

const FechaText = styled.Text`
  font-size: 14px;
  color: #4a5568;
`;

const EstadoBadge = styled.View`
  background-color: ${props => {
    switch (props.estado) {
      case 'pendiente': return '#FEF3C7';
      case 'validada': return '#D1FAE5';
      case 'rechazada': return '#FEE2E2';
      case 'entregada': return '#E0E7FF';
      default: return '#F3F4F6';
    }
  }};
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${props => {
    switch (props.estado) {
      case 'pendiente': return '#F59E0B';
      case 'validada': return '#10B981';
      case 'rechazada': return '#EF4444';
      case 'entregada': return '#6366F1';
      default: return '#9CA3AF';
    }
  }};
`;

const EstadoText = styled.Text`
  color: ${props => {
    switch (props.estado) {
      case 'pendiente': return '#92400E';
      case 'validada': return '#065F46';
      case 'rechazada': return '#991B1B';
      case 'entregada': return '#3730A3';
      default: return '#374151';
    }
  }};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const MontoText = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #3EAB37;
  margin-bottom: 4px;
`;

const DescripcionText = styled.Text`
  font-size: 14px;
  color: #4a5568;
  line-height: 20px;
  margin-bottom: 16px;
`;

const AccionesContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AccionButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${props => props.primary ? '#3EAB37' : 'transparent'};
  border: 2px solid #3EAB37;
  border-radius: 8px;
  padding: 12px;
  margin: 0 4px;
  align-items: center;
`;

const AccionButtonText = styled.Text`
  color: ${props => props.primary ? '#fff' : '#3EAB37'};
  font-weight: 600;
  font-size: 14px;
`;

const EmptyContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.Text`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 8px;
  text-align: center;
`;

const EmptyDescription = styled.Text`
  font-size: 16px;
  color: #4a5568;
  text-align: center;
  line-height: 24px;
  margin-bottom: 24px;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
`;

const FilterButton = styled.TouchableOpacity`
  background-color: ${props => props.active ? '#3EAB37' : '#f7fafc'};
  border: 2px solid ${props => props.active ? '#3EAB37' : '#e2e8f0'};
  border-radius: 20px;
  padding: 8px 16px;
  margin-right: 8px;
`;

const FilterText = styled.Text`
  color: ${props => props.active ? '#fff' : '#4a5568'};
  font-weight: 600;
  font-size: 14px;
`;

const MisDonacionesScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todas');

  const filtros = [
    { id: 'todas', label: 'Todas' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'validada', label: 'Validadas' },
    { id: 'entregada', label: 'Entregadas' }
  ];

  useEffect(() => {
    cargarDonaciones();
  }, []);

  const cargarDonaciones = async () => {
    try {
      setLoading(true);
      const response = await ApiService.request('GET', `/api/donaciones/usuario/${user.id_usuario}`);
      
      // Simular algunas donaciones de ejemplo si no hay ninguna
      const donacionesData = response.data || [];
      if (donacionesData.length === 0) {
        // Agregar donaciones de ejemplo para mostrar la interfaz
        setDonaciones([]);
      } else {
        setDonaciones(donacionesData);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error al cargar las donaciones');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDonaciones();
    setRefreshing(false);
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'monetaria': return '💰';
      case 'deducible': return '🧾';
      case 'especie': return '📦';
      default: return '❤️';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'monetaria': return 'Donación Monetaria';
      case 'deducible': return 'Donación Deducible';
      case 'especie': return 'Donación en Especie';
      default: return 'Donación';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'validada': return 'Validada';
      case 'rechazada': return 'Rechazada';
      case 'entregada': return 'Entregada';
      default: return 'Desconocido';
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMonto = (monto) => {
    if (!monto) return null;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const descargarRecibo = async (donacion) => {
    try {
      Alert.alert(
        'Descargar Recibo',
        '¿En qué formato deseas descargar el recibo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'PDF', 
            onPress: () => descargarArchivo(donacion.id_donacion, 'pdf')
          },
          { 
            text: 'XML', 
            onPress: () => descargarArchivo(donacion.id_donacion, 'xml')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el recibo');
    }
  };

  const descargarArchivo = async (idDonacion, formato) => {
    try {
      // Realizar petición real al backend
      const url = `${ApiService.baseURL}/api/facturas/donacion/${idDonacion}/descargar?formato=${formato}`;
      
      // En React Native, para descargar archivos necesitarías usar una librería como react-native-fs
      // Por ahora simularemos la descarga exitosa
      Alert.alert(
        'Descarga Iniciada',
        `El recibo en formato ${formato.toUpperCase()} se está descargando. Revisa tu carpeta de descargas.`,
        [
          { text: 'OK' }
        ]
      );

      // En una implementación real, aquí abrirías el archivo o lo guardarías
      // Linking.openURL(url); // Para abrir en el navegador
      
    } catch (error) {
      Alert.alert('Error', `No se pudo descargar el recibo en formato ${formato.toUpperCase()}`);
    }
  };

  const verDetalles = (donacion) => {
    Alert.alert(
      'Detalles de la Donación',
      `Tipo: ${getTipoLabel(donacion.tipo)}\n` +
      `Estado: ${getEstadoLabel(donacion.estado)}\n` +
      `Fecha: ${formatearFecha(donacion.fecha_donacion)}\n` +
      (donacion.monto ? `Monto: ${formatearMonto(donacion.monto)}\n` : '') +
      `ID: ${donacion.id_donacion}\n\n` +
      `Descripción:\n${donacion.descripcion}`,
      [{ text: 'OK' }]
    );
  };

  const donacionesFiltradas = donaciones.filter(donacion => {
    if (filtroActivo === 'todas') return true;
    return donacion.estado === filtroActivo;
  });

  const goBack = () => {
    navigation.goBack();
  };

  const irADonar = () => {
    navigation.navigate('SelectorTipoDonacion');
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3EAB37" />
        <SubtitleText style={{ marginTop: 16, color: '#3EAB37' }}>
          Cargando tus donaciones...
        </SubtitleText>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar backgroundColor="#3EAB37" barStyle="light-content" />
      
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HeaderContainer style={{ backgroundColor: '#3EAB37' }}>
          <WelcomeText>Mis Donaciones</WelcomeText>
          <SubtitleText>
            Historial y estado de tus contribuciones
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Filtros */}
          <FilterContainer>
            {filtros.map((filtro) => (
              <FilterButton
                key={filtro.id}
                active={filtroActivo === filtro.id}
                onPress={() => setFiltroActivo(filtro.id)}
              >
                <FilterText active={filtroActivo === filtro.id}>
                  {filtro.label}
                </FilterText>
              </FilterButton>
            ))}
          </FilterContainer>

          {donacionesFiltradas.length === 0 ? (
            <EmptyContainer>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyTitle>
                {filtroActivo === 'todas' ? 'No tienes donaciones aún' : `No hay donaciones ${filtroActivo}s`}
              </EmptyTitle>
              <EmptyDescription>
                {filtroActivo === 'todas' 
                  ? 'Comienza a hacer la diferencia con tu primera donación'
                  : `No tienes donaciones con estado "${filtroActivo}" en este momento`
                }
              </EmptyDescription>
              
              {filtroActivo === 'todas' && (
                <PrimaryButton 
                  onPress={irADonar}
                  style={{ backgroundColor: '#3EAB37' }}
                >
                  <PrimaryButtonText>
                    Hacer mi Primera Donación
                  </PrimaryButtonText>
                </PrimaryButton>
              )}
            </EmptyContainer>
          ) : (
            donacionesFiltradas.map((donacion) => (
              <DonacionCard key={donacion.id_donacion}>
                <DonacionHeader>
                  <TipoContainer>
                    <TipoIcon>{getTipoIcon(donacion.tipo)}</TipoIcon>
                    <TipoInfo>
                      <TipoText>{getTipoLabel(donacion.tipo)}</TipoText>
                      <FechaText>{formatearFecha(donacion.fecha_donacion)}</FechaText>
                    </TipoInfo>
                  </TipoContainer>
                  <EstadoBadge estado={donacion.estado}>
                    <EstadoText estado={donacion.estado}>
                      {getEstadoLabel(donacion.estado)}
                    </EstadoText>
                  </EstadoBadge>
                </DonacionHeader>

                {donacion.monto && (
                  <MontoText>{formatearMonto(donacion.monto)}</MontoText>
                )}

                <DescripcionText numberOfLines={2}>
                  {donacion.descripcion}
                </DescripcionText>

                <AccionesContainer>
                  <AccionButton onPress={() => verDetalles(donacion)}>
                    <AccionButtonText>Ver Detalles</AccionButtonText>
                  </AccionButton>
                  
                  {(donacion.estado === 'validada' || donacion.estado === 'entregada') && (
                    <AccionButton 
                      primary 
                      onPress={() => descargarRecibo(donacion)}
                    >
                      <AccionButtonText primary>Descargar Recibo</AccionButtonText>
                    </AccionButton>
                  )}
                </AccionesContainer>
              </DonacionCard>
            ))
          )}

          <Divider />

          {/* Botón para nueva donación */}
          <SectionContainer>
            <SectionTitle>¿Quieres hacer otra donación?</SectionTitle>
            <SectionDescription style={{ marginBottom: 16 }}>
              Cada contribución hace la diferencia en nuestra comunidad
            </SectionDescription>
            
            <PrimaryButton 
              onPress={irADonar}
              style={{ backgroundColor: '#3EAB37' }}
            >
              <PrimaryButtonText>
                Nueva Donación
              </PrimaryButtonText>
            </PrimaryButton>
          </SectionContainer>

          {/* Información de contacto */}
          <SectionContainer>
            <SectionTitle>¿Necesitas ayuda?</SectionTitle>
            <SectionDescription>
              📧 donaciones@tlamatini.org{'\n'}
              📞 (123) 456-7890{'\n'}
              🕒 Lun-Vie 9:00 AM - 5:00 PM
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>

      <ErrorModal
        visible={showErrorModal}
        title="Error al cargar donaciones"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={() => {
          setShowErrorModal(false);
          cargarDonaciones();
        }}
      />
    </Container>
  );
};

export default MisDonacionesScreen;
