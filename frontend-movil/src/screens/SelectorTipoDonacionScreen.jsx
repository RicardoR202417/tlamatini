import React, { useState } from 'react';
import { StatusBar } from 'react-native';
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

const TipoCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  border-width: 2px;
  border-color: ${props => props.selected ? '#3EAB37' : '#e2e8f0'};
  shadow-color: ${props => props.selected ? '#3EAB37' : '#000'};
  shadow-offset: 0px 4px;
  shadow-opacity: ${props => props.selected ? 0.2 : 0.1};
  shadow-radius: 8px;
  elevation: ${props => props.selected ? 8 : 4};
`;

const TipoHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const TipoIcon = styled.Text`
  font-size: 32px;
  margin-right: 16px;
`;

const TipoTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  flex: 1;
`;

const TipoDescription = styled.Text`
  font-size: 14px;
  color: #4a5568;
  line-height: 20px;
  margin-bottom: 12px;
`;

const TipoDetails = styled.Text`
  font-size: 12px;
  color: #718096;
  line-height: 18px;
`;

const CheckIcon = styled.Text`
  font-size: 20px;
  color: #3EAB37;
  position: absolute;
  top: 16px;
  right: 16px;
`;

const SelectorTipoDonacionScreen = ({ navigation }) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  const tiposDonacion = [
    {
      id: 'monetaria',
      icon: '💰',
      title: 'Donación Monetaria',
      description: 'Realiza una donación en efectivo de forma rápida y segura.',
      details: 'Acepta PayPal, Mercado Pago y transferencias bancarias. Monto mínimo: $50 MXN',
      screen: 'DonacionMonetaria'
    },
    {
      id: 'deducible',
      icon: '📋',
      title: 'Donación Deducible',
      description: 'Donación monetaria con comprobante fiscal para deducir de impuestos.',
      details: 'Requiere RFC válido. Recibirás factura oficial y comprobante del SAT.',
      screen: 'DonacionDeducible'
    },
    {
      id: 'especie',
      icon: '📦',
      title: 'Donación en Especie',
      description: 'Dona artículos físicos como ropa, alimentos o medicamentos.',
      details: 'Requiere fotografía de evidencia. Coordinamos recolección o entrega.',
      screen: 'DonacionEspecie'
    }
  ];

  const handleTipoSelect = (tipo) => {
    setTipoSeleccionado(tipo);
  };

  const handleContinuar = () => {
    if (tipoSeleccionado) {
      navigation.navigate(tipoSeleccionado.screen);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <StatusBar backgroundColor="#3EAB37" barStyle="light-content" />
      
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer style={{ backgroundColor: '#3EAB37' }}>
          <WelcomeText>Tipo de Donación</WelcomeText>
          <SubtitleText>
            Selecciona el tipo de donación que deseas realizar
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          <SectionContainer>
            <SectionTitle>¿Cómo quieres donar?</SectionTitle>
            <SectionDescription>
              Cada tipo de donación tiene sus propias ventajas y procesos. 
              Elige la opción que mejor se adapte a tus necesidades.
            </SectionDescription>
          </SectionContainer>

          {tiposDonacion.map((tipo) => (
            <TipoCard 
              key={tipo.id}
              selected={tipoSeleccionado?.id === tipo.id}
              onPress={() => handleTipoSelect(tipo)}
            >
              {tipoSeleccionado?.id === tipo.id && <CheckIcon>✓</CheckIcon>}
              <TipoHeader>
                <TipoIcon>{tipo.icon}</TipoIcon>
                <TipoTitle>{tipo.title}</TipoTitle>
              </TipoHeader>
              <TipoDescription>{tipo.description}</TipoDescription>
              <TipoDetails>{tipo.details}</TipoDetails>
            </TipoCard>
          ))}

          <Divider />

          <SectionContainer>
            <PrimaryButton 
              onPress={handleContinuar}
              disabled={!tipoSeleccionado}
              style={{ 
                backgroundColor: tipoSeleccionado ? '#3EAB37' : '#ccc',
                opacity: tipoSeleccionado ? 1 : 0.6
              }}
            >
              <PrimaryButtonText>
                {tipoSeleccionado ? `Continuar con ${tipoSeleccionado.title}` : 'Selecciona un tipo'}
              </PrimaryButtonText>
            </PrimaryButton>
            
            <SecondaryButton 
              onPress={goBack}
              style={{ borderColor: '#3EAB37' }}
            >
              <SecondaryButtonText style={{ color: '#3EAB37' }}>
                Volver
              </SecondaryButtonText>
            </SecondaryButton>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default SelectorTipoDonacionScreen;
