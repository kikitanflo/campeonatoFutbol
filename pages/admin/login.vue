<template>
  <div class="login-container">
    <div class="login-box card">
      <h2 class="text-center">Panel de Administración</h2>
      <p class="text-center text-muted mb-4">Ingresa tus credenciales para continuar</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Usuario</label>
          <input type="text" v-model="username" class="form-control" required placeholder="Ej: admin">
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <div class="password-wrapper">
            <input :type="mostrarPass ? 'text' : 'password'" v-model="password" class="form-control" required placeholder="********">
            <button type="button" class="btn-eye" @click="mostrarPass = !mostrarPass" title="Mostrar/Ocultar">
              {{ mostrarPass ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth' // Activar el middleware
});

const username = ref('');
const password = ref('');
const mostrarPass = ref(false);
const errorMsg = ref('');
const loading = ref(false);
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';

  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value.trim(),
        password: password.value.trim()
      }
    });

    // Login exitoso
    const redirectUrl = data?.redirect || '/admin';
    router.push(redirectUrl);
  } catch (err) {
    if (err.data && err.data.statusMessage) {
      errorMsg.value = err.data.statusMessage;
    } else {
      errorMsg.value = 'Error de conexión. Revisa las credenciales.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
}

.mb-4 {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.2);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-eye {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #e64a19;
}

.btn-primary:disabled {
  background-color: #ffab91;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}
</style>
