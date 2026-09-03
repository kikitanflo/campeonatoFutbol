<template>
  <div class="container">
    <div class="header-actions">
      <h2>Gestionar Equipos</h2>
      <NuxtLink to="/admin" class="btn-secondary" style="padding: 0.5rem 1rem; text-decoration: none;">Volver al Panel</NuxtLink>
    </div>

    <div class="admin-grid">
      <!-- Formulario para agregar -->
      <div class="card">
        <h3>Agregar Nuevo Equipo</h3>
        <form @submit.prevent="crearEquipo" class="mt-4">
          <div class="form-group">
            <label>Nombre del Equipo</label>
            <input type="text" v-model="nuevoEquipo" class="form-control" required placeholder="Ej: Los Galácticos FC">
          </div>
          
          <div v-if="mensaje" :class="['alert', errorForm ? 'alert-danger' : 'alert-success']">
            {{ mensaje }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Equipo' }}
          </button>
        </form>
      </div>

      <!-- Lista de equipos actuales -->
      <div class="card">
        <h3>Equipos Registrados ({{ equipos?.length || 0 }})</h3>
        <div class="table-responsive mt-4">
          <table class="standings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in equipos" :key="team.id">
                <td>{{ team.id }}</td>
                <td style="font-weight: bold; text-align: left;">{{ team.name }}</td>
                <td>
                  <button class="btn-sm btn-delete">Eliminar</button>
                </td>
              </tr>
              <tr v-if="!equipos || equipos.length === 0">
                <td colspan="3" class="text-muted">No hay equipos creados.</td>
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

const nuevoEquipo = ref('');
const loading = ref(false);
const mensaje = ref('');
const errorForm = ref(false);

// Cargamos los equipos usando el mismo endpoint GET público
const { data: equipos, refresh } = await useFetch('/api/equipos');

async function crearEquipo() {
  loading.value = true;
  mensaje.value = '';
  errorForm.value = false;

  try {
    const { data, error } = await useFetch('/api/equipos', {
      method: 'POST',
      body: { nombre: nuevoEquipo.value }
    });

    if (error.value) {
      errorForm.value = true;
      mensaje.value = error.value.data?.statusMessage || 'Error al guardar';
    } else {
      mensaje.value = '¡Equipo agregado con éxito!';
      nuevoEquipo.value = '';
      await refresh(); // Recargamos la lista
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => { mensaje.value = ''; }, 3000);
    }
  } catch (err) {
    errorForm.value = true;
    mensaje.value = 'Ocurrió un error inesperado';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 { font-weight: 800; color: #111827; }
h3 { font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; }

.admin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 768px) {
  .admin-grid { grid-template-columns: 1fr 2fr; }
}

.mt-4 { margin-top: 1.5rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; }

.btn-primary { width: 100%; padding: 0.75rem; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-secondary { background-color: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; border-radius: 4px; cursor: pointer; border: none; }
.btn-delete { background-color: #fee2e2; color: #ef4444; }

.alert { padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; text-align: center; font-weight: 600; }
.alert-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.alert-danger { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.table-responsive { overflow-x: auto; }
.standings-table { width: 100%; border-collapse: collapse; text-align: center; }
.standings-table th { padding: 0.75rem; font-size: 0.8rem; color: var(--text-muted); border-bottom: 2px solid var(--border-color); }
.standings-table td { padding: 0.75rem; border-bottom: 1px solid var(--border-color); }
</style>
