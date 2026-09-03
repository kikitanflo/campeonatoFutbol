<template>
  <div class="admin-dashboard container">
    <div class="dashboard-header">
      <h2>Panel de Control</h2>
      <button @click="logout" class="btn-logout">Cerrar Sesión</button>
    </div>

    <div class="dashboard-grid">
      <div class="card action-card">
        <h3>🛡️ Equipos</h3>
        <p>Registra nuevos equipos y sube sus logos.</p>
        <NuxtLink to="/admin/equipos" class="btn-secondary" style="display: block; text-decoration: none;">Gestionar Equipos</NuxtLink>
      </div>

      <div class="card action-card">
        <h3>👥 Usuarios</h3>
        <p>Crea o desactiva árbitros y dirigentes.</p>
        <NuxtLink to="/admin/usuarios" class="btn-secondary" style="display: block; text-decoration: none;">Gestión de Seguridad</NuxtLink>
      </div>

      <div class="card action-card">
        <h3>📝 Partidos y Planillas</h3>
        <p>Registra partidos, goles, amarillas y rojas. ¡Actualiza la tabla automáticamente!</p>
        <NuxtLink to="/admin/partidos" class="btn-primary" style="display: block; text-decoration: none; text-align: center;">Programar Partidos</NuxtLink>
      </div>

      <div class="card action-card">
        <h3>⚙️ Editar Portada</h3>
        <p>Cambia los textos, títulos y botones de la página principal sin leer código.</p>
        <NuxtLink to="/admin/configuracion" class="btn-secondary" style="display: block; text-decoration: none; text-align: center;">Abrir Editor Visual</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});

const router = useRouter();
const authCookie = useCookie('admin_session');

function logout() {
  authCookie.value = null; // Borrar cookie
  router.push('/admin/login');
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.dashboard-header h2 {
  font-weight: 800;
  color: #111827;
}

.btn-logout {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-logout:hover {
  background-color: #e5e7eb;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  text-align: center;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.action-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #111827;
}

.action-card p {
  color: var(--text-muted);
  margin-bottom: 2rem;
  flex-grow: 1;
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
}

.btn-secondary {
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #111827;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}
</style>
