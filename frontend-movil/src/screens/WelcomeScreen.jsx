import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Container,
  LogoContainer,
  Logo,
  WelcomeText,
  DescriptionText,
  ButtonContainer,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText
} from '../styles/WelcomeScreen.styles';

const WelcomeScreen = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <Container>
      <StatusBar style="light" />
      
      <LogoContainer>
        {/* TODO: Reemplazar con el logo real de TLAMATINI */}
        <Logo
          source={{ uri: 'https://via.placeholder.com/120x120/FFFFFF/3EAB37?text=LOGO' }}
          resizeMode="contain"
        />
      </LogoContainer>

      <WelcomeText>
        Bienvenido a TLAMATINI
      </WelcomeText>

      <DescriptionText>
        Juntos por el bienestar comunitario. Una plataforma que conecta corazones solidarios para transformar vidas y fortalecer nuestra comunidad.
      </DescriptionText>

      <ButtonContainer>
        <PrimaryButton onPress={handleLogin}>
          <PrimaryButtonText>Iniciar Sesión</PrimaryButtonText>
        </PrimaryButton>

        <SecondaryButton onPress={handleRegister}>
          <SecondaryButtonText>Registrarse</SecondaryButtonText>
        </SecondaryButton>
      </ButtonContainer>
    </Container>
  );
};

export default WelcomeScreen;
