import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
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
  color: #7c3aed;
  font-weight: bold;
`;

const NotificationCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 6;
  border-left-width: 5px;
  border-left-color: ${props => props.borderColor || '#7c3aed'};
  ${props => !props.leido && `
    background-color: #faf5ff;
  `}
`;

const NotificationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const NotificationIcon = styled.Text`
  font-size: 24px;
  margin-right: 12px;
`;

const NotificationTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  flex: 1;
`;

const NotificationTime = styled.Text`
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
`;

const NotificationContent = styled.Text`
  font-size: 15px;
  color: #4b5563;
  line-height: 22px;
  margin-bottom: 12px;
`;

const NotificationFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const NotificationCategory = styled.Text`
  font-size: 12px;
  color: #7c3aed;
  font-weight: 600;
  text-transform: uppercase;
`;

const UnreadIndicator = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #7c3aed;
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

const AvisosScreen = ({ navigation }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo de notificaciones (en futuro vendrán del backend)
  const notificacionesEjemplo = [
    {
      id: '1',
      titulo: 'Cita Confirmada',
      contenido: 'Tu cita de psicología con la Dra. María González ha sido confirmada para el 28 de agosto a las 10:00 AM.',
      categoria: 'citas',
      fecha: '2025-08-25T14:30:00Z',
      leido: false,
      icono: '✅',
      borderColor: '#059669'
    },
    {
      id: '2',
      titulo: 'Nueva Actividad Disponible',
      contenido: 'Se ha programado una nueva sesión de Senderismo Terapéutico para este domingo. ¡Inscríbete ahora!',
      categoria: 'actividades',
      fecha: '2025-08-25T10:15:00Z',
      leido: false,
      icono: '🥾',
      borderColor: '#2563eb'
    },
    {
      id: '3',
      titulo: 'Recordatorio de Donación',
      contenido: 'Gracias por tu interés en donar. Recuerda que puedes hacer tu donación en cualquier momento desde la app.',
      categoria: 'donaciones',
      fecha: '2025-08-24T16:45:00Z',
      leido: true,
      icono: '🎁',
      borderColor: '#dc2626'
    },
    {
      id: '4',
      titulo: 'Actualización de Perfil',
      contenido: 'Te recomendamos mantener tu información de contacto actualizada para recibir mejor atención.',
      categoria: 'perfil',
      fecha: '2025-08-24T09:20:00Z',
      leido: true,
      icono: '👤',
      borderColor: '#6366f1'
    },
    {
      id: '5',
      titulo: 'Banco de Alimentos',
      contenido: 'Este sábado habrá distribución de despensas en el Centro Comunitario de 9:00 AM a 12:00 PM.',
      categoria: 'actividades',
      fecha: '2025-08-23T11:00:00Z',
      leido: true,
      icono: '🍞',
      borderColor: '#2563eb'
    }
  ];

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = () => {
    // TODO: Implementar llamada a API para obtener notificaciones del usuario
    setNotificaciones(notificacionesEjemplo);
    setLoading(false);
  };

  const formatTime = (fechaString) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace unos minutos';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return fecha.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const handleNotificationPress = (notificacion) => {
    // Marcar como leída
    if (!notificacion.leido) {
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacion.id 
            ? { ...n, leido: true }
            : n
        )
      );
    }

    // Mostrar detalles o navegar según tipo
    Alert.alert(
      notificacion.titulo,
      notificacion.contenido,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver Más',
          onPress: () => {
            // TODO: Navegar a pantalla específica según categoría
            console.log('Ver más de:', notificacion.categoria);
          }
        }
      ]
    );
  };

  const markAllAsRead = () => {
    setNotificaciones(prev => 
      prev.map(n => ({ ...n, leido: true }))
    );
    Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas');
  };

  const goBack = () => {
    navigation.goBack();
  };

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  return (
    <Container>
      <StatusBar backgroundColor="#7c3aed" barStyle="light-content" />
      
      {/* Botón de regreso */}
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderContainer style={{ backgroundColor: '#7c3aed' }}>
          <WelcomeText>Avisos y Notificaciones</WelcomeText>
          <SubtitleText>
            Mantente al día con todas las actualizaciones importantes de TLAMATINI.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Estadísticas de notificaciones */}
          <SectionContainer>
            <SectionTitle>
              Centro de Notificaciones
              {unreadCount > 0 && ` (${unreadCount} sin leer)`}
            </SectionTitle>
            
            {unreadCount > 0 && (
              <PrimaryButton 
                onPress={markAllAsRead}
                style={{ backgroundColor: '#7c3aed', marginBottom: 16 }}
              >
                <PrimaryButtonText>Marcar Todo como Leído</PrimaryButtonText>
              </PrimaryButton>
            )}
          </SectionContainer>

          {/* Lista de notificaciones */}
          {notificaciones.length > 0 ? (
            <SectionContainer>
              {notificaciones.map((notificacion) => (
                <NotificationCard
                  key={notificacion.id}
                  onPress={() => handleNotificationPress(notificacion)}
                  leido={notificacion.leido}
                  borderColor={notificacion.borderColor}
                >
                  <NotificationHeader>
                    <NotificationIcon>{notificacion.icono}</NotificationIcon>
                    <NotificationTitle numberOfLines={1}>
                      {notificacion.titulo}
                    </NotificationTitle>
                    <NotificationTime>{formatTime(notificacion.fecha)}</NotificationTime>
                    {!notificacion.leido && <UnreadIndicator />}
                  </NotificationHeader>
                  
                  <NotificationContent numberOfLines={3}>
                    {notificacion.contenido}
                  </NotificationContent>
                  
                  <NotificationFooter>
                    <NotificationCategory>{notificacion.categoria}</NotificationCategory>
                    <StatusIndicator color={notificacion.borderColor}>
                      <StatusText>{notificacion.leido ? 'Leído' : 'Nuevo'}</StatusText>
                    </StatusIndicator>
                  </NotificationFooter>
                </NotificationCard>
              ))}
            </SectionContainer>
          ) : (
            <EmptyStateCard>
              <EmptyStateIcon>🔔</EmptyStateIcon>
              <EmptyStateTitle>No tienes notificaciones</EmptyStateTitle>
              <EmptyStateDescription>
                Cuando recibas avisos importantes sobre citas, actividades o actualizaciones, 
                aparecerán aquí para mantenerte informado.
              </EmptyStateDescription>
            </EmptyStateCard>
          )}

          {/* Configuración de notificaciones */}
          <SectionContainer>
            <SectionTitle>Configuración</SectionTitle>
            
            <ServiceCard onPress={() => Alert.alert('Próximamente', 'Configuración de notificaciones')}>
              <ServiceIcon>⚙️</ServiceIcon>
              <ServiceTitle>Preferencias de Notificaciones</ServiceTitle>
              <ServiceDescription>Configura qué tipos de avisos deseas recibir</ServiceDescription>
            </ServiceCard>
          </SectionContainer>

          {/* Información adicional */}
          <SectionContainer>
            <SectionDescription style={{ textAlign: 'center', fontStyle: 'italic' }}>
              💡 Las notificaciones importantes también se envían por correo electrónico.
              {'\n'}Revisa tu bandeja de entrada regularmente.
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default AvisosScreen;
