import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

// Estilos del componente estándar
const HeaderContainer = styled.View`
  background-color: ${props => props.backgroundColor || '#3EAB37'};
  padding: 50px 20px 24px 20px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  margin-bottom: 20px;
  position: relative;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 20px;
  padding: 8px;
  z-index: 10;
`;

const BackIcon = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const ContentContainer = styled.View`
  padding-top: ${props => props.showBackButton ? '0px' : '0px'};
  padding-left: ${props => props.showBackButton ? '60px' : '0px'};
`;

const Title = styled.Text`
  font-size: ${props => props.titleSize || '26px'};
  font-weight: bold;
  color: white;
  margin-bottom: ${props => props.subtitle || props.description ? '5px' : '0px'};
`;

const Subtitle = styled.Text`
  font-size: ${props => props.subtitleSize || '18px'};
  color: #e8f5e8;
  margin-bottom: ${props => props.description ? '8px' : '0px'};
`;

const Description = styled.Text`
  font-size: ${props => props.descriptionSize || '14px'};
  color: #e8f5e8;
  line-height: 20px;
`;

const StandardHeader = ({
  backgroundColor = '#3EAB37',
  title,
  subtitle,
  description,
  titleSize,
  subtitleSize, 
  descriptionSize,
  showBackButton = false,
  onBackPress,
  children
}) => {
  return (
    <>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      <HeaderContainer backgroundColor={backgroundColor}>
        {showBackButton && (
          <BackButton onPress={onBackPress}>
            <BackIcon>←</BackIcon>
          </BackButton>
        )}
        
        <ContentContainer showBackButton={showBackButton}>
          {title && (
            <Title 
              titleSize={titleSize}
              subtitle={subtitle}
              description={description}
            >
              {title}
            </Title>
          )}
          
          {subtitle && (
            <Subtitle 
              subtitleSize={subtitleSize}
              description={description}
            >
              {subtitle}
            </Subtitle>
          )}
          
          {description && (
            <Description descriptionSize={descriptionSize}>
              {description}
            </Description>
          )}
          
          {children}
        </ContentContainer>
      </HeaderContainer>
    </>
  );
};

export default StandardHeader;