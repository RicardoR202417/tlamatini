import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import StandardHeader from '../components/StandardHeader';
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
  DonationCard,
  DonationHeader,
  DonationIcon,
  DonationTitle,
  DonationDescription,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
  Divider
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
  color: #dc2626;
  font-weight: bold;
`;

const InfoCard = styled.View`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoText = styled.Text`
  color: #dc2626;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`;

const DonacionesScreen = ({ navigation }) => {
  // Opciones de Donaciones
  const opcionesDonaciones = [
    {
      id: 'dinero',
      icon: '💰',
      title: 'Donaciones Monetarias',
      description: 'Realiza donaciones en efectivo para apoyar programas específicos y necesidades urgentes de la comunidad.',
      metodos: ['Transferencia bancaria', 'PayPal', 'Tarjeta de crédito/débito'],
      minimo: '$50 MXN'
    },
    {
      id: 'especie',
      icon: '📦',
      title: 'Donaciones en Especie',
      description: 'Dona ropa, alimentos no perecederos, medicamentos y otros artículos de primera necesidad.',
      metodos: ['Entrega en centro de acopio', 'Recolección a domicilio'],
      horarios: 'Lun-Vie 9:00 AM - 5:00 PM'
    },
    {
      id: 'deducibles',
      icon: '📋',
      title: 'Donaciones Deducibles',
      description: 'Obtén comprobantes fiscales oficiales para deducir tus donaciones de impuestos según la ley vigente.',
      beneficios: ['Deducción fiscal', 'Comprobante oficial', 'Transparencia total'],
      requisitos: 'RFC activo requerido'
    }
  ];

  const handleDonacionPress = (donacion) => {
    switch(donacion.id) {
      case 'dinero':
        navigation.navigate('DonacionMonetaria');
        break;
      case 'especie':
        navigation.navigate('DonacionEspecie');
        break;
      case 'deducibles':
        navigation.navigate('DonacionDeducible');
        break;
      default:
        console.log(`Tipo de donación no implementado: ${donacion.id}`);
    }
  };

  return (
    <Container>
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <StandardHeader
          backgroundColor="#dc2626"
          title="Apóyanos / Donaciones"
          subtitle="Plataforma de Contribución Social"
          description="Tu generosidad hace la diferencia. Conoce las diferentes formas en que puedes contribuir."
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <ContentContainer>
          {/* Información importante */}
          <InfoCard>
            <InfoText>
              🎁 Todas las donaciones son destinadas directamente a programas de apoyo comunitario. 
              Manejamos completa transparencia en el uso de recursos.
            </InfoText>
          </InfoCard>

          {/* Información general */}
          <SectionContainer>
            <SectionTitle>Formas de Contribuir</SectionTitle>
            <SectionDescription>
              Existen diferentes maneras de apoyar nuestra causa. Elige la opción que mejor se adapte 
              a tus posibilidades y preferencias.
            </SectionDescription>
          </SectionContainer>

          {/* Lista de opciones de donación */}
          {opcionesDonaciones.map((donacion) => (
            <DonationCard 
              key={donacion.id} 
              onPress={() => handleDonacionPress(donacion)}
            >
              <DonationHeader>
                <DonationIcon>{donacion.icon}</DonationIcon>
                <DonationTitle>{donacion.title}</DonationTitle>
              </DonationHeader>
              <DonationDescription>{donacion.description}</DonationDescription>
              
              {/* Información adicional específica */}
              {donacion.metodos && (
                <SectionDescription style={{ marginTop: 10, fontWeight: 'bold' }}>
                  Métodos disponibles: {donacion.metodos.join(', ')}
                </SectionDescription>
              )}
              
              {donacion.minimo && (
                <SectionDescription style={{ color: '#059669' }}>
                  Monto mínimo: {donacion.minimo}
                </SectionDescription>
              )}
              
              {donacion.horarios && (
                <SectionDescription style={{ color: '#2563eb' }}>
                  Horarios: {donacion.horarios}
                </SectionDescription>
              )}
              
              {donacion.beneficios && (
                <SectionDescription style={{ color: '#7c3aed' }}>
                  Beneficios: {donacion.beneficios.join(', ')}
                </SectionDescription>
              )}
              
              {donacion.requisitos && (
                <SectionDescription style={{ color: '#dc2626', fontStyle: 'italic' }}>
                  Requisito: {donacion.requisitos}
                </SectionDescription>
              )}
            </DonationCard>
          ))}
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default DonacionesScreen;
