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
    const fadeDuration = 700;
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

    // Fades out the intro, restores page scrolling, then removes the loader from the DOM.
    function finishIntro() {
        if (hasFinished) {
            return;
        }

        hasFinished = true;
        introLoader.classList.add("intro-complete");
        document.body.style.overflow = "auto";
        document.body.classList.remove("intro-active");

        setTimeout(() => {
            introLoader.remove();
        }, fadeDuration);
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
