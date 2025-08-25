import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BeneficiarioHomeScreen from './src/screens/BeneficiarioHomeScreen';
import ProfesionalHomeScreen from './src/screens/ProfesionalHomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
          options={{ title: 'Inicio - Beneficiario', headerShown: false }}
        />
        <Stack.Screen 
          name="ProfesionalHome" 
          component={ProfesionalHomeScreen}
          options={{ title: 'Inicio - Profesional', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
