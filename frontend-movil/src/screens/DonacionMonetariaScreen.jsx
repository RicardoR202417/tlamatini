import React, { useState, useContext } from 'react';
import { StatusBar, Alert, ActivityIndicator } from 'react-native';
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
import SuccessModal from '../components/SuccessModal';
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

const FormContainer = styled.View`
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

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const TextInput = styled.TextInput`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 16px;
  background-color: #fff;
`;

const MontoCard = styled.TouchableOpacity`
  background-color: ${props => props.selected ? '#3EAB37' : '#f7fafc'};
  border: 2px solid ${props => props.selected ? '#3EAB37' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  margin: 4px;
  flex: 1;
  align-items: center;
`;

const MontoText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.selected ? '#fff' : '#2d3748'};
`;

const MontoRow = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

const PaymentCard = styled.TouchableOpacity`
  background-color: white;
  border: 2px solid ${props => props.selected ? '#3EAB37' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

const PaymentIcon = styled.Text`
  font-size: 24px;
  margin-right: 12px;
`;

const PaymentInfo = styled.View`
  flex: 1;
`;

const PaymentTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
`;

const PaymentDescription = styled.Text`
  font-size: 14px;
  color: #4a5568;
`;

const ErrorText = styled.Text`
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 8px;
`;

const DonacionMonetariaScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado del formulario
  const [montoSeleccionado, setMontoSeleccionado] = useState(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [errors, setErrors] = useState({});

  const montosRapidos = [50, 100, 250, 500, 1000];

  const metodosPago = [
    {
      id: 'paypal',
      icon: '💳',
      title: 'PayPal',
      description: 'Pago seguro con PayPal'
    },
    {
      id: 'mercadopago',
      icon: '💰',
      title: 'Mercado Pago',
      description: 'Tarjeta de crédito/débito'
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    const monto = montoSeleccionado || parseFloat(montoPersonalizado);
    if (!monto || monto < 50) {
      newErrors.monto = 'El monto mínimo es $50 MXN';
    }
    
    if (!metodoSeleccionado) {
      newErrors.metodo = 'Selecciona un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMontoRapido = (monto) => {
    setMontoSeleccionado(monto);
    setMontoPersonalizado('');
    if (errors.monto) {
      setErrors({ ...errors, monto: null });
    }
  };

  const handleMontoPersonalizado = (text) => {
    setMontoPersonalizado(text);
    setMontoSeleccionado(null);
    if (errors.monto) {
      setErrors({ ...errors, monto: null });
    }
  };

  const handleMetodoSelect = (metodo) => {
    setMetodoSeleccionado(metodo);
    if (errors.metodo) {
      setErrors({ ...errors, metodo: null });
    }
  };

  const procesarDonacion = async () => {
    if (!validateForm()) return;

    const monto = montoSeleccionado || parseFloat(montoPersonalizado);

    try {
      setLoading(true);

      if (metodoSeleccionado.id === 'paypal') {
        await procesarConPayPal(monto);
      } else if (metodoSeleccionado.id === 'mercadopago') {
        await procesarConMercadoPago(monto);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error al procesar la donación');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const procesarConPayPal = async (monto) => {
    try {
      // Crear orden en PayPal
      const ordenResponse = await ApiService.request('POST', '/api/donar/paypal/crear-orden', {
        monto,
        tipo: 'monetaria',
        return_url: 'tlamatini://payment/success',
        cancel_url: 'tlamatini://payment/cancel'
      });

      // En una app real, aquí se abriría el WebView de PayPal
      Alert.alert(
        'PayPal',
        'Se abrirá PayPal para completar el pago',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Continuar',
            onPress: () => simularPagoPayPal(ordenResponse.data.id, monto)
          }
        ]
      );
    } catch (error) {
      throw new Error('Error al crear orden de PayPal: ' + error.message);
    }
  };

  const simularPagoPayPal = async (orderId, monto) => {
    try {
      // Simular procesamiento exitoso
      const response = await ApiService.request('POST', '/api/donar/paypal', {
        id_usuario: user.id_usuario,
        monto,
        tipo: 'monetaria',
        descripcion,
        paypal_order_id: orderId
      });

      setShowSuccessModal(true);
    } catch (error) {
      throw new Error('Error al procesar pago con PayPal: ' + error.message);
    }
  };

  const procesarConMercadoPago = async (monto) => {
    try {
      // Crear preferencia en Mercado Pago
      const preferenciaResponse = await ApiService.request('POST', '/api/donar/mercadopago/crear-preferencia', {
        monto,
        tipo: 'monetaria',
        back_urls: {
          success: 'tlamatini://payment/success',
          failure: 'tlamatini://payment/failure',
          pending: 'tlamatini://payment/pending'
        }
      });

      // En una app real, aquí se abriría el WebView de Mercado Pago
      Alert.alert(
        'Mercado Pago',
        'Se abrirá Mercado Pago para completar el pago',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Continuar',
            onPress: () => simularPagoMercadoPago(monto)
          }
        ]
      );
    } catch (error) {
      throw new Error('Error al crear preferencia de Mercado Pago: ' + error.message);
    }
  };

  const simularPagoMercadoPago = async (monto) => {
    try {
      // Simular pago exitoso
      const paymentId = `MP_${Date.now()}`;
      const response = await ApiService.request('POST', '/api/donar/mercadopago', {
        id_usuario: user.id_usuario,
        monto,
        tipo: 'monetaria',
        descripcion,
        payment_id: paymentId,
        payment_status: 'approved'
      });

      setShowSuccessModal(true);
    } catch (error) {
      throw new Error('Error al procesar pago con Mercado Pago: ' + error.message);
    }
  };

  const handleSuccessModalPress = () => {
    setShowSuccessModal(false);
    navigation.navigate('MisDonaciones');
  };

  const handleErrorModalPress = () => {
    setShowErrorModal(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3EAB37" />
        <SubtitleText style={{ marginTop: 16, color: '#3EAB37' }}>
          Procesando donación...
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
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer style={{ backgroundColor: '#3EAB37' }}>
          <WelcomeText>Donación Monetaria</WelcomeText>
          <SubtitleText>
            Realiza tu donación de forma rápida y segura
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Selección de monto */}
          <FormContainer>
            <InputLabel>Monto de la donación</InputLabel>
            <SectionDescription style={{ marginBottom: 16 }}>
              Selecciona un monto rápido o ingresa la cantidad que desees donar
            </SectionDescription>
            
            <MontoRow>
              {montosRapidos.slice(0, 3).map((monto) => (
                <MontoCard
                  key={monto}
                  selected={montoSeleccionado === monto}
                  onPress={() => handleMontoRapido(monto)}
                >
                  <MontoText selected={montoSeleccionado === monto}>
                    ${monto}
                  </MontoText>
                </MontoCard>
              ))}
            </MontoRow>
            
            <MontoRow>
              {montosRapidos.slice(3).map((monto) => (
                <MontoCard
                  key={monto}
                  selected={montoSeleccionado === monto}
                  onPress={() => handleMontoRapido(monto)}
                >
                  <MontoText selected={montoSeleccionado === monto}>
                    ${monto}
                  </MontoText>
                </MontoCard>
              ))}
              <MontoCard
                selected={!!montoPersonalizado}
                onPress={() => {}}
                style={{ backgroundColor: montoPersonalizado ? '#3EAB37' : '#f7fafc' }}
              >
                <MontoText selected={!!montoPersonalizado}>
                  Otro
                </MontoText>
              </MontoCard>
            </MontoRow>

            <InputLabel>O ingresa tu monto personalizado:</InputLabel>
            <TextInput
              placeholder="Ej: 150"
              value={montoPersonalizado}
              onChangeText={handleMontoPersonalizado}
              keyboardType="numeric"
              style={{
                borderColor: errors.monto ? '#e53e3e' : '#e2e8f0'
              }}
            />
            {errors.monto && <ErrorText>{errors.monto}</ErrorText>}
          </FormContainer>

          {/* Descripción opcional */}
          <FormContainer>
            <InputLabel>Mensaje (opcional)</InputLabel>
            <TextInput
              placeholder="Añade un mensaje a tu donación..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormContainer>

          {/* Método de pago */}
          <FormContainer>
            <InputLabel>Método de pago</InputLabel>
            <SectionDescription style={{ marginBottom: 16 }}>
              Selecciona cómo quieres realizar tu donación
            </SectionDescription>
            
            {metodosPago.map((metodo) => (
              <PaymentCard
                key={metodo.id}
                selected={metodoSeleccionado?.id === metodo.id}
                onPress={() => handleMetodoSelect(metodo)}
              >
                <PaymentIcon>{metodo.icon}</PaymentIcon>
                <PaymentInfo>
                  <PaymentTitle>{metodo.title}</PaymentTitle>
                  <PaymentDescription>{metodo.description}</PaymentDescription>
                </PaymentInfo>
                {metodoSeleccionado?.id === metodo.id && (
                  <PaymentIcon>✓</PaymentIcon>
                )}
              </PaymentCard>
            ))}
            {errors.metodo && <ErrorText>{errors.metodo}</ErrorText>}
          </FormContainer>

          <Divider />

          {/* Botones de acción */}
          <SectionContainer>
            <PrimaryButton 
              onPress={procesarDonacion}
              disabled={loading}
              style={{ backgroundColor: '#3EAB37' }}
            >
              <PrimaryButtonText>
                Donar ${montoSeleccionado || montoPersonalizado || '0'}
              </PrimaryButtonText>
            </PrimaryButton>
            
            <SecondaryButton 
              onPress={goBack}
              style={{ borderColor: '#3EAB37' }}
            >
              <SecondaryButtonText style={{ color: '#3EAB37' }}>
                Cancelar
              </SecondaryButtonText>
            </SecondaryButton>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>

      <SuccessModal
        visible={showSuccessModal}
        title="¡Donación Exitosa!"
        message="Tu donación ha sido procesada correctamente. ¡Gracias por tu generosidad!"
        buttonText="Ver Mis Donaciones"
        onPress={handleSuccessModalPress}
        icon="💚"
      />

      <ErrorModal
        visible={showErrorModal}
        title="Error en la donación"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={handleErrorModalPress}
      />
    </Container>
  );
};

export default DonacionMonetariaScreen;