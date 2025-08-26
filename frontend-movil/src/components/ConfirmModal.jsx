import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ConfirmCard = styled.View`
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

const ConfirmIcon = styled.Text`
  font-size: 60px;
  margin-bottom: 20px;
`;

const ConfirmTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #dc2626;
  text-align: center;
  margin-bottom: 10px;
`;

const ConfirmMessage = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 25px;
  line-height: 22px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 15px;
  width: 100%;
  justify-content: space-between;
`;

const PrimaryButton = styled.TouchableOpacity`
  background-color: #dc2626;
  padding: 15px 25px;
  border-radius: 25px;
  flex: 1;
  align-items: center;
`;

const SecondaryButton = styled.TouchableOpacity`
  background-color: #f3f4f6;
  padding: 15px 25px;
  border-radius: 25px;
  flex: 1;
  align-items: center;
`;

const PrimaryButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const SecondaryButtonText = styled.Text`
  color: #374151;
  font-size: 16px;
  font-weight: bold;
`;

const ConfirmModal = ({ 
  visible, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  onConfirm, 
  onCancel,
  icon = "⚠️"
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <ModalOverlay>
        <ConfirmCard>
          <ConfirmIcon>{icon}</ConfirmIcon>
          <ConfirmTitle>{title}</ConfirmTitle>
          <ConfirmMessage>{message}</ConfirmMessage>
          <ButtonContainer>
            <SecondaryButton onPress={onCancel}>
              <SecondaryButtonText>{cancelText}</SecondaryButtonText>
            </SecondaryButton>
            <PrimaryButton onPress={onConfirm}>
              <PrimaryButtonText>{confirmText}</PrimaryButtonText>
            </PrimaryButton>
          </ButtonContainer>
        </ConfirmCard>
      </ModalOverlay>
    </Modal>
  );
};

export default ConfirmModal;
