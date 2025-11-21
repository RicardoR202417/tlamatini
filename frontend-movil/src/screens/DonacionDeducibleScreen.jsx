import React, { useState, useContext, useEffect } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import {
  Container,
  ScrollContainer,
  ContentContainer,
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
import StorageService from '../services/StorageService';
import StandardHeader from '../components/StandardHeader';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import styled from 'styled-components/native';

// Estilos específicos (reutilizando de DonacionMonetaria)
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

const InfoCard = styled.View`
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const InfoText = styled.Text`
  color: #0369a1;
  font-size: 14px;
  line-height: 20px;
`;

const ErrorText = styled.Text`
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 8px;
`;

const DonacionDeducibleScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado del formulario
  const [montoSeleccionado, setMontoSeleccionado] = useState(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [usoCfdi, setUsoCfdi] = useState('D01'); // Honorarios médicos, dentales y hospitalarios
  const [errors, setErrors] = useState({});

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
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
      } else {
        throw new Error('No se recibieron datos del usuario');
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      // Usar datos del contexto como fallback
      setUserData(user);
    }
  };

  const montosRapidos = [500, 1000, 2500, 5000, 10000];

  const usosCfdi = [
    { value: 'D01', label: 'D01 - Honorarios médicos, dentales y hospitalarios' },
    { value: 'P01', label: 'P01 - Por definir' },
    { value: 'G03', label: 'G03 - Gastos en general' },
    { value: 'D10', label: 'D10 - Pagos por servicios educativos' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    const monto = montoSeleccionado || parseFloat(montoPersonalizado);
    if (!monto || monto < 100) {
      newErrors.monto = 'El monto mínimo para donaciones deducibles es $100 MXN';
    }
    
    if (!rfc.trim()) {
      newErrors.rfc = 'El RFC es requerido';
    } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc.toUpperCase())) {
      newErrors.rfc = 'RFC inválido';
    }
    
    if (!razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es requerida';
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

  const procesarDonacion = async () => {
    if (!validateForm()) return;

    const monto = montoSeleccionado || parseFloat(montoPersonalizado);

    try {
      setLoading(true);

      // 1. Crear la donación
      const donacionResponse = await ApiService.request('POST', '/api/donaciones', {
        id_usuario: user.id_usuario,
        tipo: 'deducible',
        monto,
        descripcion: descripcion || 'Donación deducible de impuestos'
      });

      // 2. Generar la factura
      const facturaResponse = await ApiService.request('POST', '/api/facturas', {
        id_donacion: donacionResponse.data.id_donacion,
        rfc: rfc.toUpperCase(),
        razon_social: razonSocial,
        uso_cfdi: usoCfdi,
        metodo_pago: 'PUE', // Pago en una exhibición
        forma_pago: '01' // Efectivo
      });

      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.message || 'Error al procesar la donación deducible');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
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
          Procesando donación y generando factura...
        </SubtitleText>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <StandardHeader
          backgroundColor="#dc2626"
          title="Donación Deducible"
          subtitle="Donación con comprobante fiscal para deducir de impuestos"
          showBackButton={true}
          onBackPress={goBack}
        />

        <ContentContainer>
          {/* Información fiscal */}
          <InfoCard>
            <InfoText>
              📋 Las donaciones deducibles requieren datos fiscales válidos.{'\n'}
              💰 Recibirás un comprobante oficial para tu declaración anual.{'\n'}
              🏛️ Monto mínimo: $100 MXN para procesos administrativos.
            </InfoText>
          </InfoCard>

          {/* Selección de monto */}
          <FormContainer>
            <InputLabel>Monto de la donación</InputLabel>
            <SectionDescription style={{ marginBottom: 16 }}>
              Las donaciones deducibles tienen un monto mínimo de $100 MXN
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
              placeholder="Ej: 1500"
              value={montoPersonalizado}
              onChangeText={handleMontoPersonalizado}
              keyboardType="numeric"
              style={{
                borderColor: errors.monto ? '#e53e3e' : '#e2e8f0'
              }}
            />
            {errors.monto && <ErrorText>{errors.monto}</ErrorText>}
          </FormContainer>

          {/* Datos fiscales */}
          <FormContainer>
            <SectionTitle>Datos Fiscales</SectionTitle>
            <SectionDescription style={{ marginBottom: 16 }}>
              Estos datos aparecerán en tu comprobante fiscal
            </SectionDescription>
            
            <InputLabel>RFC *</InputLabel>
            <TextInput
              placeholder="Ej: ABCD123456EFG"
              value={rfc}
              onChangeText={(text) => {
                setRfc(text.toUpperCase());
                if (errors.rfc) setErrors({ ...errors, rfc: null });
              }}
              maxLength={13}
              autoCapitalize="characters"
              style={{
                borderColor: errors.rfc ? '#e53e3e' : '#e2e8f0'
              }}
            />
            {errors.rfc && <ErrorText>{errors.rfc}</ErrorText>}

            <InputLabel>Razón Social *</InputLabel>
            <TextInput
              placeholder="Nombre completo o razón social"
              value={razonSocial}
              onChangeText={(text) => {
                setRazonSocial(text);
                if (errors.razonSocial) setErrors({ ...errors, razonSocial: null });
              }}
              style={{
                borderColor: errors.razonSocial ? '#e53e3e' : '#e2e8f0'
              }}
            />
            {errors.razonSocial && <ErrorText>{errors.razonSocial}</ErrorText>}

            <InputLabel>Uso de CFDI</InputLabel>
            <SectionDescription style={{ marginBottom: 8 }}>
              Selecciona el uso que le darás al comprobante
            </SectionDescription>
            {/* En una implementación completa, esto sería un picker/selector */}
            <TextInput
              value="D01 - Honorarios médicos, dentales y hospitalarios"
              editable={false}
              style={{ backgroundColor: '#f7fafc', color: '#4a5568' }}
            />
          </FormContainer>

          {/* Información sobre entrega de comprobante */}
          <InfoCard style={{ 
            backgroundColor: '#f0fdf4', 
            borderColor: '#22c55e' 
          }}>
            <InfoText style={{ color: '#15803d' }}>
              📧 Tu comprobante fiscal (factura oficial) será enviado al correo electrónico registrado en tu cuenta: {userData?.correo || 'Cargando...'}{'\n'}
            </InfoText>
          </InfoCard>

          {/* Descripción opcional */}
          <FormContainer>
            <InputLabel>Concepto (opcional)</InputLabel>
            <TextInput
              placeholder="Describe el motivo de tu donación..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
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
        title="¡Donación y Factura Generadas!"
        message="Tu donación deducible ha sido procesada y tu factura fiscal está lista para descargar."
        buttonText="Ver Mis Donaciones"
        onPress={handleSuccessModalPress}
        icon="📋"
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

export default DonacionDeducibleScreen;
