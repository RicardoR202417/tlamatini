import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './src/context/UserContext';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

import BeneficiarioHomeScreen from './src/screens/BeneficiarioHomeScreen';
import ProfesionalHomeScreen from './src/screens/ProfesionalHomeScreen';

import ServiciosProfesionalesScreen from './src/screens/ServiciosProfesionalesScreen';
import ActividadesSocialesScreen from './src/screens/ActividadesSocialesScreen';
import DetalleActividadScreen from './src/screens/DetalleActividadScreen';

import DonacionesScreen from './src/screens/DonacionesScreen';
import SelectorTipoDonacionScreen from './src/screens/SelectorTipoDonacionScreen';
import DonacionMonetariaScreen from './src/screens/DonacionMonetariaScreen';
import DonacionDeducibleScreen from './src/screens/DonacionDeducibleScreen';
import DonacionEspecieScreen from './src/screens/DonacionEspecieScreen';
import MisDonacionesScreen from './src/screens/MisDonacionesScreen';

import MiPerfilScreen from './src/screens/MiPerfilScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';

import MisCitasScreen from './src/screens/MisCitasScreen';
import AvisosScreen from './src/screens/AvisosScreen';
import MisInscripcionesScreen from './src/screens/MisInscripcionesScreen';
import ContactoScreen from './src/screens/ContactoScreen';

// NUEVA pantalla de historial de consultas para profesional
import HistorialConsultasScreen from './src/screens/HistorialConsultasScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3EAB37',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Iniciar Sesión' }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Crear Cuenta' }}
          />

          <Stack.Screen
            name="BeneficiarioHome"
            component={BeneficiarioHomeScreen}
            options={{ 
              title: 'Inicio - Beneficiario', 
              headerShown: false,
              gestureEnabled: false 
            }}
          />

          <Stack.Screen
            name="ProfesionalHome"
            component={ProfesionalHomeScreen}
            options={{ 
              title: 'Inicio - Profesional', 
              headerShown: false,
              gestureEnabled: false 
            }}
          />

          <Stack.Screen
            name="ServiciosProfesionales"
            component={ServiciosProfesionalesScreen}
            options={{ title: 'Servicios Profesionales', headerShown: false }}
          />

          <Stack.Screen
            name="Actividades"
            component={ActividadesSocialesScreen}
            options={{ title: 'Actividades', headerShown: false }}
          />

          <Stack.Screen
            name="DetalleActividad"
            component={DetalleActividadScreen}
            options={{ title: 'Detalle de Actividad', headerShown: false }}
          />

          <Stack.Screen
            name="Donaciones"
            component={DonacionesScreen}
            options={{ title: 'Donaciones', headerShown: false }}
          />

          <Stack.Screen
            name="SelectorTipoDonacion"
            component={SelectorTipoDonacionScreen}
            options={{ title: 'Tipo de Donación', headerShown: false }}
          />

          <Stack.Screen
            name="DonacionMonetaria"
            component={DonacionMonetariaScreen}
            options={{ title: 'Donación Monetaria', headerShown: false }}
          />

          <Stack.Screen
            name="DonacionDeducible"
            component={DonacionDeducibleScreen}
            options={{ title: 'Donación Deducible', headerShown: false }}
          />

          <Stack.Screen
            name="DonacionEspecie"
            component={DonacionEspecieScreen}
            options={{ title: 'Donación en Especie', headerShown: false }}
          />

          <Stack.Screen
            name="MisDonaciones"
            component={MisDonacionesScreen}
            options={{ title: 'Mis Donaciones', headerShown: false }}
          />

          <Stack.Screen
            name="MiPerfil"
            component={MiPerfilScreen}
            options={{ title: 'Mi Perfil', headerShown: false }}
          />

          <Stack.Screen
            name="EditarPerfil"
            component={EditarPerfilScreen}
            options={{ title: 'Editar Perfil', headerShown: false }}
          />

          <Stack.Screen
            name="MisCitas"
            component={MisCitasScreen}
            options={{ title: 'Mis Citas', headerShown: false }}
          />

          {/* Nueva pantalla agregada */}
          <Stack.Screen
            name="HistorialConsultas"
            component={HistorialConsultasScreen}
            options={{ title: 'Historial de Consultas', headerShown: false }}
          />

          <Stack.Screen
            name="MisInscripciones"
            component={MisInscripcionesScreen}
            options={{ title: 'Mis Actividades', headerShown: false }}
          />

          <Stack.Screen
            name="Avisos"
            component={AvisosScreen}
            options={{ title: 'Avisos', headerShown: false }}
          />

          <Stack.Screen
            name="Contacto"
            component={ContactoScreen}
            options={{ title: 'Contacto', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
