# 🎨 StandardHeader - Guía de Implementación

## 📖 Descripción
Componente estándar para encabezados que unifica el diseño en toda la aplicación. Elimina el espacio blanco de la barra de estado y proporciona un botón de regreso consistente.

## 🔧 Props Disponibles

```javascript
<StandardHeader
  backgroundColor="#3EAB37"      // Color del encabezado (default: #3EAB37)
  title="Título Principal"       // Título principal
  subtitle="Subtítulo"           // Subtítulo opcional 
  description="Descripción"      // Descripción opcional
  titleSize="26px"              // Tamaño del título
  subtitleSize="18px"           // Tamaño del subtítulo
  descriptionSize="14px"        // Tamaño de la descripción
  showBackButton={true}         // Mostrar botón de regreso (default: false)
  onBackPress={() => navigation.goBack()} // Función del botón de regreso
>
  {/* Contenido adicional opcional */}
</StandardHeader>
```

## 📱 Ejemplos de Uso

### 1. Dashboard Principal (sin botón de regreso)
```javascript
import StandardHeader from '../components/StandardHeader';

<StandardHeader
  backgroundColor="#3EAB37"
  title="¡Bienvenido!"
  subtitle="Ricardo Reséndiz González"
  description="Explora los servicios y programas disponibles para mejorar tu bienestar y calidad de vida."
/>
```

### 2. Pantalla con Botón de Regreso
```javascript
<StandardHeader
  backgroundColor="#059669"
  title="Mis Citas"
  description="Gestiona y revisa todas tus citas médicas y de servicios profesionales."
  showBackButton={true}
  onBackPress={() => navigation.goBack()}
/>
```

### 3. Pantalla Simple
```javascript
<StandardHeader
  backgroundColor="#2563eb"
  title="Contacto"
  showBackButton={true}
  onBackPress={() => navigation.goBack()}
/>
```

### 4. Con Contenido Personalizado
```javascript
<StandardHeader
  backgroundColor="#7c3aed"
  title="Avisos"
  description="Mantente al día con las últimas notificaciones"
  showBackButton={true}
  onBackPress={() => navigation.goBack()}
>
  <View style={{marginTop: 10}}>
    <Text style={{color: 'white'}}>Contenido adicional aquí</Text>
  </View>
</StandardHeader>
```

## 🎨 Colores Recomendados por Vista

| Vista | Color | Descripción |
|-------|-------|-------------|
| BeneficiarioHome | `#3EAB37` | Verde principal |
| ProfesionalHome | `#3EAB37` | Verde principal |
| MisCitas | `#059669` | Verde citas |
| MisDonaciones | `#3EAB37` | Verde principal |
| ActividadesSociales | `#2563eb` | Azul actividades |
| ServiciosProfesionales | `#3EAB37` | Verde principal |
| Avisos | `#7c3aed` | Púrpura avisos |
| Contacto | `#2563eb` | Azul contacto |
| MiPerfil | `#6366f1` | Púrpura perfil |

## 🔄 Migración de Vista Existente

### ANTES:
```javascript
// Eliminar estos elementos:
import { StatusBar } from 'react-native';
// Eliminar BackButton personalizado
// Eliminar HeaderContainer, WelcomeText, etc. de imports

return (
  <Container>
    <StatusBar backgroundColor="#059669" barStyle="light-content" />
    <BackButton onPress={goBack}>
      <BackIcon>←</BackIcon>
    </BackButton>
    <HeaderContainer>
      <WelcomeText>Mis Citas</WelcomeText>
      <SubtitleText>Descripción...</SubtitleText>
    </HeaderContainer>
    // contenido...
```

### DESPUÉS:
```javascript
// Agregar import:
import StandardHeader from '../components/StandardHeader';

return (
  <Container>
    <StandardHeader
      backgroundColor="#059669"
      title="Mis Citas"
      description="Gestiona y revisa todas tus citas médicas..."
      showBackButton={true}
      onBackPress={goBack}
    />
    // contenido...
```

## ✅ Beneficios

- 🎨 **Diseño consistente** en toda la aplicación
- 📱 **Sin espacios blancos** en la barra de estado  
- 🔙 **Botón de regreso estandarizado** y bien posicionado
- ⚙️ **Fácil personalización** con props
- 🔄 **Reutilizable** en cualquier vista
- 📐 **Responsive** y compatible con diferentes tamaños

## 🚀 Próximos Pasos

Para implementar en tus vistas restantes:
1. Importar `StandardHeader` 
2. Reemplazar el header existente
3. Configurar las props según el diseño deseado
4. Eliminar código redundante (StatusBar, BackButton personalizado, etc.)