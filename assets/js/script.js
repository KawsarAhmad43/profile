document.addEventListener("DOMContentLoaded", function () {
    const promptInput = document.getElementById("promptInput");
    const enterPrompt = document.getElementById("enterPrompt");
    const showPrompts = document.getElementById("showPrompts");
    const availablePrompts = document.getElementById("availablePrompts");
    const loader = document.getElementById("loader");
    const backButton = document.getElementById("backButton");

    // Hide all content sections except homeSection
    function hideAllSections() {
        const sections = document.querySelectorAll(
            "#projectsSection, #profileSection, #skillsSection, #workSection, #certificationsSection, #researchworksSection, #contactSection"
        );
        sections.forEach((section) => {
            section.classList.add("hidden");
        });
    }

    // Show a specific section with a fade-in animation
    function showSection(sectionId) {
        hideAllSections();
        document.getElementById("homeSection").classList.add("hidden");
        const section = document.getElementById(sectionId);
        section.classList.remove("hidden");
        section.classList.add("fadeIn");
        backButton.classList.remove("hidden");
    }

    // Toggle available prompts with a smooth animation
    showPrompts.addEventListener("click", function () {
        if (availablePrompts.classList.contains("hidden")) {
            availablePrompts.classList.remove("hidden");
            availablePrompts.classList.add("fadeIn");
        } else {
            availablePrompts.classList.add("hidden");
        }
    });

    // Fill prompt input when a predefined prompt is clicked
    const promptItems = document.querySelectorAll(".prompt-item");
    promptItems.forEach((item) => {
        item.addEventListener("click", function () {
            promptInput.value = item.getAttribute("data-prompt");
            availablePrompts.classList.add("hidden");
        });
    });

    // Handle prompt submission and navigation
    function handlePrompt() {
        const promptValue = promptInput.value.toLowerCase().trim();
        // Mapping of valid prompt strings to section IDs
        const promptMap = {
            project: "projectsSection",
            projects: "projectsSection",
            "show me projects": "projectsSection",
            profile: "profileSection",
            skills: "skillsSection",
            work: "workSection",
            "work experience": "workSection",
            certifications: "certificationsSection",
            research: "researchworksSection",
            "research works": "researchworksSection",
            contact: "contactSection",
        };

        if (promptMap[promptValue]) {
            // Show loader animation for a short delay
            loader.classList.remove("hidden");
            setTimeout(function () {
                loader.classList.add("hidden");
                showSection(promptMap[promptValue]);
            }, 2000);
        }
    }

    enterPrompt.addEventListener("click", handlePrompt);
    promptInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            handlePrompt();
        }
    });

    // Action for the Back to Prompt button
    backButton.addEventListener("click", function () {
        hideAllSections();
        document.getElementById("homeSection").classList.remove("hidden");
        backButton.classList.add("hidden");
    });
});
