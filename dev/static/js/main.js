document.addEventListener("DOMContentLoaded", function () {

    // ...микробиблиотека для использования closest
    // function 'closest'
    !(function (e) {
        "function" != typeof e.matches &&
            (e.matches =
                e.msMatchesSelector ||
                e.mozMatchesSelector ||
                e.webkitMatchesSelector ||
                function (e) {
                    for (
                        var t = this,
                        o = (
                            t.document || t.ownerDocument
                        ).querySelectorAll(e),
                        n = 0;
                        o[n] && o[n] !== t;

                    )
                        ++n
                    return Boolean(o[n])
                }),
            "function" != typeof e.closest &&
            (e.closest = function (e) {
                for (var t = this; t && 1 === t.nodeType;) {
                    if (t.matches(e)) return t
                    t = t.parentNode
                }
                return null
            })
    })(window.Element.prototype)

    // мультиэвентлисэнер
    function addListenerMulti(el, s, fn) {
        s.split(" ").forEach(e => el.addEventListener(e, fn, false))
    }
    function isEmpty(str) {
        if (str.trim() == "") return true

        return false
    };
    (() => {
        let isSafari
        window.navigator.vendor.toLowerCase().indexOf("apple") > -1
            ? (isSafari = true)
            : (isSafari = false)
        if (isSafari) {
            document.body.classList.add("safari_browser")
        }
    })()

        // показываем кошелёк и закрываем его при клике вне
        ; (() => {
            const walletBtn = document.body.querySelector(".js_wallet_show")
            const walletBody = document.body.querySelector(".js_account_wallet")
            const hasWallet = document.body
                .querySelector("header")
                .contains(walletBtn)
            if (hasWallet) {
                function toggle(e) {
                    if (e.target.closest(".js_account_wallet") !== null) {
                        return
                    }
                    walletBtn.classList.toggle("active")
                }
                function remove() {
                    walletBtn.classList.remove("active")
                }
                document.body.addEventListener("click", e => {
                    const target = e.target
                    target == walletBtn || target.closest(".js_wallet_show")
                        ? toggle(e)
                        : target !== walletBody
                            ? remove()
                            : false
                })
            }
        })()

    if (document.body.classList.contains("js-pawnshop-offers")) {
        tabs()
        Modal()
    }
    if (document.body.classList.contains("js-pawnshop-main")) {
        //Модалка, в которую подгружатся контент из выбранного элемента(объявления)
        Modal1()
        function Modal1() {
            const openButtons = document.body.querySelectorAll(
                ".js_modal_open",
            ),
                overlay = document.body.querySelector(".js_overlayed_bg"),
                closeButtons = document.body.querySelectorAll(
                    ".js_modal_button_close",
                ),
                body = document.querySelector("body")

            // для тела модалки и конпки прописан дата-атрибут (data-modal=""),
            // при клике на кнопку происходит сравнение атрибутов и выводится модалка с таким же атрибутом
            openButtons.forEach(function (item) {
                item.addEventListener("click", function (e) {
                    e.preventDefault()
                    let modalId = this.getAttribute("data-modal"),
                        modalInnerItem = document.body.querySelector(
                            ".js_modal_copy_cloned",
                        ),
                        modalElem = document.body.querySelector(
                            '.js_modal[data-modal="' + modalId + '"]',
                        ),
                        addElemCopy = this.closest(".inner").children
                    // очищаем модалку при открытии
                    modalInnerItem.innerHTML = ""

                    for (let i = 0; i < addElemCopy.length; i++) {
                        const el = addElemCopy[i]

                        if (el.classList.contains("js_modal_copy")) {
                            // копируем объявление
                            let clonedInnerCard = el.cloneNode(true)
                            //удаляем описание
                            for (
                                let i = 0;
                                i < clonedInnerCard.children.length;
                                i++
                            ) {
                                const el = clonedInnerCard.children[i]
                                if (el.classList.contains("descr")) {
                                    el.remove()
                                }
                            }
                            // вставляем в модалку
                            modalInnerItem.appendChild(clonedInnerCard)
                        }
                    }
                    modalElem.classList.add("active")
                    overlay.classList.add("active")
                    body.classList.add("no-scroll")
                })
            })

            // функции для закрытия модалки
            closeButtons.forEach(function (item) {
                item.addEventListener("click", function (e) {
                    var parentModal = document.body.querySelector(
                        ".js_modal.active",
                    )
                    parentModal.classList.remove("active")
                    overlay.classList.remove("active")
                    body.classList.remove("no-scroll")
                })
            })

            document.body.addEventListener(
                "keyup",
                function (e) {
                    var key = e.keyCode
                    if (key == 27) {
                        document.body
                            .querySelector(".js_modal.active")
                            .classList.remove("active")

                        overlay.classList.remove("active")
                        body.classList.remove("no-scroll")
                    }
                },
                false,
            )

            overlay.addEventListener("click", function (e) {
                var parentModal = document.body.querySelector(
                    ".js_modal.active",
                )
                if (this == e.target) {
                    parentModal.classList.remove("active")
                    this.classList.remove("active")
                    body.classList.remove("no-scroll")
                }
            })
        }
    }


})
// const errorModal = document.querySelector(".js_info_modal.error")
// const errorModalText = document.querySelector(".info-modal__error > p")
// function showModal(text, type) {
//     let modalCloseTimeout
//     if (modalCloseTimeout !== undefined && modalCloseTimeout !== null) {
//         clearTimeout(modalCloseTimeout)
//     }
//     if (type.toLowerCase() === "error") {
//         errorModal.classList.add("active")
//         errorModalText.innerText = text
//         modalCloseTimeout = setTimeout(closeModals, 10000, type)
//     }
// }

// function closeModals(type) {
//     if (type !== undefined) {
//         if (type.toLowerCase() === "error") {
//             errorModal.classList.remove("active")
//             errorModalText.innerText = ""
//         }
//     } else {
//         allModals.forEach(modal => {
//             modal.classList.remove("active")
//         })
//     }
// }
// табы
function tabs() {
    const jsTriggers = document.body.querySelectorAll(".js-tab-trigger")

    jsTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
            const id = this.getAttribute("data-tab"),
                content = document.body.querySelector(
                    '.js-tab-content[data-tab="' + id + '"]',
                ),
                activeTrigger = document.body.querySelector(
                    ".js-tab-trigger.active",
                ),
                activeContent = document.body.querySelector(
                    ".js-tab-content.active",
                )

            activeTrigger.classList.remove("active")
            trigger.classList.add("active")

            activeContent.classList.remove("active")
            content.classList.add("active")
        })
    })
}

// табы со слайдерами

function imageLoading(container_loaded, max) {
    const fileInput = document.getElementById("file-input"), //  инпут с файлами
        delBtn = document.body.querySelector(".del-info"), // кнопка удаления (блок)
        loadedRow = document.getElementById("js-loaded-row") // контейнер предпросмотра файлов
    fileInput.addEventListener("change", handleFileSelect)
    delBtn.addEventListener("click", clearInput, false)
    function clearInput() {
        let loadedImg = document.body.querySelectorAll(`.${container_loaded}`)
        if (loadedImg.length > 0) {
            for (let i = 0; i < loadedImg.length; i++) {
                loadedImg[i].remove()
            }
            fileInput.value = ""
        }
    }

    function handleFileSelect(e) {
        let loadedImg = document.body.querySelectorAll(`.${container_loaded}`)
        let files = e.target.files
        for (let i = 0; i < loadedImg.length; i++) {
            loadedImg[i].remove()
        }
        for (var i = 0; i < files.length; i++) {
            let f = files[i]
            if (!f.type.match("image.*") || !f.type.startsWith("image/")) {
                showModal(`Только изображения в формате .jpg, .png`, "error")
            } else if (f.size > 1024 * 512) {
                showModal(
                    `Только изображения в размере не более 500кб`,
                    "error",
                )
            } else if (files.length > max) {
                showModal(`Не больше ${max} изображений`, "error")
            } else {
                let reader = new FileReader()
                reader.readAsDataURL(f)
                reader.addEventListener("load", function (e) {
                    //Рендер картинки
                    let pic = e.target
                    let imageBox = document.createElement("div")
                    imageBox.classList.add(container_loaded)
                    imageBox.innerHTML = `<img class="thumb" title="${pic.result.name}" src="${pic.result}"/>`
                    loadedRow.insertBefore(imageBox, null)
                })
            }
        }
    }
}

// показывает модалку при нажатии на кнопку js modal open
function Modal() {
    const openButtons = document.body.querySelectorAll(".js_modal_open"),
        overlay = document.body.querySelector(".js_overlayed_bg"),
        closeButtons = document.body.querySelectorAll(".js_modal_button_close"),
        body = document.querySelector("body")

    // для тела модалки и конпки прописан дата-атрибут (data-modal=""),
    // при клике на кнопку происходит сравнение атрибутов и выводится модалка с таким же атрибутом
    openButtons.forEach(function (item) {
        item.addEventListener("click", function (e) {
            e.preventDefault()
            var modalId = this.getAttribute("data-modal"),
                modalElem = document.body.querySelector(
                    '.js_modal[data-modal="' + modalId + '"]',
                )
            modalElem.classList.add("active")
            overlay.classList.add("active")
            body.classList.add("no-scroll")
        })
    })

    closeButtons.forEach(function (item) {
        item.addEventListener("click", function (e) {
            var parentModal = document.body.querySelector(".js_modal.active")
            parentModal.classList.remove("active")
            overlay.classList.remove("active")
            body.classList.remove("no-scroll")
        })
    })

    document.body.addEventListener(
        "keyup",
        function (e) {
            var key = e.keyCode
            if (key == 27) {
                document.body
                    .querySelector(".js_modal.active")
                    .classList.remove("active")

                overlay.classList.remove("active")
                body.classList.remove("no-scroll")
            }
        },
        false,
    )

    overlay.addEventListener("click", function (e) {
        var parentModal = document.body.querySelector(".js_modal.active")
        if (this == e.target) {
            parentModal.classList.remove("active")
            this.classList.remove("active")
            body.classList.remove("no-scroll")
        }
    })

    document.body.querySelectorAll(".js_switch_modal").forEach(function (item) {
        var event = item.getAttribute("data-event")

        item.addEventListener(event, function (e) {
            e.preventDefault()
            var currentModal = this.closest(".js_modal").getAttribute(
                "data-modal",
            ),
                currentModalEl = document.body.querySelector(
                    '.js_modal[data-modal="' + currentModal + '"]',
                ),
                nextModal = this.getAttribute("data-next-modal"),
                nextModalEl = document.body.querySelector(
                    '.js_modal[data-modal="' + nextModal + '"]',
                )

            currentModalEl.classList.remove("active")
            nextModalEl.classList.add("active")
        })
    })
}

/// показывает\скрывает отзывы
function seeMore() {
    const showButtons = document.body.querySelectorAll(".js_button_seemore")
    if (showButtons !== null || showButtons !== undefined) {
        showButtons.forEach(button => {
            // console.log(button)
            button.addEventListener("click", e => {
                e.preventDefault()
                const showBox = e.target.nextElementSibling
                const buttonArrow = e.target.lastChild
                // e.target.closest('.js_replays_box')
                if (showBox.classList.contains("active")) {
                    showBox.classList.remove("active")
                    buttonArrow.classList.remove("active")
                } else {
                    showBox.classList.add("active")
                    showBox.scrollIntoView({ behavior: "smooth" })
                    buttonArrow.classList.add("active")
                }
            })
        })
    }
}



function openMenu(button, boxes) {
    const openButton = document.body.querySelector(button)
    openButton.addEventListener("click", e => {
        const showBox = document.body.querySelectorAll(boxes)
        e.preventDefault()
        showBox.forEach(function (box) {
            box.classList.toggle("js_active_menu")
        })
        openButton.classList.toggle("js_active_menu")
    })
}

function pagePagination(item, paginator) {
    var count = document.body.querySelectorAll(item).length //всего записей
    var maxElements = 5 //сколько отображаем сначала
    var pagesNumber = Math.ceil(count / maxElements) //кол-во страниц
    //выводим список страниц
    var paginator = document.body.querySelector(paginator)
    var page = ""
    if (
        item !== undefined &&
        item !== null &&
        paginator !== undefined &&
        paginator !== null
    ) {
        for (var i = 0; i < pagesNumber; i++) {
            page +=
                "<span data-page=" +
                i * maxElements +
                '  id="page' +
                (i + 1) +
                '">' +
                (i + 1) +
                "</span>"
        }
        paginator.innerHTML = page

        //выводим первые записи {maxElements}
        var div_num = document.body.querySelectorAll(item)
        for (var i = 0; i < div_num.length; i++) {
            if (i < maxElements) {
                div_num[i].style.display = "flex"
            } else {
                div_num[i].style.display = "none"
            }
        }

        var main_page = document.getElementById("page1")
        main_page.classList.add("paginator_active")

        //листаем
        function pagination(event) {
            var e = event || window.event
            var target = e.target
            var id = target.id

            if (target.tagName.toLowerCase() != "span") return

            var num_ = id.substr(4)
            var data_page = +target.dataset.page
            main_page.classList.remove("paginator_active")
            main_page = document.getElementById(id)
            main_page.classList.add("paginator_active")

            var j = 0
            for (var i = 0; i < div_num.length; i++) {
                var data_num = div_num[i].dataset.num
                if (data_num <= data_page || data_num >= data_page)
                    div_num[i].style.display = "none"
            }
            for (var i = data_page; i < div_num.length; i++) {
                if (j >= maxElements) break
                div_num[i].style.display = "flex"
                j++
            }
        }
    }
    // Переключение страниц
    paginator.addEventListener("click", function () {
        pagination(event)
    })
    // добавляем атрибуты всем элементам
    div_num.forEach((div, index) => {
        div.setAttribute("data-num", index)
    })
}
// для работы с лэйблом в инпуте
function hideLabel() {
    const inputs = document.body.querySelectorAll(".js_input_hide_label")
    inputs.forEach(input => {
        input.addEventListener("click", hideLabel)
        input.addEventListener("focusout", function () {
            if (input.value !== "") {
                hideLabel()
            } else {
                showLabel()
            }
        })
        function hideLabel(e) {
            input.previousElementSibling.classList.remove("active")
            input.previousElementSibling.classList.add("hidden")
        }
        function showLabel() {
            input.previousElementSibling.classList.remove("hidden")
            input.previousElementSibling.classList.add("active")
        }
    })
}
//обрезка текста
function cropText(box, numberSymbols) {
    const cropElement = document.body.querySelectorAll(box), // выбор элементов
        size = numberSymbols, // кол-во символов
        endCharacter = ".." // окончание

    cropElement.forEach(el => {
        let text = el.innerHTML

        if (el.innerText.length > size) {
            text = text.substr(0, size)
            el.setAttribute("title", el.innerHTML)
            el.innerHTML = text.trim() + endCharacter
        }
    })
}

function scrollToTop() {
    const arrowTop = document.body.querySelector("#arrow_top")
    // скрываем на первом экране
    window.addEventListener("scroll", function () {
        if (pageYOffset > document.documentElement.clientHeight) {
            arrowTop.classList.add("active")
        } else {
            arrowTop.classList.remove("active")
        }
    })
    var scrolled
    var timer
    arrowTop.addEventListener("click", function () {
        scrolled = window.pageYOffset
        //window.scrollTo(0,0);
        scroll()
    })
    function scroll() {
        if (scrolled > 0) {
            window.scrollTo(0, scrolled)
            scrolled = scrolled - 100 // прокрутка по 100 px
            timer = setTimeout(scroll, 10) //  каждые 10мс.
        } else {
            clearTimeout(timer)
            window.scrollTo(0, 0)
        }
    }
}

const inputsDigit = document.querySelectorAll(".input_digit")
if (
    inputsDigit.length > 0 &&
    inputsDigit !== null &&
    inputsDigit !== undefined
) {
    formatInputs(inputsDigit)
}
function formatInputs(inputs) {
    inputs.forEach(input => {
        input.addEventListener("change", () => {
            input.value = parseFloat(+input.value).toFixed(8)
        })
        input.addEventListener("input", () => {
            // только одна точка
            input.value = input.value.replace(/(^[^.]*.)|[.]+/g, "$1")
            // и без пробелов
            input.value = input.value.replace(/\s/g, "")
            // и только цифры
            input.value = input.value.replace(/[^\d.]/g, "")
        })
    })
}

const inputs = document.body.querySelectorAll('input[type="number"]')
inputs.forEach(input => {
    input.addEventListener("mousewheel", e => {
        e.preventDefault
    })
})