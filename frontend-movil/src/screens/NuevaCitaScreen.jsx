// src/screens/NuevaCitaScreen.jsx
import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, Modal, FlatList, Platform } from 'react-native';
import styled from 'styled-components/native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  PrimaryButton,
  PrimaryButtonText
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

const FormCard = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 6;
`;

const Label = styled.Text`
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 4px;
  margin-top: 10px;
`;

const TextArea = styled.TextInput`
  border-width: 1px;
  border-color: #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  color: #111827;
  height: 90px;
  text-align-vertical: top;
`;

const HelperText = styled.Text`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
`;

/* Selector de profesional */

const SelectorProfesionalButton = styled.TouchableOpacity`
  border-width: 1px;
  border-color: #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SelectorProfesionalText = styled.Text`
  font-size: 14px;
  color: ${props => (props.placeholder ? '#9ca3af' : '#111827')};
`;

const SelectorProfesionalIcon = styled.Text`
  font-size: 18px;
  color: #6b7280;
`;

/* Modal lista profesionales */

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.4);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  max-height: 70%;
  background-color: #ffffff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 16px 20px 24px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 10px;
`;

const ProfesionalItem = styled.TouchableOpacity`
  padding-vertical: 10px;
  padding-horizontal: 4px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const ProfesionalNombre = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
`;

const ProfesionalDetalle = styled.Text`
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
`;

const CerrarModalButton = styled.TouchableOpacity`
  margin-top: 10px;
  align-self: flex-end;
`;

const CerrarModalText = styled.Text`
  font-size: 14px;
  color: #059669;
  font-weight: 600;
`;

/* Helpers fecha */

const formatDateForDisplay = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}/${m}/${y}`; // lo que ve el usuario
};

const buildISOForBackend = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  // Por ahora hora fija 10:00:00
  return `${y}-${m}-${d}T10:00:00`;
};

/* ===== Screen ===== */

const NuevaCitaScreen = ({ navigation, route }) => {
  const [beneficiarioId, setBeneficiarioId] = useState(
    route?.params?.beneficiarioId || null
  );

  const [profesionales, setProfesionales] = useState([]);
  const [loadingProfesionales, setLoadingProfesionales] = useState(false);

  const [selectedProfesionalId, setSelectedProfesionalId] = useState(null);
  const [selectedProfesionalNombre, setSelectedProfesionalNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar usuario si no viene por params
  useEffect(() => {
    const loadUser = async () => {
      if (!beneficiarioId) {
        const user = await StorageService.getUserData?.();
        if (user?.id_usuario) {
          setBeneficiarioId(user.id_usuario);
        }
      }
    };
    loadUser();
  }, []);

  // Cargar profesionales (GET /api/profesionales)
  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        setLoadingProfesionales(true);
        const data = await ApiService.getProfesionales(); // ya debe devolver array

        const list = (Array.isArray(data) ? data : []).map((p) => ({
          id: p.id_profesional,
          nombre: `Profesional #${p.id_profesional}`,
          especialidad: p.especialidad || 'Atención general',
          cedula: p.cedula_profesional || 'Sin cédula registrada'
        }));

        setProfesionales(list);
      } catch (err) {
        console.error('Error al cargar profesionales:', err);
        Alert.alert(
          'Error',
          err.message || 'No se pudieron cargar los profesionales.'
        );
      } finally {
        setLoadingProfesionales(false);
      }
    };

    fetchProfesionales();
  }, []);

  const goBack = () => navigation.goBack();

  const handleSelectProfesional = (prof) => {
    setSelectedProfesionalId(prof.id);
    setSelectedProfesionalNombre(prof.nombre);
    setModalVisible(false);
  };

const onChangeDate = (event, date) => {
  console.log('CAMBIO FECHA ===>', event, date);
  if (date) setSelectedDate(date);
};

  const handleCrearCita = async () => {
    if (!beneficiarioId) {
      Alert.alert(
        'Sesión',
        'No se pudo determinar el usuario. Vuelve a iniciar sesión.'
      );
      return;
    }

    if (!selectedProfesionalId) {
      Alert.alert('Dato faltante', 'Selecciona un profesional.');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Dato faltante', 'Selecciona la fecha de la cita.');
      return;
    }

    try {
      setLoading(true);

      const fechaISO = buildISOForBackend(selectedDate);

      const payload = {
        id_beneficiario: beneficiarioId,
        id_profesional: Number(selectedProfesionalId),
        fecha_solicitada: fechaISO,
        motivo: motivo || undefined
      };

      await ApiService.crearCita(payload);

      Alert.alert(
        'Cita solicitada',
        'Tu solicitud de cita ha sido registrada. El profesional deberá confirmarla.',
        [
          {
            text: 'Ver mis citas',
            onPress: () =>
              navigation.navigate('MisCitas', { beneficiarioId }),
          },
          { text: 'OK', style: 'default' }
        ]
      );

      setSelectedProfesionalId(null);
      setSelectedProfesionalNombre('');
      setSelectedDate(null);
      setMotivo('');
    } catch (err) {
      console.error('Error al crear cita:', err);
      Alert.alert(
        'Error',
        err.message || 'Ocurrió un problema al crear la cita.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />

      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>

      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderContainer style={{ backgroundColor: '#059669' }}>
          <WelcomeText>Nueva Cita</WelcomeText>
          <SubtitleText>
            Solicita una cita con nuestros profesionales según el servicio que
            necesites.
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          <SectionContainer>
            <SectionTitle>Datos de la cita</SectionTitle>
          </SectionContainer>

          <FormCard>
            {/* Selector de profesional */}
            <Label>Profesional</Label>
            <SelectorProfesionalButton onPress={() => setModalVisible(true)}>
              <SelectorProfesionalText placeholder={!selectedProfesionalId}>
                {selectedProfesionalId
                  ? selectedProfesionalNombre
                  : loadingProfesionales
                  ? 'Cargando profesionales...'
                  : 'Selecciona un profesional'}
              </SelectorProfesionalText>
              <SelectorProfesionalIcon>▾</SelectorProfesionalIcon>
            </SelectorProfesionalButton>
            <HelperText>
              Toca para ver la lista de profesionales disponibles.
            </HelperText>

            {/* Calendario de fecha */}
            <Label>Fecha de la cita</Label>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={onChangeDate}
            />
            <HelperText>
              Fecha seleccionada:{' '}
              {selectedDate
                ? formatDateForDisplay(selectedDate)
                : 'ninguna'}
            </HelperText>

            {/* Motivo */}
            <Label>Motivo (opcional)</Label>
            <TextArea
              placeholder="Describe brevemente el motivo de tu consulta"
              value={motivo}
              onChangeText={setMotivo}
              multiline
            />

            <PrimaryButton
              onPress={handleCrearCita}
              disabled={loading}
              style={{ backgroundColor: '#059669', marginTop: 20 }}
            >
              <PrimaryButtonText>
                {loading ? 'Enviando...' : 'Solicitar cita'}
              </PrimaryButtonText>
            </PrimaryButton>
          </FormCard>

          <SectionContainer>
            <SectionDescription style={{ textAlign: 'center' }}>
              💡 La cita quedará en estado "pendiente" hasta que el profesional
              la confirme. Podrás ver el estado actualizado en "Mis Citas".
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>

      {/* Modal selector de profesionales */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Selecciona un profesional</ModalTitle>

            <FlatList
              data={profesionales}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProfesionalItem onPress={() => handleSelectProfesional(item)}>
                  <ProfesionalNombre>{item.nombre}</ProfesionalNombre>
                  <ProfesionalDetalle>
                    {item.especialidad} • Cédula: {item.cedula}
                  </ProfesionalDetalle>
                </ProfesionalItem>
              )}
              ListEmptyComponent={
                <ProfesionalDetalle>
                  {loadingProfesionales
                    ? 'Cargando profesionales...'
                    : 'No hay profesionales disponibles.'}
                </ProfesionalDetalle>
              }
            />

            <CerrarModalButton onPress={() => setModalVisible(false)}>
              <CerrarModalText>Cerrar</CerrarModalText>
            </CerrarModalButton>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export default NuevaCitaScreen;
