import styled from 'styled-components/native';

// Contenedor principal
export const Container = styled.View`
  flex: 1;
  background-color: #3EAB37;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

// Contenedor del logo
export const LogoContainer = styled.View`
  margin-bottom: 40px;
  align-items: center;
`;

// Logo
export const Logo = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
`;

// Texto de bienvenida
export const WelcomeText = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-family: 'Lexend-Black';
`;

// Texto de descripción
export const DescriptionText = styled.Text`
  font-size: 16px;
  color: white;
  text-align: center;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 24px;
  font-family: 'Lexend-Regular';
  padding: 0 20px;
`;

// Contenedor de botones
export const ButtonContainer = styled.View`
  width: 100%;
  max-width: 300px;
`;

// Botón primario
export const PrimaryButton = styled.TouchableOpacity`
  background-color: white;
  padding: 16px 32px;
  border-radius: 8px;
  margin-bottom: 16px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

// Texto del botón primario
export const PrimaryButtonText = styled.Text`
  color: #3EAB37;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Lexend-Black';
`;

// Botón secundario
export const SecondaryButton = styled.TouchableOpacity`
  background-color: transparent;
  border: 2px solid white;
  padding: 16px 32px;
  border-radius: 8px;
  align-items: center;
`;

// Texto del botón secundario
export const SecondaryButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Lexend-Black';
`;
