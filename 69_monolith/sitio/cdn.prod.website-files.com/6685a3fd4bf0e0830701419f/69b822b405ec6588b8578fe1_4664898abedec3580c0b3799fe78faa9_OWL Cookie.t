(() => {
  const STORAGE_KEY = "artistsViewMode";

  const initViewToggle = () => {
    const listBtn = document.querySelector(".list-view");
    const gridBtn = document.querySelector(".grid-view");
    const listWrap = document.querySelector(".artists_list");
    const gridWrap = document.querySelector(".artists_grid");

    if (!listBtn || !gridBtn || !listWrap || !gridWrap) return;

    const applyMode = (mode) => {
      const isList = mode === "list";

      listBtn.classList.toggle("is-active", isList);
      gridBtn.classList.toggle("is-active", !isList);

      listWrap.style.display = isList ? "" : "none";
      gridWrap.style.display = isList ? "none" : "";
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    applyMode(saved === "grid" ? "grid" : "list");

    listBtn.addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEY, "list");
      applyMode("list");
    });

    gridBtn.addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEY, "grid");
      applyMode("grid");
    });
  };

  const bindRefreshOnImages = ($owl, scopeEl) => {
    scopeEl.querySelectorAll("img").forEach((img) => {
      if (img.dataset.owlRefreshBound === "1") return;
      img.dataset.owlRefreshBound = "1";

      const refresh = () => {
        if ($owl.hasClass("owl-loaded")) $owl.trigger("refresh.owl.carousel");
      };

      if (!img.complete) {
        img.addEventListener("load", refresh, { once: true });
        img.addEventListener("error", refresh, { once: true });
      }
    });
  };

  const initOwlsIn = (root) => {
    const $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.owlCarousel) return;

    const scope = root instanceof Element ? root : document;

    scope.querySelectorAll(".owl-carousel").forEach((owlEl) => {
      const $owl = $(owlEl);

      if ($owl.hasClass("owl-loaded")) {
        bindRefreshOnImages($owl, owlEl);
        return;
      }

      const artistEl = owlEl.closest(".artist");
      const $progressBar = artistEl ? $(artistEl).find(".my-slider-progress-bar") : $();

      $owl.owlCarousel({
        loop: false,
        autoWidth: true,
        margin: 8,
        nav: false,
        responsive: {
          0: { items: 2, center: false, autoWidth: true },
          600: { items: 3 },
          1000: { items: 4 },
        },
        onInitialized: function () {
          bindRefreshOnImages($owl, owlEl);
        },
        onChanged: function (event) {
          if (!$progressBar.length) return;
          const current = event.item.index + 1;
          const total = event.item.count;
          const progress = current >= total - 1 ? 100 : (current / total) * 100;
          $progressBar.outerWidth(progress + "%");
        },
      });
    });
  };

  const hookFinsweet = () => {
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      "cmsload",
      (listInstances) => {
        (listInstances || []).forEach((listInstance) => {
          listInstance.on("renderitems", (renderedItems) => {
            renderedItems.forEach((item) => {
              requestAnimationFrame(() => initOwlsIn(item));
            });
          });
        });
      },
    ]);
  };

  const observeFallback = () => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(".owl-carousel") || node.querySelector(".owl-carousel")) {
            initOwlsIn(node);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const init = () => {
    initViewToggle();
    initOwlsIn(document);
    hookFinsweet();
    observeFallback();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();