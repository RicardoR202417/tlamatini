import React from 'react';
import { StatusBar, FlatList } from 'react-native';
import styled from 'styled-components/native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f9fafb;
`;

const Header = styled.View`
  padding: 16px 20px;
  background-color: #2563eb;
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

const mockCitas = []; // luego aquí conectas tu API de citas confirmadas

const ProfesionalAgendaScreen = () => {
  const renderItem = ({ item }) => (
    <ItemCard>
      <ItemTitle>{item.titulo}</ItemTitle>
      <ItemSub>{item.fecha_hora}</ItemSub>
      <ItemSub>Beneficiario: {item.beneficiario}</ItemSub>
    </ItemCard>
  );

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <Header>
        <HeaderTitle>Mi agenda</HeaderTitle>
      </Header>
      <Content>
        {mockCitas.length === 0 ? (
          <EmptyText>
            Aún no tienes citas confirmadas. Cuando se confirmen, aparecerán
            aquí.
          </EmptyText>
        ) : (
          <FlatList
            data={mockCitas}
            keyExtractor={(item) => item.id_cita.toString()}
            renderItem={renderItem}
          />
        )}
      </Content>
    </Container>
  );
};

export default ProfesionalAgendaScreen;
