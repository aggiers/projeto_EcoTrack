// =============================================
//  EcoTrack — dashboard.js
//  dados reais do usuário logado no dashboard
// =============================================

// ---------- utilitários (espelha auth.js / actions.js) ----------

function getSession() {
    return JSON.parse(localStorage.getItem('ecotrack_session') || 'null');
}

function getUsers() {
    return JSON.parse(localStorage.getItem('ecotrack_users') || '[]');
}

function getUserStats(email) {
    const raw = localStorage.getItem(`ecotrack_points_${email}`);
    return raw ? JSON.parse(raw) : {
        totalPoints: 0,
        totalCompleted: 0,
        activeDays: 0,
        missionCounts: {},
        hadPerfectDay: false,
        streak: 0,
    };
}

function getUserAchievements(email) {
    const raw = localStorage.getItem(`ecotrack_achievements_${email}`);
    return raw ? JSON.parse(raw) : [];
}

function getStreak(email) {
    const raw = localStorage.getItem(`ecotrack_streak_${email}`);
    return raw ? JSON.parse(raw) : { count: 0, lastDay: null };
}

function getDailyMissions(email) {
    const raw = localStorage.getItem(`ecotrack_daily_missions_${email}`);
    if (!raw) return null;
    return JSON.parse(raw);
}

function getPegadaCO2(session) {
    // pega do session ou do array de usuários
    if (session.pegadaCO2 != null) return session.pegadaCO2;
    const users = getUsers();
    const user = users.find(u => u.email === session.email);
    return user ? (user.pegadaCO2 ?? null) : null;
}

// ---------- ecoscore: calculado a partir dos pontos ----------

function calcularEcoScore(totalPoints) {
    // escala de pontos
    return Math.min(1000, Math.round((totalPoints / 2000) * 1000));
}

function classificarImpacto(ecoScore) {
    if (ecoScore >= 800) return { label: 'Impacto: Muito Alto', cor: '#1a6641' };
    if (ecoScore >= 600) return { label: 'Impacto: Alto',      cor: '#2e7d54' };
    if (ecoScore >= 400) return { label: 'Impacto: Médio',     cor: '#f59e0b' };
    if (ecoScore >= 200) return { label: 'Impacto: Baixo',     cor: '#e05252' };
    return                       { label: 'Impacto: Iniciante', cor: '#7a8fa6' };
}

function calcularRankRegiao(ecoScore) {
    // percentual estimado baseado no ecoscore
    if (ecoScore >= 900) return 'Top 1% na sua região';
    if (ecoScore >= 800) return 'Top 5% na sua região';
    if (ecoScore >= 650) return 'Top 15% na sua região';
    if (ecoScore >= 500) return 'Top 30% na sua região';
    if (ecoScore >= 300) return 'Top 50% na sua região';
    return 'Continue para subir no rank!';
}



// ---------- rank da comunidade ----------

function calcularRankComunidade() {
    const users = getUsers();
    // filtra só quem já se registrou
    const ativos = users.filter(u => u.email);
    return {
        total: ativos.length,
        // pega os últimos 3 cadastrados para mostrar no avatar group
        recentes: ativos.slice(-3).map(u => u.nome),
    };
}

function calcularEconomiaTotal() {
    // soma o total de pontos de todos os usuários para mostrar impacto coletivo
    const users = getUsers();
    let totalPontos = 0;
    let totalCO2Reduzido = 0; 

    users.forEach(u => {
        const stats = getUserStats(u.email);
        totalPontos += stats.totalPoints;
      
        totalCO2Reduzido += stats.totalPoints * 0.05;
    });

    return {
        totalPontos,
        totalCO2Reduzido: Math.round(totalCO2Reduzido),
        totalResiduo: Math.round(totalCO2Reduzido * 0.3),
    };
}

// ---------- objetivos ativos ----------

function buildObjetivosAtivos(email) {
    const data = getDailyMissions(email);
    if (!data || !data.missions) return [];

    return data.missions.map(m => ({
        icon: getMissionIcon(m.badge),
        title: m.title,
        desc: m.id === 'bike' || m.id === 'transporte'
            ? `${data.completed.includes(m.id) ? 'Concluído hoje ✓' : 'Pendente para hoje'}`
            : `${data.completed.includes(m.id) ? 'Concluído hoje ✓' : 'Pendente para hoje'}`,
        progress: data.completed.includes(m.id) ? 100 : 0,
        done: data.completed.includes(m.id),
    }));
}

function getMissionIcon(badge) {
    const map = {
        'WATER SAVER':      '💧',
        'CIRCULAR ECONOMY': '♻️',
        'CARBON FREE':      '🚲',
        'ENERGY WISE':      '⚡',
        'PLANT BASED':      '🥗',
        'ZERO PLASTIC':     '🛍️',
        'SOIL HERO':        '🌱',
        'ECO WARRIOR':      '🌊',
        'ECO LEARNER':      '📚',
        'GREEN THUMB':      '🌿',
        'MINDFUL TECH':     '📴',
    };
    return map[badge] || '🌱';
}

// ---------- renderização ----------

function renderNomeUsuario(session) {
    const el = document.getElementById('user-name-display');
    if (!el) return;
    const primeiroNome = session.nome.split(' ')[0];
    el.textContent = primeiroNome + '.';
}

function renderEcoScore(stats) {
    const ecoScore = calcularEcoScore(stats.totalPoints);
    const impacto  = classificarImpacto(ecoScore);
    const rank     = calcularRankRegiao(ecoScore);
    const pct      = Math.round((ecoScore / 1000) * 100);

    const scoreValueEl = document.querySelector('.score-value');
    if (scoreValueEl) scoreValueEl.textContent = ecoScore;

    const progressFillEl = document.querySelector('.progress-fill');
    if (progressFillEl) {
        progressFillEl.style.transition = 'width 1s ease';
        setTimeout(() => { progressFillEl.style.width = pct + '%'; }, 100);
    }

    const impactoBadgeEl = document.querySelector('.impact-badge');
    if (impactoBadgeEl) {
        impactoBadgeEl.textContent = impacto.label;
        impactoBadgeEl.style.background = impacto.cor + '22';
        impactoBadgeEl.style.color = impacto.cor;
    }

    const rankEl = document.querySelector('.rank-text');
    if (rankEl) rankEl.textContent = rank;
}

function renderPegadaCarbono(session, stats) {
    const kgCO2  = getPegadaCO2(session);
    const tonStr = kgCO2 != null ? formatarPegada(kgCO2) + ' toneladas' : '—';
    const variacao = calcularVariacaoPegada(kgCO2);

    
    const pegadaDescEl = document.querySelector('.card-large p');
    if (pegadaDescEl) {
        if (kgCO2 != null) {
            pegadaDescEl.textContent =
                `Seu estilo de vida atual emite ${tonStr} de CO₂ por ano.`;
        } else {
            pegadaDescEl.textContent =
                'Use o Calculador para medir sua pegada de carbono.';
        }
    }

    // variação
    const trendEl = document.querySelector('.trend-badge');
    if (trendEl && variacao != null) {
        if (variacao >= 0) {
            trendEl.textContent = `-${variacao}% vs média nacional`;
            trendEl.className = 'trend-badge positive';
        } else {
            trendEl.textContent = `+${Math.abs(variacao)}% vs média nacional`;
            trendEl.className = 'trend-badge negative';
            trendEl.style.background = '#fef2f2';
            trendEl.style.color = '#e05252';
        }
    } else if (trendEl && variacao == null) {
        trendEl.textContent = 'Calcule sua pegada';
        trendEl.className = 'trend-badge';
        trendEl.style.background = '#eef1f6';
        trendEl.style.color = '#7a8fa6';
    }
}

function renderUsoEnergia(stats) {
    // estima pontos
    const missionesEnergia =
        (stats.missionCounts['energia'] || 0) +
        (stats.missionCounts['digital'] || 0);
    const kwhEconomizados = 120 + missionesEnergia * 10;

    const mainStatEl = document.querySelector('.card:nth-child(2) .main-stat');
    if (mainStatEl) mainStatEl.innerHTML = `${kwhEconomizados} <span>kWh</span>`;

    // eficiência baseada no streak
    const streak = getStreak(stats.email || '').count;
    const eficiencia = Math.min(50, 10 + (stats.totalCompleted || 0));
    const statDetailEl = document.querySelector('.card:nth-child(2) .stat-detail');
    if (statDetailEl) statDetailEl.textContent = `↓ ${eficiencia}% ganho de eficiência`;
}

function renderAguaEconomizada(stats) {
    // cada missão de água = 200L economizados
    const missionesAgua =
        (stats.missionCounts['agua'] || 0) +
        (stats.missionCounts['ducha'] || 0);
    const litros = 200 + missionesAgua * 200;
    const litrosFormatado = litros >= 1000
        ? (litros / 1000).toFixed(1) + ' mil'
        : litros.toString();

    const mainStatEl = document.querySelector('.card:nth-child(3) .main-stat');
    if (mainStatEl) mainStatEl.innerHTML = `${litrosFormatado} <span>Litros</span>`;
}

function renderComunidade() {
    const comunidade = calcularRankComunidade();
    const economia   = calcularEconomiaTotal();

    // avatar group — iniciais dos últimos cadastrados
    const avatarGroup = document.querySelector('.avatar-group');
    if (avatarGroup) {
        avatarGroup.innerHTML = '';
        const cores = ['#1a6641', '#2e7d54', '#4caf85'];

        comunidade.recentes.forEach((nome, i) => {
            const inicial = nome.charAt(0).toUpperCase();
            const span = document.createElement('span');
            span.style.cssText = `
                width: 38px; height: 38px; border-radius: 50%;
                background: ${cores[i % cores.length]}; color: #fff;
                font-size: 15px; font-weight: 700;
                display: inline-flex; align-items: center; justify-content: center;
                border: 2px solid #fff; margin-left: ${i > 0 ? '-8px' : '0'};
                font-family: 'Poppins', sans-serif;
                position: relative; z-index: ${10 - i};
                title: "${nome}";
            `;
            span.textContent = inicial;
            span.title = nome;
            avatarGroup.appendChild(span);
        });

        
        const extra = comunidade.total - comunidade.recentes.length;
        if (extra > 0) {
            const moreEl = document.createElement('span');
            moreEl.className = 'more-count';
            moreEl.textContent = `+${extra}`;
            avatarGroup.appendChild(moreEl);
        }
    }

    // mensagem da comunidade
    const communityMsgEl = document.querySelector('.community-msg');
    if (communityMsgEl) {
        if (comunidade.total === 0) {
            communityMsgEl.textContent = 'Seja o primeiro da comunidade EcoTrack!';
        } else if (economia.totalResiduo > 0) {
            communityMsgEl.textContent =
                `Você e ${comunidade.total} ${comunidade.total === 1 ? 'pessoa salva' : 'pessoas salvaram'} ${economia.totalResiduo} kg de resíduos juntos.`;
        } else {
            communityMsgEl.textContent =
                `${comunidade.total} ${comunidade.total === 1 ? 'pessoa já faz parte' : 'pessoas já fazem parte'} da comunidade EcoTrack.`;
        }
    }
}

function renderObjetivos(email) {
    const objetivos = buildObjetivosAtivos(email);
    const container = document.querySelector('.goals-card');
    if (!container) return;

    // remove itens antigos
    container.querySelectorAll('.goal-item').forEach(el => el.remove());

    if (objetivos.length === 0) {
        const vazio = document.createElement('p');
        vazio.style.cssText = 'color:#7a8fa6;font-size:13px;margin-top:12px;font-family:Poppins,sans-serif;';
        vazio.textContent = 'Nenhuma missão iniciada hoje. Acesse Ações para começar!';
        container.appendChild(vazio);
        return;
    }

    objetivos.forEach(obj => {
        const item = document.createElement('div');
        item.className = 'goal-item';
        item.innerHTML = `
            <div class="goal-icon">${obj.icon}</div>
            <div class="goal-info">
                <strong>${obj.title}</strong>
                <span>${obj.desc}</span>
            </div>
            <div class="mini-progress">
                <div class="fill" style="width: ${obj.progress}%; background: ${obj.done ? '#1a6641' : '#ccc'};"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderWelcomeMsg(session, stats) {
    const descEl = document.querySelector('.welcome-text p');
    if (!descEl) return;

    const streak = getStreak(session.email).count;
    const missoesSemana = stats.totalCompleted || 0;
    const kgCO2 = getPegadaCO2(session);
    const mediaKg = 2400;

    if (streak >= 3) {
        descEl.textContent = `🔥 ${streak} dias seguidos! Você está em uma sequência incrível. Continue assim!`;
    } else if (kgCO2 != null && kgCO2 < mediaKg) {
        const kg = Math.round((mediaKg - kgCO2) / 52); // kg por semana vs média
        descEl.textContent = `Continue assim, você está fazendo a diferença! Sua pegada é ${kg} kg CO₂ menor por semana do que a média nacional.`;
    } else if (missoesSemana > 0) {
        descEl.textContent = `Você já completou ${missoesSemana} missão${missoesSemana > 1 ? 'ões' : ''} no total. Cada ação conta para o planeta!`;
    } else {
        descEl.textContent = `Bem-vindo(a) ao EcoTrack! Comece suas missões diárias e meça sua pegada de carbono.`;
    }
}

// ---------- botão "analisar detalhes" ----------

function bindAnalisarDetalhes() {
    const btn = document.querySelector('.btn-action');
    if (!btn) return;
    btn.addEventListener('click', () => {
        window.location.href = 'calculador.html';
    });
}

// ---------- inicializar ----------

document.addEventListener('DOMContentLoaded', function () {
    const session = getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const stats = getUserStats(session.email);

    renderNomeUsuario(session);
    renderWelcomeMsg(session, stats);
    renderEcoScore(stats);
    renderPegadaCarbono(session, stats);
    renderUsoEnergia(stats);
    renderAguaEconomizada(stats);
    renderComunidade();
    renderObjetivos(session.email);
    bindAnalisarDetalhes();
});
