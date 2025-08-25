import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styled from 'styled-components/native';

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const SuccessCard = styled.View`
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  align-items: center;
  min-width: 280px;
  shadow-color: #000;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.25;
  shadow-radius: 20px;
  elevation: 10;
`;

const SuccessIcon = styled.Text`
  font-size: 60px;
  margin-bottom: 20px;
`;

const SuccessTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #3EAB37;
  text-align: center;
  margin-bottom: 10px;
`;

const SuccessMessage = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 25px;
  line-height: 22px;
`;

const SuccessButton = styled.TouchableOpacity`
  background-color: #3EAB37;
  padding: 15px 40px;
  border-radius: 25px;
  min-width: 120px;
`;

const SuccessButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const SuccessModal = ({ 
  visible, 
  title, 
  message, 
  buttonText = "Continuar", 
  onPress 
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onPress}
    >
      <ModalOverlay>
        <SuccessCard>
          <SuccessIcon>🎉</SuccessIcon>
          <SuccessTitle>{title}</SuccessTitle>
          <SuccessMessage>{message}</SuccessMessage>
          <SuccessButton onPress={onPress}>
            <SuccessButtonText>{buttonText}</SuccessButtonText>
          </SuccessButton>
        </SuccessCard>
      </ModalOverlay>
    </Modal>
  );
};

export default SuccessModal;
