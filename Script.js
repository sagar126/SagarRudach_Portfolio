const projects =
    document.querySelectorAll(".project");


function scatterProjects() {

    const name = document.querySelector(".name");
    const subtitle = document.querySelector(".subtitle");
    const header = document.querySelector(".site-header")
    const aboutme = document.querySelector(".about-me");
    const nameRect = name.getBoundingClientRect();
    const subtitleRect = subtitle.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const aboutmeRect = aboutme.getBoundingClientRect();
    const placed = [];

    /* =========================================
       SAFE ZONE SETTINGS
    ========================================= */

    const NAME_GAP = 50;

    // Space below header
    const HEADER_GAP = 50;

    // Space above subtitle
    const SUBTITLE_GAP = 50;

    // Keep projects away from bottom edge
    const BOTTOM_GAP = 35;

    // Keep projects away from screen edges
    const SIDE_GAP = 250;

    // Keep projects away from aboutme
    const ABOUTME_GAP = 180;


    const MAX_OVERLAP = 0.20;
    const MAX_ATTEMPTS = 150;


    projectButtons.forEach(project => {

        const width = project.offsetWidth;
        const height = project.offsetHeight;

        let position = null;


        for (
            let attempt = 0;
            attempt < MAX_ATTEMPTS;
            attempt++
        ) {

            /* =========================================
               RANDOM POSITION
            ========================================= */

            const minX = SIDE_GAP + width / 2;

            const maxX =
                window.innerWidth -
                SIDE_GAP -
                width / 2;

            const minY =
                headerRect.bottom +
                HEADER_GAP +
                height / 2;

            const maxY =
                subtitleRect.top -
                SUBTITLE_GAP -
                height / 2;


            // If there isn't enough vertical space
            // don't allow the project to go outside it.
            if (maxY <= minY) {
                continue;
            }


            const x =
                Math.random() *
                (maxX - minX) +
                minX;

            const y =
                Math.random() *
                (maxY - minY) +
                minY;


            const candidate = {

                left: x - width / 2,
                right: x + width / 2,

                top: y - height / 2,
                bottom: y + height / 2

            };


            /* =========================================
               DON'T TOUCH NAME
            ========================================= */

            const touchesName =

                candidate.right >
                    nameRect.left - NAME_GAP &&

                candidate.left <
                    nameRect.right + NAME_GAP &&

                candidate.bottom >
                    nameRect.top - NAME_GAP &&

                candidate.top <
                    nameRect.bottom + NAME_GAP;


            if (touchesName) {
                continue;
            }


            /* =========================================
               DON'T TOUCH HEADER
            ========================================= */

            const touchesHeader =

                candidate.right >
                    headerRect.left &&

                candidate.left <
                    headerRect.right &&

                candidate.bottom >
                    headerRect.top - HEADER_GAP &&

                candidate.top <
                    headerRect.bottom + HEADER_GAP;


            if (touchesHeader) {
                continue;
            }

            /* =========================================
               DON'T TOUCH ABOUTME
            ========================================= */

            const touchaboutme =

                candidate.right >
                    aboutmeRect.left &&

                candidate.left <
                    aboutmeRect.right &&

                candidate.bottom >
                    aboutmeRect.top - ABOUTME_GAP &&

                candidate.top <
                    aboutmeRect.bottom + ABOUTME_GAP;


            if (touchaboutme) {
                continue;
            }

            /* =========================================
               DON'T TOUCH SUBTITLE
            ========================================= */

            const touchesSubtitle =

                candidate.right >
                    subtitleRect.left &&

                candidate.left <
                    subtitleRect.right &&

                candidate.bottom >
                    subtitleRect.top - SUBTITLE_GAP &&

                candidate.top <
                    subtitleRect.bottom + SUBTITLE_GAP;


            if (touchesSubtitle) {
                continue;
            }


            /* =========================================
               CHECK OTHER PROJECTS
            ========================================= */

            let valid = true;


            for (const other of placed) {

                const overlapWidth = Math.max(
                    0,

                    Math.min(
                        candidate.right,
                        other.right
                    )
                    -
                    Math.max(
                        candidate.left,
                        other.left
                    )
                );


                const overlapHeight = Math.max(
                    0,

                    Math.min(
                        candidate.bottom,
                        other.bottom
                    )
                    -
                    Math.max(
                        candidate.top,
                        other.top
                    )
                );


                const overlapArea =
                    overlapWidth *
                    overlapHeight;


                const candidateArea =
                    width * height;


                const overlapPercentage =
                    overlapArea /
                    candidateArea;


                if (
                    overlapPercentage >
                    MAX_OVERLAP
                ) {

                    valid = false;
                    break;

                }

            }


            if (valid) {

                position = candidate;
                break;

            }

        }


        /* =========================================
           PLACE PROJECT
        ========================================= */

        if (position) {

            const rotation =
                Math.random() * 16 - 8;


            project.style.left =
                `${position.left + width / 2}px`;


            project.style.top =
                `${position.top + height / 2}px`;


            project.style.transform =
                `translate(-50%, -50%) rotate(${rotation}deg)`;


            placed.push(position);

        }

    });

}

function layoutProjects() {
    const name = document.querySelector(".name");
    const subtitle = document.querySelector(".subtitle");
    const header = document.querySelector(".site-header");
    const aboutme = document.querySelector(".about-me");
    const obstacles = [
        { rect: name.getBoundingClientRect(), gap: 28 },
        { rect: aboutme.getBoundingClientRect(), gap: 24 },
        { rect: subtitle.getBoundingClientRect(), gap: 18 },
        { rect: header.getBoundingClientRect(), gap: 16 }
    ];
    const slots = [
        [.16, .18], [.38, .16], [.60, .18], [.82, .20],
        [.04, .68], [.96, .68]
    ];

    projectButtons.forEach((project, index) => {
        const width = project.offsetWidth;
        const height = project.offsetHeight;
        const [slotX, slotY] = slots[index];
        const centerX = Math.max(
            width / 2 + 8,
            Math.min(
                window.innerWidth - width / 2 - 8,
                slotX * window.innerWidth
            )
        );
        const centerY = slotY * window.innerHeight;
        const candidate = {
            left: centerX - width / 2,
            right: centerX + width / 2,
            top: centerY - height / 2,
            bottom: centerY + height / 2
        };
        const touchesObstacle = obstacles.some(({ rect, gap }) =>
            candidate.right > rect.left - gap &&
            candidate.left < rect.right + gap &&
            candidate.bottom > rect.top - gap &&
            candidate.top < rect.bottom + gap
        );

        if (touchesObstacle) {
            project.style.visibility = "hidden";
            return;
        }

        const rotation = index % 2 === 0 ? -4 : 4;
        project.style.left = `${centerX}px`;
        project.style.top = `${centerY}px`;
        project.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        project.style.visibility = "visible";
    });
}

        /* =========================================
           HERO ANIMATION
        ========================================= */

        const hero =
            document.getElementById("hero");

        const letters =
            document.querySelectorAll(".letter");


        function scatterLetters() {

            letters.forEach(letter => {

                const x =
                    Math.random() * 1200 - 600;

                const y =
                    Math.random() * 700 - 350;

                const rotation =
                    Math.random() * 120 - 60;


                letter.style.setProperty(
                    "--x",
                    `${x}px`
                );

                letter.style.setProperty(
                    "--y",
                    `${y}px`
                );

                letter.style.setProperty(
                    "--rotation",
                    `${rotation}deg`
                );

            });

        }


       function startIntro() {

    hero.classList.remove("reveal");

    /*
        Scatter the project boxes
    */

    layoutProjects();


    /*
        Scatter the letters
    */

    scatterLetters();


    /*
        Wait for browser to register
        the starting positions.
    */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            hero.classList.add("reveal");

        });

    });

}


        window.addEventListener(
            "load",
            startIntro
        );

        window.addEventListener(
            "resize",
            layoutProjects
        );
       
        /* =========================================
           PROJECT ELEMENTS
        ========================================= */

        const projectButtons =
            document.querySelectorAll(".project");


        const projectView =
            document.getElementById("projectView");


        const projectContent =
            document.getElementById("projectContent");


        const projectNumber =
            document.getElementById("projectNumber");


        const projectTitle =
            document.getElementById("projectTitle");


        const projectDescription =
            document.getElementById("projectDescription");


        const closeProject =
            document.getElementById("closeProject");


        const projectBackdrop =
            document.getElementById("projectBackdrop");


        /* =========================================
           OPEN PROJECT
        ========================================= */

        projectButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const projectIndex =
                        Number(
                            button.dataset.project
                        );
                    const project =
                        projects[projectIndex];
                    /*
                        Find where the clicked
                        box is on screen.
                    */
                    const rect =
                        button.getBoundingClientRect();
                    const boxCenterX =
                        rect.left +
                        rect.width / 2;
                    const boxCenterY =
                        rect.top +
                        rect.height / 2;
                    /*
                        Distance from center
                        of screen.
                    */
                    const startX =
                        boxCenterX -
                        window.innerWidth / 2;
                    const startY =
                        boxCenterY -
                        window.innerHeight / 2;
                    /*
                        Scale from small box
                        to large project.
                    */
                    const startScale =
                        rect.width /
                        (window.innerWidth * .8);
                    projectContent.style.setProperty(
                        "--start-x",
                        `${startX}px`
                    );
                    projectContent.style.setProperty(
                        "--start-y",
                        `${startY}px`
                    );
                    projectContent.style.setProperty(
                        "--start-scale",
                        startScale
                    );

                    /*
                        Fill project information.
                    */

                    projectNumber.textContent =
                        project.number;
                    projectTitle.textContent =
                        project.title;
                    projectDescription.textContent =
                        project.description;

                    /*
                        Open.
                    */

                    projectView.classList.add(
                        "active"
                    );
                }
            );
        });


        /* =========================================
           CLOSE PROJECT
        ========================================= */

        function closeProjectView() {

            projectView.classList.remove(
                "active"
            );

        }


        closeProject.addEventListener(
            "click",
            closeProjectView
        );


        projectBackdrop.addEventListener(
            "click",
            closeProjectView
        );

/* =========================================
   PROJECT ARCHIVE NAVIGATION
========================================= */

const projectDrawer =
    document.getElementById("projectDrawer");

const projectArchive =
    document.getElementById("projectArchive");

const archiveArrow =
    document.getElementById("archiveArrow");

const archiveCover =
    document.querySelector(".archive-cover");


let archiveOpen = false;
let archiveExpanded = false;


/* =========================================
   UPDATE
========================================= */

/* =========================================
   ARCHIVE COVER
   Click cover → open / close stack
========================================= */

if (archiveCover) {

    archiveCover.addEventListener("click", () => {

        archiveOpen = !archiveOpen;

        // If closing, also collapse the expanded projects
        if (!archiveOpen) {
            archiveExpanded = false;
        }

        updateArchive();

    });

}


/* =========================================
   ARCHIVE ARROW
   Click arrow → expand project stack
========================================= */

if (archiveArrow) {

    archiveArrow.addEventListener("click", (event) => {

        // Prevent the cover click from firing
        event.stopPropagation();

        // Make sure the stack is open
        archiveOpen = true;

        // Expand the projects
        archiveExpanded = true;

        updateArchive();

    });

}

/* =========================================
   HEADER CLOCK
========================================= */

function updateClock() {

    const clock = document.getElementById("clock");

    if (!clock) return;

    const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).format(new Date());

    clock.textContent = time;
}

updateClock();

setInterval(updateClock, 1000);