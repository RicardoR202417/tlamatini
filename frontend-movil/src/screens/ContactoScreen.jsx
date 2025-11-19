import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { UserContext } from '../context/UserContext';
import { enviarMensajeContacto } from '../services/contactoService';

const Container = styled.SafeAreaView`flex:1;background:#fff;`;
const Header = styled.View`padding:20px;background:#2563eb;`;
const BackButton = styled.TouchableOpacity`margin-bottom:10px;`;
const BackIcon = styled.Text`font-size:24px;color:#fff;`;
const Title = styled.Text`color:#fff;font-size:22px;font-weight:bold;`;

const ScrollContainer = styled.ScrollView`flex:1;padding:20px;`;

const FormGroup = styled.View`margin-bottom:20px;`;
const Label = styled.Text`font-size:14px;font-weight:600;color:#1f2937;margin-bottom:6px;`;
const TextInput = styled.TextInput`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  background-color: #f9fafb;
`;
const TextArea = styled.TextInput`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  background-color: #f9fafb;
  height: 120px;
  text-align-vertical: top;
`;

const ErrorText = styled.Text`color:#dc2626;font-size:12px;margin-top:4px;`;

const SubmitButton = styled.TouchableOpacity`
  background-color: #2563eb;
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
`;
const SubmitButtonText = styled.Text`color:#fff;font-size:16px;font-weight:bold;`;

const CancelButton = styled.TouchableOpacity`
  background-color: #e5e7eb;
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  margin-top: 8px;
`;
const CancelButtonText = styled.Text`color:#374151;font-size:16px;font-weight:bold;`;

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

const SuccessIcon = styled.Text`font-size:60px;margin-bottom:15px;`;
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

const CloseButton = styled.TouchableOpacity`
  background-color: #2563eb;
  padding: 12px 30px;
  border-radius: 8px;
  width: 100%;
  align-items: center;
`;
const CloseButtonText = styled.Text`color:#fff;font-size:16px;font-weight:bold;`;

const ContactoScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [nombre, setNombre] = useState(user?.nombres || '');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!correo.trim()) newErrors.correo = 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) newErrors.correo = 'Correo inválido';
    if (!mensaje.trim()) newErrors.mensaje = 'El mensaje es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await enviarMensajeContacto({
        nombre,
        correo,
        asunto: asunto.trim() || 'Sin asunto',
        mensaje,
        website: '' // honeypot
      });

      if (response.success) {
        setShowSuccess(true);
        setNombre('');
        setCorreo('');
        setAsunto('');
        setMensaje('');
        setErrors({});
      } else {
        Alert.alert('Error', response.message || 'No se pudo enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar contacto:', error);
      Alert.alert('Error', error.message || 'Ocurrió un error al enviar tu mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon>←</BackIcon>
        </BackButton>
        <Title>Contacto</Title>
      </Header>

      <Modal visible={showSuccess} transparent={true} animationType="fade">
        <ModalOverlay>
          <ModalContent>
            <SuccessIcon>✅</SuccessIcon>
            <ModalTitle>¡Mensaje Enviado!</ModalTitle>
            <ModalMessage>
              Gracias por tu mensaje. Nos pondremos en contacto pronto.
            </ModalMessage>
            <CloseButton onPress={handleCloseModal}>
              <CloseButtonText>Aceptar</CloseButtonText>
            </CloseButton>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      <ScrollContainer showsVerticalScrollIndicator={false}>
        <FormGroup>
          <Label>Nombre*</Label>
          <TextInput
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
            editable={!loading}
          />
          {errors.nombre && <ErrorText>{errors.nombre}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Correo Electrónico*</Label>
          <TextInput
            placeholder="tu@correo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            editable={!loading}
          />
          {errors.correo && <ErrorText>{errors.correo}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Asunto</Label>
          <TextInput
            placeholder="Asunto del mensaje (opcional)"
            value={asunto}
            onChangeText={setAsunto}
            editable={!loading}
          />
        </FormGroup>

        <FormGroup>
          <Label>Mensaje*</Label>
          <TextArea
            placeholder="Escribe tu mensaje aquí..."
            value={mensaje}
            onChangeText={setMensaje}
            multiline={true}
            editable={!loading}
          />
          {errors.mensaje && <ErrorText>{errors.mensaje}</ErrorText>}
        </FormGroup>

        {loading ? (
          <View style={{justifyContent:'center',alignItems:'center',paddingVertical:20}}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
            <SubmitButton onPress={handleSubmit}>
              <SubmitButtonText>Enviar Mensaje</SubmitButtonText>
            </SubmitButton>
            <CancelButton onPress={() => navigation.goBack()}>
              <CancelButtonText>Cancelar</CancelButtonText>
            </CancelButton>
          </>
        )}
      </ScrollContainer>
    </Container>
  );
};

export default ContactoScreen;
