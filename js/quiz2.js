// =============================================
// EcoTrack - quiz2.js
// lógica do quiz socioeconômico
// =============================================

const quizData = [
 
    {
        page: 1,
        total: 3,
        progressPercent: 33,
        question: "O que é o Índice de Desenvolvimento Humano (IDH)?",
        description:
            "O IDH é uma das métricas mais usadas para comparar o bem-estar das populações ao redor do mundo. Mas o que ele realmente mede?",
        options: [
            {
                letter: "A",
                title: "O PIB per capita de um país",
                desc: "Valor da produção econômica dividido pela população.",
                correct: false,
                feedback:
                    "❌ Incorreto. O PIB per capita mede apenas a riqueza econômica — o IDH vai além disso, incluindo educação e saúde.",
            },
            {
                letter: "B",
                title: "Uma medida composta de renda, educação e saúde",
                desc: "Combina expectativa de vida, escolaridade e renda.",
                correct: true,
                feedback:
                    "✅ Correto! O IDH combina três dimensões: expectativa de vida ao nascer, nível de escolaridade e renda per capita ajustada.",
            },
            {
                letter: "C",
                title: "O nível de desigualdade social de um país",
                desc: "Mede a concentração de renda entre os mais ricos e mais pobres.",
                correct: false,
                feedback:
                    "❌ Incorreto. A desigualdade social é medida por outros índices, como o Coeficiente de Gini. O IDH foca em desenvolvimento humano médio.",
            },
        ],
        didYouKnow:
            "O Brasil ocupa a 89ª posição no ranking global do IDH (2023), classificado como país de alto desenvolvimento humano.",
        nextPage: "socioeconomico2.html",
        backPage: "../saibamais.html",
        backLabel: "Voltar ao Artigo",
        nextLabel: "Próximo",
    },

    
    {
        page: 2,
        total: 3,
        progressPercent: 66,
        question: "O que é a economia circular?",
        description:
            "Modelos econômicos sustentáveis estão ganhando força no mundo. A economia circular é um dos conceitos centrais dessa transformação.",
        options: [
            {
                letter: "A",
                title: "Um modelo que elimina resíduos e reutiliza recursos",
                desc: "Produtos são projetados para serem reusados, reparados ou reciclados.",
                correct: true,
                feedback:
                    "✅ Correto! A economia circular substitui o modelo linear 'produzir → usar → descartar' por ciclos contínuos de uso, recuperação e regeneração de materiais.",
            },
            {
                letter: "B",
                title: "Uma forma de distribuir renda igualmente",
                desc: "Sistema econômico focado na redistribuição de riqueza.",
                correct: false,
                feedback:
                    "❌ Incorreto. A distribuição de renda é tema da economia social. A economia circular foca no ciclo de vida dos produtos e materiais.",
            },
            {
                letter: "C",
                title: "O comércio entre países em desenvolvimento",
                desc: "Trocas comerciais Sul-Sul entre economias emergentes.",
                correct: false,
                feedback:
                    "❌ Incorreto. O comércio entre países emergentes é chamado de cooperação Sul-Sul. A economia circular trata do uso eficiente de recursos.",
            },
        ],
        didYouKnow:
            "Adotar a economia circular poderia gerar até 700 mil empregos líquidos no Brasil até 2030, segundo estudo da Fundação Ellen MacArthur.",
        nextPage: "socioeconomico3.html",
        backPage: "socioeconomico.html",
        backLabel: "Voltar ao Anterior",
        nextLabel: "Próximo",
    },

    
    {
        page: 3,
        total: 3,
        progressPercent: 100,
        question: "Qual é o principal impacto das mudanças climáticas sobre a desigualdade social?",
        description:
            "As mudanças climáticas não afetam todas as pessoas da mesma forma. Entender essa dinâmica é essencial para promover justiça socioambiental.",
        options: [
            {
                letter: "A",
                title: "Afetam igualmente toda a população global",
                desc: "Todos os países e classes sociais sofrem da mesma forma.",
                correct: false,
                feedback:
                    "❌ Incorreto. As mudanças climáticas têm impactos profundamente desiguais — populações vulneráveis são as mais afetadas, mesmo sendo as que menos contribuíram para o problema.",
            },
            {
                letter: "B",
                title: "Impactam mais quem tem maior renda",
                desc: "Países ricos sofrem mais por terem mais infraestrutura exposta.",
                correct: false,
                feedback:
                    "❌ Incorreto. Países ricos têm maior capacidade de adaptação. São as populações de baixa renda e países em desenvolvimento os mais vulneráveis.",
            },
            {
                letter: "C",
                title: "Aprofundam desigualdades, atingindo mais os pobres",
                desc: "Populações vulneráveis têm menos recursos para se adaptar.",
                correct: true,
                feedback:
                    "✅ Correto! Os mais pobres sofrem mais os efeitos climáticos — enchentes, secas e insegurança alimentar — e têm menos recursos para se adaptar ou se recuperar.",
            },
        ],
        didYouKnow:
            "Segundo o Banco Mundial, as mudanças climáticas podem empurrar mais 132 milhões de pessoas para a pobreza extrema até 2030 se nada for feito.",
        nextPage: "../resultadoquiz.html",
        backPage: "socioeconomico2.html",
        backLabel: "Voltar ao Anterior",
        nextLabel: "Finalizar",
    },
];


function detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes("socioeconomico3")) return 3;
    if (path.includes("socioeconomico2")) return 2;
    return 1;
}


function renderQuiz(data) {
    const fill = document.querySelector(".progress-bar-fill");
    const counter = document.querySelector(".progress-counter");
    if (fill) fill.style.width = data.progressPercent + "%";
    if (counter) counter.textContent = `0${data.page} / 0${data.total}`;

    const qCard = document.querySelector(".question-card");
    if (qCard) {
        qCard.querySelector("h2").textContent = data.question;
        qCard.querySelector("p").textContent = data.description;
    }

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

    const btnNext = document.querySelector(".btn-next");
    if (btnNext) {
        btnNext.innerHTML = `<a href="${data.nextPage}">${data.nextLabel}</a>`;
    }

    const btnVoltar = document.querySelector(".voltar");
    if (btnVoltar) {
        btnVoltar.innerHTML = `<a href="${data.backPage}">${data.backLabel}</a>`;
    }

    const dykText = document.querySelector(".dyk-text p");
    if (dykText) dykText.textContent = data.didYouKnow;
}


function storageKey(quizId, page) {
    return `ecotrack_quiz_${quizId}_page${page}`;
}


function saveAnswer(quizId, page, selectedIndex) {
    try {
        localStorage.setItem(storageKey(quizId, page), String(selectedIndex));
    } catch (e) {}
}


function loadAnswer(quizId, page) {
    try {
        const val = localStorage.getItem(storageKey(quizId, page));
        return val !== null ? parseInt(val) : null;
    } catch (e) {
        return null;
    }
}


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
    const QUIZ_ID = "socioeconomico";
    let selectedIndex = null;
    let confirmed = false;

  
    const saved = loadAnswer(QUIZ_ID, data.page);
    if (saved !== null) {
        selectedIndex = saved;
        confirmed = true;
        
        requestAnimationFrame(() => restoreConfirmedState(data, saved));
    }

    document.addEventListener("click", function (e) {
        const item = e.target.closest(".option-item");
        if (item && !confirmed) {
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
                    el.classList.add("correct");
                }
            });

            btnConfirm.textContent = "Respondido ✓";
            btnConfirm.style.background = "#16a34a";
            btnConfirm.disabled = true;
        });
    }
}

function shakeButton(btn) {
    btn.style.animation = "none";
    btn.offsetHeight;
    btn.style.animation = "shake 0.4s ease";
    setTimeout(() => (btn.style.animation = ""), 400);
}

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
        
        .feedback {
            display: none;
            margin-top: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #334155;
            line-height: 1.5;
        }

        
        .option-item.selected {
            background: #eef2ff;
            border: 2px solid #6366f1;
            transform: translateX(4px);
        }

        .option-item.selected .option-letter {
            background: #6366f1;
            color: white;
        }

        
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

       
        .option-item {
            transition: all 0.25s ease, border 0.2s ease;
            border: 2px solid transparent;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    const pageNum = detectCurrentPage();
    const data = quizData.find((q) => q.page === pageNum);
    if (!data) return;
    renderQuiz(data);
    initQuizInteraction(data);
});
