/* ==========================================================
   js/info.js — Info page portrait
   ==========================================================
   The eyes follow the cursor, and look at a role when it is
   hovered (or tapped). Two modes:

     Photo mode   assets/images/info/portrait.jpg exists, plus
                  one eye image per direction in
                  assets/images/info/eyes/ (see DIRECTIONS).
                  The eye images cross-fade as the gaze moves.

     Drawn mode   fallback when the photo is missing: two drawn
                  eyes whose pupils track smoothly and blink.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const portrait = document.getElementById("portrait");
    if (!portrait) return;

    const INFO_FOLDER = "assets/images/info";

    // Direction name -> unit vector (x right, y down)
    const DIRECTIONS = {
        "center":      [ 0,     0    ],
        "up":          [ 0,    -1    ],
        "down":        [ 0,     1    ],
        "left":        [-1,     0    ],
        "right":       [ 1,     0    ],
        "upper-left":  [-0.71, -0.71 ],
        "upper-right": [ 0.71, -0.71 ],
        "lower-left":  [-0.71,  0.71 ],
        "lower-right": [ 0.71,  0.71 ]
    };

    const roles = document.querySelectorAll(".role[data-gaze]");
    const pupils = portrait.querySelectorAll(".pupil");
    const eyesA = document.getElementById("eyesA");
    const eyesB = document.getElementById("eyesB");
    const base  = document.getElementById("portraitBase");

    let photoMode = false;
    let lockedGaze = null;      // set while a role is hovered / tapped
    let currentDirection = "center";


    /* ---------------------------------------------------------
       MODE DETECTION
    --------------------------------------------------------- */

    function loads(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    Promise.all([
        loads(`${INFO_FOLDER}/portrait.jpg`),
        loads(`${INFO_FOLDER}/eyes/center.png`)
    ]).then(([hasPortrait, hasEyes]) => {

        if (!hasPortrait || !hasEyes) return;  // stay in drawn mode

        photoMode = true;
        base.src  = `${INFO_FOLDER}/portrait.jpg`;
        eyesA.src = eyesB.src = `${INFO_FOLDER}/eyes/center.png`;
        portrait.classList.add("is-photo");

        // Preload the other directions so swaps are instant
        Object.keys(DIRECTIONS).forEach(name => loads(`${INFO_FOLDER}/eyes/${name}.png`));
    });


    /* ---------------------------------------------------------
       LOOK
    --------------------------------------------------------- */

    // Drawn mode: move the pupils along a vector (-1..1)
    function lookVector(x, y) {
        pupils.forEach(pupil => {
            pupil.style.transform =
                `translate(calc(-50% + ${x * 34}%), calc(-50% + ${y * 34}%))`;
        });
    }

    // Photo mode: cross-fade to the eye image for a direction
    let showingA = true;

    function lookDirection(name) {

        if (name === currentDirection) return;
        currentDirection = name;

        const incoming = showingA ? eyesB : eyesA;
        const outgoing = showingA ? eyesA : eyesB;

        incoming.src = `${INFO_FOLDER}/eyes/${name}.png`;
        incoming.classList.add("eyes-visible");
        outgoing.classList.remove("eyes-visible");
        showingA = !showingA;
    }

    function look(x, y, name) {
        if (photoMode) lookDirection(name);
        else lookVector(x, y);
    }

    // Nearest of the 8 directions (or center) for a vector
    function directionFor(x, y) {

        if (Math.hypot(x, y) < 0.35) return "center";

        const angle = Math.atan2(y, x) * 180 / Math.PI;   // 0 = right, 90 = down
        const names = ["right", "lower-right", "down", "lower-left",
                       "left", "upper-left", "up", "upper-right"];

        return names[Math.round(((angle + 360) % 360) / 45) % 8];
    }


    /* ---------------------------------------------------------
       FOLLOW THE CURSOR
    --------------------------------------------------------- */

    window.addEventListener("pointermove", (e) => {

        if (lockedGaze || e.pointerType === "touch") return;

        const rect = portrait.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.42;   // eye line

        // Full deflection about one portrait-width away
        const reach = rect.width;
        let x = (e.clientX - cx) / reach;
        let y = (e.clientY - cy) / reach;

        const length = Math.hypot(x, y);
        if (length > 1) { x /= length; y /= length; }

        look(x, y, directionFor(x, y));
    });

    document.addEventListener("pointerleave", () => {
        if (!lockedGaze) look(0, 0, "center");
    });


    /* ---------------------------------------------------------
       LOOK AT A ROLE
    --------------------------------------------------------- */

    function lockOn(role) {
        lockedGaze = role.dataset.gaze;
        const [x, y] = DIRECTIONS[lockedGaze] || [0, 0];
        roles.forEach(r => r.classList.toggle("is-looked-at", r === role));
        portrait.classList.add("is-focused");
        look(x, y, lockedGaze);
    }

    function release() {
        lockedGaze = null;
        roles.forEach(r => r.classList.remove("is-looked-at"));
        portrait.classList.remove("is-focused");
    }

    roles.forEach(role => {

        role.addEventListener("pointerenter", (e) => {
            if (e.pointerType !== "touch") lockOn(role);
        });

        role.addEventListener("pointerleave", (e) => {
            if (e.pointerType !== "touch") release();
        });

        // Touch: tap a role to make the eyes look at it
        role.addEventListener("click", () => {
            if (lockedGaze === role.dataset.gaze) {
                release();
                look(0, 0, "center");
            } else {
                lockOn(role);
            }
        });
    });


    /* ---------------------------------------------------------
       BLINK (drawn mode)
    --------------------------------------------------------- */

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function scheduleBlink() {
        setTimeout(() => {
            if (!photoMode && !document.hidden) {
                portrait.classList.add("is-blinking");
                setTimeout(() => portrait.classList.remove("is-blinking"), 160);
            }
            scheduleBlink();
        }, 2500 + Math.random() * 3500);
    }

    if (!reduceMotion) scheduleBlink();

});
