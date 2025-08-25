import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfesionalHomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Menú Profesional</Text>
        <Text style={styles.subtitle}>Bienvenido al portal de profesionales</Text>
        
        {/* Aquí irán las opciones del menú para profesionales */}
        <View style={styles.menuOptions}>
          <Text style={styles.menuItem}>🎁 Crear Donación</Text>
          <Text style={styles.menuItem}>📋 Mis Donaciones</Text>
          <Text style={styles.menuItem}>👥 Solicitudes Recibidas</Text>
          <Text style={styles.menuItem}>📊 Estadísticas</Text>
          <Text style={styles.menuItem}>👤 Mi Perfil</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3EAB37',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  menuOptions: {
    width: '100%',
    marginTop: 20,
  },
  menuItem: {
    fontSize: 18,
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3EAB37',
  },
});

export default ProfesionalHomeScreen;
