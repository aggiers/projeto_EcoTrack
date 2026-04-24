// =============================================
//  EcoTrack — calculador.js
//  Cálculo real de pegada de carbono (CO2e/ano)
// =============================================

const CALC_SAVE_KEY_PREFIX = 'ecotrack_calculator';

function getCalcSaveKey() {
    const session = JSON.parse(localStorage.getItem('ecotrack_session') || 'null');
    return session ? `${CALC_SAVE_KEY_PREFIX}_${session.email}` : CALC_SAVE_KEY_PREFIX;
}

// ---------- Fatores de emissão (kg CO2e) ----------
// Fontes: IPCC, EPA, SEEG Brasil

const FATORES = {
    transporte: {
        'carro-gasolina': 0.21,   // kg CO2e por km (carro médio gasolina)
        'carro-etanol': 0.10,   // etanol reduz ~52% vs gasolina
        'carro-diesel': 0.27,
        'eletrico': 0.04,   // elétrico na matriz brasileira
        'publico': 0.06,   // ônibus urbano BR
        'bicicleta': 0.00,
    },
    energia: {
        baseAnual: 1200,   // kg CO2e médio residencial BR por ano
        renovavelDesconto: 0.60,   // -60% se usa renovável
        smartHomeDesconto: 0.15,   // -15% se usa automação inteligente
    },
    agua: {
        banhoCurto: -80,     // kg CO2e economizados/ano vs banho longo
        cargasCompletas: -40,     // máquina somente cheia
        aguaChuva: -60,     // reuso de água da chuva
    },
    mediaBrasileiro: 2400,   // kg CO2e/ano (média nacional)
    metaClimatica: 1000,   // meta para 1.5°C até 2050
};

// Insights dinâmicos por faixa
const INSIGHTS = [
    {
        max: 800,
        icon: '🌟',
        texto: (v, pct) => `Você está entre os ${100 - pct}% mais sustentáveis! Sua pegada de ${v} kg CO2e/ano é exemplar — continue inspirando.`,
        dica: 'Continue assim! Considere plantar árvores para neutralizar o restante.',
    },
    {
        max: 1500,
        icon: '🌱',
        texto: (v, pct) => `Ótimo! Com ${v} kg CO2e/ano você supera ${pct}% dos brasileiros. Pequenos ajustes podem te colocar na zona ideal.`,
        dica: 'Instale painéis solares para zerar sua pegada energética.',
    },
    {
        max: 2400,
        icon: '⚡',
        texto: (v, pct) => `Sua pegada de ${v} kg CO2e/ano está na média brasileira. Há espaço para melhorar — cada ação conta!`,
        dica: 'Substituir 2 trajetos/semana de carro por bike economiza ~200 kg CO2/ano.',
    },
    {
        max: 4000,
        icon: '🔥',
        texto: (v, pct) => `Com ${v} kg CO2e/ano você está acima da média. Reduza ${v - 2400} kg ajustando transporte e energia.`,
        dica: 'Usar transporte público 3x/semana pode cortar 30% da sua pegada de transporte.',
    },
    {
        max: Infinity,
        icon: '🚨',
        texto: (v, pct) => `Sua pegada de ${v} kg CO2e/ano está ${Math.round((v / FATORES.mediaBrasileiro - 1) * 100)}% acima da média. Priorize mudanças urgentes.`,
        dica: 'Trocar para energia renovável é a ação de maior impacto imediato.',
    },
];

// ---------- Estado da calculadora ----------

let estado = {
    trajeto: null,         // 'eletrico' | 'publico' | 'bicicleta' | 'carro-gasolina'
    kmSemanal: 45,
    energiaRenovavel: false,
    smartHome: false,
    aguaHabitos: new Set(), // 'banhoCurto' | 'cargasCompletas' | 'aguaChuva'
};

// ---------- Carrega estado salvo ----------

function carregarEstado() {
    const raw = localStorage.getItem(getCalcSaveKey());
    if (!raw) return;
    try {
        const salvo = JSON.parse(raw);
        estado = { ...estado, ...salvo, aguaHabitos: new Set(salvo.aguaHabitos || []) };
    } catch (_) { }
}

function salvarEstado() {
    const paraSerializar = { ...estado, aguaHabitos: [...estado.aguaHabitos] };
    localStorage.setItem(getCalcSaveKey(), JSON.stringify(paraSerializar));
}

// ---------- Cálculo principal ----------

function calcularPegada() {
    let total = 0;

    // 1. Transporte
    const fatorTrajeto = FATORES.transporte[estado.trajeto] ?? FATORES.transporte['carro-gasolina'];
    const kmAnual = estado.kmSemanal * 52;
    const emissaoTransp = fatorTrajeto * kmAnual; // kg CO2e/ano
    total += emissaoTransp;

    // 2. Energia
    let emissaoEnergia = FATORES.energia.baseAnual;
    if (estado.energiaRenovavel) emissaoEnergia *= (1 - FATORES.energia.renovavelDesconto);
    if (estado.smartHome) emissaoEnergia *= (1 - FATORES.energia.smartHomeDesconto);
    total += emissaoEnergia;

    // 3. Água (descontos)
    let emissaoAgua = 0;
    if (estado.aguaHabitos.has('banhoCurto')) emissaoAgua += FATORES.agua.banhoCurto;
    if (estado.aguaHabitos.has('cargasCompletas')) emissaoAgua += FATORES.agua.cargasCompletas;
    if (estado.aguaHabitos.has('aguaChuva')) emissaoAgua += FATORES.agua.aguaChuva;
    total += emissaoAgua;

    return Math.max(0, Math.round(total));
}

// ---------- Percentil vs média brasileira ----------

function calcularPercentil(pegada) {
    // Distribuição simulada com base em dados SEEG
    // ~20% < 1000 kg, ~50% < 2400 kg, ~80% < 4000 kg
    if (pegada < 500) return 95;
    if (pegada < 1000) return 88;
    if (pegada < 1500) return 75;
    if (pegada < 2000) return 60;
    if (pegada < 2400) return 50;
    if (pegada < 3000) return 35;
    if (pegada < 4000) return 20;
    return 8;
}

// ---------- Equivalências visuais ----------

function equivalencias(kgCO2) {
    return {
        arvores: Math.round(kgCO2 / 21),        // 1 árvore absorve ~21 kg CO2/ano
        km: Math.round(kgCO2 / 0.21),      // km equivalente de carro
        chuveiros: Math.round(kgCO2 / 0.5),       // banhos de 10min
    };
}

// ---------- Atualiza UI de resultado ----------

function atualizarResultado(animar = false) {
    const pegada = calcularPegada();
    const toneladas = (pegada / 1000).toFixed(1);
    const percentil = calcularPercentil(pegada);
    const eqv = equivalencias(pegada);

    // Faixa de insight
    const insight = INSIGHTS.find(i => pegada <= i.max) || INSIGHTS[INSIGHTS.length - 1];

    // Progresso para meta climática (1000 kg = 100%, acima = passa de 100%)
    const progressoPctMeta = Math.min(100, Math.round((pegada / FATORES.mediaBrasileiro) * 100));
    const melhorOuPior = pegada <= FATORES.mediaBrasileiro
        ? `${Math.round((1 - pegada / FATORES.mediaBrasileiro) * 100)}% Melhor`
        : `${Math.round((pegada / FATORES.mediaBrasileiro - 1) * 100)}% Acima`;

    // Cor da barra
    let corBarra = '#1a6641';
    if (pegada > 3000) corBarra = '#e05252';
    else if (pegada > 2000) corBarra = '#f59e0b';

    // Atualiza elementos
    const valorEl = document.querySelector('.valor-resultado');
    if (valorEl) {
        if (animar) {
            animarContador(valorEl, parseFloat(valorEl.dataset.current || 0), parseFloat(toneladas), 800);
        } else {
            valorEl.innerHTML = `${toneladas} <span>tons CO2e/ano</span>`;
        }
        valorEl.dataset.current = toneladas;
    }

    const pctEl = document.querySelector('.porcentagem');
    if (pctEl) pctEl.textContent = melhorOuPior;

    const barraEl = document.querySelector('.barra-preenchida');
    if (barraEl) {
        barraEl.style.width = progressoPctMeta + '%';
        barraEl.style.background = corBarra;
        barraEl.style.transition = 'width 0.8s ease, background 0.5s';
    }

    const insightEl = document.querySelector('.texto-insight');
    if (insightEl) {
        insightEl.textContent = `${insight.icon} ${insight.texto(pegada, percentil)}`;
    }

    const dicaEl = document.querySelector('.cartao-dica:first-child p');
    if (dicaEl) dicaEl.textContent = insight.dica;

    // Conquista dinâmica (segundo card)
    const conquistaEl = document.querySelector('.cartao-dica:last-child p');
    if (conquistaEl) {
        if (pegada < 1000) {
            conquistaEl.textContent = 'Você atingiu a meta climática de 2050! Parabéns!';
        } else {
            const faltam = pegada - 1000;
            conquistaEl.textContent = `Faltam ${faltam} kg CO2e para atingir a meta climática de 1.5°C.`;
        }
    }

    // Equivalências (se existir o elemento)
    const eqvEl = document.querySelector('.equivalencias-texto');
    if (eqvEl) {
        eqvEl.innerHTML = `
      Equivale a <strong>${eqv.arvores} árvores</strong> plantadas/ano
      ou <strong>${(eqv.km / 1000).toFixed(1)} mil km</strong> de carro.
    `;
    }

    salvarEstado();
}

// ---------- Função de Compartilhamento ----------

function configurarCompartilhamento() {
    const btnCompartilhar = document.getElementById('btn_compartilhar');
    if (!btnCompartilhar) return;

    btnCompartilhar.addEventListener('click', async () => {
        // Pega o valor atual do resultado que já está na tela
        const resultadoTexto = document.getElementById('resultado-valor')?.textContent || "0.00";
        
        const dadosCompartilhamento = {
            title: 'Meu Impacto Ecológico - EcoTrack',
            text: `Minha pegada de carbono atual é de ${resultadoTexto} kg CO2e/ano! Vamos juntos transformar nossa pegada em impacto vivo? 🌿`,
            url: window.location.href // Envia o link da sua página
        };

        try {
            // Verifica se o navegador suporta o compartilhamento nativo
            if (navigator.share) {
                await navigator.share(dadosCompartilhamento);
            } else {
                // Caso não suporte (navegadores antigos), copia o texto para a área de transferência
                navigator.clipboard.writeText(`${dadosCompartilhamento.text} Acesse: ${dadosCompartilhamento.url}`);
                alert("Link e progresso copiados para a área de transferência!");
            }
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    });
}

// Chame a função dentro do seu EventListener de DOMContentLoaded já existente
document.addEventListener('DOMContentLoaded', () => {
    // ... suas outras chamadas (initCalculadora, etc)
    configurarCompartilhamento();
});

// ---------- Animação de contador ----------

function animarContador(el, de, ate, duracao) {
    const inicio = performance.now();
    function frame(agora) {
        const prog = Math.min((agora - inicio) / duracao, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        const val = (de + (ate - de) * ease).toFixed(1);
        el.innerHTML = `${val} <span>tons CO2e/ano</span>`;
        if (prog < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// ---------- Bind: Trajeto ----------

function bindTrajeto() {
    const btns = document.querySelectorAll('.botoes-selecao .opcao-btn');
    const mapa = {
        'Veículo Elétrico': 'eletrico',
        'Transporte Público': 'publico',
        'Bicicleta/Caminhada': 'bicicleta',
        'Carro (Gasolina)': 'carro-gasolina',
        'Carro (Etanol)': 'carro-etanol',
        'Carro (Diesel)': 'carro-diesel',
    };

    btns.forEach(btn => {
        // Marca ativo se já salvo
        const chave = mapa[btn.textContent.trim()];
        if (chave && chave === estado.trajeto) btn.classList.add('ativo');

        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            estado.trajeto = mapa[btn.textContent.trim()] ?? 'carro-gasolina';
            atualizarResultado();
        });
    });

    // Default: se nenhum salvo, seleciona primeiro
    if (!estado.trajeto && btns.length) {
        btns[0].click();
    }
}

// ---------- Bind: Range de KM ----------

function bindRange() {
    const range = document.querySelector('.seletor-range');
    const labelEl = document.querySelector('.legenda-range strong');

    if (!range) return;

    range.value = estado.kmSemanal;
    if (labelEl) labelEl.textContent = estado.kmSemanal + ' km';

    range.addEventListener('input', () => {
        const val = parseInt(range.value);
        estado.kmSemanal = val;
        if (labelEl) labelEl.textContent = val + ' km';
        atualizarResultado();
    });
}

// ---------- Bind: Toggles de energia ----------

function bindToggles() {
    const linhas = document.querySelectorAll('.linha-alternancia');

    linhas.forEach((linha, i) => {
        const checkbox = linha.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        // Restaura estado salvo
        if (i === 0) checkbox.checked = estado.energiaRenovavel;
        if (i === 1) checkbox.checked = estado.smartHome;

        checkbox.addEventListener('change', () => {
            if (i === 0) estado.energiaRenovavel = checkbox.checked;
            if (i === 1) estado.smartHome = checkbox.checked;
            atualizarResultado();
        });
    });
}

// ---------- Bind: Cards de água ----------

function bindAgua() {
    const cards = document.querySelectorAll('.card-water');
    const mapaAgua = ['banhoCurto', 'cargasCompletas', 'aguaChuva'];

    cards.forEach((card, i) => {
        const chave = mapaAgua[i];
        if (!chave) return;

        // Restaura estado visual
        if (estado.aguaHabitos.has(chave)) card.classList.add('selecionado');

        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            if (estado.aguaHabitos.has(chave)) {
                estado.aguaHabitos.delete(chave);
                card.classList.remove('selecionado');
            } else {
                estado.aguaHabitos.add(chave);
                card.classList.add('selecionado');
            }
            atualizarResultado();
        });
    });

    // CSS para card selecionado (injeta uma vez)
    injetarEstilosAgua();
}

function injetarEstilosAgua() {
    if (document.getElementById('eco-agua-styles')) return;
    const s = document.createElement('style');
    s.id = 'eco-agua-styles';
    s.textContent = `
        .card-water {
        transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        border: 2px solid transparent;
        border-radius: 14px;
        }
        .card-water:hover {
        transform: translateY(-3px);
        }
        .card-water.selecionado {
        border-color: #1a6641;
        background: rgba(26, 102, 65, 0.08);
        transform: translateY(-3px);
        box-shadow: 0 6px 24px rgba(26,102,65,0.15);
        }
        .opcao-btn {
        transition: background 0.18s, color 0.18s, transform 0.15s;
        }
        .opcao-btn.ativo {
        background: #1a6641 !important;
        color: #fff !important;
        transform: scale(1.04);
        }
    `;
    document.head.appendChild(s);
}

// ---------- Bind: Botão calcular ----------

function bindBotaoCalcular() {
    const btn = document.querySelector('.botao-calcular');
    if (!btn) return;

    // Remove o <a> de dentro e torna o botão funcional
    btn.innerHTML = 'Calcular meu impacto';
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Pulsa o card de resultado
        const card = document.querySelector('.cartao-resultado');
        if (card) {
            card.style.transform = 'scale(1.02)';
            card.style.transition = 'transform 0.2s';
            setTimeout(() => { card.style.transform = ''; }, 300);
        }

        atualizarResultado(true); // com animação de contador
        salvarEstadoNoUsuario();
    });
}

// ---------- Salva resultado na conta do usuário ----------

function salvarEstadoNoUsuario() {
    const session = JSON.parse(localStorage.getItem('ecotrack_session') || 'null');
    if (!session) return;

    const pegada = calcularPegada();
    session.pegadaCO2 = pegada;
    localStorage.setItem('ecotrack_session', JSON.stringify(session));

    // Atualiza também no array de usuários
    const STORAGE_KEY = 'ecotrack_users';
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const idx = users.findIndex(u => u.email === session.email);
    if (idx > -1) {
        users[idx].pegadaCO2 = pegada;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
}

// ---------- Init ----------

document.addEventListener('DOMContentLoaded', function () {
    carregarEstado();
    bindTrajeto();
    bindRange();
    bindToggles();
    bindAgua();
    bindBotaoCalcular();
    atualizarResultado(); // exibe cálculo com valores padrão/salvos
});