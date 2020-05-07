document.addEventListener("DOMContentLoaded", function() {
  if (document.body.classList.contains("js-main-menu")) {
    const mainMenuButton = document.body.querySelector(".js_open_main_menu");
    const mainMenu = document.body.querySelector(".main-sidebar");
    function toggleMenu() {
      mainMenu.classList.toggle("active");
    }
    mainMenuButton.addEventListener("click", e => {
      e.stopPropagation();
      toggleMenu();
    });
    document.addEventListener("click", function(e) {
      const target = e.target;
      const itsMenu = target == mainMenu || mainMenu.contains(target);
      const itsBtnMenu = target == mainMenuButton;
      const menuIsActive = mainMenu.classList.contains("active");
      if (!itsMenu && !itsBtnMenu && menuIsActive) {
        toggleMenu();
      }
    });
  }
  if (document.body.classList.contains("js-mobile-menu")) {
    openMenu(".burger-menu", ".nav__menu-mobile");
  }
  customSelect(document.getElementById("toggleBuySale"), {
    containerClass: "sale-toggle__select-container",
    openerClass: "sale-toggle__select-opener",
    panelClass: "sale-toggle__select-panel",
    optionClass: "sale-toggle__select-option",
    optgroupClass: "sale-toggle__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open"
  });

  /// подсветка ссылки на активную страницу в основном сайдбаре
  function mainsidebarActivePage() {
    if (document.body.classList.contains("multi")) {
      document.body.querySelector(".js_page_multi").classList.add("active");
    }
    if (document.body.classList.contains("partners")) {
      document.body.querySelector(".js_page_partners").classList.add("active");
    }
    if (document.body.classList.contains("travel")) {
      document.body.querySelector(".js_page_travel").classList.add("active");
    }
    if (document.body.classList.contains("jewelry")) {
      document.body.querySelector(".js_page_jewelry").classList.add("active");
    }
    if (document.body.classList.contains("market")) {
      document.body.querySelector(".js_page_market").classList.add("active");
    }
    if (document.body.classList.contains("pawnshop")) {
      document.body.querySelector(".js_page_pawnshop").classList.add("active");
    }
    if (document.body.classList.contains("store")) {
      document.body.querySelector(".js_page_store").classList.add("active");
    }
    if (document.body.classList.contains("jewelry")) {
      document.body.querySelector(".js_page_jewelry").classList.add("active");
    }
    if (document.body.classList.contains("start")) {
      document.body.querySelector(".js_page_start").classList.add("active");
    } else {
      return;
    }
  }
  function openMenu(button, boxes) {
    const openButton = document.body.querySelector(button);
    openButton.addEventListener("click", e => {
      const showBox = document.body.querySelectorAll(boxes);
      e.preventDefault();
      showBox.forEach(function(box) {
        box.classList.toggle("js_active_menu");
      });

      openButton.classList.toggle("js_active_menu");
    });
  }
  openMenu(".burger-menu", ".nav__menu-mobile");

  (() => {
    const closeButtons = document.querySelectorAll(".info-modal__close-btn");
    if (closeButtons) {
      closeButtons.forEach((btn, e) => {
        btn.addEventListener("click", function(e) {
          e.target.closest(".js_info_modal").classList.remove("active");
        });
      });
    }
  })();

  mainsidebarActivePage();

  (() => {
    let isSafari;
    window.navigator.vendor.toLowerCase().indexOf("apple") > -1
      ? (isSafari = true)
      : (isSafari = false);
    if (isSafari) {
      document.body.classList.add("safari_browser");
    }
  })();
  // показываем кошелёк и закрываем его при клике вне
  (() => {
    const walletBtn = document.body.querySelector(".js_wallet_show");
    const walletBody = document.body.querySelector(".js_account_wallet");
    const hasWallet = document.body.querySelector("header").contains(walletBtn);
    if (hasWallet) {
      function toggle(e) {
        if (e.target.closest(".js_account_wallet") !== null) {
          return;
        }
        walletBtn.classList.toggle("active");
      }
      function remove() {
        walletBtn.classList.remove("active");
      }
      document.body.addEventListener("click", e => {
        const target = e.target;
        target == walletBtn || target.closest(".js_wallet_show")
          ? toggle(e)
          : target !== walletBody
          ? remove()
          : false;
      });
    }
  })();
});
