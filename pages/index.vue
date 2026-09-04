<template>
  <div class="landing-page">
    <!-- Live Score Ticker (Marquee Animation) -->
    <section class="live-ticker" v-if="!pending && data?.partidos?.length">
      <div class="ticker-wrapper">
        <div class="ticker-label">{{ data?.configuracion?.ticker_label ?? '⚽ LO ÚLTIMO' }}</div>
        <div class="ticker-scroll">
          <div class="ticker-content">
            <div v-for="partido in data.partidos" :key="partido.id" class="match-item">
              <span class="status" :class="{'text-live': partido.estado === 'En Curso', 'text-scheduled': partido.estado === 'Programado' || partido.estado === 'Pendiente'}">
                <i class="fas fa-circle blink" v-if="partido.estado === 'En Curso'"></i>
                {{ partido.estado === 'En Curso' ? 'EN VIVO' : ((partido.estado === 'Programado' || partido.estado === 'Pendiente') && partido.fecha ? formatTime(partido.fecha) : partido.estado.toUpperCase()) }}
              </span>
              <div class="teams">
                <img :src="partido.local_logo" v-if="partido.local_logo" class="ticker-logo" alt="">
                <span class="team-name">{{ partido.local_nombre }}</span> 
                <span class="score" v-if="partido.estado !== 'Programado'">{{ partido.goles_local }} - {{ partido.goles_visitante }}</span>
                <span class="score pending" v-else>VS</span>
                <span class="team-name">{{ partido.visitante_nombre }}</span>
                <img :src="partido.visitante_logo" v-if="partido.visitante_logo" class="ticker-logo" alt="">
              </div>
            </div>
            <!-- Duplicate for infinite scroll effect -->
            <div v-for="partido in data.partidos" :key="'dup-'+partido.id" class="match-item">
              <span class="status" :class="{'text-live': partido.estado === 'En Curso', 'text-scheduled': partido.estado === 'Programado' || partido.estado === 'Pendiente'}">
                <i class="fas fa-circle blink" v-if="partido.estado === 'En Curso'"></i>
                {{ partido.estado === 'En Curso' ? 'EN VIVO' : ((partido.estado === 'Programado' || partido.estado === 'Pendiente') && partido.fecha ? formatTime(partido.fecha) : partido.estado.toUpperCase()) }}
              </span>
              <div class="teams">
                <img :src="partido.local_logo" v-if="partido.local_logo" class="ticker-logo" alt="">
                <span class="team-name">{{ partido.local_nombre }}</span> 
                <span class="score" v-if="partido.estado !== 'Programado'">{{ partido.goles_local }} - {{ partido.goles_visitante }}</span>
                <span class="score pending" v-else>VS</span>
                <span class="team-name">{{ partido.visitante_nombre }}</span>
                <img :src="partido.visitante_logo" v-if="partido.visitante_logo" class="ticker-logo" alt="">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <!-- Hero Banner -->
      <section class="hero-carousel">
        <!-- Hero Background Carousel -->
        <div class="carousel-bg" v-if="heroImages.length > 0">
          <div 
            v-for="(img, idx) in heroImages" 
            :key="'h-img-'+idx" 
            class="bg-slide" 
            :class="{ active: currentHeroIndex === idx }"
            :style="{ backgroundImage: `url(${img})` }">
          </div>
        </div>

        <div class="hero-content">
          <!-- <h1 class="hero-title" v-html="formatHeroTitle(data?.configuracion?.hero_title)"></h1> -->
          <p class="hero-subtitle">{{ data?.configuracion?.hero_subtitle ?? 'Pasión, táctica y gloria en la cancha. El torneo más competitivo de la ciudad.' }}</p>
          <div class="hero-actions">
            <NuxtLink to="/posiciones" class="btn-glow" v-if="data?.configuracion?.hero_btn1_text !== ''">{{ data?.configuracion?.hero_btn1_text ?? 'Ver Posiciones' }} <i class="fas fa-trophy ml-2"></i></NuxtLink>
            <NuxtLink to="/equipos" class="btn-outline-glow" v-if="data?.configuracion?.hero_btn2_text !== ''">{{ data?.configuracion?.hero_btn2_text ?? 'Ver Equipos' }}</NuxtLink>
          </div>
        </div>
        <div class="hero-overlay" :class="{ 'with-bg': heroImages.length > 0 }"></div>
      </section>

      <!-- Quick Stats Grid -->
      <section class="quick-stats" v-if="!pending">
        <div class="stat-card leader-card">
          <div class="stat-icon">👑</div>
          <div class="stat-info">
            <h3>Puntero Actual</h3>
            <div class="stat-value">{{ data?.puntero?.nombre || 'Por Definir' }}</div>
            <div class="stat-sub" v-if="data?.puntero">{{ data.puntero.puntos }} Puntos</div>
          </div>
        </div>

        <div class="stat-card scorer-card">
          <div class="stat-icon">⚽</div>
          <div class="stat-info">
            <h3>Máximo Goleador</h3>
            <div class="stat-value">{{ data?.goleador?.nombre || 'Ninguno' }}</div>
            <div class="stat-sub" v-if="data?.goleador">{{ data.goleador.goles }} Goles ({{ data.goleador.equipo }})</div>
          </div>
        </div>

        <div class="stat-card date-card">
          <div class="stat-icon">🗓️</div>
          <div class="stat-info">
            <h3>Próxima Fecha</h3>
            <div class="stat-value">{{ data?.proximaFecha?.jornada ? 'Jornada ' + data.proximaFecha.jornada : 'Sin programar' }}</div>
            <div class="stat-sub" v-if="data?.proximaFecha?.fecha">{{ formatDate(data.proximaFecha.fecha) }}</div>
          </div>
        </div>
      </section>

      <!-- Programación de la Próxima Fecha -->
      <section class="upcoming-matches" v-if="!pending && data?.partidos?.length">
        <div class="section-header">
          <h2 class="section-title">Programación <span class="highlight">Jornada {{ data.partidos[0].jornada }}</span></h2>
        </div>
        
        <div class="matches-grid">
          <div v-for="partido in data.partidos" :key="'sched-'+partido.id" class="schedule-card">
            <div class="schedule-header">
              <span class="schedule-date">
                <i class="far fa-calendar-alt mr-1"></i>
                {{ partido.fecha ? formatDate(partido.fecha) : 'Por definir' }}
              </span>
              <span class="schedule-time">
                <i class="far fa-clock mr-1"></i>
                {{ partido.fecha ? formatTime(partido.fecha) : '--:--' }}
              </span>
            </div>
            
            <div class="schedule-teams">
              <div class="team team-local">
                <img :src="partido.local_logo" v-if="partido.local_logo" class="card-logo" alt="">
                <div class="card-logo-placeholder" v-else><i class="fas fa-shield-alt"></i></div>
                <span class="team-name">{{ partido.local_nombre }}</span>
              </div>
              <div class="vs-badge">VS</div>
              <div class="team team-visitor">
                <img :src="partido.visitante_logo" v-if="partido.visitante_logo" class="card-logo" alt="">
                <div class="card-logo-placeholder" v-else><i class="fas fa-shield-alt"></i></div>
                <span class="team-name">{{ partido.visitante_nombre }}</span>
              </div>
            </div>
            
            <div class="schedule-footer">
              <span class="status-badge" :class="'status-' + partido.estado.replace(' ', '-').toLowerCase()">
                {{ partido.estado === 'En Curso' ? 'EN VIVO' : partido.estado }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Patrocinadores Section -->
      <section class="sponsors-section">
        <h3 class="sponsors-title">NUESTROS PATROCINADORES</h3>
        
        <div class="sponsors-carousel">
          <div class="sponsors-track">
            
            <!-- Si hay múltiples imágenes de patrocinadores subidas -->
            <template v-if="data?.configuracion?.sponsor_images && data.configuracion.sponsor_images.length > 0">
              <img v-for="(img, idx) in data.configuracion.sponsor_images" :key="'img1-'+idx" :src="img" alt="Sponsor" class="sponsor-logo-img" />
              <!-- Duplicados para el scroll infinito -->
              <img v-for="(img, idx) in data.configuracion.sponsor_images" :key="'img2-'+idx" :src="img" alt="Sponsor" class="sponsor-logo-img" />
              <!-- Triplicados por si son pocas imágenes -->
              <img v-for="(img, idx) in data.configuracion.sponsor_images" :key="'img3-'+idx" :src="img" alt="Sponsor" class="sponsor-logo-img" />
            </template>

            <!-- Si no hay imagen, mostrar el carrusel de texto por defecto -->
            <template v-else>
              <div class="sponsor-item">🍔 Burger Betulia</div>
              <div class="sponsor-item">🚗 AutoSport</div>
              <div class="sponsor-item">⚡ Energy Drink</div>
              <div class="sponsor-item">🏥 Farmacias Salud</div>
              <div class="sponsor-item">🏗️ Constructora Norte</div>
              
              <div class="sponsor-item">🍔 Burger Betulia</div>
              <div class="sponsor-item">🚗 AutoSport</div>
              <div class="sponsor-item">⚡ Energy Drink</div>
              <div class="sponsor-item">🏥 Farmacias Salud</div>
              <div class="sponsor-item">🏗️ Constructora Norte</div>
            </template>
            
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const { data, pending } = await useFetch('/api/public/home');

const heroImages = computed(() => {
  return data.value?.configuracion?.hero_images || [];
});
const currentHeroIndex = ref(0);

onMounted(() => {
  if (heroImages.value.length > 1) {
    setInterval(() => {
      currentHeroIndex.value = (currentHeroIndex.value + 1) % heroImages.value.length;
    }, 5000); // Cambiar cada 5 segundos
  }
});

function formatTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatHeroTitle(title) {
  if (title === undefined || title === null) return 'CAMPEONATO <span class="highlight">LIGA PRO</span> 2026';
  if (title === '') return '';
  // Try to split at the second word to highlight the middle part if possible, 
  // or just highlight the word "PRO" or "LIGA" if present. 
  // For a simple CMS, we can just replace 'LIGA PRO' or let the user wrap with *word*.
  // But let's just do a generic replace of the middle 2 words if length > 2
  const words = title.split(' ');
  if (words.length >= 3) {
    const first = words[0];
    const middle = words.slice(1, words.length - 1).join(' ');
    const last = words[words.length - 1];
    return `${first} <span class="highlight">${middle}</span> ${last}`;
  }
  return title;
}
</script>

<style scoped>
/* LIVE TICKER ANIMATION */
.live-ticker {
  background-color: #111827;
  color: white;
  padding: 0;
  border-bottom: 2px solid var(--primary-color);
  overflow: hidden;
  position: relative;
}

.ticker-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.ticker-label {
  font-weight: 900;
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  position: relative;
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ticker-scroll {
  flex-grow: 1;
  overflow: hidden;
}

.ticker-content {
  display: flex;
  gap: 3rem;
  animation: scroll-left 25s linear infinite;
  padding-left: 2rem;
  width: max-content;
}

.ticker-scroll:hover .ticker-content {
  animation-play-state: paused;
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.match-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.status {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #9ca3af;
  background: rgba(255,255,255,0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.status.text-live { color: #ef4444; background: rgba(239, 68, 68, 0.15); }
.status.text-scheduled { color: #3b82f6; background: rgba(59, 130, 246, 0.15); }

.blink { animation: blinker 1.5s linear infinite; margin-right: 0.3rem;}
@keyframes blinker { 50% { opacity: 0; } }

.teams { font-weight: 600; display: flex; gap: 0.5rem; align-items: center; }
.ticker-content .team-name { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: white; }
.ticker-logo { width: 20px; height: 20px; object-fit: contain; }
.score { font-size: 1.1rem; font-weight: 900; background: #1f2937; padding: 0.2rem 0.6rem; border-radius: 4px; color: white; }
.score.pending { background: transparent; color: var(--text-muted); font-size: 0.9rem; }

/* HERO CAROUSEL */
.hero-carousel {
  position: relative;
  margin-top: 2rem;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.carousel-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
}

.bg-slide {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: top center;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.bg-slide.active {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(circle at top right, rgba(37, 99, 235, 0.2) 0%, transparent 40%),
                    radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.15) 0%, transparent 40%);
  z-index: 2;
  pointer-events: none;
}

.hero-overlay.with-bg {
  background: rgba(17, 24, 39, 0.65); /* Tinte oscuro para que el texto resalte sobre fotos */
}

.hero-content {
  position: relative;
  z-index: 10;
  padding: 3rem 2rem;
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: -1px;
  line-height: 1.1;
}

.highlight {
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(90deg, #3b82f6, #10b981);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #d1d5db;
  margin-bottom: 2.5rem;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.btn-glow {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.1rem;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  border: none;
}
.btn-glow:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.btn-outline-glow {
  background: transparent;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.1rem;
  text-decoration: none;
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}
.btn-outline-glow:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.4);
}

/* QUICK STATS */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: -3rem;
  position: relative;
  z-index: 20;
  padding-bottom: 4rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.12);
}

.stat-icon {
  font-size: 3rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 20px;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
}

.leader-card .stat-icon { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.scorer-card .stat-icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
.date-card .stat-icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }

.stat-info h3 {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.3rem;
  font-weight: 700;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 900;
  color: #111827;
  line-height: 1.2;
}

.stat-sub {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
  margin-top: 0.2rem;
}

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1rem; }
  .quick-stats { grid-template-columns: 1fr; }
  .stat-card { padding: 1.5rem; }
  .matches-grid { grid-template-columns: 1fr; }
  .schedule-card { padding: 1rem; }
  .hero-actions { flex-direction: column; gap: 1rem; }
  .btn-glow, .btn-outline-glow { width: 100%; text-align: center; justify-content: center; display: flex; }
  .ticker-label { padding: 0.75rem 1rem; font-size: 0.9rem; }
  .schedule-teams { flex-direction: column; gap: 1rem; }
}

/* UPCOMING MATCHES */
.upcoming-matches {
  margin-top: 4rem;
  margin-bottom: 2rem;
}
.section-header { text-align: center; margin-bottom: 2.5rem; }
.section-title { font-size: 2.5rem; font-weight: 900; color: #111827; letter-spacing: -0.5px; }

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.schedule-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #f3f4f6;
  transition: transform 0.2s, box-shadow 0.2s;
}
.schedule-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #e5e7eb;
}
.mr-1 { margin-right: 0.25rem; }

.schedule-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.team { flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 0.5rem; gap: 0.5rem; }
.card-logo { width: 45px; height: 45px; object-fit: contain; }
.card-logo-placeholder { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 50%; color: #9ca3af; font-size: 1.2rem; }
.schedule-teams .team-name { font-size: 0.85rem; font-weight: 800; color: #1f2937; text-transform: uppercase; word-break: break-word; line-height: 1.2; }

.vs-badge {
  background: #f3f4f6;
  color: #9ca3af;
  font-weight: 900;
  padding: 0.5rem;
  border-radius: 50%;
  font-size: 0.9rem;
  min-width: 40px;
  text-align: center;
}

.schedule-footer {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.status-pendiente { background: #fef3c7; color: #d97706; }
.status-programado { background: #dbeafe; color: #2563eb; }
.status-en-curso { background: #fee2e2; color: #dc2626; animation: pulse 2s infinite; }
.status-finalizado { background: #f3f4f6; color: #4b5563; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}

/* SPONSORS CAROUSEL */
.sponsors-section {
  margin-top: 4rem;
  margin-bottom: 2rem;
  text-align: center;
}

.sponsors-title {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.sponsors-carousel {
  overflow: hidden;
  position: relative;
  width: 100%;
  background: white;
  padding: 1.5rem 0;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.sponsors-carousel::before,
.sponsors-carousel::after {
  content: "";
  position: absolute;
  top: 0;
  width: 100px;
  height: 100%;
  z-index: 2;
}

.sponsors-carousel::before {
  left: 0;
  background: linear-gradient(to right, white, transparent);
}

.sponsors-carousel::after {
  right: 0;
  background: linear-gradient(to left, white, transparent);
}

.sponsors-track {
  display: flex;
  gap: 4rem;
  width: max-content;
  animation: sponsor-scroll 20s linear infinite;
  align-items: center;
}

.sponsors-track:hover {
  animation-play-state: paused;
}

@keyframes sponsor-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.sponsor-item {
  font-size: 1.25rem;
  font-weight: 800;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.3s;
  cursor: pointer;
}

.sponsor-item:hover {
  opacity: 1;
  color: var(--primary-color);
}

/* Sponsor Image Carousel Styles */
.sponsor-logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
  opacity: 0.8;
  transition: opacity 0.3s, transform 0.3s;
  cursor: pointer;
}

.sponsor-logo-img:hover {
  opacity: 1;
  transform: scale(1.05);
}
</style>
