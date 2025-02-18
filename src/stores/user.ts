import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import axios from 'axios';
import apiClient, { setAuthToken, removeAuthToken } from '@/api/apiClient';
import router from '@/router';
import type { User } from "@/types";

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>(JSON.parse(localStorage.getItem('users') || '[]'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref<string>('');
  const errorMessage = ref<string>('');
  const isLoading = ref<boolean>(false);
  

  async function login(email: string, password: string) {
    isLoading.value = true;
    try {
      const response = await apiClient.post('/login', { email, password });
      console.log(response.data.userPin)
     


      errorMessage.value = '';

      // Establecer el token en el cliente Axios
      setAuthToken(response.data.token);

      // Guardar token en una cookie
      document.cookie = `token=${response.data.token}; Path=/; Secure; SameSite=Strict`;

      // Obtener todos los usuarios
      await getAllUsers();  

      // Guardar el usuario actual
      saveCurrentUser(email);

      // Redirigir a HomeView
      router.push({ name: 'HOME.VIEW' });
    } catch (error) {
      console.error('Login error:', error);

      if (axios.isAxiosError(error) && error.response) {
        errorMessage.value = 'Correo o contraseña incorrectos.';
      } else {
        errorMessage.value = 'Usuario no autorizado';
      }
    } finally {
      isLoading.value = false;
    }
  }

  function saveCurrentUser(email: string) {
    const loggedInUser = users.value.find((user) => user.email === email);
    if (loggedInUser) {
      user.value = loggedInUser;
      localStorage.setItem('user', JSON.stringify(user.value));
    } else {
      throw new Error('User not found');
    }
  }

  function logout() {
    user.value = null;
    token.value = '';
    
    // Eliminar el token del cliente Axios
    removeAuthToken();

    // Eliminar el token de la cookie
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    
    localStorage.removeItem('user');
    router.push({ name: 'LOGIN.VIEW' });
  }

  async function getAllUsers() {
    try {
      const response = await apiClient.get('/users');
      users.value = response.data;
      
      localStorage.setItem('users', JSON.stringify(users.value));
    } catch (error) {
      console.error('Error:', error); 
    }
  }



  // Watchers para actualizar localStorage
  watch(users, (newUsers) => {
    localStorage.setItem('users', JSON.stringify(newUsers));
  });

  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  });

  return {
    
    user,
    users,
    token,
    errorMessage,
    isLoading,
    login,
    logout,
    getAllUsers,
    saveCurrentUser,
  };
});
