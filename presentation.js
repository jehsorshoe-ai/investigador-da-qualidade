(function initPresentationLayer() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const body = document.body;
  const stage = document.querySelector("#presentationStage");
  const form = document.querySelector("#startForm");
  const openButton = document.querySelector("#openInvestigation");
  const closeButton = document.querySelector("#closeInvestigationForm");
  const profileInput = document.querySelector("#profile");
  const screens = Array.from(document.querySelectorAll(".screen"));
  const questionPanel = document.querySelector(".question-panel");
  const questionText = document.querySelector("#questionText");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!stage || !form || !openButton || !closeButton) return;

  root.classList.add("presentation-ready");
  form.hidden = true;
  let stageExitTimer = null;

  function activeScreenName() {
    return screens.find((screen) => screen.classList.contains("is-active"))?.dataset.screen || "home";
  }

  function syncView() {
    body.dataset.view = activeScreenName();
  }

  function revealForm() {
    if (form.hidden === false) return;

    let completed = false;
    const complete = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(stageExitTimer);
      stage.removeEventListener("animationend", onAnimationEnd);
      stage.hidden = true;
      stage.classList.remove("is-leaving");
    };

    const onAnimationEnd = (event) => {
      if (event.target === stage && event.animationName === "stage-exit") complete();
    };

    form.hidden = false;
    form.classList.add("is-entering");
    root.classList.add("presentation-form-open");
    profileInput?.focus({ preventScroll: true });

    if (reducedMotion.matches) {
      complete();
      return;
    }

    stage.addEventListener("animationend", onAnimationEnd);
    stage.classList.add("is-leaving");
    stageExitTimer = window.setTimeout(complete, 700);
  }

  function showPresentation() {
    window.clearTimeout(stageExitTimer);
    form.hidden = true;
    form.classList.remove("is-entering");
    stage.hidden = false;
    stage.classList.remove("is-leaving");
    root.classList.remove("presentation-form-open");
    openButton.focus({ preventScroll: true });
  }

  function showFormAfterReset() {
    window.clearTimeout(stageExitTimer);
    stage.hidden = true;
    stage.classList.remove("is-leaving");
    form.hidden = false;
    form.classList.remove("is-entering");
    root.classList.add("presentation-form-open");
  }

  openButton.addEventListener("click", revealForm);
  closeButton.addEventListener("click", showPresentation);

  ["#backHome", "#restart", "#restartTop"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("click", showFormAfterReset);
  });

  const screenObserver = new MutationObserver(syncView);
  screens.forEach((screen) => {
    screenObserver.observe(screen, { attributes: true, attributeFilter: ["class"] });
  });

  if (questionPanel && questionText) {
    const questionObserver = new MutationObserver(() => {
      if (!questionPanel.closest(".screen")?.classList.contains("is-active")) return;
      questionPanel.classList.remove("question-refresh");
      requestAnimationFrame(() => questionPanel.classList.add("question-refresh"));
    });

    questionObserver.observe(questionText, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    questionPanel.addEventListener("animationend", (event) => {
      if (event.target === questionPanel && event.animationName === "question-enter") {
        questionPanel.classList.remove("question-refresh");
      }
    });
  }

  syncView();
})();
