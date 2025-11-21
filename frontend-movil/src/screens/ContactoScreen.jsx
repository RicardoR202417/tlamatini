import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView, StatusBar, Linking, Platform, KeyboardAvoidingView } from 'react-native';
import styled from 'styled-components/native';
import { UserContext } from '../context/UserContext';
import { enviarMensajeContacto } from '../services/contactoService';
import StandardHeader from '../components/StandardHeader';
import ApiService from '../api/ApiService';
import StorageService from '../services/StorageService';
import {
  Container,
  ContentContainer,
  SectionContainer,
  SectionTitle,
  SectionDescription,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText
} from '../styles/BeneficiarioHome.styles';

// Estilos modernos para el formulario de contacto
const FormCard = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  shadow-color: #2563eb;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 6;
  border-left-width: 4px;
  border-left-color: #2563eb;
`;

const FormGroup = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

const StyledTextInput = styled.TextInput`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  background-color: #f9fafb;
  color: #374151;
  placeholder-text-color: #9ca3af;
  ${props => props.error && `
    border-color: #dc2626;
    background-color: #fef2f2;
  `}
  ${props => props.focused && `
    border-color: #2563eb;
    background-color: white;
    placeholder-text-color: #6b7280;
  `}
`;

const StyledTextArea = styled.TextInput`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  background-color: #f9fafb;
  color: #374151;
  height: 120px;
  text-align-vertical: top;
  placeholder-text-color: #9ca3af;
  ${props => props.error && `
    border-color: #dc2626;
    background-color: #fef2f2;
  `}
  ${props => props.focused && `
    border-color: #2563eb;
    background-color: white;
    placeholder-text-color: #6b7280;
  `}
`;

const ErrorText = styled.Text`
  color: #dc2626;
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
`;

// Estilos para información de contacto
const ContactInfoCard = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 6;
`;

const ContactItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
`;

const ContactIcon = styled.Text`
  font-size: 24px;
  margin-right: 16px;
  width: 32px;
  text-align: center;
`;

const ContactContent = styled.View`
  flex: 1;
`;

const ContactLabel = styled.Text`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ContactValue = styled.Text`
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
`;

const ContactAction = styled.View`
  padding: 8px;
  border-radius: 8px;
  background-color: #dbeafe;
`;

const ActionIcon = styled.Text`
  font-size: 16px;
  color: #2563eb;
`;

const ScheduleItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f1f5f9;
`;

const DayText = styled.Text`
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const TimeText = styled.Text`
  font-size: 14px;
  color: #6b7280;
`;

const TermsCard = styled.TouchableOpacity`
  background-color: #f0f9ff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 2px solid #bae6fd;
  align-items: center;
`;

const TermsIcon = styled.Text`
  font-size: 48px;
  margin-bottom: 16px;
`;

const TermsTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #0c4a6e;
  margin-bottom: 8px;
  text-align: center;
`;

const TermsDescription = styled.Text`
  font-size: 14px;
  color: #075985;
  text-align: center;
  line-height: 20px;
`;

const ToggleButton = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  shadow-color: #2563eb;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 6;
  border-left-width: 4px;
  border-left-color: #2563eb;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ToggleText = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const ToggleIcon = styled.Text`
  font-size: 24px;
  color: #2563eb;
  font-weight: bold;
`;

const ClearButton = styled.TouchableOpacity`
  position: absolute;
  right: 12px;
  top: 50%;
  margin-top: -12px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #e5e7eb;
  justify-content: center;
  align-items: center;
`;

const ClearIcon = styled.Text`
  font-size: 14px;
  color: #6b7280;
  font-weight: bold;
`;

const FieldContainer = styled.View`
  position: relative;
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
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [formularioVisible, setFormularioVisible] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setUserLoading(true);
      
      // Obtener el token
      const token = await StorageService.getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Sesión expirada');
        navigation.navigate('Login');
        return;
      }

      // Obtener datos actualizados del servidor
      const response = await ApiService.getProfile(token);
      
      if (response.user) {
        // Actualizar el storage con los datos más recientes
        await StorageService.saveUserData(response.user);
        setUserData(response.user);
        
        // Inicializar campos del formulario
        const fullName = `${response.user.nombres || ''} ${response.user.apellidos || ''}`.trim();
        setNombre(fullName || '');
        setCorreo(response.user.correo || '');
      } else {
        throw new Error('No se recibieron datos del usuario');
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback: intentar cargar desde storage local
      try {
        const localUser = await StorageService.getUserData();
        if (localUser) {
          setUserData(localUser);
          const fullName = `${localUser.nombres || ''} ${localUser.apellidos || ''}`.trim();
          setNombre(fullName || '');
          setCorreo(localUser.correo || '');
        } else {
          Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
          navigation.goBack();
        }
      } catch (localError) {
        console.error('Error con storage local:', localError);
        Alert.alert('Error', 'Error al cargar el perfil');
        navigation.goBack();
      }
    } finally {
      setUserLoading(false);
    }
  };

  // Información de contacto
  const TELEFONO = '+52-442-123-4567';
  const EMAIL = 'contacto@tlamatini.org';
  const TELEFONO_NUMERICO = '5244212341567';

  const handlePhoneCall = async () => {
    Alert.alert(
      'Teléfono de Contacto',
      `${TELEFONO}\n\n¿Qué acción deseas realizar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Copiar Número',
          onPress: async () => {
            try {
              // Simular copia al portapapeles mostrando el número
              Alert.alert('✅ Copiado', `Número copiado: ${TELEFONO}`);
            } catch (error) {
              Alert.alert('Info', `Número: ${TELEFONO}`);
            }
          }
        },
        {
          text: 'Llamar Ahora',
          onPress: async () => {
            try {
              const phoneUrl = `tel:${TELEFONO_NUMERICO}`;
              const supported = await Linking.canOpenURL(phoneUrl);
              
              if (supported) {
                await Linking.openURL(phoneUrl);
              } else {
                Alert.alert('Error', 'No se puede realizar la llamada desde este dispositivo');
              }
            } catch (error) {
              Alert.alert('Error', 'No se puede realizar la llamada');
            }
          },
          style: 'default'
        }
      ]
    );
  };

  const handleEmailPress = async () => {
    Alert.alert(
      'Correo de Contacto',
      `${EMAIL}\n\n¿Qué acción deseas realizar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Copiar Correo',
          onPress: async () => {
            try {
              // Simular copia al portapapeles mostrando el correo
              Alert.alert('✅ Copiado', `Correo copiado: ${EMAIL}`);
            } catch (error) {
              Alert.alert('Info', `Correo: ${EMAIL}`);
            }
          }
        },
        {
          text: 'Enviar Email',
          onPress: async () => {
            try {
              const emailUrl = `mailto:${EMAIL}`;
              const supported = await Linking.canOpenURL(emailUrl);
              
              if (supported) {
                await Linking.openURL(emailUrl);
              } else {
                Alert.alert('Error', 'No se puede abrir la aplicación de correo');
              }
            } catch (error) {
              Alert.alert('Error', 'No se puede enviar el email');
            }
          },
          style: 'default'
        }
      ]
    );
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Términos y Políticas',
      'Esta funcionalidad estará disponible próximamente. Podrás consultar nuestros términos y condiciones, así como nuestras políticas de privacidad.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

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
        // Restaurar datos del usuario pero limpiar asunto y mensaje
        if (userData && userData.nombres && userData.correo) {
          const fullName = `${userData.nombres || ''} ${userData.apellidos || ''}`.trim();
          setNombre(fullName || '');
          setCorreo(userData.correo || '');
        }
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

  const clearNameField = () => {
    setNombre('');
  };

  const clearEmailField = () => {
    setCorreo('');
  };

  const resetToUserData = () => {
    if (userData && userData.nombres && userData.correo) {
      const fullName = `${userData.nombres || ''} ${userData.apellidos || ''}`.trim();
      setNombre(fullName || '');
      setCorreo(userData.correo || '');
    }
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  if (loading || userLoading) {
    return (
      <Container>
        <StandardHeader
          backgroundColor="#2563eb"
          title="Contacto"
          subtitle="Centro de Servicios UTEQ"
          description="Cargando información..."
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <ContentContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: '#6b7280' }}>Cargando datos del usuario...</Text>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <StandardHeader
        backgroundColor="#2563eb"
        title="Contacto y Ayuda"
        description="Envíanos un mensaje o contáctanos directamente. Estamos aquí para apoyarte."
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <Modal visible={showSuccess} transparent={true} animationType="fade">
        <ModalOverlay>
          <ModalContent>
            <SuccessIcon>✅</SuccessIcon>
            <ModalTitle>¡Mensaje Enviado!</ModalTitle>
            <ModalMessage>
              Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.
            </ModalMessage>
            <CloseButton onPress={handleCloseModal}>
              <CloseButtonText>Aceptar</CloseButtonText>
            </CloseButton>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: '#f9fafb' }}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Formulario de Contacto Desplegable */}
        <SectionContainer>
          <ToggleButton onPress={() => setFormularioVisible(!formularioVisible)}>
            <ToggleText>Envíanos un Comentario</ToggleText>
            <ToggleIcon>{formularioVisible ? '−' : '+'}</ToggleIcon>
          </ToggleButton>
          
          {formularioVisible && (
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <FormCard>
                <FormGroup>
                  <Label>Nombre Completo *</Label>
                  <FieldContainer>
                    <StyledTextInput
                      placeholder="Ingresa tu nombre completo"
                      placeholderTextColor="#9ca3af"
                      value={nombre}
                      onChangeText={setNombre}
                      editable={!loading}
                      error={errors.nombre}
                      focused={focusedField === 'nombre'}
                      onFocus={() => setFocusedField('nombre')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {(nombre && userData && userData.nombres && nombre === `${userData.nombres || ''} ${userData.apellidos || ''}`.trim()) && (
                      <ClearButton onPress={clearNameField}>
                        <ClearIcon>×</ClearIcon>
                      </ClearButton>
                    )}
                  </FieldContainer>
                  {errors.nombre && <ErrorText>{errors.nombre}</ErrorText>}
                </FormGroup>

              <FormGroup>
                <Label>Correo Electrónico *</Label>
                <FieldContainer>
                  <StyledTextInput
                    placeholder="tu@correo.com"
                    placeholderTextColor="#9ca3af"
                    value={correo}
                    onChangeText={setCorreo}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    error={errors.correo}
                    focused={focusedField === 'correo'}
                    onFocus={() => setFocusedField('correo')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {(correo && userData && correo === userData.correo) && (
                    <ClearButton onPress={clearEmailField}>
                      <ClearIcon>×</ClearIcon>
                    </ClearButton>
                  )}
                </FieldContainer>
                {errors.correo && <ErrorText>{errors.correo}</ErrorText>}
              </FormGroup>

              <FormGroup>
              <Label>Asunto</Label>
              <StyledTextInput
                placeholder="Asunto de tu mensaje (opcional)"
                placeholderTextColor="#9ca3af"
                value={asunto}
                onChangeText={setAsunto}
                editable={!loading}
                focused={focusedField === 'asunto'}
                onFocus={() => setFocusedField('asunto')}
                onBlur={() => setFocusedField(null)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Mensaje *</Label>
              <StyledTextArea
                placeholder="Describe tu consulta, sugerencia o comentario..."
                placeholderTextColor="#9ca3af"
                value={mensaje}
                onChangeText={setMensaje}
                multiline={true}
                editable={!loading}
                error={errors.mensaje}
                focused={focusedField === 'mensaje'}
                onFocus={() => setFocusedField('mensaje')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.mensaje && <ErrorText>{errors.mensaje}</ErrorText>}
            </FormGroup>

            {loading ? (
              <View style={{justifyContent:'center',alignItems:'center',paddingVertical:20}}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            ) : (
              <PrimaryButton onPress={handleSubmit} style={{ backgroundColor: '#2563eb' }}>
                <PrimaryButtonText>Enviar Mensaje</PrimaryButtonText>
              </PrimaryButton>
            )}
          </FormCard>
            </KeyboardAvoidingView>
          )}
        </SectionContainer>

        {/* Información de Contacto Directo */}
        <SectionContainer>
          <SectionTitle>Contacto Directo</SectionTitle>
          
          <ContactInfoCard>
            <ContactItem onPress={handlePhoneCall}>
              <ContactIcon>📞</ContactIcon>
              <ContactContent>
                <ContactLabel>Teléfono</ContactLabel>
                <ContactValue>{TELEFONO}</ContactValue>
              </ContactContent>
              <ContactAction>
                <ActionIcon>📱</ActionIcon>
              </ContactAction>
            </ContactItem>

            <ContactItem onPress={handleEmailPress}>
              <ContactIcon>✉️</ContactIcon>
              <ContactContent>
                <ContactLabel>Correo Electrónico</ContactLabel>
                <ContactValue>{EMAIL}</ContactValue>
              </ContactContent>
              <ContactAction>
                <ActionIcon>📧</ActionIcon>
              </ContactAction>
            </ContactItem>
          </ContactInfoCard>
        </SectionContainer>

        {/* Horarios de Atención */}
        <SectionContainer>
          <SectionTitle>Horarios de Atención</SectionTitle>
          
          <ContactInfoCard>
            <ScheduleItem>
              <DayText>Lunes a Viernes</DayText>
              <TimeText>8:00 AM - 6:00 PM</TimeText>
            </ScheduleItem>
            <ScheduleItem>
              <DayText>Sábados</DayText>
              <TimeText>9:00 AM - 2:00 PM</TimeText>
            </ScheduleItem>
            <ScheduleItem style={{ borderBottomWidth: 0 }}>
              <DayText>Domingos</DayText>
              <TimeText>Cerrado</TimeText>
            </ScheduleItem>
          </ContactInfoCard>
        </SectionContainer>

        {/* Términos y Políticas */}
        <SectionContainer>
          <TermsCard onPress={handleTermsPress}>
            <TermsIcon>📜</TermsIcon>
            <TermsTitle>Términos y Políticas</TermsTitle>
            <TermsDescription>
              Consulta nuestros términos y condiciones,{"\n"}
              así como nuestras políticas de privacidad.
            </TermsDescription>
          </TermsCard>
        </SectionContainer>

        {/* Información Adicional */}
        <SectionContainer>
          <SectionDescription style={{ textAlign: 'center', fontStyle: 'italic' }}>
            💬 Tiempo promedio de respuesta: 24-48 horas{"\n"}
            🔒 Toda tu información está protegida y es confidencial
          </SectionDescription>
        </SectionContainer>
      </ScrollView>
    </Container>
  );
};

export default ContactoScreen;
