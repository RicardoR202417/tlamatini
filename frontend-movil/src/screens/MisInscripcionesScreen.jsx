import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { UserContext } from '../context/UserContext';
import { obtenerInscripcionesUsuario, obtenerActividadPorId } from '../services/actividadesService';

const Container = styled.SafeAreaView`flex:1;background:#fff;`;
const Header = styled.View`padding:16px;background:#2563eb;`;
const Title = styled.Text`color:#fff;font-size:20px;font-weight:bold;`;
const DashboardButton = styled.TouchableOpacity`
  margin-top:10px;
  background: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  align-self: flex-start;
`;
const DashboardButtonText = styled.Text`
  color: #2563eb;
  font-weight: 600;
`;
const Item = styled.TouchableOpacity`padding:14px;border-bottom-width:1px;border-bottom-color:#eee;`;
const ItemTitle = styled.Text`font-size:16px;font-weight:600;`;
const ItemSub = styled.Text`font-size:14px;color:#666;margin-top:6px;`;

const MisInscripcionesScreen = ({ navigation }) => {
  const { user, token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadInscripciones();
  }, [user]);

  const loadInscripciones = async () => {
    try {
      setLoading(true);
      const res = await obtenerInscripcionesUsuario(user.id_usuario, token);
      if (res.success) {
        setInscripciones(res.data || []);
      }
    } catch (err) {
      console.error('Error al cargar inscripciones', err);
      Alert.alert('Error', err.message || 'No se pudieron cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const openActividad = async (idActividad) => {
    try {
      setLoading(true);
      const res = await obtenerActividadPorId(idActividad);
      if (res.success) {
        navigation.navigate('DetalleActividad', { actividad: res.data });
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StatusBar backgroundColor="#2563eb" barStyle="light-content" />
      <Header>
        <Title>Mis Actividades</Title>
        <DashboardButton onPress={() => navigation.navigate('BeneficiarioHome')}>
          <DashboardButtonText>← Ir al Dashboard</DashboardButtonText>
        </DashboardButton>
      </Header>

      {loading ? (
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={inscripciones}
          keyExtractor={(i) => String(i.id_inscripcion)}
          renderItem={({item}) => (
            <Item onPress={() => openActividad(item.id_actividad)}>
              <ItemTitle>{item.nombre_actividad}</ItemTitle>
              <ItemSub>{item.estado} • {new Date(item.fecha_inscripcion).toLocaleString()}</ItemSub>
            </Item>
          )}
          ListEmptyComponent={<View style={{padding:20}}><Text>No tienes inscripciones aún.</Text></View>}
        />
      )}
    </Container>
  );
};

export default MisInscripcionesScreen;
