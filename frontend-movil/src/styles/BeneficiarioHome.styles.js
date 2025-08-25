import styled from 'styled-components/native';

// Contenedor principal
export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f8f9fa;
`;

export const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

export const ContentContainer = styled.View`
  padding: 20px;
`;

// Header con bienvenida personalizada
export const HeaderContainer = styled.View`
  background-color: #3EAB37;
  padding: 24px 20px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  margin-bottom: 20px;
`;

export const WelcomeText = styled.Text`
  font-size: 26px;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
`;

export const UserNameText = styled.Text`
  font-size: 18px;
  color: #e8f5e8;
  margin-bottom: 8px;
`;

export const SubtitleText = styled.Text`
  font-size: 14px;
  color: #e8f5e8;
  line-height: 20px;
`;

// Secciones principales
export const SectionContainer = styled.View`
  margin-bottom: 25px;
`;

export const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 15px;
`;

export const SectionDescription = styled.Text`
  font-size: 14px;
  color: #718096;
  margin-bottom: 15px;
  line-height: 20px;
`;

// Cards para servicios profesionales
export const ServiceCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 6;
  border-left-width: 5px;
  border-left-color: #3EAB37;
`;

export const ServiceIcon = styled.Text`
  font-size: 36px;
  margin-bottom: 12px;
`;

export const ServiceTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 8px;
`;

export const ServiceDescription = styled.Text`
  font-size: 15px;
  color: #718096;
  line-height: 22px;
`;

// Cards para actividades y programas
export const ActivityCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.08;
  shadow-radius: 2.22px;
  elevation: 3;
  flex-direction: row;
  align-items: center;
`;

export const ActivityIcon = styled.Text`
  font-size: 24px;
  margin-right: 15px;
`;

export const ActivityInfo = styled.View`
  flex: 1;
`;

export const ActivityTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 3px;
`;

export const ActivityDescription = styled.Text`
  font-size: 13px;
  color: #718096;
`;

// Cards para donaciones
export const DonationCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3.84px;
  elevation: 5;
  border-left-width: 4px;
  border-left-color: #e53e3e;
`;

export const DonationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

export const DonationIcon = styled.Text`
  font-size: 28px;
  margin-right: 12px;
`;

export const DonationTitle = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #2d3748;
  flex: 1;
`;

export const DonationDescription = styled.Text`
  font-size: 14px;
  color: #718096;
  line-height: 18px;
`;

// Botones de acción rápida
export const QuickActionsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const QuickActionButton = styled.TouchableOpacity`
  background-color: white;
  border-radius: 14px;
  padding: 16px 12px;
  align-items: center;
  flex: 1;
  margin: 0 6px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  elevation: 4;
`;

export const QuickActionIcon = styled.Text`
  font-size: 22px;
  margin-bottom: 6px;
`;

export const QuickActionText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
`;

// Botón principal
export const PrimaryButton = styled.TouchableOpacity`
  background-color: #3EAB37;
  border-radius: 12px;
  padding: 15px;
  align-items: center;
  margin: 10px 0;
`;

export const PrimaryButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

// Botón secundario
export const SecondaryButton = styled.TouchableOpacity`
  background-color: transparent;
  border: 2px solid #3EAB37;
  border-radius: 12px;
  padding: 13px;
  align-items: center;
  margin: 5px 0;
`;

export const SecondaryButtonText = styled.Text`
  color: #3EAB37;
  font-size: 16px;
  font-weight: bold;
`;

// Separador visual
export const Divider = styled.View`
  height: 1px;
  background-color: #e2e8f0;
  margin: 20px 0;
`;

// Indicador de estado
export const StatusIndicator = styled.View`
  background-color: ${props => props.color || '#3EAB37'};
  border-radius: 10px;
  padding: 4px 8px;
  align-self: flex-start;
  margin-top: 5px;
`;

export const StatusText = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: bold;
`;
