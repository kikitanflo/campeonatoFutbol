<template>
  <div class="container mt-4">
    <div class="header-actions">
      <h2>Gestión de Plantilla ({{ session?.username }})</h2>
      <NuxtLink to="/dirigente" class="btn-secondary" style="padding: 0.5rem 1rem; text-decoration: none;">Volver al Panel</NuxtLink>
    </div>

    <div class="admin-grid">
      <!-- Formulario de inscripción -->
      <div class="card">
        <h3 v-if="!editandoId">Inscribir Jugador</h3>
        <h3 v-else style="color: #ea580c;">Editar Jugador</h3>
        <p class="text-muted" v-if="!editandoId">Cupos disponibles: {{ 30 - (jugadores?.length || 0) }}</p>
        
        <form @submit.prevent="guardarJugador" class="mt-4">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" v-model="nuevoJugador.name" class="form-control" required placeholder="Ej: Lionel Messi">
          </div>
          <div class="form-group">
            <label>Dorsal (Número)</label>
            <input type="number" v-model="nuevoJugador.dorsal" class="form-control" required placeholder="Ej: 10" min="1" max="99">
          </div>
          
          <div v-if="mensaje" :class="['alert', errorForm ? 'alert-danger' : 'alert-success']">
            {{ mensaje }}
          </div>

          <div class="d-flex" style="gap: 1rem;">
            <button type="submit" class="btn-primary" :disabled="loading || (!editandoId && jugadores?.length >= 30)" style="flex: 1;">
              {{ loading ? 'Guardando...' : (editandoId ? '💾 Actualizar Jugador' : (jugadores?.length >= 30 ? 'Plantilla Llena' : 'Inscribir Jugador')) }}
            </button>
            <button v-if="editandoId" type="button" @click="cancelarEdicion" class="btn-secondary" style="flex: 1;">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de jugadores actuales -->
      <div class="card">
        <h3>Plantilla Actual ({{ jugadores?.length || 0 }}/30)</h3>
        <div class="table-responsive mt-4">
          <table class="standings-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>NOMBRE</th>
                <th>ESTADÍSTICAS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="jugador in jugadores" :key="jugador.id">
                <td style="font-weight: bold;">{{ jugador.dorsal }}</td>
                <td style="text-align: left;">{{ jugador.nombre }}</td>
                <td>
                  <span title="Goles">⚽ {{ jugador.goles }}</span> | 
                  <span title="Amarillas">🟨 {{ jugador.amarillas }}</span> | 
                  <span title="Rojas">🟥 {{ jugador.rojas }}</span>
                </td>
                <td style="white-space: nowrap;">
                  <button @click="prepararEdicion(jugador)" class="btn-action edit" title="Editar">✏️</button>
                  <button @click="eliminarJugador(jugador.id, jugador.nombre)" class="btn-action delete" title="Eliminar">🗑️</button>
                </td>
              </tr>
              <tr v-if="!jugadores || jugadores.length === 0">
                <td colspan="4" class="text-muted">No tienes jugadores inscritos aún.</td>
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

const authCookie = useCookie('admin_session');
// Nuxt ya hace el parse automático a objeto si es JSON válido
const session = ref(authCookie.value || null);

const nuevoJugador = ref({ name: '', dorsal: '' });
const editandoId = ref(null);
const loading = ref(false);
const mensaje = ref('');
const errorForm = ref(false);

// Cargar jugadores del equipo del dirigente
const { data: jugadores, refresh } = await useFetch('/api/jugadores', {
  query: { equipo_id: session.value?.equipo_id }
});

async function guardarJugador() {
  loading.value = true;
  mensaje.value = '';
  errorForm.value = false;

  try {
    const url = editandoId.value ? `/api/jugadores/${editandoId.value}` : '/api/jugadores';
    const method = editandoId.value ? 'PUT' : 'POST';

    const { data, error } = await useFetch(url, {
      method,
      body: { 
        name: nuevoJugador.value.name,
        dorsal: nuevoJugador.value.dorsal
      }
    });

    if (error.value) {
      errorForm.value = true;
      mensaje.value = error.value.data?.statusMessage || 'Error al guardar';
    } else {
      mensaje.value = editandoId.value ? '¡Jugador actualizado con éxito!' : '¡Jugador inscrito con éxito!';
      cancelarEdicion();
      await refresh();
      setTimeout(() => { mensaje.value = ''; }, 3000);
    }
  } catch (err) {
    errorForm.value = true;
    mensaje.value = 'Ocurrió un error inesperado';
  } finally {
    loading.value = false;
  }
}

function prepararEdicion(jugador) {
  nuevoJugador.value = { name: jugador.nombre, dorsal: jugador.dorsal };
  editandoId.value = jugador.id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
  nuevoJugador.value = { name: '', dorsal: '' };
  editandoId.value = null;
}

async function eliminarJugador(id, nombre) {
  if (!confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?\n\n¡Atención! Esto eliminará también todas sus estadísticas.`)) return;
  
  try {
    const { error } = await useFetch(`/api/jugadores/${id}`, { method: 'DELETE' });
    if (error.value) {
      alert(error.value.data?.statusMessage || 'Error al eliminar');
    } else {
      await refresh();
    }
  } catch (err) {
    alert('Ocurrió un error al eliminar');
  }
}
</script>

<style scoped>
.mt-4 { margin-top: 1.5rem; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h2 { font-weight: 800; color: #111827; }
h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; }

.admin-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .admin-grid { grid-template-columns: 1fr 2fr; } }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; }

.btn-primary { width: 100%; padding: 0.75rem; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { background-color: #ffab91; cursor: not-allowed; }
.btn-secondary { background-color: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; cursor: pointer; }

.alert { padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; text-align: center; font-weight: 600; }
.alert-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.alert-danger { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.table-responsive { overflow-x: auto; }
.standings-table { width: 100%; border-collapse: collapse; text-align: center; }
.standings-table th { padding: 0.75rem; font-size: 0.8rem; color: var(--text-muted); border-bottom: 2px solid var(--border-color); }
.standings-table td { padding: 0.75rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.d-flex { display: flex; }

.btn-action { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.3rem 0.5rem; transition: transform 0.2s; border-radius: 4px; }
.btn-action:hover { transform: scale(1.1); background-color: #f3f4f6; }
</style>
