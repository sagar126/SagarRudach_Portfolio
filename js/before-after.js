/* =========================================
   BEFORE / AFTER PAGE

   Finds your photos by name and builds one
   comparison slider for each pair.

   Names it looks for (inside assets/images/before-after/):

       before_1.png    after_1.png
       before_2.png    after_2.png
       ...

   If your names are different, change the
   settings below. The header clock comes
   from js/main.js.
========================================= */

const BA_FOLDER = "Assets/images/before-after/";
const BA_BEFORE_PREFIX = "before_";
const BA_AFTER_PREFIX = "after_";

// File types it will try, in this order
const BA_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

// Highest photo number it will look for
const BA_MAX_NUMBER = 100;

// It stops after this many missing numbers in a row,
// so a gap like before_3 -> before_5 is fine.
const BA_GAPS_ALLOWED = 3;


const baGrid = document.getElementById("baGrid");
const baCount = document.getElementById("baCount");

const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Remembers the file type that worked last, to find the next ones faster
let baExtension = BA_EXTENSIONS[0];


function pad(number) {
    return String(number).padStart(2, "0");
}


/* =========================================
   FIND THE PHOTOS
========================================= */

function imageLoads(url) {

    return new Promise(resolve => {

        const probe = new Image();

        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = url;

    });

}

async function fileExists(url) {

    // On a website a tiny HEAD request is enough.
    // Opened straight from a folder (file://) the
    // browser can only test by loading the image.
    if (location.protocol === "http:" || location.protocol === "https:") {

        try {

            const response = await fetch(url, { method: "HEAD" });

            if (response.status === 404) {
                return false;
            }

            if (response.ok) {

                const type = response.headers.get("content-type");

                return !type || type.startsWith("image/");

            }

        }
        catch (error) {
            // fall through to the image test
        }

    }

    return imageLoads(url);

}

async function findPhoto(prefix, number) {

    const extensions = [
        baExtension,
        ...BA_EXTENSIONS.filter(extension => extension !== baExtension)
    ];

    for (const extension of extensions) {

        const url = `${BA_FOLDER}/${prefix}${number}.${extension}`;

        if (await fileExists(url)) {
            baExtension = extension;
            return url;
        }

    }

    return null;

}

async function findPairs() {

    const pairs = [];
    let misses = 0;

    for (
        let number = 1;
        number <= BA_MAX_NUMBER && misses < BA_GAPS_ALLOWED;
        number++
    ) {

        const [before, after] = await Promise.all([
            findPhoto(BA_BEFORE_PREFIX, number),
            findPhoto(BA_AFTER_PREFIX, number)
        ]);

        if (!before && !after) {
            misses++;
            continue;
        }

        misses = 0;

        pairs.push({ number, before, after });

    }

    return pairs;

}


/* =========================================
   BUILD A CARD
========================================= */

function photoTag(className, url, alt) {

    if (!url) {
        return "";
    }

    return `<img class="${className}" src="${url}" alt="${alt}" ` +
        `loading="lazy" decoding="async" draggable="false">`;

}

function markMissing(compare, path) {

    compare.classList.add("is-missing");

    const note = document.createElement("p");

    note.className = "ba-missing";
    note.textContent = `Missing: ${path}`;

    compare.appendChild(note);

}

function buildCard(pair, position) {

    const card = document.createElement("article");
    const label = `Still ${pad(pair.number)}`;

    card.className = "ba-card";

    card.innerHTML = `
        <div class="ba-compare">

            ${photoTag("ba-after", pair.after, `After - ${label}`)}
            ${photoTag("ba-before", pair.before, `Before - ${label}`)}

            <input class="ba-range" type="range" min="0" max="100" step="0.1"
                value="50" aria-label="Compare before and after, ${label}">

            <div class="ba-handle" aria-hidden="true"><span>&harr;</span></div>

            <span class="ba-tag ba-tag-before">Before</span>
            <span class="ba-tag ba-tag-after">After</span>

        </div>

        <div class="work-card-meta">
            <span>${pad(position)}</span>
            <span>${label}</span>
        </div>
    `;

    const compare = card.querySelector(".ba-compare");

    // A photo that is missing, or fails to load, gets a visible note
    // instead of a silent empty box.
    if (!pair.before) {
        markMissing(
            compare,
            `${BA_FOLDER}/${BA_BEFORE_PREFIX}${pair.number}.${BA_EXTENSIONS[0]}`
        );
    }

    if (!pair.after) {
        markMissing(
            compare,
            `${BA_FOLDER}/${BA_AFTER_PREFIX}${pair.number}.${BA_EXTENSIONS[0]}`
        );
    }

    card.querySelectorAll(".ba-compare img").forEach(image => {

        image.addEventListener("error", () => {
            markMissing(compare, image.getAttribute("src"));
        });

    });

    return card;

}


/* =========================================
   SET SLIDER POSITION (0 - 100)
   Updates the CSS variable that drives the
   clip, the handle and the label visibility.
========================================= */

function setPosition(card, value) {

    const compare = card.querySelector(".ba-compare");
    const range = card.querySelector(".ba-range");

    range.value = value;

    compare.style.setProperty("--ba-pos", value);

    // Hide a label when the slider is covering its side
    compare.classList.toggle("hide-before", value < 14);
    compare.classList.toggle("hide-after", value > 86);

}


/* =========================================
   INTRO SWEEP
   When a card scrolls into view the slider
   slides from "Before" to the middle once,
   so visitors see that it can be dragged.
========================================= */

function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function runSweep(card) {

    const FROM = 100;
    const TO = 50;
    const DELAY = 300;
    const DURATION = 1600;

    let start = null;

    function frame(now) {

        if (start === null) {
            start = now;
        }

        const t = Math.min(
            1,
            Math.max(0, (now - start - DELAY) / DURATION)
        );

        setPosition(card, FROM + (TO - FROM) * easeOutExpo(t));

        card.sweepFrame = t < 1
            ? requestAnimationFrame(frame)
            : null;

    }

    card.sweepFrame = requestAnimationFrame(frame);

}

function stopSweep(card) {

    if (card.sweepFrame) {
        cancelAnimationFrame(card.sweepFrame);
        card.sweepFrame = null;
    }

}


/* =========================================
   DRAGGING + KEYBOARD
========================================= */

function setupCard(card) {

    const compare = card.querySelector(".ba-compare");
    const range = card.querySelector(".ba-range");

    // Mouse / touch / native keyboard
    range.addEventListener("input", () => {

        stopSweep(card);
        setPosition(card, Number(range.value));

    });

    // Arrow keys move in bigger steps than the 0.1 step
    // used for smooth dragging.
    range.addEventListener("keydown", event => {

        const amount = event.shiftKey ? 10 : 2;
        let value = Number(range.value);

        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            value -= amount;
        }
        else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            value += amount;
        }
        else if (event.key === "Home") {
            value = 0;
        }
        else if (event.key === "End") {
            value = 100;
        }
        else {
            return;
        }

        event.preventDefault();

        stopSweep(card);
        setPosition(card, Math.min(100, Math.max(0, value)));

    });

    // "is-live" styles the handle while it is being held
    compare.addEventListener("pointerdown", () => {

        stopSweep(card);
        compare.classList.add("is-live");

    });

}

function releaseHandles() {

    document
        .querySelectorAll(".ba-compare.is-live")
        .forEach(compare => compare.classList.remove("is-live"));

}

window.addEventListener("pointerup", releaseHandles);
window.addEventListener("pointercancel", releaseHandles);


/* =========================================
   SCROLL REVEAL
========================================= */

const baObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) {
                return;
            }

            const card = entry.target;

            baObserver.unobserve(card);

            if (!reduceMotion && !card.querySelector(".is-missing")) {
                // Start fully on "Before" while the card is still invisible
                setPosition(card, 100);
                runSweep(card);
            }

            card.classList.add("in-view");

        });

    },

    { threshold: 0.2 }

);


/* =========================================
   START
========================================= */

async function startBeforeAfter() {

    baGrid.setAttribute("aria-busy", "true");

    const pairs = await findPairs();

    baGrid.innerHTML = "";

    if (!pairs.length) {

        baGrid.innerHTML = `
            <p class="ba-empty">
                No photos found.<br>
                Put ${BA_BEFORE_PREFIX}1.png and ${BA_AFTER_PREFIX}1.png
                (then 2, 3 ...) in the ${BA_FOLDER} folder.
            </p>
        `;

    }

    pairs.forEach((pair, index) => {

        const card = buildCard(pair, index + 1);

        baGrid.appendChild(card);

        setupCard(card);
        baObserver.observe(card);

    });

    if (baCount) {
        baCount.textContent = pad(pairs.length);
    }

    baGrid.removeAttribute("aria-busy");

}

startBeforeAfter();
