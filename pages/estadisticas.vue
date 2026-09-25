<template>
  <div class="page-wrapper">
    <div class="container pb-5">
      <div class="header-actions">
        <h2 class="premium-title">📊 Estadísticas del Torneo</h2>
        <div class="filters">
          <select class="premium-select">
            <option>Torneo 2026</option>
          </select>
        </div>
      </div>

      <!-- Pestañas para navegación rápida en móviles y escritorio -->
      <div class="stats-tabs">
        <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          Todos
        </button>
        <button :class="{ active: activeTab === 'goleadores' }" @click="activeTab = 'goleadores'">
          ⚽ Goleadores
        </button>
        <button :class="{ active: activeTab === 'defensa' }" @click="activeTab = 'defensa'">
          🧤 Valla Invicta
        </button>
        <button :class="{ active: activeTab === 'tarjetas' }" @click="activeTab = 'tarjetas'">
          🟨 Tarjetas
        </button>
        <button :class="{ active: activeTab === 'fairplay' }" @click="activeTab = 'fairplay'">
          🏆 Fair Play
        </button>
      </div>

      <div v-if="pending" class="text-center mt-5">
        <div class="spinner">⚽</div>
        <p class="text-muted mt-2 font-weight-bold">Cargando datos en vivo...</p>
      </div>

      <div v-else-if="stats && stats.success" class="stats-grid">
        
        <!-- 1. Tabla de Goleadores -->
        <div class="glass-card" v-show="activeTab === 'all' || activeTab === 'goleadores'">
          <h3 class="section-title"><span class="icon">🔥</span> Tabla de Goleadores</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th>JUGADOR</th>
                  <th class="text-center col-stat">GOLES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(scorer, index) in stats.goleadores" :key="scorer.id">
                  <td class="col-rank">
                    <span v-if="index === 0" class="medal gold">🥇</span>
                    <span v-else-if="index === 1" class="medal silver">🥈</span>
                    <span v-else-if="index === 2" class="medal bronze">🥉</span>
                    <span v-else class="rank-number">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="player-info">
                      <span class="player-name">{{ scorer.name }}</span>
                      <span class="player-team">{{ scorer.team }}</span>
                    </div>
                  </td>
                  <td class="text-center col-stat">
                    <span class="stat-badge blue">{{ scorer.goals }}</span>
                  </td>
                </tr>
                <tr v-if="!stats.goleadores || stats.goleadores.length === 0">
                  <td colspan="3" class="empty-state">No hay goles registrados aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Tabla de Malla Menos Vencida -->
        <div class="glass-card" v-show="activeTab === 'all' || activeTab === 'defensa'">
          <h3 class="section-title"><span class="icon">🧤</span> Malla Menos Vencida</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th>EQUIPO</th>
                  <th class="text-center col-stat">GC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(team, index) in stats.defensa" :key="team.id">
                  <td class="col-rank">
                    <span v-if="index === 0" class="medal shield">🛡️</span>
                    <span v-else class="rank-number">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="team-cell">
                      <div class="team-logo-placeholder">{{ team.name.charAt(0) }}</div>
                      <span class="team-name-text">{{ team.name }}</span>
                    </div>
                  </td>
                  <td class="text-center col-stat">
                    <span class="stat-badge green">{{ team.gc }}</span>
                  </td>
                </tr>
                <tr v-if="!stats.defensa || stats.defensa.length === 0">
                  <td colspan="3" class="empty-state">No hay datos de defensa aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 3. Tabla de Tarjetas / Disciplinaria -->
        <div class="glass-card" v-show="activeTab === 'all' || activeTab === 'tarjetas'">
          <h3 class="section-title"><span class="icon">🟨</span> Registro Disciplinario</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th>JUGADOR</th>
                  <th class="text-center col-badge-th">AMARILLAS</th>
                  <th class="text-center col-badge-th">ROJAS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(jugador, index) in stats.tarjetas" :key="jugador.id">
                  <td class="col-rank"><span class="rank-number">{{ index + 1 }}</span></td>
                  <td>
                    <div class="player-info">
                      <span class="player-name">{{ jugador.name }}</span>
                      <span class="player-team">{{ jugador.team }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span v-if="jugador.amarillas > 0" class="card-badge yellow">{{ jugador.amarillas }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="text-center">
                    <span v-if="jugador.rojas > 0" class="card-badge red">{{ jugador.rojas }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                </tr>
                <tr v-if="!stats.tarjetas || stats.tarjetas.length === 0">
                  <td colspan="4" class="empty-state">No hay tarjetas registradas en el torneo. ¡Juego limpio!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. Tabla de Juego Limpio por Equipos -->
        <div class="glass-card" v-show="activeTab === 'all' || activeTab === 'fairplay'">
          <h3 class="section-title"><span class="icon">🏆</span> Juego Limpio por Equipos</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th>EQUIPO</th>
                  <th class="text-center col-badge-th">AMARILLAS</th>
                  <th class="text-center col-badge-th">ROJAS</th>
                  <th class="text-center col-stat">CASTIGO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(equipo, index) in stats.fairplay" :key="equipo.id">
                  <td class="col-rank">
                    <span v-if="index === 0" class="medal gold">🏆</span>
                    <span v-else class="rank-number">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="team-cell">
                      <div class="team-logo-placeholder">{{ equipo.team.charAt(0) }}</div>
                      <span class="team-name-text">{{ equipo.team }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span v-if="equipo.total_amarillas > 0" class="card-badge yellow">{{ equipo.total_amarillas }}</span>
                    <span v-else class="text-muted">0</span>
                  </td>
                  <td class="text-center">
                    <span v-if="equipo.total_rojas > 0" class="card-badge red">{{ equipo.total_rojas }}</span>
                    <span v-else class="text-muted">0</span>
                  </td>
                  <td class="text-center col-stat">
                    <span class="stat-badge" :class="equipo.puntos_castigo === 0 ? 'green' : 'blue'">{{ equipo.puntos_castigo }}</span>
                  </td>
                </tr>
                <tr v-if="!stats.fairplay || stats.fairplay.length === 0">
                  <td colspan="5" class="empty-state">No hay equipos registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const { data: stats, pending } = await useFetch('/api/estadisticas');
const activeTab = ref('all');
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 64px);
  padding-top: 2rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.premium-title {
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #0f172a, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-size: 1.8rem;
}

.premium-select {
  padding: 0.5rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  background-color: white;
  color: #334155;
  outline: none;
}

/* Tabs de navegación */
.stats-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.stats-tabs::-webkit-scrollbar {
  display: none;
}
.stats-tabs button {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.stats-tabs button.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s;
}

.glass-card:hover {
  transform: translateY(-2px);
}

.section-title {
  color: #1e293b;
  margin-bottom: 1.25rem;
  font-weight: 900;
  font-size: 1.15rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-title .icon { font-size: 1.4rem; }

/* Contenedor responsivo para las tablas */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
}

.premium-table th {
  padding: 0.75rem 0.75rem;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}

.premium-table td {
  padding: 0.85rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 600;
  color: #334155;
  transition: background-color 0.2s;
  vertical-align: middle;
}

.premium-table tbody tr:hover {
  background-color: #f8fafc;
}

.col-rank {
  font-weight: 800;
  width: 44px;
  min-width: 44px;
  text-align: center !important;
}

.medal { font-size: 1.4rem; }

.rank-number {
  background: #f1f5f9;
  color: #64748b;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.85rem;
}

.team-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 800;
  color: #0f172a;
  font-size: 0.98rem;
}

.player-team {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
}

.team-logo-placeholder {
  width: 30px;
  height: 30px;
  min-width: 30px;
  background: linear-gradient(135deg, #475569, #1e293b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
}

.team-name-text {
  font-weight: 800;
  color: #0f172a;
  font-size: 0.95rem;
}

.col-stat {
  width: 70px;
}

.col-badge-th {
  width: 80px;
}

.stat-badge {
  color: white;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
  display: inline-block;
}
.stat-badge.blue { background: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }
.stat-badge.green { background: #10b981; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); }

.card-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 28px;
  border-radius: 4px;
  color: #111827;
  font-weight: 800;
  font-size: 0.85rem;
  box-shadow: 1px 2px 4px rgba(0,0,0,0.1);
}
.card-badge.yellow { background: #fef08a; border: 1px solid #facc15; }
.card-badge.red { background: #fca5a5; border: 1px solid #f87171; color: white; }

.empty-state {
  text-align: center;
  padding: 2rem !important;
  color: #94a3b8;
  font-style: italic;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
.spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  display: inline-block;
}

/* ==============================================================
   AJUSTES RESPONSIVE PARA DISPOSITIVOS MÓVILES (TELÉFONOS)
   ============================================================== */
@media (max-width: 768px) {
  .page-wrapper {
    padding-top: 1rem;
  }
  
  .container {
    padding: 0 0.75rem;
  }

  .header-actions {
    margin-top: 0.5rem !important;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .premium-title {
    font-size: 1.35rem;
  }

  .premium-select {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }

  .glass-card {
    padding: 1rem 0.65rem;
    border-radius: 12px;
  }

  .section-title {
    font-size: 1.05rem;
    margin-bottom: 0.85rem;
  }

  .premium-table th {
    padding: 0.6rem 0.4rem;
    font-size: 0.72rem;
  }

  .premium-table td {
    padding: 0.65rem 0.4rem;
    font-size: 0.82rem;
  }

  .col-rank {
    width: 32px;
    min-width: 32px;
  }

  .medal {
    font-size: 1.15rem;
  }

  .rank-number {
    width: 22px;
    height: 22px;
    font-size: 0.75rem;
  }

  .player-name {
    font-size: 0.88rem;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-team {
    font-size: 0.72rem;
  }

  .team-name-text {
    font-size: 0.88rem;
    max-width: 130px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .team-logo-placeholder {
    width: 26px;
    height: 26px;
    min-width: 26px;
    font-size: 0.75rem;
  }

  .stat-badge {
    padding: 0.15rem 0.5rem;
    font-size: 0.85rem;
  }

  .card-badge {
    width: 20px;
    height: 26px;
    font-size: 0.78rem;
  }
}
</style>
