<template>
  <div class="page-wrapper">
    <div class="container pb-5">
      <div class="header-actions mt-5">
        <h2 class="premium-title">🛡️ Equipos Participantes</h2>
      </div>

      <div v-if="pending" class="text-center mt-5">
        <div class="spinner">⚽</div>
        <p class="text-muted mt-2 font-weight-bold">Cargando equipos...</p>
      </div>

      <div v-else-if="!equipos || equipos.length === 0" class="empty-state mt-5">
        <div class="glass-card">
          <p>Aún no hay equipos registrados en el torneo.</p>
        </div>
      </div>

      <div v-else class="teams-grid mt-4">
        <div v-for="team in equipos" :key="team.id" class="glass-card team-card">
          <div class="team-logo-large">
            <span class="logo-placeholder">{{ team.name.charAt(0) }}</span>
          </div>
          <h3 class="team-name">{{ team.name }}</h3>
          <div class="team-stats">
            <div class="stat">
              <span class="label">PUNTOS</span>
              <span class="value">{{ team.pts }}</span>
            </div>
            <div class="stat">
              <span class="label">PARTIDOS</span>
              <span class="value">{{ team.pj }}</span>
            </div>
            <div class="stat">
              <span class="label">GOLES</span>
              <span class="value">{{ team.gf }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reutilizamos el endpoint que ya creamos para las posiciones
const { data: equipos, pending } = await useFetch('/api/equipos');
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 64px);
  padding-top: 2rem;
}

.header-actions {
  margin-bottom: 2rem;
  text-align: center;
}

.premium-title {
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #0f172a, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-size: 2rem;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  overflow: hidden;
}

.team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
  cursor: pointer;
  position: relative;
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, var(--primary-color), #3b82f6);
  opacity: 0;
  transition: opacity 0.3s;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.team-card:hover::before {
  opacity: 1;
}

.team-logo-large {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #475569, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border: 4px solid white;
}

.team-name {
  font-size: 1.4rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  color: #0f172a;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.team-stats {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat:not(:last-child) {
  border-right: 1px solid #f1f5f9;
}

.stat .label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.stat .value {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--primary-color);
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  font-size: 1.2rem;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
.spinner {
  font-size: 2.5rem;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@media (max-width: 768px) {
  .glass-card { padding: 1.5rem 1rem; }
  .premium-title { font-size: 1.5rem; }
  .team-logo-large { width: 70px; height: 70px; font-size: 2rem; }
  .team-name { font-size: 1.2rem; }
  .stat .value { font-size: 1.2rem; }
}
</style>
