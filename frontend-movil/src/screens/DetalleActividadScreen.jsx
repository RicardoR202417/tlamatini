import React, { useState, useContext, useEffect } from 'react';
import { StatusBar, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import styled from 'styled-components/native';
import { UserContext } from '../context/UserContext';
import { inscribirseEnActividad, cancelarInscripcion } from '../services/actividadesService';

// Header personalizado para mejor estética
const CustomHeader = styled.View`
  background-color: #2563eb;
  padding: 50px 20px 30px 20px;
  margin-top: -50px;
  padding-top: 70px;
  position: relative;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 20px;
  padding: 8px;
  z-index: 10;
`;

const BackIcon = styled.Text`
  font-size: 24px;
  color: white;
  font-weight: bold;
`;

const HeaderContent = styled.View`
  padding-top: 20px;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 8px;
`;

const HeaderSubtitle = styled.Text`
  font-size: 16px;
  color: #bfdbfe;
  text-align: center;
  margin-bottom: 16px;
`;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #2563eb;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: #f9fafb;
`;

const ContentContainer = styled.View`
  padding: 20px;
`;

const IconBig = styled.Text`
  font-size: 64px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 40px;
  width: 80px;
  height: 80px;
  line-height: 80px;
  overflow: hidden;
`;

const InfoCard = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 6;
`;

const Section = styled.View`
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12px;
`;

const SectionContent = styled.Text`
  font-size: 16px;
  color: #4b5563;
  line-height: 24px;
`;

const DetailRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 12px;
  border-left-width: 3px;
  border-left-color: #2563eb;
`;

const DetailIcon = styled.Text`
  font-size: 20px;
  margin-right: 16px;
  width: 28px;
`;

const DetailText = styled.Text`
  font-size: 15px;
  color: #1f2937;
  flex: 1;
  font-weight: 500;
`;

const PrimaryButton = styled.TouchableOpacity`
  background-color: #2563eb;
  padding: 16px 24px;
  border-radius: 12px;
  align-items: center;
  margin-bottom: 12px;
  shadow-color: #2563eb;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
  elevation: 8;
`;

const PrimaryButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

const SecondaryButton = styled.TouchableOpacity`
  background-color: #e5e7eb;
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 10px;
`;

const SecondaryButtonText = styled.Text`
  color: #374151;
  font-size: 16px;
  font-weight: bold;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalContent = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 10;
`;

const SuccessIcon = styled.Text`
  font-size: 60px;
  margin-bottom: 15px;
`;

const ModalTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 10px;
  text-align: center;
`;

const ModalMessage = styled.Text`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 20px;
  line-height: 20px;
`;

const FormInput = styled.TextInput`
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  background-color: #f9fafb;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
`;

const ConfirmButton = styled.TouchableOpacity`
  background-color: #2563eb;
  padding: 12px 30px;
  border-radius: 8px;
  width: 100%;
  align-items: center;
`;

const ConfirmButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

const DetalleActividadScreen = ({ route, navigation }) => {
  const { user, token } = useContext(UserContext);
  const { actividad } = route.params;
  
  // Form fields para inscripción
  const [nombreIns, setNombreIns] = useState(user?.nombres || '');
  const [apellidoIns, setApellidoIns] = useState(user?.apellidos || '');
  const [correoIns, setCorreoIns] = useState(user?.correo || '');
  const [telefonoIns, setTelefonoIns] = useState(user?.celular || '');
  
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estaInscrito, setEstaInscrito] = useState(false);
  const [idInscripcion, setIdInscripcion] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    verificarInscripcion();
  }, []);

  const verificarInscripcion = () => {
    if (actividad.inscripciones && user) {
      const inscripcionExistente = actividad.inscripciones.find(
        (insc) => insc.id_usuario === user.id_usuario
      );
      if (inscripcionExistente) {
        setEstaInscrito(true);
        setIdInscripcion(inscripcionExistente.id_inscripcion);
      }
    }
  };

  const handleInscribirse = async () => {
    if (!user) {
      Alert.alert('Aviso', 'Debes iniciar sesión para inscribirte');
      return;
    }

    // Mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  const confirmarInscripcion = async () => {
    setShowConfirmModal(false);

    // Validaciones básicas del formulario
    if (!nombreIns || !apellidoIns || !correoIns) {
      Alert.alert('Aviso', 'Por favor completa nombre, apellido y correo');
      return;
    }

    try {
      setLoading(true);
      const formData = {
        nombre: nombreIns,
        apellido: apellidoIns,
        correo: correoIns,
        telefono: telefonoIns
      };

      const response = await inscribirseEnActividad(actividad.id_actividad, token, formData);

      if (response.success) {
        setEstaInscrito(true);
        setIdInscripcion(response.data?.id_inscripcion);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error al inscribirse:', error);
      Alert.alert('Error', error.message || 'No se pudo completar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarInscripcion = async () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas cancelar tu inscripción?',
      [
        { text: 'No', onPress: () => {} },
        {
          text: 'Sí, cancelar',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await cancelarInscripcion(idInscripcion, token);
              
              if (response.success) {
                setEstaInscrito(false);
                setIdInscripcion(null);
                Alert.alert(
                  'Éxito',
                  'Tu inscripción ha sido cancelada',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error al cancelar inscripción:', error);
              Alert.alert('Error', error.message || 'No se pudo cancelar la inscripción');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

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
  const totalInscripciones = actividad.inscripciones ? actividad.inscripciones.length : 0;

  return (
    <Container>
      <StatusBar backgroundColor="#2563eb" barStyle="light-content" />
      
      {/* Modal de Confirmación de Inscripción */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <SuccessIcon>📋</SuccessIcon>
            <ModalTitle>Confirmar Inscripción</ModalTitle>
            <ModalMessage>
              ¿Deseas inscribirte en "{actividad.titulo}"?
            </ModalMessage>
            
            {/* Formulario de inscripción */}
            <Section style={{ width: '100%', marginBottom: 0 }}>
              <SectionTitle>Datos para la inscripción</SectionTitle>
              <FormInput
                placeholder="Nombre"
                value={nombreIns}
                onChangeText={setNombreIns}
              />
              <FormInput
                placeholder="Apellido"
                value={apellidoIns}
                onChangeText={setApellidoIns}
              />
              <FormInput
                placeholder="Correo electrónico"
                value={correoIns}
                onChangeText={setCorreoIns}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <FormInput
                placeholder="Teléfono"
                value={telefonoIns}
                onChangeText={setTelefonoIns}
                keyboardType="phone-pad"
              />

              <ConfirmButton 
                onPress={confirmarInscripcion}
                style={{ marginBottom: 10 }}
              >
                <ConfirmButtonText>Sí, Inscribirme</ConfirmButtonText>
              </ConfirmButton>
              
              <SecondaryButton 
                onPress={() => setShowConfirmModal(false)}
              >
                <SecondaryButtonText>Cancelar</SecondaryButtonText>
              </SecondaryButton>
            </Section>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <SuccessIcon>✅</SuccessIcon>
            <ModalTitle>¡Inscripción Exitosa!</ModalTitle>
            <ModalMessage>
              Te has inscrito correctamente en la actividad. Te esperamos allá.
            </ModalMessage>
            
            <ConfirmButton 
              onPress={() => setShowSuccessModal(false)}
              style={{ marginTop: 10 }}
            >
              <ConfirmButtonText>Aceptar</ConfirmButtonText>
            </ConfirmButton>
          </ModalContent>
        </ModalOverlay>
      </Modal>
      
      <StatusBar backgroundColor="#2563eb" barStyle="light-content" />
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <CustomHeader>
          <BackButton onPress={() => navigation.goBack()}>
            <BackIcon>←</BackIcon>
          </BackButton>
          
          <HeaderContent>
            <HeaderTitle>{actividad.titulo || 'Detalle de Actividad'}</HeaderTitle>
            <HeaderSubtitle>Programa Social Comunitario</HeaderSubtitle>
            <IconBig>{icon}</IconBig>
          </HeaderContent>
        </CustomHeader>

        <ContentContainer>
          {/* Descripción */}
          <InfoCard>
            <Section>
              <SectionTitle>Descripción</SectionTitle>
              <SectionContent>{actividad.descripcion}</SectionContent>
            </Section>
          </InfoCard>

          {/* Detalles */}
          <InfoCard>
            <Section>
              <SectionTitle>Detalles</SectionTitle>
              
              <DetailRow>
                <DetailIcon>📅</DetailIcon>
                <DetailText>{fechaFormato}</DetailText>
              </DetailRow>

            {actividad.horario_inicio && (
              <DetailRow>
                <DetailIcon>🕐</DetailIcon>
                <DetailText>
                  {actividad.horario_inicio}
                  {actividad.horario_fin ? ` - ${actividad.horario_fin}` : ''}
                </DetailText>
              </DetailRow>
            )}

            {actividad.ubicacion && (
              <DetailRow>
                <DetailIcon>📍</DetailIcon>
                <DetailText>{actividad.ubicacion}</DetailText>
              </DetailRow>
            )}

            <DetailRow>
              <DetailIcon>👥</DetailIcon>
              <DetailText>{totalInscripciones} inscripciones</DetailText>
            </DetailRow>

            {actividad.modalidad && (
              <DetailRow>
                <DetailIcon>📡</DetailIcon>
                <DetailText>
                  Modalidad: {actividad.modalidad === 'presencial' ? 'Presencial' : 
                             actividad.modalidad === 'distancia' ? 'A Distancia' : 'Mixta'}
                </DetailText>
              </DetailRow>
            )}
            </Section>
          </InfoCard>

          {/* Acciones */}
          <InfoCard>
            <Section>
              <SectionTitle>Inscripción</SectionTitle>
            {loading ? (
              <LoadingContainer>
                <ActivityIndicator size="large" color="#2563eb" />
              </LoadingContainer>
            ) : estaInscrito ? (
              <>
                <PrimaryButton style={{ backgroundColor: '#10b981' }}>
                  <PrimaryButtonText>✓ Inscrito</PrimaryButtonText>
                </PrimaryButton>
                <SecondaryButton onPress={handleCancelarInscripcion}>
                  <SecondaryButtonText>Cancelar Inscripción</SecondaryButtonText>
                </SecondaryButton>
              </>
            ) : (
              <PrimaryButton onPress={handleInscribirse}>
                <PrimaryButtonText>Inscribirse Ahora</PrimaryButtonText>
              </PrimaryButton>
            )}
            </Section>
          </InfoCard>

          {/* Participantes */}
          {actividad.inscripciones && actividad.inscripciones.length > 0 && (
            <InfoCard>
              <Section>
                <SectionTitle>Participantes Confirmados</SectionTitle>
                {actividad.inscripciones.map((inscripcion, index) => (
                  <DetailRow key={index}>
                    <DetailIcon>👤</DetailIcon>
                    <DetailText>
                      {inscripcion.usuario?.nombres} {inscripcion.usuario?.apellidos}
                    </DetailText>
                  </DetailRow>
                ))}
              </Section>
            </InfoCard>
          )}
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default DetalleActividadScreen;
