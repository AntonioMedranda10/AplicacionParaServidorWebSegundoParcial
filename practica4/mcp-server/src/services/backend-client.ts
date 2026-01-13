import axios from 'axios';

// Configuración centralizada de la conexión con el Backend NestJS
export const backendClient = axios.create({
  baseURL: 'http://localhost:3002', // Apunta a tu Backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función auxiliar para manejar errores de conexión limpiamente
export const handleAxiosError = (error: any) => {
  if (error.response) {
    console.error('Error del Backend:', error.response.data);
    throw new Error(`Backend Error: ${JSON.stringify(error.response.data)}`);
  } else if (error.request) {
    console.error('No hubo respuesta del Backend. ¿Está encendido el puerto 3002?');
    throw new Error('El Backend NestJS no responde. Verifica que esté corriendo.');
  } else {
    throw new Error(`Error de configuración: ${error.message}`);
  }
};