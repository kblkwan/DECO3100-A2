document.addEventListener("DOMContentLoaded", () => {
    const storyContainer = document.getElementById("story-container");
    const storySteps = [...document.querySelectorAll(".story-step")];
    let currentUnlockedIndex = 0;
    let storyIsActive = false;
    let storyIsComplete = false;
    let ignoreNextEnter = false;

    if (!storyContainer || storySteps.length === 0) {
        return;
    }

    // Adds the Enter prompt to the story section that is currently active.
    function addContinuePrompt(step) {
        if (step.querySelector(".story-continue")) {
            return;
        }

        const prompt = document.createElement("div");
        prompt.className = "story-continue";
        prompt.textContent = "Press Enter to continue";
        step.appendChild(prompt);
    }

    // Removes all prompts so only one step asks the user to continue.
    function clearContinuePrompts() {
        document.querySelectorAll(".story-continue").forEach(prompt => {
            prompt.remove();
        });
    }

    // Loads each chart script once when its graph section is first unlocked.
    function initialiseChart(step) {
        const chartScript = step.dataset.chart;

        if (!chartScript || step.dataset.chartLoaded === "true") {
            return;
        }

        step.dataset.chartLoaded = "true";

        const script = document.createElement("script");
        script.src = chartScript;
        script.dataset.storyChart = "true";
        document.body.appendChild(script);
    }

    // Centers graph cards using their real rendered size instead of relying on scrollIntoView timing.
    function centerGraphStep(step, behavior = "smooth") {
        const rect = step.getBoundingClientRect();
        const targetTop = window.scrollY + rect.top - ((window.innerHeight - rect.height) / 2);

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: behavior
        });
    }

    // Re-centers a graph after Plotly/D3 has had time to finish changing the card height.
    function scrollToStoryStep(step) {
        if (!step.classList.contains("graph-card")) {
            step.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            return;
        }

        centerGraphStep(step);
        [300, 900, 1600].forEach(delay => {
            setTimeout(() => {
                centerGraphStep(step);
            }, delay);
        });
    }

    // Sets up the starting state: first story section visible, all future sections hidden.
    function setupStorySteps() {
        storySteps.forEach((step, index) => {
            const isFirstStep = index === 0;

            step.classList.toggle("unlocked", isFirstStep);
            step.classList.toggle("locked", !isFirstStep);
            step.classList.toggle("active", isFirstStep);
        });

        clearContinuePrompts();
        addContinuePrompt(storySteps[0]);
    }

    // Reveals the next step, scrolls to it, and starts its graph if it contains one.
    function unlockNextStep() {
        if (!storyIsActive || storyIsComplete) {
            return;
        }

        const currentStep = storySteps[currentUnlockedIndex];
        const nextIndex = currentUnlockedIndex + 1;

        if (nextIndex >= storySteps.length) {
            completeStory();
            return;
        }

        const nextStep = storySteps[nextIndex];

        currentStep.classList.remove("active");
        nextStep.classList.remove("locked");
        nextStep.classList.add("unlocked", "active");
        currentUnlockedIndex = nextIndex;

        clearContinuePrompts();
        initialiseChart(nextStep);

        if (currentUnlockedIndex < storySteps.length - 1) {
            addContinuePrompt(nextStep);
        } else {
            completeStory();
        }

        scrollToStoryStep(nextStep);
    }

    // Removes story restrictions once the final section has been unlocked.
    function completeStory() {
        storyIsComplete = true;
        storyContainer.classList.add("story-complete");
        clearContinuePrompts();

        storySteps.forEach(step => {
            step.classList.remove("locked", "active");
            step.classList.add("unlocked");
        });
    }

    // Starts the story after the video title screen has been confirmed with Enter.
    function startStory() {
        if (storyIsActive) {
            return;
        }

        storyIsActive = true;
        ignoreNextEnter = true;
        storySteps[0].scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    setupStorySteps();
    document.addEventListener("introLoaderComplete", startStory);

    document.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            if (ignoreNextEnter) {
                ignoreNextEnter = false;
                return;
            }

            unlockNextStep();
        }
    });
});
