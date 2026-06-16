const DEFAULT_QUESTIONS = [
    { cat: "General Information", q: "What is the capital of Jamaica?", a: "kingston" },
    
    { cat: "General Information", q: "What is the official language of Jamaica?", a: "English" },
    
    { cat: "General Information", q: "In which sea is Jamaica located?", a: "Caribbean" },
    
    { cat: "General Information", q: "What type of climate does Jamaica have?", a: "tropical" },
    
    { cat: "General Information", q: "Did Bob Marley popularize reggae, jazz, or blues? (trick question)", a: "reggae" },
    
    { cat: "Tradition", q: "What is the name of the typical Jamaican chicken with hot spices?", a: "jerk chicken" },
    
    { cat: "Tradition", q: "What three things are fundamental in daily Jamaican life?", a: "music, dance, and family" },
    
    { cat: "Tradition", q: "Is Jerk Chicken sweet or spicy? (trap: sounds sophisticated)", a: "spicy" },
    
    { cat: "Tradition", q: "Are family gatherings in Jamaica part of the tradition? Yes or No", a: "yes" },
    
    { cat: "Festival", q: "In which city is Jamaican Carnival celebrated?", a: "kingston" },
    
    { cat: "Festival", q: "Between which months is Jamaican Carnival celebrated?", a: "March and April" },
    
    { cat: "Festival", q: "Which musical genre is NOT played at Carnival: Soca, Dancehall, Reggae, or Salsa? (trap)", a: "salsa" },
    
    { cat: "Festival", q: "What fills the streets during Jamaican Carnival?", a: "costumes and music" },
    
    { cat: "Food and famous place", q: "What is the most popular traditional food in Jamaica?", a: "jerk chicken" },
    
    { cat: "Food and famous place", q: "What is the name of the famous tourist waterfall in Jamaica?", a: "Dunn's River Falls" },
    
    { cat: "Food and famous place", q: "At Dunn's River Falls, can visitors climb or just look? (riddle)", a: "climb" },
    
    { cat: "Food and famous place", q: "Is Jerk Chicken a drink, a soup, or a meat? (trick)", a: "meat" },
    
    { cat: "Fun fact", q: "In what decade did Sound Systems originate in Jamaica?", a: "the 1950s" },
    
    { cat: "Fun fact", q: "In which neighborhoods of Kingston did Sound Systems emerge?", a: "slums" },
    
    { cat: "Fun fact", q: "Which US musical genre was inspired by Jamaican Sound Systems?", a: "hip-hop" },
    
    { cat: "Fun Fact", q: "Jamaican DJs used trucks with generators, what for? (riddle)", a: "street parties" },
    
    { cat: "Cultural Challenge", q: "Simulate a short dance inspired by a Jamaican festival, as if you were in the streets of Kingston with reggae or dancehall music. You have 10 seconds!", a: "challenge completed" },
    
    { cat: "Quick Challenge", q: "Say out loud 3 things you remember about Jamaica (they can be food, music, places or customs). You only have 10 seconds!", a: "challenge completed" }
];


/* ──────────────────────────────────────────
   2. DATOS: Categorías (orden del carrusel)
   ────────────────────────────────────────── */

const CATEGORIES = [
    { name: "General Information", color: "#e3f2fd", border: "#90caf9", text: "#1a4a7a", icon: "🌍" },
    { name: "Tradition", color: "#e8f5e9", border: "#a5d6a7", text: "#2e6b3e", icon: "🥁" },
    { name: "Festival", color: "#fce4ec", border: "#f48fb1", text: "#7a1a3a", icon: "🎉" },
    { name: "Famous food and place", color: "#fff8e1", border: "#ffe082", text: "#7a5c00", icon: "🍽️" },
    { name: "Interesting fact", color: "#ede7f6", border: "#b39ddb", text: "#4a2a7a", icon: "🌟" },
    { name: "Quick challenges", color: "#fff0f0", border: "#cc2200", text: "#8a0000", icon: "⚔️" },
    { name: "Other", color: "#f0f0f0", border: "#1a1a1a", text: "#1a1a1a", icon: "❓" }
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
