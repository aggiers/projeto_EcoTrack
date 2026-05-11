// =============================================
//  EcoTrack — actions.js
//  missões diárias, pontos, conquistas, meta
// =============================================

const MISSIONS_KEY = 'ecotrack_daily_missions';   // missões do dia + progresso
const POINTS_KEY = 'ecotrack_points';           // pontos totais por e-mail
const ACHIEV_KEY = 'ecotrack_achievements';     // conquistas por e-mail
const STREAK_KEY = 'ecotrack_streak';           // streak por e-mail

// ---------- pool completo de missões ----------

const MISSION_POOL = [
    { id: 'agua', title: 'Economizar água', desc: 'Reduza o tempo de banho para 5 min.', badge: 'ECONOMIZADOR DE ÁGUA', points: 50 },
    { id: 'reciclar', title: 'Reciclar lixo', desc: 'Separe plásticos, papel e metal.', badge: 'ECONOMIA CIRCULAR', points: 120 },
    { id: 'transporte', title: 'Usar transporte público', desc: 'Vá de ônibus, trem ou bike hoje.', badge: 'SEM CARBONO', points: 200 },
    { id: 'energia', title: 'Economizar energia', desc: 'Desligue luzes e aparelhos em standby.', badge: 'ECONOMIA DE ENERGIA', points: 80 },
    { id: 'vegetal', title: 'Refeição vegetal', desc: 'Faça uma refeição sem carne hoje.', badge: 'À BASE DE PLANTAS', points: 100 },
    { id: 'sacola', title: 'Sacola reutilizável', desc: 'Leve sua sacola nas compras.', badge: 'ZERO PLÁSTICO', points: 60 },
    { id: 'compostagem', title: 'Compostagem', desc: 'Destine restos orgânicos ao composto.', badge: 'HERÓI DO SOLO', points: 150 },
    { id: 'ducha', title: 'Banho frio', desc: 'Tome um banho frio para economizar energia.', badge: 'GUERREIRO ECOLÓGICO', points: 70 },
    { id: 'bike', title: 'Pedalar no trabalho', desc: 'Use a bicicleta como transporte hoje.', badge: 'SEM CARBONO', points: 180 },
    { id: 'noticia', title: 'Educação ambiental', desc: 'Leia um artigo sobre sustentabilidade.', badge: 'APRENDIZ DE ECOLOGIA', points: 40 },
    { id: 'horta', title: 'Cuidar da horta', desc: 'Plante ou regue algo no seu canteiro.', badge: 'DEDO VERDE', points: 90 },
    { id: 'digital', title: 'Detox digital', desc: 'Fique 2h sem telas para reduzir consumo.', badge: 'TECNOLOGIA CONSCIENTE', points: 55 },
];

// ---------- definição de conquistas ----------

const ACHIEVEMENT_DEFS = [
    {
        id: 'primeiro_passo',
        label: 'Primeiro Passo',
        desc: 'Complete sua primeira missão.',
        icon: '🌱',
        condition: (stats) => stats.totalCompleted >= 1,
    },
    {
        id: 'tres_dias',
        label: '3 Dias Seguidos',
        desc: 'Mantenha um streak de 3 dias.',
        icon: '🔥',
        condition: (stats) => stats.streak >= 3,
    },
    {
        id: 'sete_dias',
        label: 'Semana Verde',
        desc: 'Mantenha um streak de 7 dias.',
        icon: '🗓️',
        condition: (stats) => stats.streak >= 7,
    },
    {
        id: 'quinhentos_pontos',
        label: '500 Pontos',
        desc: 'Acumule 500 pontos no total.',
        icon: '⭐',
        condition: (stats) => stats.totalPoints >= 500,
    },
    {
        id: 'mil_pontos',
        label: 'Eco Mestre',
        desc: 'Acumule 1000 pontos.',
        icon: '🏆',
        condition: (stats) => stats.totalPoints >= 1000,
    },
    {
        id: 'usuario_ativo',
        label: 'Usuário Ativo',
        desc: 'Complete missões em 2 dias diferentes.',
        icon: '⚡',
        condition: (stats) => stats.activeDays >= 2,
    },
    {
        id: 'agua_heroi',
        label: 'Herói da Água',
        desc: 'Complete a missão de água 3 vezes.',
        icon: '💧',
        condition: (stats) => (stats.missionCounts['agua'] || 0) >= 3,
    },
    {
        id: 'dia_perfeito',
        label: 'Dia Perfeito',
        desc: 'Complete todas as missões do dia.',
        icon: '🌟',
        condition: (stats) => stats.hadPerfectDay,
    },
];

// ---------- utilitários ----------

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getUserEmail() {
    const session = JSON.parse(localStorage.getItem('ecotrack_session') || 'null');
    return session ? session.email : null;
}

function getUserStats(email) {
    const raw = localStorage.getItem(`${POINTS_KEY}_${email}`);
    return raw ? JSON.parse(raw) : {
        totalPoints: 0,
        totalCompleted: 0,
        activeDays: 0,
        missionCounts: {},
        hadPerfectDay: false,
    };
}

function saveUserStats(email, stats) {
    localStorage.setItem(`${POINTS_KEY}_${email}`, JSON.stringify(stats));
}

function getUserAchievements(email) {
    const raw = localStorage.getItem(`${ACHIEV_KEY}_${email}`);
    return raw ? JSON.parse(raw) : [];
}

function saveUserAchievements(email, list) {
    localStorage.setItem(`${ACHIEV_KEY}_${email}`, JSON.stringify(list));
}

function getStreak(email) {
    const raw = localStorage.getItem(`${STREAK_KEY}_${email}`);
    return raw ? JSON.parse(raw) : { count: 0, lastDay: null };
}

function saveStreak(email, streak) {
    localStorage.setItem(`${STREAK_KEY}_${email}`, JSON.stringify(streak));
}

// ---------- missões diárias com rotação ----------

function getDailyMissions(email) {
    const key = `${MISSIONS_KEY}_${email}`;
    const raw = localStorage.getItem(key);

    if (raw) {
        const data = JSON.parse(raw);
        if (data.day === getTodayKey()) return data; 
    }

    // novo dia: sorteia 3 missões aleatórias sem repetir
    const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    const data = {
        day: getTodayKey(),
        missions: selected,
        completed: [], // ids concluídos hoje
    };

    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

function saveDailyMissions(email, data) {
    localStorage.setItem(`${MISSIONS_KEY}_${email}`, JSON.stringify(data));
}

// ---------- renderização ----------

function renderMissions(email) {
    const data = getDailyMissions(email);
    const container = document.querySelector('.secao-missoes');
    if (!container) return;

    // remove cartões antigos (mantém cabeçalho e grid inferior)
    container.querySelectorAll('.cartao-missao').forEach(el => el.remove());

    // calcula XP do dia
    const xpHoje = data.missions
        .filter(m => data.completed.includes(m.id))
        .reduce((acc, m) => acc + m.points, 0);

    const xpEl = container.querySelector('.xp-ganho');
    if (xpEl) xpEl.textContent = `+${xpHoje} XP Hoje`;

    const gridInferior = container.querySelector('.grid-inferior');

    data.missions.forEach(mission => {
        const done = data.completed.includes(mission.id);

        const card = document.createElement('div');
        card.className = 'cartao-missao' + (done ? ' concluido' : '');
        card.dataset.missionId = mission.id;

        card.innerHTML = `
      <label class="check-missao">
        <input type="checkbox" ${done ? 'checked' : ''}>
        <span class="circulo"></span>
      </label>
      <div class="info-missao">
        <strong>${mission.title}</strong>
        <span>${mission.desc}</span>
      </div>
      <span class="badge-categoria">${mission.badge}</span>
      <div class="pontos-missao">
        <span class="pontos-valor">+${mission.points}</span>
        <span class="pontos-label">POINTS</span>
      </div>
    `;

        container.insertBefore(card, gridInferior);

        // evento de check
        const checkbox = card.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => onMissionToggle(email, mission, checkbox.checked));
    });

    updateProgressRing(data);
}

function updateProgressRing(data) {
    const total = data.missions.length;
    const completed = data.completed.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;

    // texto central
    const pctEl = document.querySelector('.porcentagem-anel');
    if (pctEl) pctEl.textContent = pct + '%';

    // SVG ring
    const ring = document.querySelector('.anel-progresso');
    if (ring) {
        const r = 85;
        const circum = 2 * Math.PI * r;
        const dashoffset = circum * (1 - pct / 100);

        ring.style.strokeDasharray = circum;
        ring.style.strokeDashoffset = dashoffset;
        ring.style.transition = 'stroke-dashoffset 0.6s ease';
    }
}

// ---------- lógica de toggle de missão ----------

function onMissionToggle(email, mission, isChecked) {
    const data = getDailyMissions(email);
    const stats = getUserStats(email);

    if (isChecked) {
        if (!data.completed.includes(mission.id)) {
            data.completed.push(mission.id);

            // atualiza pontos e contagens
            stats.totalPoints += mission.points;
            stats.totalCompleted += 1;
            stats.missionCounts[mission.id] = (stats.missionCounts[mission.id] || 0) + 1;

            // dia perfeito?
            if (data.completed.length === data.missions.length) {
                stats.hadPerfectDay = true;
                updateStreakOnPerfectDay(email, stats);
            }

            showPointsToast(mission.points);
        }
    } else {
        const idx = data.completed.indexOf(mission.id);
        if (idx > -1) {
            data.completed.splice(idx, 1);
            stats.totalPoints -= mission.points;
            stats.totalCompleted = Math.max(0, stats.totalCompleted - 1);
        }
    }

    saveDailyMissions(email, data);
    saveUserStats(email, stats);

    // re-renderiza cartão
    const card = document.querySelector(`[data-mission-id="${mission.id}"]`);
    if (card) {
        if (isChecked) card.classList.add('concluido');
        else card.classList.remove('concluido');
    }

    // atualiza XP e anel
    const xpHoje = data.missions
        .filter(m => data.completed.includes(m.id))
        .reduce((acc, m) => acc + m.points, 0);
    const xpEl = document.querySelector('.xp-ganho');
    if (xpEl) xpEl.textContent = `+${xpHoje} XP Hoje`;

    updateProgressRing(data);
    updateTotalPointsDisplay(stats);
    checkAndUnlockAchievements(email, stats);
}

// ---------- streak ----------

function updateStreakOnPerfectDay(email, stats) {
    const today = getTodayKey();
    const streak = getStreak(email);

    const d = new Date();
    const yesterday = new Date(d);
    yesterday.setDate(d.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    if (streak.lastDay === yesterdayKey || streak.lastDay === today) {
        if (streak.lastDay !== today) {
            streak.count += 1;
            streak.lastDay = today;
            stats.activeDays = (stats.activeDays || 0) + 1;
        }
    } else {
        streak.count = 1;
        streak.lastDay = today;
        stats.activeDays = (stats.activeDays || 0) + 1;
    }

    stats.streak = streak.count;
    saveStreak(email, streak);
}

// ---------- conquistas ----------

function checkAndUnlockAchievements(email, stats) {
    const unlocked = getUserAchievements(email);
    const newOnes = [];

    ACHIEVEMENT_DEFS.forEach(def => {
        if (!unlocked.includes(def.id) && def.condition(stats)) {
            unlocked.push(def.id);
            newOnes.push(def);
        }
    });

    if (newOnes.length) {
        saveUserAchievements(email, unlocked);
        newOnes.forEach(a => {
            setTimeout(() => showAchievementToast(a), 400);
        });
    }

    renderAchievements(email);
}

function renderAchievements(email) {
    const unlocked = getUserAchievements(email);
    const grade = document.querySelector('.grade-conquistas');
    if (!grade) return;

    grade.innerHTML = '';

    // mostra desbloqueadas primeiro, depois bloqueadas (máx 6 no grid)
    const sorted = [
        ...ACHIEVEMENT_DEFS.filter(a => unlocked.includes(a.id)),
        ...ACHIEVEMENT_DEFS.filter(a => !unlocked.includes(a.id)),
    ].slice(0, 6);

    sorted.forEach(def => {
        const isUnlocked = unlocked.includes(def.id);
        const el = document.createElement('div');
        el.className = 'conquista' + (isUnlocked ? '' : ' bloqueada');
        el.title = def.desc;
        el.innerHTML = `
      <div class="icone-badge" style="font-size:22px;${!isUnlocked ? 'filter:grayscale(1);opacity:0.35;' : ''}">
        ${def.icon}
      </div>
      <span class="label-conquista" style="${!isUnlocked ? 'opacity:0.4;' : ''}">${def.label}</span>
    `;
        grade.appendChild(el);
    });
}

// ---------- pontos totais no header ----------

function updateTotalPointsDisplay(stats) {
    const el = document.querySelector('.total-points-display');
    if (el) el.textContent = stats.totalPoints + ' pts';
}

// função de imagem que muda
const impactData = [
    {
        img: 'images/imageImpacto.png',
        text: 'Veja como usuários EcoTrack ajudaram a restaurar a Bacia Amazônica.'
    },
    {
        img: 'images/imageAgua.avif',
        text: 'Nossa comunidade ajudou a preservar mais de 5.000 litros de água potável hoje.'
    },
    {
        img: 'images/imageNatureza.jpg',
        text: 'Juntos, estamos expandindo áreas verdes em centros urbanos.'
    },
    {
        img: 'images/rochas.jpg',
        text: 'Protegendo a biodiversidade e os ecossistemas mais frágeis do planeta.'
    }
];

let currentSlide = 0;

function startImpactSlideshow() {
    const container = document.getElementById('impact-slideshow');
    const textEl = document.getElementById('impact-text');
    
    // verificação para evitar erros se o elemento não existir na página
    if (!container || !textEl) return;

    // limpa o container para garantir que as imagens sejam inseridas normalmente, 
    // mantendo o overlay e o texto
    const overlay = container.querySelector('.overlay-gradiente');
    const textoContainer = container.querySelector('.texto-imagem');

    // cria as tags de imagem para cada item do array
    impactData.forEach((item, index) => {
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = "Impacto Ambiental";
        img.className = 'slide-img' + (index === 0 ? ' active' : '');
        // inserindo antes do overlay para que o gradiente fique por cima
        container.insertBefore(img, overlay);
    });

    const slides = container.querySelectorAll('.slide-img');

    // lógica de transição
    setInterval(() => {
        // remove classe ativa do slide atual
        slides[currentSlide].classList.remove('active');

        // calcula o próximo índice
        currentSlide = (currentSlide + 1) % slides.length;

        // adiciona classe ativa ao novo slide
        slides[currentSlide].classList.add('active');
        
        // atualiza o texto com um leve delay para sincronizar com o desfoque
        setTimeout(() => {
            textEl.textContent = impactData[currentSlide].text;
        }, 600);

    }, 5000); // troca a cada 5 segundos
}

// chamando a função dentro do carregamento do documento
document.addEventListener('DOMContentLoaded', function () {
    startImpactSlideshow();
});

// ---------- toasts de feedback ----------

function showPointsToast(points) {
    const toast = document.createElement('div');
    toast.textContent = `+${points} pts 🌿`;
    toast.style.cssText = `
    position: fixed; bottom: 32px; right: 32px;
    background: #1a6641; color: #fff;
    padding: 14px 24px; border-radius: 50px;
    font-family: 'Poppins', sans-serif;
    font-size: 15px; font-weight: 700;
    box-shadow: 0 8px 32px rgba(26,102,65,0.35);
    z-index: 9999;
    animation: toastIn 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
  `;

    injectToastStyles();
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function showAchievementToast(achievement) {
    const toast = document.createElement('div');
    toast.innerHTML = `
    <span style="font-size:22px;">${achievement.icon}</span>
    <div>
      <div style="font-weight:800;font-size:13px;">Conquista desbloqueada!</div>
      <div style="font-size:11px;opacity:0.85;margin-top:2px;">${achievement.label}</div>
    </div>
  `;
    toast.style.cssText = `
    position: fixed; bottom: 32px; right: 32px;
    background: #fff; color: #1c2b3a;
    padding: 16px 22px; border-radius: 18px;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    z-index: 9999; display: flex; gap: 14px; align-items: center;
    border-left: 4px solid #1a6641;
    animation: toastIn 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
  `;

    injectToastStyles();
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function injectToastStyles() {
    if (document.getElementById('eco-toast-styles')) return;
    const s = document.createElement('style');
    s.id = 'eco-toast-styles';
    s.textContent = `
    @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); }      to { opacity:0; transform:translateY(20px) scale(0.9); } }
  `;
    document.head.appendChild(s);
}

// ---------- inicializando ----------

document.addEventListener('DOMContentLoaded', function () {
    const email = getUserEmail();

    if (!email) {
        // usuário não logado: mostra missões sem interação
        return;
    }

    renderMissions(email);
    renderAchievements(email);
    updateTotalPointsDisplay(getUserStats(email));
});
