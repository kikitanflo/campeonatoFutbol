<template>
  <div class="container mt-4">
    <div class="header-actions">
      <h2>👥 Gestión de Usuarios</h2>
      <NuxtLink to="/admin" class="btn-secondary" style="padding: 0.5rem 1rem; text-decoration: none;">Volver al Panel</NuxtLink>
    </div>

    <div class="admin-grid">
      <!-- Crear Usuario -->
      <div class="card">
        <h3>Crear Nuevo Usuario</h3>
        <form @submit.prevent="crearUsuario" class="mt-4">
          <div class="form-group">
            <label>Nombre de Usuario</label>
            <input type="text" v-model="form.username" class="form-control" required placeholder="Ej: arbitro2">
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" v-model="form.password" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Rol</label>
            <select v-model="form.rol" class="form-control" required>
              <option value="arbitro">Árbitro</option>
              <option value="dirigente">Dirigente</option>
            </select>
          </div>
          
          <template v-if="form.rol === 'dirigente'">
            <div class="form-group">
              <label>Equipo Asignado</label>
              <select v-model="form.equipo_id" class="form-control" required>
                <option v-for="equipo in equipos" :key="equipo.id" :value="equipo.id">{{ equipo.nombre }}</option>
              </select>
            </div>
          </template>

          <div class="form-group">
            <label>Teléfono (WhatsApp)</label>
            <input type="text" v-model="form.telefono" class="form-control" placeholder="Ej: 573000000000 (Opcional para árbitros)" :required="form.rol === 'dirigente'">
          </div>

          <div v-if="mensaje" :class="['alert', errorForm ? 'alert-danger' : 'alert-success']">
            {{ mensaje }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Creando...' : 'Crear Usuario' }}
          </button>
        </form>
      </div>

      <!-- Lista de Usuarios -->
      <div class="card">
        <h3>Usuarios Existentes</h3>
        <div v-if="pending" class="text-center mt-4">Cargando...</div>
        <div v-else class="table-responsive mt-4">
          <table class="standings-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>ROL / EQUIPO</th>
                <th>TELÉFONO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usuarios" :key="user.id">
                <td style="font-weight: bold;">{{ user.username }}</td>
                <td>
                  <span class="badge" :class="'badge-' + user.rol">{{ user.rol }}</span>
                  <div v-if="user.rol === 'dirigente'" class="small text-muted mt-1">{{ user.equipo_nombre }}</div>
                </td>
                <td>{{ user.telefono || 'N/A' }}</td>
                <td>
                  <span :class="user.activo ? 'text-success' : 'text-danger'">
                    {{ user.activo ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn-sm" 
                    :class="user.activo ? 'btn-danger' : 'btn-success'"
                    @click="cambiarEstado(user.id, !user.activo)">
                    {{ user.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });

const form = ref({ username: '', password: '', rol: 'arbitro', equipo_id: '', telefono: '' });
const loading = ref(false);
const mensaje = ref('');
const errorForm = ref(false);

const { data: apiData, pending, refresh } = await useFetch('/api/admin/usuarios');
const usuarios = computed(() => apiData.value?.usuarios || []);
const equipos = computed(() => apiData.value?.equipos || []);

async function crearUsuario() {
  loading.value = true;
  mensaje.value = '';
  errorForm.value = false;

  try {
    const { error } = await useFetch('/api/admin/usuarios', {
      method: 'POST',
      body: form.value
    });

    if (error.value) {
      errorForm.value = true;
      mensaje.value = error.value.data?.statusMessage || 'Error al crear usuario';
    } else {
      mensaje.value = 'Usuario creado con éxito!';
      form.value = { username: '', password: '', rol: 'arbitro', equipo_id: '', telefono: '' };
      await refresh();
      setTimeout(() => { mensaje.value = ''; }, 3000);
    }
  } catch (err) {
    errorForm.value = true;
    mensaje.value = 'Error inesperado';
  } finally {
    loading.value = false;
  }
}

async function cambiarEstado(id, nuevoEstado) {
  if(!confirm(`¿Estás seguro de ${nuevoEstado ? 'activar' : 'desactivar'} este usuario?`)) return;
  
  try {
    await $fetch('/api/admin/usuarios', {
      method: 'PUT',
      body: { id, activo: nuevoEstado }
    });
    await refresh();
  } catch (e) {
    alert('Error al cambiar el estado del usuario');
  }
}
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h2 { font-weight: 800; color: #111827; }
h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; }

.admin-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .admin-grid { grid-template-columns: 1fr 2fr; } }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; }

.btn-primary { width: 100%; padding: 0.75rem; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-secondary { background-color: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; cursor: pointer; }

.btn-sm { padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; color: white; }
.btn-danger { background-color: #ef4444; }
.btn-success { background-color: #10b981; }

.alert { padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; text-align: center; font-weight: 600; }
.alert-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.alert-danger { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.badge-arbitro { background: #e0e7ff; color: #3730a3; }
.badge-dirigente { background: #ffedd5; color: #9a3412; }
.text-success { color: #10b981; font-weight: bold; }
.text-danger { color: #ef4444; font-weight: bold; }

.table-responsive { overflow-x: auto; }
.standings-table { width: 100%; border-collapse: collapse; text-align: center; }
.standings-table th { padding: 0.75rem; font-size: 0.8rem; color: var(--text-muted); border-bottom: 2px solid var(--border-color); }
.standings-table td { padding: 0.75rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
</style>
