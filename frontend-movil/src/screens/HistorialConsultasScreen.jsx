import React from 'react';
import { StatusBar, FlatList } from 'react-native';
import styled from 'styled-components/native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f9fafb;
`;

const Header = styled.View`
  padding: 16px 20px;
  padding-top: 12px;
  background-color: #2563eb;
`;

const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const BackIcon = styled.Text`
  font-size: 20px;
  color: #e5e7eb;
  margin-right: 6px;
`;

const BackText = styled.Text`
  font-size: 14px;
  color: #e5e7eb;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
`;

const Content = styled.View`
  flex: 1;
  padding: 16px 20px;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: #6b7280;
  margin-top: 10px;
`;

const ItemCard = styled.View`
  background-color: #ffffff;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 3px;
  elevation: 1;
`;

const ItemTitle = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const ItemSub = styled.Text`
  font-size: 13px;
  color: #6b7280;
`;

const ItemTag = styled.Text`
  font-size: 11px;
  color: #2563eb;
  font-weight: 600;
  margin-top: 4px;
`;

// Por ahora mock; luego aquí conectas tu API de historial
const mockConsultas = [];

const HistorialConsultasScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <ItemCard>
      <ItemTitle>{item.beneficiario}</ItemTitle>
      <ItemSub>{item.fecha_hora}</ItemSub>
      <ItemSub>Tipo de atención: {item.tipo_atencion}</ItemSub>
      <ItemTag>Estado: {item.estado}</ItemTag>
    </ItemCard>
  );

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <Header>
        {navigation.canGoBack() && (
          <BackButton onPress={() => navigation.goBack()}>
            <BackIcon>←</BackIcon>
            <BackText>Volver</BackText>
          </BackButton>
        )}
        <HeaderTitle>Historial de consultas</HeaderTitle>
      </Header>
      <Content>
        {mockConsultas.length === 0 ? (
          <EmptyText>
            Todavía no hay consultas registradas en tu historial. Aquí verás tus
            sesiones pasadas cuando se vayan registrando.
          </EmptyText>
        ) : (
          <FlatList
            data={mockConsultas}
            keyExtractor={(item) => item.id_consulta.toString()}
            renderItem={renderItem}
          />
        )}
      </Content>
    </Container>
  );
};

export default HistorialConsultasScreen;
