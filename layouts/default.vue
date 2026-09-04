<template>
  <div class="app-wrapper">
    <header class="main-header">
      <div class="container header-content">
        <div class="logo">
          <NuxtLink to="/" style="text-decoration: none; color: inherit;">
            <h1 class="logo-title">🏆 {{ siteTitle }}</h1>
          </NuxtLink>
        </div>
        <nav class="main-nav">
          <NuxtLink to="/">Inicio</NuxtLink>
          <NuxtLink to="/posiciones">Posiciones</NuxtLink>
          <NuxtLink to="/estadisticas">Estadísticas</NuxtLink>
          <NuxtLink to="/equipos">Equipos</NuxtLink>
        </nav>
        
        <!-- Zona de Usuario -->
        <div class="user-zone">
          <template v-if="userSession">
            <span class="welcome-text">👤 Hola, <strong>{{ userSession.username }}</strong></span>
            <NuxtLink :to="getDashboardLink(userSession.rol)" class="btn-panel">Ir al Panel</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/admin/login" class="btn-login">🔒 Iniciar Sesión</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>&copy; 2026 Campeonato de Fútbol. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const { data: homeData } = useFetch('/api/public/home');
const siteTitle = computed(() => {
  return homeData.value?.configuracion?.hero_title || 'Liga Pro';
});

const authCookie = useCookie('admin_session');
const userSession = computed(() => {
  if (authCookie.value) {
    try {
      return typeof authCookie.value === 'string' ? JSON.parse(decodeURIComponent(authCookie.value)) : authCookie.value;
    } catch (e) {
      return null;
    }
  }
  return null;
});

function getDashboardLink(rol) {
  if (rol === 'admin') return '/admin';
  if (rol === 'dirigente') return '/dirigente';
  if (rol === 'arbitro') return '/arbitro';
  return '/admin';
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  background-color: #111827; /* Dark background */
  color: white;
  padding: 1rem 0;
  border-bottom: 4px solid var(--primary-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-title {
  font-size: 1rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #ffffff, #d1d5db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.main-nav a {
  color: #d1d5db;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
  text-transform: uppercase;
}

.main-nav a:hover, .main-nav a.router-link-active {
  color: var(--primary-color);
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.main-footer {
  background-color: #1f2937;
  color: #9ca3af;
  text-align: center;
  padding: 2rem 0;
  font-size: 0.875rem;
}

.user-zone {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.welcome-text {
  font-size: 0.9rem;
  color: #d1d5db;
}
.welcome-text strong {
  color: white;
}
.btn-panel, .btn-login {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-panel {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}
.btn-panel:hover {
  background-color: var(--primary-color);
  color: white;
}
.btn-login {
  background-color: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
}
.btn-login:hover {
  background-color: #e64a19;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .logo-title {
    max-width: 100%;
    white-space: normal;
  }
  
  .main-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .user-zone {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    padding-top: 0.5rem;
    border-top: 1px solid #374151;
  }
}
</style>
