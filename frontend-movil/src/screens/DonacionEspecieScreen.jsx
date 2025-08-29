import React, { useState, useContext } from 'react';
import { StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Container,
  ScrollContainer,
  ContentContainer,
  HeaderContainer,
  WelcomeText,
  SubtitleText,
  SectionContainer,
  SectionTitle,
  SectionDescription,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
  Divider
} from '../styles/BeneficiarioHome.styles';
import { UserContext } from '../context/UserContext';
import ApiService from '../api/ApiService';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import styled from 'styled-components/native';

// Estilos específicos
const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 10;
  z-index: 1000;
`;

const BackIcon = styled.Text`
  font-size: 24px;
  color: #3EAB37;
  font-weight: bold;
`;

const FormContainer = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 4;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const TextInput = styled.TextInput`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 16px;
  background-color: #fff;
`;

const CategoriaCard = styled.TouchableOpacity`
  background-color: ${props => props.selected ? '#3EAB37' : '#f7fafc'};
  border: 2px solid ${props => props.selected ? '#3EAB37' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

const CategoriaIcon = styled.Text`
  font-size: 24px;
  margin-right: 12px;
`;

const CategoriaInfo = styled.View`
  flex: 1;
`;

const CategoriaTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.selected ? '#fff' : '#2d3748'};
`;

const CategoriaDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.selected ? '#e8f5e8' : '#4a5568'};
`;

const FotoContainer = styled.View`
  border: 2px dashed ${props => props.hasPhoto ? '#3EAB37' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.hasPhoto ? '#f0f9ff' : '#f7fafc'};
  margin-bottom: 16px;
`;

const FotoPreview = styled.Image`
  width: 200px;
  height: 150px;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const FotoText = styled.Text`
  font-size: 14px;
  color: #4a5568;
  text-align: center;
  margin-bottom: 8px;
`;

const InfoCard = styled.View`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const InfoText = styled.Text`
  color: #dc2626;
  font-size: 14px;
  line-height: 20px;
`;

const ErrorText = styled.Text`
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 8px;
`;

const DonacionEspecieScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado del formulario
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [errors, setErrors] = useState({});

  const categorias = [
    {
      id: 'ropa',
      icon: '👕',
      title: 'Ropa y Calzado',
      description: 'Prendas de vestir, zapatos, accesorios'
    },
    {
      id: 'alimentos',
      icon: '🥫',
      title: 'Alimentos No Perecederos',
      description: 'Enlatados, granos, productos secos'
    },
    {
      id: 'medicamentos',
      icon: '💊',
      title: 'Medicamentos',
      description: 'Medicinas, primeros auxilios, equipo médico'
    },
    {
      id: 'electronicos',
      icon: '📱',
      title: 'Electrónicos',
      description: 'Dispositivos, cables, accesorios'
    },
    {
      id: 'muebles',
      icon: '🪑',
      title: 'Muebles y Electrodomésticos',
      description: 'Muebles, aparatos, utensilios'
    },
    {
      id: 'otros',
      icon: '📦',
      title: 'Otros Artículos',
      description: 'Juguetes, libros, artículos diversos'
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!categoriaSeleccionada) {
      newErrors.categoria = 'Selecciona una categoría';
    }
    
    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!foto) {
      newErrors.foto = 'La fotografía de evidencia es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoriaSelect = (categoria) => {
    setCategoriaSeleccionada(categoria);
    if (errors.categoria) {
      setErrors({ ...errors, categoria: null });
    }
  };

  const handleDescripcionChange = (text) => {
    setDescripcion(text);
    if (errors.descripcion) {
      setErrors({ ...errors, descripcion: null });
    }
  };

  const tomarFoto = async () => {
    try {
      // Pedir permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de cámara para tomar la foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFoto(result.assets[0]);
        if (errors.foto) {
          setErrors({ ...errors, foto: null });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la cámara');
    }
  };

  const seleccionarFoto = async () => {
    try {
      // Pedir permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de galería para seleccionar la foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFoto(result.assets[0]);
        if (errors.foto) {
          setErrors({ ...errors, foto: null });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la galería');
    }
  };

  const mostrarOpcionesFoto = () => {
    Alert.alert(
      'Agregar Fotografía',
      'Selecciona una opción para agregar la foto de evidencia',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Tomar Foto',
          onPress: tomarFoto
        },
        {
          text: 'Seleccionar de Galería',
          onPress: seleccionarFoto
        }
      ]
    );
  };

  const procesarDonacion = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Crear FormData para subir la imagen
      const formData = new FormData();
      formData.append('id_usuario', user.id_usuario.toString());
      formData.append('tipo', 'especie');
      formData.append('descripcion', `${categoriaSeleccionada.title}: ${descripcion}`);

      // Agregar la imagen si existe
      if (foto) {
        formData.append('evidencias', {
          uri: foto.uri,
          type: 'image/jpeg',
          name: 'evidencia.jpg'
        });
      }

      const response = await ApiService.requestWithFile('POST', '/api/donaciones', formData);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.message || 'Error al registrar la donación en especie');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalPress = () => {
    setShowSuccessModal(false);
    navigation.navigate('MisDonaciones');
  };

  const handleErrorModalPress = () => {
    setShowErrorModal(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3EAB37" />
        <SubtitleText style={{ marginTop: 16, color: '#3EAB37' }}>
          Registrando donación en especie...
        </SubtitleText>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar backgroundColor="#3EAB37" barStyle="light-content" />
      
      <BackButton onPress={goBack}>
        <BackIcon>←</BackIcon>
      </BackButton>
      
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer style={{ backgroundColor: '#3EAB37' }}>
          <WelcomeText>Donación en Especie</WelcomeText>
          <SubtitleText>
            Dona artículos físicos para ayudar a la comunidad
          </SubtitleText>
        </HeaderContainer>

        <ContentContainer>
          {/* Información importante */}
          <InfoCard>
            <InfoText>
              📦 Todas las donaciones en especie requieren fotografía de evidencia.{'\n'}
              🚚 Coordinamos la recolección o puedes entregarlas en nuestro centro.{'\n'}
              ✅ Serán revisadas y validadas antes de distribuirse.
            </InfoText>
          </InfoCard>

          {/* Selección de categoría */}
          <FormContainer>
            <InputLabel>Categoría de Donación</InputLabel>
            <SectionDescription style={{ marginBottom: 16 }}>
              Selecciona el tipo de artículos que deseas donar
            </SectionDescription>
            
            {categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                selected={categoriaSeleccionada?.id === categoria.id}
                onPress={() => handleCategoriaSelect(categoria)}
              >
                <CategoriaIcon>{categoria.icon}</CategoriaIcon>
                <CategoriaInfo>
                  <CategoriaTitle selected={categoriaSeleccionada?.id === categoria.id}>
                    {categoria.title}
                  </CategoriaTitle>
                  <CategoriaDescription selected={categoriaSeleccionada?.id === categoria.id}>
                    {categoria.description}
                  </CategoriaDescription>
                </CategoriaInfo>
                {categoriaSeleccionada?.id === categoria.id && (
                  <CategoriaIcon>✓</CategoriaIcon>
                )}
              </CategoriaCard>
            ))}
            {errors.categoria && <ErrorText>{errors.categoria}</ErrorText>}
          </FormContainer>

          {/* Descripción detallada */}
          <FormContainer>
            <InputLabel>Descripción Detallada *</InputLabel>
            <SectionDescription style={{ marginBottom: 8 }}>
              Describe los artículos: cantidad, estado, marca, etc.
            </SectionDescription>
            <TextInput
              placeholder="Ej: 5 camisas talla M en buen estado, 3 pantalones talla L, 2 pares de zapatos talla 8..."
              value={descripcion}
              onChangeText={handleDescripcionChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                borderColor: errors.descripcion ? '#e53e3e' : '#e2e8f0',
                height: 100
              }}
            />
            {errors.descripcion && <ErrorText>{errors.descripcion}</ErrorText>}
          </FormContainer>

          {/* Fotografía de evidencia */}
          <FormContainer>
            <InputLabel>Fotografía de Evidencia *</InputLabel>
            <SectionDescription style={{ marginBottom: 16 }}>
              Toma una foto clara de los artículos que vas a donar
            </SectionDescription>
            
            <FotoContainer hasPhoto={!!foto} onPress={mostrarOpcionesFoto}>
              {foto ? (
                <>
                  <FotoPreview source={{ uri: foto.uri }} />
                  <FotoText>Toca para cambiar la fotografía</FotoText>
                </>
              ) : (
                <>
                  <CategoriaIcon style={{ fontSize: 48, marginBottom: 8 }}>📷</CategoriaIcon>
                  <FotoText>Toca para agregar fotografía</FotoText>
                </>
              )}
            </FotoContainer>
            {errors.foto && <ErrorText>{errors.foto}</ErrorText>}
          </FormContainer>

          <Divider />

          {/* Botones de acción */}
          <SectionContainer>
            <PrimaryButton 
              onPress={procesarDonacion}
              disabled={loading}
              style={{ backgroundColor: '#3EAB37' }}
            >
              <PrimaryButtonText>
                Registrar Donación en Especie
              </PrimaryButtonText>
            </PrimaryButton>
            
            <SecondaryButton 
              onPress={goBack}
              style={{ borderColor: '#3EAB37' }}
            >
              <SecondaryButtonText style={{ color: '#3EAB37' }}>
                Cancelar
              </SecondaryButtonText>
            </SecondaryButton>
          </SectionContainer>

          {/* Información adicional */}
          <SectionContainer>
            <SectionTitle>Información de Entrega</SectionTitle>
            <SectionDescription>
              📍 Centro de Acopio: Av. Universidad 123, Col. Centro{'\n'}
              🕒 Horarios: Lun-Vie 9:00 AM - 5:00 PM{'\n'}
              📞 Recolección a domicilio: (123) 456-7890{'\n'}
              📧 Coordinación: donaciones@tlamatini.org
            </SectionDescription>
          </SectionContainer>
        </ContentContainer>
      </ScrollContainer>

      <SuccessModal
        visible={showSuccessModal}
        title="¡Donación Registrada!"
        message="Tu donación en especie ha sido registrada. Te contactaremos pronto para coordinar la recolección o entrega."
        buttonText="Ver Mis Donaciones"
        onPress={handleSuccessModalPress}
        icon="📦"
      />

      <ErrorModal
        visible={showErrorModal}
        title="Error en el registro"
        message={errorMessage}
        buttonText="Intentar de nuevo"
        onPress={handleErrorModalPress}
      />
    </Container>
  );
};

export default DonacionEspecieScreen;