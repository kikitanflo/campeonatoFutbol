<template>
  <div class="planilla-container">
    <div class="header-mobile">
      <NuxtLink to="/arbitro" class="btn-back">⬅ Volver</NuxtLink>
      <h2>Planilla Digital</h2>
      <div style="display: flex; gap: 8px;">
        <button class="btn-start" v-if="partido?.estado !== 'En Curso' && partido?.estado !== 'Finalizado'" @click="iniciarPartido">▶ Iniciar</button>
        <button class="btn-finish" @click="finalizarPartido">Terminar</button>
      </div>
    </div>

    <div v-if="pending" class="text-center mt-4">Cargando planilla...</div>
    
    <div v-else-if="partido" class="match-board">
      <div class="d-flex justify-content-end mb-3 text-right">
        <button class="btn-print" @click="imprimirPlanilla">🖨️ Descargar / Imprimir Planilla</button>
      </div>

      <!-- Marcador -->
      <div class="scoreboard">
        <div class="team-score">
          <span class="team-name">{{ partido.local_nombre }}</span>
          <span class="score">{{ partido.goles_local }}</span>
        </div>
        <div class="divider">-</div>
        <div class="team-score">
          <span class="score">{{ partido.goles_visitante }}</span>
          <span class="team-name">{{ partido.visitante_nombre }}</span>
        </div>
      </div>

      <div v-if="mensajeExito" class="alert alert-success">{{ mensajeExito }}</div>

      <!-- Informe Arbitral -->
      <div class="informe-section mb-4">
        <h3>📝 Informe Arbitral</h3>
        <textarea v-model="informePartido" class="form-control" rows="4" placeholder="Observaciones del partido, incidentes, razones de tarjetas, etc..."></textarea>
      </div>

      <!-- Planillas de Jugadores -->
      <div class="rosters-grid">
        <!-- Local -->
        <div class="roster-col">
          <h3>Local</h3>
          <div class="player-list">
            <div v-for="jugador in partido.jugadores_local" :key="jugador.id" class="player-item">
              <div class="player-info">
                <span class="dorsal">{{ jugador.dorsal }}</span>
                <span class="nombre">{{ jugador.nombre }}</span>
                <div class="match-stats">
                  <span v-if="jugador.goles_partido > 0">⚽ {{ jugador.goles_partido }}</span>
                  <span v-if="jugador.amarillas_partido > 0">🟨 {{ jugador.amarillas_partido }}</span>
                  <span v-if="jugador.rojas_partido > 0">🟥 {{ jugador.rojas_partido }}</span>
                </div>
              </div>
              <div class="action-buttons">
                <button class="btn-action btn-gol" @click="registrarEvento(jugador.id, 'Gol')" :disabled="jugador.rojas_partido > 0">⚽</button>
                <button class="btn-action btn-amarilla" @click="registrarEvento(jugador.id, 'Amarilla')" :disabled="jugador.amarillas_partido >= 2 || jugador.rojas_partido > 0">🟨</button>
                <button class="btn-action btn-roja" @click="registrarEvento(jugador.id, 'Roja')" :disabled="jugador.rojas_partido > 0">🟥</button>
              </div>
            </div>
            <div v-if="partido.jugadores_local.length === 0" class="text-muted small">Sin jugadores inscritos.</div>
          </div>
        </div>

        <!-- Visitante -->
        <div class="roster-col">
          <h3>Visitante</h3>
          <div class="player-list">
            <div v-for="jugador in partido.jugadores_visitante" :key="jugador.id" class="player-item">
              <div class="player-info">
                <span class="dorsal">{{ jugador.dorsal }}</span>
                <span class="nombre">{{ jugador.nombre }}</span>
                <div class="match-stats">
                  <span v-if="jugador.goles_partido > 0">⚽ {{ jugador.goles_partido }}</span>
                  <span v-if="jugador.amarillas_partido > 0">🟨 {{ jugador.amarillas_partido }}</span>
                  <span v-if="jugador.rojas_partido > 0">🟥 {{ jugador.rojas_partido }}</span>
                </div>
              </div>
              <div class="action-buttons">
                <button class="btn-action btn-gol" @click="registrarEvento(jugador.id, 'Gol')" :disabled="jugador.rojas_partido > 0">⚽</button>
                <button class="btn-action btn-amarilla" @click="registrarEvento(jugador.id, 'Amarilla')" :disabled="jugador.amarillas_partido >= 2 || jugador.rojas_partido > 0">🟨</button>
                <button class="btn-action btn-roja" @click="registrarEvento(jugador.id, 'Roja')" :disabled="jugador.rojas_partido > 0">🟥</button>
              </div>
            </div>
            <div v-if="partido.jugadores_visitante.length === 0" class="text-muted small">Sin jugadores inscritos.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });
const route = useRoute();
const partidoId = route.params.id;

const mensajeExito = ref('');
const informePartido = ref('');

const { data: partido, pending, refresh } = await useFetch(`/api/arbitro/partido/${partidoId}`);

async function registrarEvento(jugador_id, tipo) {
  if (!confirm(`¿Confirmar ${tipo}?`)) return;

  try {
    await $fetch('/api/arbitro/eventos', {
      method: 'POST',
      body: { partido_id: partidoId, jugador_id, tipo_evento: tipo, minuto: null }
    });
    
    mensajeExito.value = `¡${tipo} registrado correctamente! Notificación enviada.`;
    await refresh(); // Recarga el marcador y las stats
    setTimeout(() => { mensajeExito.value = ''; }, 3000);
  } catch (error) {
    alert('Error al registrar el evento');
  }
}

async function iniciarPartido() {
  if(confirm('¿Estás seguro de iniciar el partido? Esto lo marcará como EN VIVO en la página principal.')) {
    try {
      await $fetch('/api/arbitro/iniciar', {
        method: 'POST',
        body: { partido_id: partidoId }
      });
      await refresh();
      alert('¡Partido en vivo!');
    } catch (error) {
      alert('Error al iniciar el partido.');
    }
  }
}

async function finalizarPartido() {
  if(confirm('¿Estás seguro de finalizar el partido? Se enviará el informe por WhatsApp a los dirigentes.')) {
    try {
      await $fetch('/api/arbitro/finalizar', {
        method: 'POST',
        body: { 
          partido_id: partidoId,
          informe: informePartido.value
        }
      });
      alert('Partido finalizado y reportes enviados.');
      router.push('/arbitro');
    } catch (error) {
      alert('Error al finalizar el partido.');
    }
  }
}

function imprimirPlanilla() {
  window.print();
}
</script>

<style scoped>
.planilla-container { max-width: 800px; margin: 0 auto; background: #fff; min-height: 100vh; }
@media (min-width: 768px) { .planilla-container { margin-top: 2rem; border-radius: 12px; min-height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid var(--border-color); } }

.header-mobile { background: #111827; color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
.header-mobile h2 { font-size: 1.1rem; margin: 0; font-weight: 700; }
.btn-back { color: #d1d5db; text-decoration: none; font-size: 0.9rem; }
.btn-finish { background: #dc2626; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 700; cursor: pointer; }
.btn-start { background: #10b981; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 700; cursor: pointer; }

.match-board { padding: 1rem; }
.scoreboard { display: flex; justify-content: center; align-items: center; background: #f3f4f6; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
.team-score { display: flex; flex-direction: column; align-items: center; width: 40%; }
.team-name { font-weight: 800; font-size: 1.1rem; color: #111827; text-align: center; }
.score { font-size: 3rem; font-weight: 900; color: var(--primary-color); line-height: 1; margin: 0.5rem 0; }
.divider { font-size: 2rem; font-weight: 700; color: #9ca3af; padding: 0 1rem; }

.rosters-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .rosters-grid { grid-template-columns: 1fr 1fr; } }

.roster-col h3 { text-align: center; padding-bottom: 0.5rem; border-bottom: 2px solid var(--primary-color); margin-bottom: 1rem; color: #111827; }

.player-list { display: flex; flex-direction: column; gap: 0.5rem; }
.player-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; }
.player-info { display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem; }
.dorsal { background: #374151; color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.nombre { font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
.match-stats { display: flex; gap: 0.25rem; font-size: 0.8rem; margin-left: 0.25rem; }

.informe-section { background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); }
.informe-section h3 { margin-top: 0; margin-bottom: 0.75rem; font-size: 1.1rem; color: #111827; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; resize: vertical; }
.form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.mb-4 { margin-bottom: 1.5rem; }

.action-buttons { display: flex; gap: 0.25rem; }
.btn-action { width: 32px; height: 32px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; background: white; transition: transform 0.1s; }
.btn-action:active:not(:disabled) { transform: scale(0.9); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; background: #e5e7eb !important; border-color: #d1d5db; }
.btn-gol { background: #f3f4f6; }
.btn-amarilla { background: #fef08a; }
.btn-roja { background: #fecaca; }

.alert-success { background-color: #d1fae5; color: #065f46; padding: 0.75rem; border-radius: 6px; text-align: center; font-weight: 700; margin-bottom: 1rem; }
.btn-print { background: #4b5563; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-print:hover { background: #374151; }
.text-right { text-align: right; }

@media print {
  .header-mobile, .btn-print, .action-buttons, .informe-section { display: none !important; }
  .planilla-container { max-width: 100%; border: none; box-shadow: none; margin: 0; padding: 0; }
  .rosters-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
  .player-item { page-break-inside: avoid; border-color: #000; }
  .scoreboard { border: 2px solid #000; background: transparent; }
  body { background: white; color: black; }
}
</style>
