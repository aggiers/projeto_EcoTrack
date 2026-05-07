// =============================================
// EcoTrack - Quiz Socioambiental
// quiz.js — Lógica central do quiz
// =============================================

const quizData = [
    {
        page: 1,
        total: 3,
        progressPercent: 33,
        question: "Qual a principal causa do desmatamento na Amazônia?",
        description:
            "A Amazônia é vital para o equilíbrio climático global. Entender as pressões que a floresta sofre é o primeiro passo para protegê-la.",
        options: [
            {
                letter: "A",
                title: "Pecuária e soja",
                desc: "Expansão de fronteiras agrícolas e pastagens.",
                correct: true,
                feedback:
                    "✅ Correto! Cerca de 80% das áreas desmatadas na Amazônia são convertidas em pastagens ou lavouras de soja para exportação.",
            },
            {
                letter: "B",
                title: "Turismo sustentável",
                desc: "Visitação controlada em parques nacionais.",
                correct: false,
                feedback:
                    "❌ Incorreto. O turismo sustentável, quando bem gerenciado, é uma aliada da conservação — não uma ameaça.",
            },
            {
                letter: "C",
                title: "Reflorestamento natural",
                desc: "Recuperação espontânea de áreas degradadas.",
                correct: false,
                feedback:
                    "❌ Incorreto. O reflorestamento natural é, na verdade, um processo de recuperação ambiental, não uma causa de desmatamento.",
            },
        ],
        didYouKnow:
            "Cerca de 80% das áreas desmatadas na Amazônia são transformadas em pastagens para criação de gado.",
        nextPage: "socioambiental2.html",
        backPage: "../saibamais.html",
        backLabel: "Voltar ao Artigo",
        nextLabel: "Próximo",
    },

    {
        page: 2,
        total: 3,
        progressPercent: 66,
        question: "O que é a pegada de carbono de uma pessoa ou empresa?",
        description:
            "Medir o impacto das nossas ações no clima é essencial para adotar hábitos mais sustentáveis e tomar decisões mais conscientes.",
        options: [
            {
                letter: "A",
                title: "A quantidade de carbono no solo",
                desc: "Medição do carbono armazenado em solos agrícolas.",
                correct: false,
                feedback:
                    "❌ Incorreto. O carbono no solo é importante para a agricultura, mas não define a pegada de carbono individual ou corporativa.",
            },
            {
                letter: "B",
                title: "O total de emissões de CO₂ geradas",
                desc: "Soma das emissões diretas e indiretas de gases de efeito estufa.",
                correct: true,
                feedback:
                    "✅ Correto! A pegada de carbono soma todas as emissões de CO₂ e outros gases do efeito estufa — de transporte, alimentação, energia e consumo.",
            },
            {
                letter: "C",
                title: "O número de árvores plantadas",
                desc: "Iniciativas de compensação ambiental via reflorestamento.",
                correct: false,
                feedback:
                    "❌ Incorreto. Plantar árvores pode compensar parte das emissões, mas não é o que define a pegada de carbono.",
            },
        ],
        didYouKnow:
            "Um brasileiro emite, em média, cerca de 2,2 toneladas de CO₂ por ano — bem abaixo da média global de 4,7 toneladas.",
        nextPage: "socioambiental3.html",
        backPage: "socioambiental.html",
        backLabel: "Voltar ao Anterior",
        nextLabel: "Próximo",
    },

    {
        page: 3,
        total: 3,
        progressPercent: 100,
        question: "Qual setor é responsável pela maior parte das emissões globais de CO₂?",
        description:
            "Identificar os maiores emissores de gases de efeito estufa é fundamental para direcionar políticas públicas e ações individuais eficazes.",
        options: [
            {
                letter: "A",
                title: "Agricultura e pecuária",
                desc: "Produção de alimentos e criação de animais.",
                correct: false,
                feedback:
                    "❌ Incorreto. A agropecuária é responsável por cerca de 10–12% das emissões globais — significativa, mas não a maior.",
            },
            {
                letter: "B",
                title: "Geração de energia elétrica e calor",
                desc: "Usinas termelétricas a carvão, gás e petróleo.",
                correct: true,
                feedback:
                    "✅ Correto! A geração de energia — especialmente por combustíveis fósseis — é responsável por aproximadamente 34% das emissões globais de CO₂.",
            },
            {
                letter: "C",
                title: "Gestão de resíduos sólidos",
                desc: "Aterros sanitários e incineração de lixo.",
                correct: false,
                feedback:
                    "❌ Incorreto. A gestão de resíduos contribui com cerca de 3–5% das emissões — importante, mas longe de ser a maior fonte.",
            },
        ],
        didYouKnow:
            "Se o setor energético global migrasse 100% para renováveis até 2050, as emissões de CO₂ poderiam cair até 70% em relação aos níveis atuais.",
        nextPage: "../resultadoquiz.html",
        backPage: "socioambiental2.html",
        backLabel: "Voltar ao Anterior",
        nextLabel: "Finalizar",
    },
];

// ── Detecta qual página está rodando ──────────────────────────────────────────
function detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes("socioambiental3")) return 3;
    if (path.includes("socioambiental2")) return 2;
    return 1;
}

// ── Renderiza os dados da questão no DOM ──────────────────────────────────────
function renderQuiz(data) {
    // Progresso
    const fill = document.querySelector(".progress-bar-fill");
    const counter = document.querySelector(".progress-counter");
    if (fill) fill.style.width = data.progressPercent + "%";
    if (counter)
        counter.textContent = `0${data.page} / 0${data.total}`;

    // Pergunta e descrição
    const qCard = document.querySelector(".question-card");
    if (qCard) {
        qCard.querySelector("h2").textContent = data.question;
        qCard.querySelector("p").textContent = data.description;
    }

    // Alternativas
    const optionsList = document.querySelector(".options-list");
    if (optionsList) {
        optionsList.innerHTML = "";
        data.options.forEach((opt, idx) => {
            const div = document.createElement("div");
            div.className = "option-item";
            div.dataset.index = idx;
            div.innerHTML = `
        <span class="option-letter">${opt.letter}</span>
        <div class="option-text">
          <strong>${opt.title}</strong>
          <p>${opt.desc}</p>
          <p class="feedback" id="feedback-${idx}">${opt.feedback}</p>
        </div>
        <i class="bi bi-chevron-right"></i>
      `;
            optionsList.appendChild(div);
        });
    }

    // Botão Próximo / Finalizar
    const btnNext = document.querySelector(".btn-next");
    if (btnNext) {
        btnNext.innerHTML = `<a href="${data.nextPage}">${data.nextLabel}</a>`;
    }

    // Botão Voltar
    const btnVoltar = document.querySelector(".voltar");
    if (btnVoltar) {
        btnVoltar.innerHTML = `<a href="${data.backPage}">${data.backLabel}</a>`;
    }

    // Você sabia?
    const dykText = document.querySelector(".dyk-text p");
    if (dykText) dykText.textContent = data.didYouKnow;
}

// ── Lógica de seleção e confirmação ───────────────────────────────────────────



// ── Chave única de storage por quiz e página ──────────────────────────────────
function storageKey(quizId, page) {
    return `ecotrack_quiz_${quizId}_page${page}`;
}

// ── Salva resposta no localStorage ────────────────────────────────────────────
function saveAnswer(quizId, page, selectedIndex) {
    try {
        localStorage.setItem(storageKey(quizId, page), String(selectedIndex));
    } catch (e) {}
}

// ── Recupera resposta salva (ou null) ─────────────────────────────────────────
function loadAnswer(quizId, page) {
    try {
        const val = localStorage.getItem(storageKey(quizId, page));
        return val !== null ? parseInt(val) : null;
    } catch (e) {
        return null;
    }
}



// ── Aplica estado visual de resposta já confirmada ────────────────────────────
function restoreConfirmedState(data, savedIndex) {
    const items = document.querySelectorAll(".option-item");
    items.forEach((el, idx) => {
        const feedbackEl = document.getElementById("feedback-" + idx);
        const isCorrect  = data.options[idx].correct;

        if (idx === savedIndex) {
            el.classList.add(isCorrect ? "correct" : "wrong");
            if (feedbackEl) feedbackEl.style.display = "block";
        } else if (isCorrect) {
            el.classList.add("correct");
        }
    });

    const btnConfirm = document.querySelector(".btn-confirm");
    if (btnConfirm) {
        btnConfirm.textContent = "Respondido ✓";
        btnConfirm.style.background = "#16a34a";
        btnConfirm.disabled = true;
    }
}

function initQuizInteraction(data) {
    const QUIZ_ID = "socioambiental";
    let selectedIndex = null;
    let confirmed = false;

    // Restaura resposta salva
    const saved = loadAnswer(QUIZ_ID, data.page);
    if (saved !== null) {
        selectedIndex = saved;
        confirmed = true;
        // Aguarda DOM renderizado pelo renderQuiz
        requestAnimationFrame(() => restoreConfirmedState(data, saved));
    }

    document.addEventListener("click", function (e) {
        const item = e.target.closest(".option-item");
        if (item && !confirmed) {
            // Remove seleção anterior
            document.querySelectorAll(".option-item").forEach((el) => {
                el.classList.remove("selected");
            });
            selectedIndex = parseInt(item.dataset.index);
            item.classList.add("selected");
        }
    });

    const btnConfirm = document.querySelector(".btn-confirm");
    if (btnConfirm) {
        btnConfirm.addEventListener("click", function () {
            if (selectedIndex === null) {
                shakeButton(btnConfirm);
                return;
            }
            if (confirmed) return;
            confirmed = true;
            saveAnswer(QUIZ_ID, data.page, selectedIndex);
            // Salva acerto/erro para a página de resultado
            const wasCorrect = data.options[selectedIndex].correct;
            try {
                localStorage.setItem(
                    `ecotrack_score_${QUIZ_ID}_page${data.page}`,
                    wasCorrect ? "1" : "0"
                );
            } catch(e) {}

            const items = document.querySelectorAll(".option-item");

            items.forEach((el, idx) => {
                const feedbackEl = document.getElementById("feedback-" + idx);
                const isCorrect = data.options[idx].correct;

                if (idx === selectedIndex) {
                    el.classList.remove("selected");
                    el.classList.add(isCorrect ? "correct" : "wrong");
                    if (feedbackEl) {
                        feedbackEl.style.display = "block";
                        feedbackEl.style.animation = "fadeInFeedback 0.4s ease";
                    }
                } else if (isCorrect) {
                    // Destaca a correta se o usuário errou
                    el.classList.add("correct");
                }
            });

            btnConfirm.textContent = "Respondido ✓";
            btnConfirm.style.background = "#16a34a";
            btnConfirm.disabled = true;
        });
    }
}

// ── Animação de shake quando nenhuma opção foi selecionada ────────────────────
function shakeButton(btn) {
    btn.style.animation = "none";
    btn.offsetHeight; // reflow
    btn.style.animation = "shake 0.4s ease";
    setTimeout(() => (btn.style.animation = ""), 400);
}

// ── Injeta estilos de animação dinamicamente ──────────────────────────────────
function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
    @keyframes fadeInFeedback {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    /* ── Feedback oculto por padrão ── */
        .feedback {
            display: none;
            margin-top: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #334155;
            line-height: 1.5;
        }

        /* ── Estado: selecionado ── */
        .option-item.selected {
            background: #eef2ff;
            border: 2px solid #6366f1;
            transform: translateX(4px);
        }

        .option-item.selected .option-letter {
            background: #6366f1;
            color: white;
        }

        /* ── Estado: correto ── */
        .option-item.correct {
            background: #f0fdf4;
            border: 2px solid #16a34a;
        }

        .option-item.correct .option-letter {
            background: #dcfce7;
            color: #16a34a;
        }

        .option-item.correct .option-arrow {
            color: #16a34a;
        }

        /* ── Estado: errado ── */
        .option-item.wrong {
            background: #fff1f2;
            border: 2px solid #dc2626;
        }

        .option-item.wrong .option-letter {
            background: #fee2e2;
            color: #dc2626;
        }

        .option-item.wrong .option-arrow {
            color: #dc2626;
        }

        /* ── Transição suave nas opções ── */
        .option-item {
            transition: all 0.25s ease, border 0.2s ease;
            border: 2px solid transparent;
        }
  `;
    document.head.appendChild(style);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    const pageNum = detectCurrentPage();
    const data = quizData.find((q) => q.page === pageNum);
    if (!data) return;
    renderQuiz(data);
    initQuizInteraction(data);
});