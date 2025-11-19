import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { UserContext } from '../context/UserContext';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f9fafb;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const Header = styled.View`
  margin-bottom: 20px;
`;

const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const BackIcon = styled.Text`
  font-size: 20px;
  color: #4b5563;
  margin-right: 6px;
`;

const BackText = styled.Text`
  font-size: 14px;
  color: #4b5563;
`;

const WelcomeText = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 4px;
`;

const SubText = styled.Text`
  font-size: 14px;
  color: #6b7280;
`;

const CardGrid = styled.View`
  margin-top: 10px;
`;

const CardRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Card = styled.TouchableOpacity`
  flex: 1;
  background-color: #ffffff;
  border-radius: 14px;
  padding: 16px;
  margin-right: ${({ isLast }) => (isLast ? '0px' : '12px')};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  elevation: 2;
`;

const CardIcon = styled.Text`
  font-size: 28px;
  margin-bottom: 10px;
`;

const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const CardText = styled.Text`
  font-size: 12px;
  color: #6b7280;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-top: 24px;
  margin-bottom: 8px;
`;

const InfoBox = styled.View`
  background-color: #e5f0ff;
  padding: 14px;
  border-radius: 12px;
`;

const InfoText = styled.Text`
  font-size: 13px;
  color: #1f2937;
`;

const Highlight = styled.Text`
  font-weight: 600;
  color: #1d4ed8;
`;

const ProfesionalHomeScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);

  const firstName = user?.nombres ? user.nombres.split(' ')[0] : 'Profesional';

  const goToAgenda = () => {
    navigation.navigate('MisCitas');
  };

  const goToHistorialConsultas = () => {
    navigation.navigate('HistorialConsultas');
  };

  const goToServicios = () => {
    navigation.navigate('ServiciosProfesionales');
  };

  const goToActividades = () => {
    navigation.navigate('Actividades');
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header / Bienvenida */}
        <Header>
          {navigation.canGoBack() && (
            <BackButton onPress={() => navigation.goBack()}>
              <BackIcon>←</BackIcon>
              <BackText>Volver</BackText>
            </BackButton>
          )}

          <WelcomeText>Hola, {firstName} 👋</WelcomeText>
          <SubText>
            Este es tu panel principal. Accede rápido a tu agenda, consultas,
            servicios y actividades sociales.
          </SubText>
        </Header>

        {/* Accesos rápidos principales */}
        <CardGrid>
          <CardRow>
            <Card onPress={goToAgenda}>
              <CardIcon>📆</CardIcon>
              <CardTitle>Mi agenda</CardTitle>
              <CardText>
                Revisa tus citas confirmadas y próximas sesiones.
              </CardText>
            </Card>

            <Card onPress={goToHistorialConsultas} isLast>
              <CardIcon>📋</CardIcon>
              <CardTitle>Historial de consultas</CardTitle>
              <CardText>
                Consulta el registro de sesiones realizadas con beneficiarios.
              </CardText>
            </Card>
          </CardRow>

          <CardRow>
            <Card onPress={goToServicios}>
              <CardIcon>🩺</CardIcon>
              <CardTitle>Mis servicios</CardTitle>
              <CardText>
                Gestiona los servicios profesionales que ofreces en Tlamatini.
              </CardText>
            </Card>

            <Card onPress={goToActividades} isLast>
              <CardIcon>🤝</CardIcon>
              <CardTitle>Actividades / voluntariados</CardTitle>
              <CardText>
                Explora actividades sociales y voluntariados disponibles.
              </CardText>
            </Card>
          </CardRow>
        </CardGrid>

        {/* Sección informativa */}
        <SectionTitle>Resumen rápido</SectionTitle>
        <InfoBox>
          <InfoText>
            Desde aquí podrás administrar tu{' '}
            <Highlight>agenda de citas</Highlight>, revisar el{' '}
            <Highlight>historial de consultas</Highlight>, configurar tus{' '}
            <Highlight>servicios profesionales</Highlight> y participar en{' '}
            <Highlight>actividades comunitarias</Highlight>.
          </InfoText>
        </InfoBox>
      </ScrollContainer>
    </Container>
  );
};

export default ProfesionalHomeScreen;
