/* ==========================================================
   js/main.js — Sagar Rudach Portfolio
   ==========================================================
   Handles:
     1. Hero intro animation (letter scatter → reveal)
     2. Project archive slider (open / close / expand)
     3. Project detail view (click a project → modal)
     4. Live clock
   The shared header itself (and its active link) comes from js/header.js.
   ========================================================== */


document.addEventListener("DOMContentLoaded", () => {


    /* ---------------------------------------------------------
       1. HERO INTRO ANIMATION
    --------------------------------------------------------- */

    const hero = document.querySelector(".hero");

    if (hero) {

        const letters = hero.querySelectorAll(".letter");

        // Give each letter a random starting offset
        letters.forEach(letter => {

            const x = (Math.random() - 0.5) * 600;
            const y = (Math.random() - 0.5) * 400;
            const rotation = (Math.random() - 0.5) * 60;

            letter.style.setProperty("--x", x + "px");
            letter.style.setProperty("--y", y + "px");
            letter.style.setProperty("--rotation", rotation + "deg");
        });

        // Trigger the reveal after a short pause
        requestAnimationFrame(() => {
            setTimeout(() => {
                hero.classList.add("reveal");
            }, 100);
        });
    }


    /* ---------------------------------------------------------
       2. PROJECT POSITIONS (scatter around the hero)
    --------------------------------------------------------- */

    const projectButtons = document.querySelectorAll(".hero .project");

    // Desktop: scattered around the name
    const positions = [
        { top: "8%",  left: "5%" },
        { top: "12%", left: "75%" },
        { top: "55%", left: "3%" },
        { top: "60%", left: "80%" },
        { top: "30%", left: "85%" },
        { top: "75%", left: "40%" }
    ];

    // Tablet (<= 900px): a loose row above and below the name,
    // clear of the archive tab on the right
    const positionsTablet = [
        { top: "11%", left: "6%" },
        { top: "14%", left: "40%" },
        { top: "10%", left: "73%" },
        { top: "56%", left: "5%" },
        { top: "59%", left: "39%" },
        { top: "55%", left: "73%" }
    ];

    // Phone (<= 600px)
    const positionsPhone = [
        { top: "11%", left: "4%" },
        { top: "14%", left: "37%" },
        { top: "10%", left: "70%" },
        { top: "55%", left: "4%" },
        { top: "58%", left: "37%" },
        { top: "54%", left: "70%" }
    ];

    const tabletQuery = window.matchMedia("(max-width: 900px)");
    const phoneQuery  = window.matchMedia("(max-width: 600px)");

    function placeProjects() {

        const set = phoneQuery.matches ? positionsPhone
                  : tabletQuery.matches ? positionsTablet
                  : positions;

        projectButtons.forEach((btn, i) => {

            if (set[i]) {
                btn.style.top  = set[i].top;
                btn.style.left = set[i].left;
            }
        });
    }

    placeProjects();
    tabletQuery.addEventListener("change", placeProjects);
    phoneQuery.addEventListener("change", placeProjects);


    /* ---------------------------------------------------------
       3. PROJECT ARCHIVE SLIDER
    --------------------------------------------------------- */

    const archiveArrow = document.getElementById("archiveArrow");
    const projectArchive = document.getElementById("projectArchive");

    if (archiveArrow && projectArchive) {

        let archiveOpen = false;
        let archiveExpanded = false;

        // Folders: earlier ones sit on top, and the tabs step down the
        // edge (repeating every 6), so any number of projects works
        const archiveFolders = document.getElementById("archiveFolders");

        if (archiveFolders) {

            const folders = archiveFolders.querySelectorAll(".archive-project");

            folders.forEach((folder, i) => {
                folder.style.zIndex = String(folders.length - i + 1);
                folder.style.setProperty("--tab", String(i % 6));
            });

            // A normal (vertical) mouse wheel scrolls the folders sideways
            archiveFolders.addEventListener("wheel", (e) => {

                if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
                if (archiveFolders.scrollWidth <= archiveFolders.clientWidth) return;

                e.preventDefault();
                archiveFolders.scrollLeft += e.deltaY;

            }, { passive: false });
        }

        // The whole cover (title, info and arrow) opens / closes the archive
        const archiveCover =
            projectArchive.querySelector(".archive-cover") || archiveArrow;

        archiveCover.addEventListener("click", () => {

            if (!archiveOpen) {

                // STEP 1 — Slide the archive into view
                document.body.classList.add("archive-open");
                archiveOpen = true;

                // After the slide-in completes, fan out the folders
                setTimeout(() => {
                    document.body.classList.add("archive-expanded");
                    archiveExpanded = true;
                }, 600);

            } else {

                // Close: reverse the process
                document.body.classList.remove("archive-expanded");
                archiveExpanded = false;

                setTimeout(() => {
                    document.body.classList.remove("archive-open");
                    archiveOpen = false;
                }, 400);
            }
        });

        // Close archive when clicking outside of it
        document.addEventListener("click", (e) => {

            if (archiveOpen &&
                !projectArchive.contains(e.target)) {

                document.body.classList.remove("archive-expanded");
                archiveExpanded = false;

                setTimeout(() => {
                    document.body.classList.remove("archive-open");
                    archiveOpen = false;
                }, 400);
            }
        });
    }


    /* ---------------------------------------------------------
       4. PROJECT DETAIL VIEW
    --------------------------------------------------------- */

    const projectView    = document.getElementById("projectView");
    const projectContent = document.getElementById("projectContent");
    const closeProject   = document.getElementById("closeProject");
    const projectBackdrop = document.getElementById("projectBackdrop");

    // Data for each project (index matches data-project attribute)
    const projectData = [
        {
            number: "PROJECT 01",
            title: "Social Campaign",
            description:
                "Recreation of the SUPERYOU brand's new product launch " +
                "campaign for social media carousel design. The task involved " +
                "creating a visually appealing and engaging design that " +
                "effectively communicates the brand's visual language.",
            image: "assets/images/projects/project-01/POST_1_1.png",
            // Optional: full project page ("View project" link in the modal)
            link: "project-01.html"
        },
        {
            number: "PROJECT 02",
            title: "Dynamic Story",
            description:
                "A dynamic Instagram story crafted to engage audiences " +
                "with bold visuals and smooth motion transitions.",
            image: "assets/images/projects/project-02/Post_2.png"
        },
        {
            number: "PROJECT 03",
            title: "Furniture Campaign",
            description:
                "A premium social-media visual direction for a contemporary " +
                "furniture brand, blending art direction with retouching.",
            image: "assets/images/before-after/after_3.png"
        },
        {
            number: "PROJECT 04",
            title: "Motion Graphics",
            description:
                "Recreation of a motion graphics reel, with a focus on " +
                "visual design, editing and self-evident proposition.",
            image: "assets/images/before-after/after_4.png"
        },
        {
            number: "PROJECT 05",
            title: "Brand Story",
            description:
                "A compelling brand story told through film and visual " +
                "storytelling, capturing the essence of the brand.",
            image: "assets/images/before-after/after_5.png"
        },
        {
            number: "PROJECT 06",
            title: "Visual Storytelling",
            description:
                "A visual storytelling project that combines photography, " +
                "design and narrative to create an impactful experience.",
            image: "assets/images/before-after/after_6.png"
        }
    ];


    // Open project on click (works for both hero buttons and archive buttons)
    document.querySelectorAll("[data-project]").forEach(btn => {

        btn.addEventListener("click", (e) => {

            // Don't open project if clicking the archive arrow
            if (btn.id === "archiveArrow") return;

            const index = parseInt(btn.dataset.project, 10);
            const data  = projectData[index];

            if (!data || !projectView) return;

            // Populate the detail view
            const numberEl = document.getElementById("projectNumber");
            const titleEl  = document.getElementById("projectTitle");
            const descEl   = document.getElementById("projectDescription");
            const imageEl  = document.getElementById("projectImage");

            if (numberEl) numberEl.textContent = data.number;
            if (titleEl)  titleEl.textContent  = data.title;
            if (descEl)   descEl.textContent   = data.description;

            const linkEl = document.getElementById("projectLink");

            if (linkEl) {
                linkEl.hidden = !data.link;
                if (data.link) linkEl.href = data.link;
            }

            if (imageEl) {
                imageEl.innerHTML =
                    `<img src="${data.image}"
                          alt="${data.title}"
                          style="width:100%; height:100%;
                                 object-fit:cover; display:block;">`;
            }

            // Calculate the origin point for the expand animation
            const rect = btn.getBoundingClientRect();
            const vw   = window.innerWidth;
            const vh   = window.innerHeight;

            const startX = rect.left + rect.width / 2  - vw / 2;
            const startY = rect.top  + rect.height / 2 - vh / 2;
            const startScale = Math.max(
                rect.width / (vw * 0.8),
                rect.height / (vh * 0.8)
            );

            if (projectContent) {
                projectContent.style.setProperty("--start-x", startX + "px");
                projectContent.style.setProperty("--start-y", startY + "px");
                projectContent.style.setProperty("--start-scale", startScale);
            }

            // Show the overlay
            projectView.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });


    // Close project
    function closeProjectView() {

        if (!projectView) return;

        projectView.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (closeProject) {
        closeProject.addEventListener("click", closeProjectView);
    }

    if (projectBackdrop) {
        projectBackdrop.addEventListener("click", closeProjectView);
    }

    // ESC to close
    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") closeProjectView();
    });


    /* ---------------------------------------------------------
       5. LIVE CLOCK
    --------------------------------------------------------- */

    const clockEl = document.getElementById("clock");

    function updateClock() {

        if (!clockEl) return;

        const now = new Date();

        // Format for IST (Gujarat, India is UTC+5:30)
        const options = {
            hour:   "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        };

        clockEl.textContent =
            now.toLocaleTimeString("en-US", options);
    }

    updateClock();
    setInterval(updateClock, 1000);

    // The active nav link is set by js/header.js


});
