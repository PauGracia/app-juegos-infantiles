document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  const bodyIndex = document.getElementById("body-index");
  const footerTop = footer.querySelector(".footer-top");
  const footerBottom = footer.querySelector(".footer-bottom");

  let isExpanded = false;
  let animationFrame;

  const isMobile = window.matchMedia("(hover: none)").matches;

  function getExpandedHeight() {
    return footerTop.offsetHeight + footerBottom.scrollHeight;
  }

  function updateBodyPadding(height) {
    bodyIndex.style.paddingBottom = `${height}px`;
  }

  function animateHeight(from, to, duration = 350, callback) {
    const startTime = performance.now();
    cancelAnimationFrame(animationFrame);

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newHeight = from + (to - from) * progress;
      footer.style.height = `${newHeight}px`;
      updateBodyPadding(newHeight);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else if (callback) {
        callback();
      }
    }

    animationFrame = requestAnimationFrame(step);
  }

  function expandFooter() {
    if (isExpanded) return;
    isExpanded = true;
    footer.classList.add("expanded");
    animateHeight(footer.offsetHeight, getExpandedHeight(), 350);
  }

  function collapseFooter() {
    if (!isExpanded) return;
    isExpanded = false;
    animateHeight(footer.offsetHeight, footerTop.offsetHeight, 350, () => {
      footer.classList.remove("expanded");
    });
  }

  // Scroll desktop y móvil
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (!isMobile) {
      if (scrollTop > 20) expandFooter();
      else collapseFooter();
    }
  });

  // Hover desktop
  if (!isMobile) {
    footer.addEventListener("mouseenter", expandFooter);
    footer.addEventListener("mouseleave", () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop < 20) collapseFooter();
    });
  }

  // Toque móvil: expandir/contraer con tap
  if (isMobile) {
    footer.addEventListener("click", () => {
      if (isExpanded) collapseFooter();
      else expandFooter();
    });
  }

  // Inicializamos altura
  footer.style.height = `${footerTop.offsetHeight}px`;
  updateBodyPadding(footerTop.offsetHeight);
});
