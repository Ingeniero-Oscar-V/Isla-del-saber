const DEFAULT_QUESTIONS = [
    { cat: "Información general", q: "¿Cuál es la capital de Jamaica?", a: "kingston" },
    { cat: "Información general", q: "¿Cuál es el idioma oficial de Jamaica?", a: "inglés" },
    { cat: "Información general", q: "¿En qué mar está ubicada Jamaica?", a: "caribe" },
    { cat: "Información general", q: "¿Qué tipo de clima tiene Jamaica?", a: "tropical" },
    { cat: "Información general", q: "¿Bob Marley popularizó el reggae, el jazz o el blues? (trampa)", a: "reggae" },
    { cat: "Tradición", q: "¿Cómo se llama el pollo típico jamaicano con especias picantes?", a: "jerk chicken" },
    { cat: "Tradición", q: "¿Qué tres cosas son fundamentales en la vida diaria jamaicana?", a: "música, baile y familia" },
    { cat: "Tradición", q: "El Jerk Chicken, ¿es dulce o picante? (trampa: suena sofisticado)", a: "picante" },
    { cat: "Tradición", q: "¿Las reuniones familiares en Jamaica son parte de la tradición? Sí o No", a: "sí" },
    { cat: "Festival", q: "¿En qué ciudad se celebra el carnaval de Jamaica?", a: "kingston" },
    { cat: "Festival", q: "¿Entre qué meses se celebra el carnaval jamaicano?", a: "marzo y abril" },
    { cat: "Festival", q: "¿Qué género musical NO suena en el carnaval: Soca, Dancehall, Reggae o Salsa? (trampa)", a: "salsa" },
    { cat: "Festival", q: "¿De qué se llenan las calles durante el carnaval de Jamaica?", a: "disfraces y música" },
    { cat: "Comida y lugar famoso", q: "¿Cuál es la comida típica más popular de Jamaica?", a: "jerk chicken" },
    { cat: "Comida y lugar famoso", q: "¿Cómo se llama la famosa cascada turística de Jamaica?", a: "dunn's river falls" },
    { cat: "Comida y lugar famoso", q: "En Dunn's River Falls, ¿los visitantes pueden subir o solo mirar? (acertijo)", a: "subir" },
    { cat: "Comida y lugar famoso", q: "¿El Jerk Chicken es una bebida, una sopa o una carne? (trampa)", a: "carne" },
    { cat: "Dato curioso", q: "¿En qué década nacieron los Sound Systems en Jamaica?", a: "los 50" },
    { cat: "Dato curioso", q: "¿En qué barrios de Kingston surgieron los Sound Systems?", a: "barrios pobres" },
    { cat: "Dato curioso", q: "¿Qué género musical de EE.UU. fue inspirado por los Sound Systems jamaicanos?", a: "hip-hop" },
    { cat: "Dato curioso", q: "Los DJs jamaicanos usaban camiones con generadores, ¿para qué? (acertijo)", a: "fiestas callejeras" },
];


/* ──────────────────────────────────────────
   2. DATOS: Categorías (orden del carrusel)
   ────────────────────────────────────────── */

const CATEGORIES = [
    { name: "Información general", color: "#e3f2fd", border: "#90caf9", text: "#1a4a7a", icon: "🌍" },
    { name: "Tradición", color: "#e8f5e9", border: "#a5d6a7", text: "#2e6b3e", icon: "🥁" },
    { name: "Festival", color: "#fce4ec", border: "#f48fb1", text: "#7a1a3a", icon: "🎉" },
    { name: "Comida y lugar famoso", color: "#fff8e1", border: "#ffe082", text: "#7a5c00", icon: "🍽️" },
    { name: "Dato curioso", color: "#ede7f6", border: "#b39ddb", text: "#4a2a7a", icon: "🌟" },
    { name: "Otras", color: "#f0f0f0", border: "#1a1a1a", text: "#1a1a1a", icon: "❓" }
];

/* ──────────────────────────────────────────
   3. ESTADO de la aplicación
   ────────────────────────────────────────── */

let extraQuestions = [];   // Preguntas agregadas dinámicamente
let currentCatIndex = 0;    // Índice de la categoría central
let spinning = false; // ¿Está girando el carrusel?
let correctCount = 0;    // Respuestas correctas
let totalCount = 0;    // Total de preguntas respondidas
let currentQuestion = null; // Pregunta activa en el modal


/* ──────────────────────────────────────────
   4. REFERENCIAS al DOM
   ────────────────────────────────────────── */

const track = document.getElementById('carousel-track');
const spinBtn = document.getElementById('spin-btn');
const questionOverlay = document.getElementById('question-overlay');
const configOverlay = document.getElementById('config-overlay');
const answerInput = document.getElementById('answer-input');
const answerResult = document.getElementById('answer-result');
const modalCatBadge = document.getElementById('modal-cat-badge');
const modalQuestion = document.getElementById('modal-question');
const scoreCorrect = document.getElementById('score-correct');
const scoreTotal = document.getElementById('score-total');
const cfgCat = document.getElementById('cfg-cat');
const cfgQ = document.getElementById('cfg-q');
const cfgA = document.getElementById('cfg-a');
const configMsg = document.getElementById('config-msg');

const N = CATEGORIES.length; // Total de categorías


/* ──────────────────────────────────────────
   5. HELPERS
   ────────────────────────────────────────── */

/**
 * Devuelve todas las preguntas (predeterminadas + extras) de una categoría.
 * @param {string} catName - Nombre de la categoría
 * @returns {Array}
 */
function getQuestionsForCat(catName) {
    return [...DEFAULT_QUESTIONS, ...extraQuestions].filter(q => q.cat === catName);
}

/**
 * Selecciona un elemento aleatorio de un arreglo.
 * @param {Array} arr
 * @returns {*}
 */
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Normaliza texto: minúsculas y sin tildes para comparar respuestas.
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Verifica si la respuesta del usuario es correcta (tolerante a tildes).
 * @param {string} userAns
 * @param {string} correctAns
 * @returns {boolean}
 */
function isCorrect(userAns, correctAns) {
    const u = normalize(userAns);
    const c = normalize(correctAns);
    return u === c || c.includes(u) || u.includes(c);
}


/* ──────────────────────────────────────────
   6. CARRUSEL
   ────────────────────────────────────────── */

/**
 * Renderiza las 5 cartas visibles del carrusel
 * centradas en `currentCatIndex`.
 */
function renderCarousel() {
  track.innerHTML = '';
 
  const offsets = [-2, -1, 0, 1, 2];
 
  offsets.forEach(offset => {
    const idx = ((currentCatIndex + offset) % N + N) % N;
    const cat = CATEGORIES[idx];
 
    const card = document.createElement('div');
 
    if (offset === 0) {
      card.className = 'card center';
    } else if (Math.abs(offset) === 1) {
      card.className = 'card side-near';
    } else {
      card.className = 'card side-far';
    }
 
    card.style.background  = cat.color;
    card.style.borderColor = cat.border;
 
    card.innerHTML = `
      <div class="card-icon">${cat.icon}</div>
      <div class="card-label" style="color:${cat.text}">${cat.name}</div>
    `;
 
    track.appendChild(card);
  });
}

/**
 * Anima el giro del carrusel de forma recursiva,
 * con deceleración progresiva al acercarse al destino.
 *
 * @param {number} targetIdx  - Índice de categoría final
 * @param {number} steps      - Pasos restantes
 * @param {number} delay      - Delay actual en ms (va aumentando)
 * @param {Function} done     - Callback al terminar
 */
function animateSpin(targetIdx, steps, delay, done) {
    if (steps <= 0) {
        currentCatIndex = targetIdx;
        renderCarousel();
        done();
        return;
    }

    currentCatIndex = (currentCatIndex + 1) % N;
    renderCarousel();

    const nextDelay = Math.min(delay + 18, 200);

    setTimeout(() => animateSpin(targetIdx, steps - 1, nextDelay, done), delay);
}


/* ──────────────────────────────────────────
   7. LÓGICA DEL JUEGO
   ────────────────────────────────────────── */

/**
 * Abre el modal de pregunta para la categoría en el índice dado.
 * @param {number} catIdx
 */
function openQuestion(catIdx) {
    const cat = CATEGORIES[catIdx];
    const pool = getQuestionsForCat(cat.name);

    if (!pool.length) return;

    currentQuestion = randomFrom(pool);

    /* Configurar el badge de categoría */
    modalCatBadge.textContent = `${cat.icon} ${cat.name}`;
    modalCatBadge.style.background = cat.color;
    modalCatBadge.style.borderColor = cat.border;
    modalCatBadge.style.color = cat.text;

    /* Mostrar pregunta */
    modalQuestion.textContent = currentQuestion.q;

    /* Resetear estado del modal */
    answerInput.value = '';
    answerResult.style.display = 'none';
    answerResult.className = '';

    /* Abrir overlay */
    questionOverlay.classList.add('open');
    setTimeout(() => answerInput.focus(), 120);
}

/**
 * Verifica la respuesta ingresada por el usuario.
 */
function checkAnswer() {
    if (!currentQuestion) return;

    const userAns = answerInput.value.trim();
    if (!userAns) return;

    totalCount++;
    const correct = isCorrect(userAns, currentQuestion.a);

    if (correct) {
        correctCount++;
        answerResult.textContent = `✓ ¡Correcto! La respuesta es: ${currentQuestion.a}`;
        answerResult.className = 'result-correct';
    } else {
        answerResult.textContent = `✗ Incorrecto. La respuesta correcta era: ${currentQuestion.a}`;
        answerResult.className = 'result-wrong';
    }

    answerResult.style.display = 'block';
    scoreCorrect.textContent = correctCount;
    scoreTotal.textContent = totalCount;
}


/* ──────────────────────────────────────────
   8. EVENTOS
   ────────────────────────────────────────── */

/* Botón GIRAR */
spinBtn.addEventListener('click', () => {
    if (spinning) return;

    spinning = true;
    spinBtn.disabled = true;

    const target = Math.floor(Math.random() * N);

    /* Calcular pasos totales para dar al menos 3 vueltas completas */
    const diff = ((target - currentCatIndex) % N + N) % N;
    const steps = N * 3 + diff;

    animateSpin(target, steps, 55, () => {
        spinning = false;
        spinBtn.disabled = false;
        openQuestion(currentCatIndex);
    });
});

/* Verificar respuesta */
document.getElementById('check-btn').addEventListener('click', checkAnswer);

/* Enter en el campo de respuesta */
answerInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAnswer();
});

/* Cerrar modal de pregunta */
document.getElementById('q-close').addEventListener('click', () => {
    questionOverlay.classList.remove('open');
});

/* Abrir modal de configuración */
document.getElementById('gear-btn').addEventListener('click', () => {
    /* Poblar el select de categorías */
    cfgCat.innerHTML = CATEGORIES
        .map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`)
        .join('');

    /* Resetear formulario */
    cfgQ.value = '';
    cfgA.value = '';
    configMsg.style.display = 'none';

    configOverlay.classList.add('open');
});

/* Cerrar modal de configuración */
document.getElementById('cfg-close').addEventListener('click', () => {
    configOverlay.classList.remove('open');
});

/* Guardar nueva pregunta */
document.getElementById('cfg-save').addEventListener('click', () => {
    const cat = cfgCat.value.trim();
    const q = cfgQ.value.trim();
    const a = cfgA.value.trim();

    if (!q || !a) {
        cfgQ.focus();
        return;
    }

    extraQuestions.push({ cat, q, a });

    /* Resetear campos */
    cfgQ.value = '';
    cfgA.value = '';

    /* Mensaje de confirmación */
    configMsg.style.display = 'block';
    setTimeout(() => { configMsg.style.display = 'none'; }, 2800);
});

/* Cerrar cualquier overlay al hacer clic fuera del modal */
document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) {
            overlay.classList.remove('open');
        }
    });
});

renderCarousel();
