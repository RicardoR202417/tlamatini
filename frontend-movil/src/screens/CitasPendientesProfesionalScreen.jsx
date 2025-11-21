// src/screens/CitasPendientesProfesionalScreen.jsx
import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import ApiService from '../api/ApiService';
import StorageService from '../services/StorageService';

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
  ActivityInfo,
  ActivityTitle,
  ActivityDescription,
  StatusIndicator,
  StatusText
} from '../styles/BeneficiarioHome.styles';

/* ===== Estilos locales ===== */

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
  elevation: 10;
  z-index: 1000;
`;

const BackIcon = styled.Text`
  font-size: 24px;
  color: #059669;
  font-weight: bold;
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

const ActionButton = styled.TouchableOpacity`
  background-color: ${(props) => props.color || '#059669'};
  padding-vertical: 8px;
  padding-horizontal: 14px;
  border-radius: 10px;
  margin-right: 8px;
  margin-top: 8px;
`;

const ActionText = styled.Text`
  color: white;
  font-size: 13px;
  font-weight: bold;
`;

const ActionsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 4px;
`;

/* ===== Screen ===== */

const CitasPendientesProfesionalScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profesionalId, setProfesionalId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await StorageService.getUserData();
        if (!user?.id_usuario) {
          Alert.alert('Error', 'No se pudo cargar el usuario.');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          return;
        }

        setProfesionalId(user.id_usuario);
        await cargarCitas(user.id_usuario);
      } catch (err) {
        console.error('Error init profesional citas:', err);
        Alert.alert('Error', 'No se pudieron cargar las citas.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const cargarCitas = async (id) => {
    try {
      setRefreshing(true);
      const data = await ApiService.getCitasProfesional(id);

      const lista = Array.isArray(data) ? data : [];

      const mapped = lista.map((cita) => {
        const rawFecha =
          cita.fecha_solicitada ||
          cita.fecha_confirmada ||
          cita.fecha_hora;

        let fecha = 'Fecha por definir';
        let hora = '';

        if (typeof rawFecha === 'string' && rawFecha.includes('T')) {
          const [f, h] = rawFecha.split('T');
          fecha = f;
          hora = h?.slice(0, 5) || '';
        }

        return {
          id: cita.id_cita || cita.id,
          idBackend: cita.id_cita || cita.id,
          beneficiario:
            cita.nombre_beneficiario ||
            cita.beneficiario_nombre ||
            `Beneficiario #${cita.id_beneficiario}`,
          fecha,
          hora,
          motivo: cita.motivo || 'Sin motivo especificado',
          estado: cita.estado || 'pendiente'
        };
      });

      setCitas(mapped);
    } catch (err) {
      console.error('Error al obtener citas profesional:', err);
      Alert.alert('Error', 'No se pudieron obtener las citas.');
    } finally {
      setRefreshing(false);
    }
  };

  /* ---- ACCIONES ---- */

  const confirmarCita = async (id) => {
    try {
      await ApiService.confirmarCita(id, {
        fecha_confirmada: new Date().toISOString()
      });
      Alert.alert('Cita confirmada', 'La cita fue confirmada con éxito.');
      if (profesionalId) await cargarCitas(profesionalId);
    } catch (err) {
      console.error('Error confirmar cita:', err);
      Alert.alert('Error', 'No se pudo confirmar la cita.');
    }
  };

  const cancelarCita = async (id) => {
    Alert.alert(
      'Cancelar cita',
      '¿Seguro que deseas cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.cancelarCita(id, {
                motivo_cancelacion: 'Cancelada por el profesional desde la app'
              });
              Alert.alert('Cita cancelada', 'La cita ha sido cancelada.');
              if (profesionalId) await cargarCitas(profesionalId);
            } catch (err) {
              console.error('Error cancelar cita:', err);
              Alert.alert('Error', 'No se pudo cancelar la cita.');
            }
          }
        }
      ]
    );
  };

  const marcarAtendida = async (id) => {
    try {
      await ApiService.atenderCita(id, {
        notas: 'Consulta atendida y registrada desde la app móvil.'
      });
      Alert.alert('Cita atendida', 'Se registró como atendida.');
      if (profesionalId) await cargarCitas(profesionalId);
    } catch (err) {
      console.error('Error marcar atendida:', err);
      Alert.alert('Error', 'No se pudo marcar como atendida.');
    }
  };

  const goBack = () => navigation.goBack();

  if (loading) {
    return (
      <Container>
        <StatusBar backgroundColor="#059669" barStyle="light-content" />
        <HeaderContainer style={{ backgroundColor: '#059669' }}>
          <WelcomeText>Citas Pendientes</WelcomeText>
          <SubtitleText>Cargando tus citas...</SubtitleText>
        </HeaderContainer>
        <LoadingWrapper>
          <ActivityIndicator size="large" color="#059669" />
          <LoadingText>Por favor espera…</LoadingText>
        </LoadingWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />

      {/* Botón regresar */}
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>

      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer style={{ backgroundColor: '#059669' }}>
          <WelcomeText>Citas Pendientes</WelcomeText>
          <SubtitleText>
            Gestiona las citas solicitadas por tus beneficiarios.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          <SectionContainer>
            <SectionTitle>Citas asignadas</SectionTitle>
            <SectionDescription>
              Aquí verás las citas que los beneficiarios han solicitado contigo.
              Puedes confirmarlas, cancelarlas o marcarlas como atendidas.
            </SectionDescription>
          </SectionContainer>

          {citas.length === 0 ? (
            <SectionContainer>
              <ActivityDescription style={{ textAlign: 'center', marginTop: 20 }}>
                No tienes citas pendientes por ahora.
              </ActivityDescription>
            </SectionContainer>
          ) : (
            <SectionContainer>
              {citas.map((cita) => (
                <ActivityCard key={cita.id} style={{ marginBottom: 15 }}>
                  <ActivityInfo>
                    <ActivityTitle>👤 {cita.beneficiario}</ActivityTitle>
                    <ActivityDescription>
                      📅 {cita.fecha}{cita.hora ? ` • ${cita.hora}` : ''}
                    </ActivityDescription>
                    <ActivityDescription>💬 {cita.motivo}</ActivityDescription>
                    <StatusIndicator color="#d97706" style={{ marginTop: 8 }}>
                      <StatusText>Pendiente</StatusText>
                    </StatusIndicator>

                    <ActivityDescription style={{ marginTop: 10, fontWeight: 'bold' }}>
                      Acciones:
                    </ActivityDescription>

                    <ActionsRow>
                      <ActionButton
                        color="#059669"
                        onPress={() => confirmarCita(cita.idBackend)}
                        disabled={refreshing}
                      >
                        <ActionText>Confirmar</ActionText>
                      </ActionButton>

                      <ActionButton
                        color="#dc2626"
                        onPress={() => cancelarCita(cita.idBackend)}
                        disabled={refreshing}
                      >
                        <ActionText>Cancelar</ActionText>
                      </ActionButton>

                      <ActionButton
                        color="#4b5563"
                        onPress={() => marcarAtendida(cita.idBackend)}
                        disabled={refreshing}
                      >
                        <ActionText>Atendida</ActionText>
                      </ActionButton>
                    </ActionsRow>
                  </ActivityInfo>
                </ActivityCard>
              ))}
            </SectionContainer>
          )}

          <SectionContainer>
            <SectionDescription style={{ textAlign: 'center', fontStyle: 'italic' }}>
              💡 Consejo: Procura confirmar o rechazar las citas con anticipación para
              mantener una buena organización de tu agenda.
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default CitasPendientesProfesionalScreen;
