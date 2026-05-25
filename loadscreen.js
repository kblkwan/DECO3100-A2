document.addEventListener("DOMContentLoaded", () => {
    const introLoader = document.getElementById("intro-loader");
    const leftLens = document.getElementById("mask-left-lens");
    const rightLens = document.getElementById("mask-right-lens");

    // If the loader is missing, make sure the page can still scroll normally.
    if (!introLoader || introLoader.dataset.hasRun === "true") {
        document.body.style.overflow = "auto";
        document.body.classList.remove("intro-active");
        return;
    }

    introLoader.dataset.hasRun = "true";
    document.body.style.overflow = "hidden";
    document.body.classList.add("intro-active");
    introLoader.classList.add("is-playing");

    const lensRadius = 120;
    const lensGap = 130;
    const revealDelay = 1900;
    let hasFinished = false;
    let canReveal = false;
    let lastPointer = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    // Moves the two SVG mask circles to the cursor position to reveal the video underneath.
    function updateReveal(clientX, clientY) {
        const centerX = clientX;
        const centerY = clientY;

        introLoader.style.setProperty("--reveal-x", `${centerX}px`);
        introLoader.style.setProperty("--reveal-y", `${centerY}px`);

        if (leftLens && rightLens) {
            leftLens.setAttribute("cx", centerX - (lensGap / 2));
            leftLens.setAttribute("cy", centerY);
            leftLens.setAttribute("r", lensRadius);
            rightLens.setAttribute("cx", centerX + (lensGap / 2));
            rightLens.setAttribute("cy", centerY);
            rightLens.setAttribute("r", lensRadius);
        }
    }

    // Converts the intro from a fixed loader into a normal top-of-page title screen.
    function finishIntro() {
        if (hasFinished) {
            return;
        }

        hasFinished = true;
        introLoader.classList.add("intro-docked");
        document.body.style.overflow = "auto";
        document.body.classList.remove("intro-active");
        document.dispatchEvent(new CustomEvent("introLoaderComplete"));
    }

    // Tracks cursor movement across the intro so the reveal follows the user's hover position.
    introLoader.addEventListener("pointermove", event => {
        lastPointer = {
            x: event.clientX,
            y: event.clientY
        };

        if (canReveal) {
            updateReveal(lastPointer.x, lastPointer.y);
        }
    });

    // Sets the reveal position as soon as the cursor enters the intro area.
    introLoader.addEventListener("pointerenter", event => {
        lastPointer = {
            x: event.clientX,
            y: event.clientY
        };

        if (canReveal) {
            updateReveal(lastPointer.x, lastPointer.y);
        }
    });

    // Lets the user leave the intro screen only after pressing Enter.
    document.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            finishIntro();
        }
    });

    // Waits until the text has fully appeared before allowing the binocular reveal.
    setTimeout(() => {
        canReveal = true;
        updateReveal(lastPointer.x, lastPointer.y);
    }, revealDelay);
});
