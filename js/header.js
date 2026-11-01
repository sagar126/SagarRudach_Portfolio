/* ==========================================================
   js/header.js — shared site header
   ==========================================================
   Edit the header HERE, once. Every page includes it as the
   first thing inside <body>:

       <script src="js/header.js"></script>

   The header is written in place while the page loads, so
   there is no flash. The current page's nav link is marked
   active automatically (by file name). For pages that should
   highlight a different link (e.g. a project page under
   Works), add data-active:

       <script src="js/header.js" data-active="works"></script>

   The live clock is started by js/main.js.
   ========================================================== */

(function () {

    const HEADER = `
    <header class="site-header">

        <!-- LEFT -->
        <a class="header-name" href="index.html" aria-label="Sagar Rudach — home">
            Sagar Rudach
        </a>

        <!-- CENTER -->
        <nav class="header-nav" id="siteNav">
            <a href="index.html" data-page="index">Index</a>
            <a href="contact.html" data-page="contact">Contact</a>
            <a href="works.html" data-page="works">Works</a>
            <a href="before-after.html" data-page="before-after">ColorGrading</a>
            <a href="info.html" data-page="info">Info</a>
        </nav>

        <!-- RIGHT -->
        <div class="header-right">

            <div class="header-location">
                <span id="clock">08:32 PM</span>
                <span>Gujarat, India</span>
            </div>

            <!-- Mobile menu toggle (hidden on wide screens) -->
            <button class="header-menu" type="button"
                aria-label="Open menu" aria-expanded="false" aria-controls="siteNav">
                <span></span>
                <span></span>
            </button>
        </div>
    </header>`;

    const script = document.currentScript;

    script.insertAdjacentHTML("beforebegin", HEADER);

    // Active nav link
    const file = window.location.pathname.split("/").pop() || "index.html";
    const page = script.dataset.active || file.replace(/\.html$/, "");

    document
        .querySelectorAll(`.site-header .header-nav a[data-page="${page}"]`)
        .forEach(link => link.classList.add("active"));


    // Mobile menu: the nav becomes a full-screen overlay below 900px
    const menuButton = document.querySelector(".site-header .header-menu");

    function setMenu(open) {
        document.body.classList.toggle("menu-open", open);
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    menuButton.addEventListener("click", () => {
        setMenu(!document.body.classList.contains("menu-open"));
    });

    document.querySelectorAll(".site-header .header-nav a").forEach(link => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenu(false);
    });

    // Close it if the screen is widened past the breakpoint
    window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
        if (e.matches) setMenu(false);
    });

})();
