document.addEventListener("DOMContentLoaded", function() {
    const btn = document.querySelector(".menu-btn"),
        mobileMenu = document.querySelector(".mobile__header_menu")
    btn.addEventListener("click", function() {
        btn.classList.toggle("menu-btn_active")
        mobileMenu.classList.toggle("active")
    })
    ;(() => {
        function isEmpty(str) {
            if (str.trim() == "") return true

            return false
        }
        const formWrap = document.getElementById("form")
        const mailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        const errorEmail = document.querySelector("#errorEmail")

        const errorPassword1 = document.querySelector("#errorPassword1")
        const validateFormMail = e => {
            let isError = false
            const emailInput = document.querySelector("#email")

            if (isEmpty(emailInput.value)) {
                emailInput.classList.remove("has-danger")
                errorEmail.innerText = "Заполните поле"
                isError = true
            } else if (
                !isEmpty(emailInput.value) &&
                !mailPattern.test(emailInput.value.trim())
            ) {
                emailInput.classList.add("has-danger")
                errorEmail.innerText = "Введите правильный e-mail"
                isError = true
            } else {
                emailInput.classList.remove("has-danger")
                errorEmail.innerText = ""
            }
            return isError
        }
        const validateFormPass = e => {
            const passwordInput = document.querySelector("#pass")
            const rePasswordInput = document.querySelector("#repass")
            // значение форм сравниваем по id и значению
            let isError = false
            passwordInput.value = passwordInput.value.replace(/\s/g, "")
            rePasswordInput.value = rePasswordInput.value.replace(/\s/g, "")
            if (
                passwordInput.value.length === 0 &&
                rePasswordInput.value.length === 0
            ) {
                passwordInput.classList.remove("has-danger")
                rePasswordInput.classList.remove("has-danger")
                errorPassword1.innerText = "Заполните поле"
                isError = true
            }
            if (passwordInput.value === rePasswordInput.value) {
                passwordInput.classList.remove("has-danger")
                rePasswordInput.classList.remove("has-danger")
                errorPassword1.innerText = ""
            }
            if (passwordInput.value !== rePasswordInput.value) {
                passwordInput.classList.add("has-danger")
                rePasswordInput.classList.add("has-danger")
                errorPassword1.innerText = "Введённые пароли не совпадают"
                isError = true
            } else if (
                passwordInput.value.length < 8 &&
                passwordInput.value.length > 0
            ) {
                passwordInput.classList.add("has-danger")
                rePasswordInput.classList.add("has-danger")
                errorPassword1.innerText = "Минимум 8 символов"
                isError = true
            } else {
                passwordInput.classList.remove("has-danger")
                rePasswordInput.classList.remove("has-danger")
                errorPassword1.innerText = ""
                errorEmail.innerText = ""
            }
            return isError
        }
        console.log(formWrap, "form")
        formWrap.onsubmit = e => {
            if (validateFormPass(e)) {
                e.preventDefault()
            }
            if (validateFormMail(e)) {
                e.preventDefault()
            }
        }
        formWrap.addEventListener("sumbit", e => {})
    })()

    let servicesSlider = new Swiper(".slider_services", {
        spaceBetween: 10,
        loopFillGroupWithBlank: true,
        navigation: {
            nextEl: ".arrow_right",
            prevEl: ".arrow_left",
        },
        breakpoints: {
            // when window width is >= 320px
            320: {
                slidesPerView: 1,
                loopedSlides: 1,
                slidesPerGroup: 1,
            },
            560: {
                slidesPerView: 2,
                loopedSlides: 2,
                slidesPerGroup: 2,
            },
            768: {
                loop: true,
                slidesPerView: 4,
                loopedSlides: 4,
                slidesPerGroup: 4,
            },

            1200: {
                slidesPerView: 8,
                loopedSlides: 8,
                slidesPerGroup: 8,
            },
        },
    })

    ;(function() {
        let servicesBtn = document.querySelectorAll(".js_service_btn")
        let servicesImg = document.querySelectorAll(".js_service_img")
        let servicesTextBox = document.querySelector(".js_service_text")
        servicesBtn.forEach(btn => {
            btn.addEventListener("click", e => {
                setServiceImg(btn.dataset.serviceName)
                setServiceText(btn.dataset.serviceName)
                btn.classList.add("active")
            })
        })
        function setServiceImg(serviceName) {
            for (let i = 0; i < servicesBtn.length; i++) {
                const btn = servicesBtn[i]
                btn.classList.remove("active")
            }
            for (let i = 0; i < servicesImg.length; i++) {
                const img = servicesImg[i]
                img.classList.remove("active")
                if (img.dataset.serviceName === serviceName) {
                    img.classList.add("active")
                }
            }
        }
        function setServiceText(serviceName) {
            servicesTextBox.innerHTML = ""
            if (serviceName === "jewelry") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Jewelry</h4>
                    <p class="pb-2">А что если мы скажем вам, что ваши драгоценности могут стоить больше их номинальной стоимости?</p>
                    <p class="pb-2"><strong>CPnet Jewelry</strong> - это холодные кошельки для хранения активов в форме драгоценностей.</p>
                    <p class="pb-4">Это возможность <strong>увековечить и приумножить ваши активы и драгоценности</strong>.</p>
                    
                `
            }
            if (serviceName === "partners") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Partners</h4>
                    <p class="pb-2">Система поощрений пользователей платформы CP.net за активность.</p>
                    <p class="pb-2">Возможность<strong> приумножать активы </strong> за счет рекомендаций.</p>
                    <p class="pb-4">Рекомендуйте нас и <strong>зарабатывайте ежедневно 0,05%</strong> купонов - токенов!</p>
                    

                `
            }
            if (serviceName === "pawnshop") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Pawnshop</h4>
                    <p class="pb-2"> <strong>Услуга займа</strong> денежных средств под залог купонов-токенов между пользователями платформы CPnet.</p>
                    <p class="pb-2"> Получатель займа <strong>сохраняет свои активы</strong> путем займа денежных средств на определенное время под залог купонов-токенов с последующим
                    выкупом своих активов у заимодателя.</p>
                    <p class="pb-4">Заимодатель <strong>приумножает свои купоны</strong> – токены за то время, пока обеспечивает хранение активов.</p>
                    <strong class="pb-4">*CP-Pawn shop позволяет получить 10% от общей суммы залога.</strong>
                               `
            }
            if (serviceName === "multiwallet") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Multiwallet</h4>
                    <p class="pb-2"> Защищенная система для <strong>хранения</strong>  купонов - токенов, которые гарантированно <strong>приумножаются</strong>.</p>
                    

                    <div class="pb-2">
                        <ul>Процентные ставки за хранение купонов - токенов на платформе:
                           <li> • 0,2% в день</li>
                           <li> • 6% в месяц</li>
                            <li>• 200% в год</li>
                        </ul>
                    </div>
                    
                               `
            }
            if (serviceName === "store") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Store</h4>
                    <p class="pb-4"> Доска объявлений для пользователей платформы, помогающая
                        <strong>рекламировать и реализовывать</strong> свои товары и услуги за купоны - токены.
                    </p>
                    <a            `
            }
            if (serviceName === "market") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Market</h4>
                    <p class="pb-2"> Это внутренняя биржа, позволяющая совершать операции по <strong>купле и продаже купонов-токенов.</strong></p>
                    <p class="pb-4"> CPnet Market гарантирует <strong>анонимность и безопасность</strong> сделок <strong>по всему миру</strong></p>
                    
                `
            }
            if (serviceName === "start") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Start</h4>
                    <p class="pb-2">Возможность <strong>привлечения инвесторов</strong> из числа пользователей сообщества для различных проектов, бизнес - идей и стартапов.</p>
                    <div class="pb-4">
                        <ul>Алгоритм действий:
                            <li> 1. Вы <strong>подаете заявку с идеей</strong> проекта на реализацию в рамках платформы CPnet</li>
                            <li> 2. Любой заинтересованный пользователь платформы CP.net может <strong>вложить активы</strong> на реализацию проекта</li>
                            <li> 3. После реализации проекта инвесторы <strong>восполняют активы за счет прибыли.</strong></li>
                        </ul>
                    </div>
                    <a              `
            }
            if (serviceName === "travel") {
                servicesTextBox.innerHTML = `
                    <h4 class="font-bold text-title select-none uppercase pb-6">Travel</h4>
                    <p class="pb-2"> Сервис для <strong>покупки туристических путевок.</strong></p>
                    <div class="pb-4"> Покупайте <strong>горящие туры </strong>на заработанные купон-токены.
                    </div>
                    <a              `
            }
        }
    })()
    /*! smooth-scroll v16.1.1 | (c) 2019 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/smooth-scroll */
    !(function(e, t) {
        "function" == typeof define && define.amd
            ? define([], function() {
                  return t(e)
              })
            : "object" == typeof exports
            ? (module.exports = t(e))
            : (e.SmoothScroll = t(e))
    })(
        "undefined" != typeof global
            ? global
            : "undefined" != typeof window
            ? window
            : this,
        function(w) {
            "use strict"
            var L = {
                    ignore: "[data-scroll-ignore]",
                    header: null,
                    topOnEmptyHash: !0,
                    speed: 500,
                    speedAsDuration: !1,
                    durationMax: null,
                    durationMin: null,
                    clip: !0,
                    offset: 0,
                    easing: "easeInOutCubic",
                    customEasing: null,
                    updateURL: !0,
                    popstate: !0,
                    emitEvents: !0,
                },
                H = function() {
                    var n = {}
                    return (
                        Array.prototype.forEach.call(arguments, function(e) {
                            for (var t in e) {
                                if (!e.hasOwnProperty(t)) return
                                n[t] = e[t]
                            }
                        }),
                        n
                    )
                },
                r = function(e) {
                    "#" === e.charAt(0) && (e = e.substr(1))
                    for (
                        var t,
                            n = String(e),
                            o = n.length,
                            a = -1,
                            r = "",
                            i = n.charCodeAt(0);
                        ++a < o;

                    ) {
                        if (0 === (t = n.charCodeAt(a)))
                            throw new InvalidCharacterError(
                                "Invalid character: the input contains U+0000.",
                            )
                        ;(1 <= t && t <= 31) ||
                        127 == t ||
                        (0 === a && 48 <= t && t <= 57) ||
                        (1 === a && 48 <= t && t <= 57 && 45 === i)
                            ? (r += "\\" + t.toString(16) + " ")
                            : (r +=
                                  128 <= t ||
                                  45 === t ||
                                  95 === t ||
                                  (48 <= t && t <= 57) ||
                                  (65 <= t && t <= 90) ||
                                  (97 <= t && t <= 122)
                                      ? n.charAt(a)
                                      : "\\" + n.charAt(a))
                    }
                    return "#" + r
                },
                q = function() {
                    return Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight,
                        document.body.offsetHeight,
                        document.documentElement.offsetHeight,
                        document.body.clientHeight,
                        document.documentElement.clientHeight,
                    )
                },
                x = function(e) {
                    return e
                        ? ((t = e),
                          parseInt(w.getComputedStyle(t).height, 10) +
                              e.offsetTop)
                        : 0
                    var t
                },
                Q = function(e, t, n, o) {
                    if (t.emitEvents && "function" == typeof w.CustomEvent) {
                        var a = new CustomEvent(e, {
                            bubbles: !0,
                            detail: { anchor: n, toggle: o },
                        })
                        document.dispatchEvent(a)
                    }
                }
            return function(o, e) {
                var I,
                    a,
                    M,
                    A,
                    C = {}
                ;(C.cancelScroll = function(e) {
                    cancelAnimationFrame(A),
                        (A = null),
                        e || Q("scrollCancel", I)
                }),
                    (C.animateScroll = function(i, s, e) {
                        C.cancelScroll()
                        var c = H(I || L, e || {}),
                            u =
                                "[object Number]" ===
                                Object.prototype.toString.call(i),
                            t = u || !i.tagName ? null : i
                        if (u || t) {
                            var l = w.pageYOffset
                            c.header &&
                                !M &&
                                (M = document.querySelector(c.header))
                            var n,
                                o,
                                a,
                                d,
                                r,
                                f,
                                m,
                                h,
                                p = x(M),
                                g = u
                                    ? i
                                    : (function(e, t, n, o) {
                                          var a = 0
                                          if (e.offsetParent)
                                              for (
                                                  ;
                                                  (a += e.offsetTop),
                                                      (e = e.offsetParent);

                                              );
                                          return (
                                              (a = Math.max(a - t - n, 0)),
                                              o &&
                                                  (a = Math.min(
                                                      a,
                                                      q() - w.innerHeight,
                                                  )),
                                              a
                                          )
                                      })(
                                          t,
                                          p,
                                          parseInt(
                                              "function" == typeof c.offset
                                                  ? c.offset(i, s)
                                                  : c.offset,
                                              10,
                                          ),
                                          c.clip,
                                      ),
                                y = g - l,
                                v = q(),
                                S = 0,
                                E =
                                    ((n = y),
                                    (a = (o = c).speedAsDuration
                                        ? o.speed
                                        : Math.abs((n / 1e3) * o.speed)),
                                    o.durationMax && a > o.durationMax
                                        ? o.durationMax
                                        : o.durationMin && a < o.durationMin
                                        ? o.durationMin
                                        : parseInt(a, 10)),
                                b = function(e, t) {
                                    var n,
                                        o,
                                        a,
                                        r = w.pageYOffset
                                    if (
                                        e == t ||
                                        r == t ||
                                        (l < t && w.innerHeight + r) >= v
                                    )
                                        return (
                                            C.cancelScroll(!0),
                                            (o = t),
                                            (a = u),
                                            0 === (n = i) &&
                                                document.body.focus(),
                                            a ||
                                                (n.focus(),
                                                document.activeElement !== n &&
                                                    (n.setAttribute(
                                                        "tabindex",
                                                        "-1",
                                                    ),
                                                    n.focus(),
                                                    (n.style.outline = "none")),
                                                w.scrollTo(0, o)),
                                            Q("scrollStop", c, i, s),
                                            !(A = d = null)
                                        )
                                },
                                O = function(e) {
                                    var t, n, o
                                    d || (d = e),
                                        (S += e - d),
                                        (f =
                                            l +
                                            y *
                                                ((n = r =
                                                    1 <
                                                    (r = 0 === E ? 0 : S / E)
                                                        ? 1
                                                        : r),
                                                "easeInQuad" ===
                                                    (t = c).easing &&
                                                    (o = n * n),
                                                "easeOutQuad" === t.easing &&
                                                    (o = n * (2 - n)),
                                                "easeInOutQuad" === t.easing &&
                                                    (o =
                                                        n < 0.5
                                                            ? 2 * n * n
                                                            : (4 - 2 * n) * n -
                                                              1),
                                                "easeInCubic" === t.easing &&
                                                    (o = n * n * n),
                                                "easeOutCubic" === t.easing &&
                                                    (o = --n * n * n + 1),
                                                "easeInOutCubic" === t.easing &&
                                                    (o =
                                                        n < 0.5
                                                            ? 4 * n * n * n
                                                            : (n - 1) *
                                                                  (2 * n - 2) *
                                                                  (2 * n - 2) +
                                                              1),
                                                "easeInQuart" === t.easing &&
                                                    (o = n * n * n * n),
                                                "easeOutQuart" === t.easing &&
                                                    (o = 1 - --n * n * n * n),
                                                "easeInOutQuart" === t.easing &&
                                                    (o =
                                                        n < 0.5
                                                            ? 8 * n * n * n * n
                                                            : 1 -
                                                              8 *
                                                                  --n *
                                                                  n *
                                                                  n *
                                                                  n),
                                                "easeInQuint" === t.easing &&
                                                    (o = n * n * n * n * n),
                                                "easeOutQuint" === t.easing &&
                                                    (o =
                                                        1 +
                                                        --n * n * n * n * n),
                                                "easeInOutQuint" === t.easing &&
                                                    (o =
                                                        n < 0.5
                                                            ? 16 *
                                                              n *
                                                              n *
                                                              n *
                                                              n *
                                                              n
                                                            : 1 +
                                                              16 *
                                                                  --n *
                                                                  n *
                                                                  n *
                                                                  n *
                                                                  n),
                                                t.customEasing &&
                                                    (o = t.customEasing(n)),
                                                o || n)),
                                        w.scrollTo(0, Math.floor(f)),
                                        b(f, g) ||
                                            ((A = w.requestAnimationFrame(O)),
                                            (d = e))
                                }
                            0 === w.pageYOffset && w.scrollTo(0, 0),
                                (m = i),
                                (h = c),
                                u ||
                                    (history.pushState &&
                                        h.updateURL &&
                                        history.pushState(
                                            {
                                                smoothScroll: JSON.stringify(h),
                                                anchor: m.id,
                                            },
                                            document.title,
                                            m === document.documentElement
                                                ? "#top"
                                                : "#" + m.id,
                                        )),
                                "matchMedia" in w &&
                                w.matchMedia("(prefers-reduced-motion)").matches
                                    ? w.scrollTo(0, Math.floor(g))
                                    : (Q("scrollStart", c, i, s),
                                      C.cancelScroll(!0),
                                      w.requestAnimationFrame(O))
                        }
                    })
                var t = function(e) {
                        if (
                            !e.defaultPrevented &&
                            !(
                                0 !== e.button ||
                                e.metaKey ||
                                e.ctrlKey ||
                                e.shiftKey
                            ) &&
                            "closest" in e.target &&
                            (a = e.target.closest(o)) &&
                            "a" === a.tagName.toLowerCase() &&
                            !e.target.closest(I.ignore) &&
                            a.hostname === w.location.hostname &&
                            a.pathname === w.location.pathname &&
                            /#/.test(a.href)
                        ) {
                            var t, n
                            try {
                                t = r(decodeURIComponent(a.hash))
                            } catch (e) {
                                t = r(a.hash)
                            }
                            if ((console.log(t), "#" === t)) {
                                if (!I.topOnEmptyHash) return
                                n = document.documentElement
                            } else n = document.querySelector(t)
                            ;(n =
                                n || "#top" !== t
                                    ? n
                                    : document.documentElement) &&
                                (e.preventDefault(),
                                (function(e) {
                                    if (
                                        history.replaceState &&
                                        e.updateURL &&
                                        !history.state
                                    ) {
                                        var t = w.location.hash
                                        ;(t = t || ""),
                                            history.replaceState(
                                                {
                                                    smoothScroll: JSON.stringify(
                                                        e,
                                                    ),
                                                    anchor: t || w.pageYOffset,
                                                },
                                                document.title,
                                                t || w.location.href,
                                            )
                                    }
                                })(I),
                                C.animateScroll(n, a))
                        }
                    },
                    n = function(e) {
                        if (
                            null !== history.state &&
                            history.state.smoothScroll &&
                            history.state.smoothScroll === JSON.stringify(I)
                        ) {
                            var t = history.state.anchor
                            ;("string" == typeof t &&
                                t &&
                                !(t = document.querySelector(
                                    r(history.state.anchor),
                                ))) ||
                                C.animateScroll(t, null, { updateURL: !1 })
                        }
                    }
                C.destroy = function() {
                    I &&
                        (document.removeEventListener("click", t, !1),
                        w.removeEventListener("popstate", n, !1),
                        C.cancelScroll(),
                        (A = M = a = I = null))
                }
                return (
                    (function() {
                        if (
                            !(
                                "querySelector" in document &&
                                "addEventListener" in w &&
                                "requestAnimationFrame" in w &&
                                "closest" in w.Element.prototype
                            )
                        )
                            throw "Smooth Scroll: This browser does not support the required JavaScript methods and browser APIs."
                        C.destroy(),
                            (I = H(L, e || {})),
                            (M = I.header
                                ? document.querySelector(I.header)
                                : null),
                            document.addEventListener("click", t, !1),
                            I.updateURL &&
                                I.popstate &&
                                w.addEventListener("popstate", n, !1)
                    })(),
                    C
                )
            }
        },
    )
    const scrollAnchors = new SmoothScroll('a[href*="#"]', {
        speed: 300,
    })
    const nav_item = document.querySelectorAll(".nav_item")
    nav_item.forEach(item => {
        item.addEventListener("click", () => {
            if (
                btn.classList.contains("menu-btn_active") &&
                mobileMenu.classList.contains("active")
            ) {
                btn.classList.remove("menu-btn_active")
                mobileMenu.classList.remove("active")
            }
        })
    })
})

window.onload = () => {
    document.querySelector("#preloader").classList.remove("active")
    const sectionId = window.location.hash

    if (sectionId) {
        // const hashContent = document.body.querySelector(`${sectionId}`)
        let V = 0.01
        let w = window.pageYOffset, // производим прокрутку
            hash = sectionId.replace(/[^#]*(.*)/, "$1"), // к id элемента, к которому нужно перейти
            t = document.querySelector(`${sectionId}`).getBoundingClientRect()
                .top, // отступ от окна браузера до id
            start = null
        requestAnimationFrame(step) // подробнее про функцию анимации [developer.mozilla.org]
        function step(time) {
            if (start === null) start = time
            let progress = time - start,
                r =
                    t < 0
                        ? Math.max(w - progress / V, w + t)
                        : Math.min(w + progress / V, w + t)
            window.scrollTo(0, r)
            if (r != w + t) {
                requestAnimationFrame(step)
            } else {
                location.hash = hash // URL с хэшем
            }
        }
    }
}
