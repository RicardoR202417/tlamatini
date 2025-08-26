import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import styled from 'styled-components/native';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.5);
`;

const ModalContent = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const DateInputContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
`;

const DateInputWrapper = styled.View`
  flex: 1;
`;

const DateInputLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
  color: #333;
`;

const DateInput = styled.TextInput`
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  font-size: 16px;
  background-color: #f9f9f9;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const CancelButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #ddd;
  align-items: center;
`;

const ConfirmButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: #6366f1;
  align-items: center;
`;

const ButtonText = styled.Text`
  font-weight: bold;
`;

const DatePickerModal = ({ visible, onClose, onConfirm, initialDate = '' }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  React.useEffect(() => {
    if (initialDate && visible) {
      const parts = initialDate.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    } else if (visible) {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [initialDate, visible]);

  const handleConfirm = () => {
    if (!day || !month || !year) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos de la fecha.');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Validaciones básicas
    if (dayNum < 1 || dayNum > 31) {
      Alert.alert('Día inválido', 'El día debe estar entre 1 y 31.');
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      Alert.alert('Mes inválido', 'El mes debe estar entre 1 y 12.');
      return;
    }

    if (yearNum < 1900 || yearNum > 2025) {
      Alert.alert('Año inválido', 'El año debe estar entre 1900 y 2025.');
      return;
    }

    // Validar que la fecha sea válida
    const testDate = new Date(yearNum, monthNum - 1, dayNum);
    if (testDate.getDate() !== dayNum || testDate.getMonth() !== monthNum - 1 || testDate.getFullYear() !== yearNum) {
      Alert.alert('Fecha inválida', 'La fecha ingresada no es válida.');
      return;
    }

    const formattedDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    onConfirm(formattedDate);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <ModalContainer>
        <ModalContent>
          <ModalTitle>Seleccionar Fecha de Nacimiento</ModalTitle>
          
          <DateInputContainer>
            <DateInputWrapper>
              <DateInputLabel>Día</DateInputLabel>
              <DateInput
                value={day}
                onChangeText={setDay}
                placeholder="01"
                keyboardType="numeric"
                maxLength={2}
              />
            </DateInputWrapper>
            
            <DateInputWrapper>
              <DateInputLabel>Mes</DateInputLabel>
              <DateInput
                value={month}
                onChangeText={setMonth}
                placeholder="01"
                keyboardType="numeric"
                maxLength={2}
              />
            </DateInputWrapper>
            
            <DateInputWrapper>
              <DateInputLabel>Año</DateInputLabel>
              <DateInput
                value={year}
                onChangeText={setYear}
                placeholder="1990"
                keyboardType="numeric"
                maxLength={4}
              />
            </DateInputWrapper>
          </DateInputContainer>
          
          <ButtonContainer>
            <CancelButton onPress={onClose}>
              <ButtonText style={{ color: '#666' }}>Cancelar</ButtonText>
            </CancelButton>
            
            <ConfirmButton onPress={handleConfirm}>
              <ButtonText style={{ color: 'white' }}>Confirmar</ButtonText>
            </ConfirmButton>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default DatePickerModal;
