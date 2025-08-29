// src/components/payment/PaymentWebView.jsx
import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    Alert, 
    TouchableOpacity, 
    ActivityIndicator,
    Modal,
    SafeAreaView
} from 'react-native';
import { WebView } from 'react-native-webview';
import styled from 'styled-components/native';

const PaymentWebView = ({ 
    visible, 
    paymentUrl, 
    onSuccess, 
    onCancel, 
    onError,
    title = "Procesar Pago"
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const webViewRef = useRef(null);

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;
        
        console.log('📍 Payment WebView navigation:', url);

        // Check for success patterns
        if (url.includes('/payment/success') || 
            url.includes('/pagos/paypal/success') ||
            url.includes('/pagos/mercadopago/success') ||
            url.includes('payment_status=approved') ||
            url.includes('status=approved')) {
            
            console.log('✅ Payment success detected');
            handleSuccess(url);
            return false; // Prevent navigation
        }

        // Check for cancel patterns
        if (url.includes('/payment/cancel') || 
            url.includes('/pagos/paypal/cancel') ||
            url.includes('payment_status=cancelled') ||
            url.includes('status=cancelled')) {
            
            console.log('❌ Payment cancelled');
            handleCancel();
            return false; // Prevent navigation
        }

        // Check for error patterns
        if (url.includes('/payment/error') || 
            url.includes('/pagos/mercadopago/failure') ||
            url.includes('payment_status=failed') ||
            url.includes('status=failed')) {
            
            console.log('💥 Payment error detected');
            handleError('Error en el procesamiento del pago');
            return false; // Prevent navigation
        }

        return true; // Allow navigation
    };

    const handleSuccess = (url) => {
        // Extract payment information from URL if available
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const paymentData = {
            orderId: urlParams.get('order_id') || urlParams.get('token'),
            paymentId: urlParams.get('payment_id'),
            status: urlParams.get('status') || 'approved'
        };

        setTimeout(() => {
            onSuccess && onSuccess(paymentData);
        }, 500);
    };

    const handleCancel = () => {
        setTimeout(() => {
            onCancel && onCancel();
        }, 500);
    };

    const handleError = (errorMessage) => {
        setTimeout(() => {
            onError && onError(errorMessage);
        }, 500);
    };

    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const handleLoadEnd = () => {
        setLoading(false);
    };

    const handleLoadError = (syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error:', nativeEvent);
        setLoading(false);
        setError('Error al cargar la página de pago');
    };

    const handleClose = () => {
        Alert.alert(
            'Cancelar Pago',
            '¿Estás seguro de que quieres cancelar el pago?',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Sí, cancelar', 
                    style: 'destructive',
                    onPress: handleCancel
                }
            ]
        );
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
        >
            <SafeAreaView style={{ flex: 1 }}>
                <Container>
                    {/* Header */}
                    <Header>
                        <HeaderTitle>{title}</HeaderTitle>
                        <CloseButton onPress={handleClose}>
                            <CloseButtonText>✕</CloseButtonText>
                        </CloseButton>
                    </Header>

                    {/* Loading Indicator */}
                    {loading && (
                        <LoadingContainer>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <LoadingText>Cargando página de pago...</LoadingText>
                        </LoadingContainer>
                    )}

                    {/* Error State */}
                    {error && (
                        <ErrorContainer>
                            <ErrorText>{error}</ErrorText>
                            <RetryButton onPress={() => {
                                setError(null);
                                webViewRef.current?.reload();
                            }}>
                                <RetryButtonText>Reintentar</RetryButtonText>
                            </RetryButton>
                        </ErrorContainer>
                    )}

                    {/* WebView */}
                    {paymentUrl && !error && (
                        <WebView
                            ref={webViewRef}
                            source={{ uri: paymentUrl }}
                            onLoadStart={handleLoadStart}
                            onLoadEnd={handleLoadEnd}
                            onError={handleLoadError}
                            onNavigationStateChange={handleNavigationStateChange}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            scalesPageToFit={true}
                            style={{ flex: 1 }}
                            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
                        />
                    )}
                </Container>
            </SafeAreaView>
        </Modal>
    );
};

// Styled Components
const Container = styled.View`
    flex: 1;
    background-color: #fff;
`;

const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom-width: 1px;
    border-bottom-color: #e0e0e0;
    background-color: #f8f9fa;
`;

const HeaderTitle = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #333;
`;

const CloseButton = styled.TouchableOpacity`
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: #f0f0f0;
    justify-content: center;
    align-items: center;
`;

const CloseButtonText = styled.Text`
    font-size: 18px;
    color: #666;
    font-weight: 600;
`;

const LoadingContainer = styled.View`
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 1000;
`;

const LoadingText = styled.Text`
    margin-top: 16px;
    font-size: 16px;
    color: #666;
`;

const ErrorContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 32px;
`;

const ErrorText = styled.Text`
    font-size: 16px;
    color: #e74c3c;
    text-align: center;
    margin-bottom: 24px;
`;

const RetryButton = styled.TouchableOpacity`
    background-color: #007AFF;
    padding: 12px 24px;
    border-radius: 8px;
`;

const RetryButtonText = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: 600;
`;

export default PaymentWebView;
