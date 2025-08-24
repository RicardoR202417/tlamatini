import styled from 'styled-components/native';
import { colors, fonts, spacing, borderRadius, shadows } from './globalStyles';

// Contenedor principal del formulario
export const FormContainer = styled.ScrollView`
  flex: 1;
  background-color: ${colors.white};
`;

// Contenedor del contenido
export const ContentContainer = styled.View`
  flex: 1;
  padding: ${spacing.md};
  justify-content: center;
  min-height: 100%;
`;

// Header del formulario
export const HeaderContainer = styled.View`
  align-items: center;
  margin-bottom: ${spacing.xl};
`;

// Logo pequeño
export const SmallLogo = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  margin-bottom: ${spacing.sm};
`;

// Título del formulario
export const FormTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.primary};
  text-align: center;
  margin-bottom: ${spacing.xs};
  font-family: ${fonts.headingBold};
`;

// Subtítulo del formulario
export const FormSubtitle = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
  font-family: ${fonts.bodyRegular};
`;

// Contenedor de campos de entrada
export const InputContainer = styled.View`
  margin-bottom: ${spacing.sm};
`;

// Etiqueta del campo
export const InputLabel = styled.Text`
  font-size: 16px;
  color: #333;
  margin-bottom: ${spacing.xs};
  font-family: ${fonts.bodyRegular};
  font-weight: 500;
`;

// Campo de entrada
export const TextInput = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: ${borderRadius.medium};
  padding: ${spacing.sm};
  font-size: 16px;
  background-color: ${colors.white};
  font-family: ${fonts.bodyRegular};
`;

// Campo de entrada enfocado
export const FocusedTextInput = styled(TextInput)`
  border-color: ${colors.primary};
`;

// Contenedor del picker
export const PickerContainer = styled.View`
  border: 1px solid #ddd;
  border-radius: ${borderRadius.medium};
  background-color: ${colors.white};
`;

// Contenedor de botones
export const ButtonContainer = styled.View`
  margin-top: ${spacing.md};
`;

// Botón primario
export const PrimaryButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  padding: ${spacing.sm};
  border-radius: ${borderRadius.medium};
  align-items: center;
  margin-bottom: ${spacing.sm};
  ${shadows.light}
`;

// Texto del botón primario
export const PrimaryButtonText = styled.Text`
  color: ${colors.white};
  font-size: 18px;
  font-weight: bold;
  font-family: ${fonts.headingBold};
`;

// Botón de Google
export const GoogleButton = styled.TouchableOpacity`
  background-color: ${colors.white};
  border: 1px solid #ddd;
  padding: ${spacing.sm};
  border-radius: ${borderRadius.medium};
  align-items: center;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${spacing.sm};
`;

// Texto del botón de Google
export const GoogleButtonText = styled.Text`
  color: #333;
  font-size: 16px;
  font-weight: 500;
  margin-left: ${spacing.xs};
  font-family: ${fonts.bodyRegular};
`;

// Contenedor de enlace
export const LinkContainer = styled.View`
  align-items: center;
  margin-top: ${spacing.sm};
`;

// Texto de enlace
export const LinkText = styled.Text`
  color: #666;
  font-size: 14px;
  font-family: ${fonts.bodyRegular};
`;

// Enlace
export const Link = styled.Text`
  color: ${colors.primary};
  font-weight: bold;
  font-family: ${fonts.bodyRegular};
`;

// Mensaje de error
export const ErrorMessage = styled.Text`
  color: #e53e3e;
  font-size: 14px;
  margin-top: ${spacing.xs};
  font-family: ${fonts.bodyRegular};
`;

// Contenedor de carga
export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.white};
`;
