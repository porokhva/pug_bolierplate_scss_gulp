document.addEventListener("DOMContentLoaded", function() {
    //подсветка страницы на которой находишься в основном сайдбаре
    mainsidebarActivePage()
    document.querySelector("#preloader").classList.remove("active")

    // ...микробиблиотека для использования closest
    // function 'closest'
    !(function(e) {
        "function" != typeof e.matches &&
            (e.matches =
                e.msMatchesSelector ||
                e.mozMatchesSelector ||
                e.webkitMatchesSelector ||
                function(e) {
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
                (e.closest = function(e) {
                    for (var t = this; t && 1 === t.nodeType; ) {
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

    ;(() => {
        let isSafari
        window.navigator.vendor.toLowerCase().indexOf("apple") > -1
            ? (isSafari = true)
            : (isSafari = false)
        if (isSafari) {
            document.body.classList.add("safari_browser")
        }
    })()

    // показываем кошелёк и закрываем его при клике вне
    ;(() => {
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
    ;(() => {
        const closeButtons = document.querySelectorAll(".info-modal__close-btn")
        if (closeButtons) {
            closeButtons.forEach((btn, e) => {
                btn.addEventListener("click", function(e) {
                    e.target
                        .closest(".js_info_modal")
                        .classList.remove("active")
                })
            })
        }
    })()

    if (document.body.classList.contains("js-pawnshop-add")) {
        const inputsNumber = document.body.querySelectorAll(".input_number")
        formatInputs(inputsNumber)
        const valueBox = document.querySelector(".js_currency_value")
        let currencyPawnshopSelect = document.querySelector(
            "select.pawnshop_add_currency",
        )
        let outputValue = valueBox
        currencyPawnshopSelect.addEventListener("change", e => {
            valueBox.innerText = e.target.value.toUpperCase()
        })
        //берёт значение из селекта, и подставляет в поле "Вы переводите". в CSS трансформируется в верхний регистр
        let options = currencyPawnshopSelect.children
        for (let i = 0; i < options.length; i++) {
            const opt = options[i]
            if (opt.selected === true) {
                valueBox.innerText = opt.getAttribute("value")
            }
        }
        valueBox.innerText = currencyPawnshopSelect.value.toUpperCase()
    }
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
            openButtons.forEach(function(item) {
                item.addEventListener("click", function(e) {
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
            closeButtons.forEach(function(item) {
                item.addEventListener("click", function(e) {
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
                function(e) {
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

            overlay.addEventListener("click", function(e) {
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

    if (document.body.classList.contains("js-multi-transact")) {
        const regExp = new RegExp("/^[0]?[0-9]+[.]?[0-9]/")
        function isEmpty(str) {
            if (str.trim() == "") return true

            return false
        }
        // создание календаря в инпутах
        let inputDateFrom = document.getElementById("order-date-from")
        let inputDateTo = document.getElementById("order-date-to")
        let inputFrom = new Lightpick({
            format: "L",
            field: inputDateFrom,
            secondField: inputDateTo,
            singleDate: false,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.one
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other

                    return ""
                },
            },
            onSelect: function(start, end) {
                inputDateFrom.value = start.format("L")
                inputDateTo.value = end.format("L")
            },
        })
        // поиск по email или логину
        const searchType = document.body.querySelectorAll(
                'input[name="typeSearch"]',
            ),
            loginInput = document.body.querySelector(".js_input_login"),
            inputs = document.body.querySelectorAll(".input__search"),
            emailInput = document.body.querySelector(".js_input_email")

        searchType.forEach(type => {
            type.addEventListener("change", changeInput)
        })
        function changeInput(e) {
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i]
                input.value = ""
            }
            const type = e.target
            let email = type.classList.contains("js_search_email")
            let login = type.classList.contains("js_search_login")

            if (email) {
                loginInput.classList.remove("active")
                emailInput.classList.add("active")
            }
            if (login) {
                emailInput.classList.remove("active")
                loginInput.classList.add("active")
            }
        }

        // При выборе валюты меняются значения в поле "Вы переводите" на введённую сумму и валюту
        const outputMoney = document.body.querySelector("#output_number_val"),
            outputValute = document.body.querySelector("#output_valute_val"),
            inputMoney = document.body.querySelector("#input_number_val"),
            inputValute = document.body.querySelector("#transact-valute"),
            sendFormBtn = document.body.querySelector("#send_form_btn")
        let numberMask = IMask(inputMoney, {
            mask: /^(0|[1-9]\d*)([.]?\d+)?/,
            min: 1,
            max: 99999999999999999999,
        })
        inputMoney.addEventListener("blur", formatInputTransact)
        inputMoney.addEventListener("input", calcPercent)
        function formatInputTransact() {
            if (isEmpty(inputMoney.value)) {
                inputMoney.value = ""
                return
            } else {
                inputMoney.value = inputMoney.value.replace(regExp, "")
                inputMoney.value = parseFloat(inputMoney.value).toFixed(8)
            }
        }
        function calcPercent(e) {
            // только одна точка
            let currentInput = e.target
            if (isEmpty(currentInput.value)) {
                outputMoney.innerText = "0.00000000"
                return
            }
            currentInput.value = currentInput.value.replace(/\s+/g, "")
            currentInput.value = currentInput.value.replace(
                /(^[^.]*.)|[.]+/g,
                "$1",
            )
            currentInput.value = currentInput.value.replace(/[^\d.]/g, "")

            // и без пробелов
            let value = +e.target.value
            // процент за использование сервисом 5%
            let percentRent = +1.05
            let valueOutput = value * percentRent
            outputMoney.innerText = valueOutput.toFixed(8)
        }

        setValute()
        inputValute.addEventListener("change", setValute)
        function setValute(e) {
            //берёт значение из селекта, и подставляет в поле "Вы переводите". в CSS трансформируется в верхний регистр
            let options = inputValute.children
            for (let i = 0; i < options.length; i++) {
                const opt = options[i]
                if (opt.selected === true) {
                    outputValute.innerText = opt.getAttribute("data-name")
                }
            }
        }
        Modal()
    }

    if (document.body.classList.contains("js-multi-bonus")) {
        tabs()

        //создание ползунка выбора количества месяцев
        let slider = document.body.querySelector("#slider-range-calc"),
            monthValue = document.body.querySelector("#term-value"),
            monthText = document.body.querySelector("#term-text")
        noUiSlider.create(slider, {
            start: [1],
            connect: [true, false],
            range: {
                min: [1],
                max: [36],
            },
        })
        slider.noUiSlider.on("update", function(values, handle) {
            let number = Math.trunc(values[handle])

            if (handle) {
                monthValue.innerText = Math.trunc(values[handle])
                monthValue.setAttribute("data-value-month", number)
                changeText(number)
            } else {
                monthValue.innerText = Math.trunc(values[handle])
                monthValue.setAttribute("data-value-month", number)
                changeText(number)
            }
        })

        //изменение текстав зависимости от количества месяцев
        function changeText(number) {
            if (number == 1) {
                monthText.innerText = "месяц"
            }
            if (number == 21) {
                monthText.innerText = "месяц"
            }
            if (number == 31) {
                monthText.innerText = "месяц"
            }
            if (number > 1 && number < 5) {
                monthText.innerText = "месяца"
            }
            if (number >= 5 && number < 21) {
                monthText.innerText = "месяцев"
            }
            if (number > 21 && number < 25) {
                monthText.innerText = "месяца"
            }
            if (number >= 25 && number < 31) {
                monthText.innerText = "месяцев"
            }
            if (number > 31 && number < 35) {
                monthText.innerText = "месяца"
            }
            if (number >= 35 && number < 37) {
                monthText.innerText = "месяцев"
            }
        }

        const inputMoney = document.body.querySelector("#value-money"),
            btn = document.body.querySelector("#btn-calc"),
            inputMonth = document.body.querySelector("#term-value"),
            inputOut = document.body.querySelector("#value-output")

        let numberMask = IMask(inputMoney, {
            mask: Number,
            min: 0,
            max: 10000000,
            radix: ".",
            scale: 8, // digits after point, 0 for integers
            signed: false,
            mapToRadix: ["."],
            thousandsSeparator: "",
        })

        btn.addEventListener("click", calc)
        inputMoney.addEventListener("input", calc2)

        // запуск функции пересчёта бонусов с добавлением анимации
        function calc2() {
            if (event.keyCode == 13) {
                event.preventDefault()
                inputOut.classList.remove("flash")
                window.setTimeout(calcValue, 0)
            }
        }
        // запуск функции пересчёта бонусов с добавлением анимации
        function calc() {
            inputOut.classList.remove("flash")
            window.setTimeout(calcValue, 0)
        }
        function isEmpty(str) {
            if (str.trim() == "") return true

            return false
        }
        const regExp = new RegExp("/^[0]?[0-9]+[.]?[0-9]+/")
        function calcValue() {
            let valueMoney = inputMoney.value
                    .replace(/\s/g, "")
                    .replace(/(^[^.]*.)|[.]+/g, "$1"),
                valueMonth = inputMonth.getAttribute("data-value-month"),
                valueDays = valueMonth * 30.4
            // и умножаем на выбранное кол-во месяцев
            if (isEmpty(valueMoney)) {
                inputMoney.focus()
                inputMoney.classList.add("focus")
                return
            }
            if (!parseFloat(+inputMoney.value)) {
                inputMoney.value = inputMoney.value.replace(regExp, "")
            }
            inputMoney.value = inputMoney.value.replace(/\s+/g, "")

            const daylyIncrease = 0.002

            let sum = JSON.parse(JSON.stringify(valueMoney))

            for (var i = 0; i < valueDays; i++) {
                sum = sum * (1 + daylyIncrease) // на наждой итерации цикла(один месяц) умножаем значение введённой суммы на 0.2%
                console.log(sum)
            }
            let outputValue = sum - valueMoney // отнимаем значение начальной суммы
            inputOut.innerText = outputValue.toFixed(3) //  Отображаем полученное значение с округлением до 3х знаков после запятой
            inputOut.classList.add("flash")
        }
    }

    if (document.body.classList.contains("js-multi-history")) {
        // создание календаря в инпутах
        let inputDateFrom = document.getElementById("order-date-from")
        let inputDateTo = document.getElementById("order-date-to")
        let inputFrom = new Lightpick({
            format: "L",
            field: inputDateFrom,
            secondField: inputDateTo,
            singleDate: false,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.one
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other

                    return ""
                },
            },
            onSelect: function(start, end) {
                inputDateFrom.value = start.format("L")
                inputDateTo.value = end.format("L")
            },
        })
    }

    if (document.body.classList.contains("js-partners-index")) {
        let tree = document.body.querySelector(".js_tree")
        if (tree) {
            tree.querySelectorAll(".js_box > .arrow").forEach(arrow => {
                arrow.addEventListener("click", () => {
                    arrow.classList.toggle("active")
                    let inner = arrow.parentElement.children

                    for (let i = 0; i < inner.length; i++) {
                        if (inner[i].classList.contains("tree-item__sub")) {
                            inner[i].classList.toggle("active")
                        }
                    }
                    for (let i = 0; i < inner.length; i++) {
                        if (inner[i].classList.contains("inner")) {
                            inner[i].classList.toggle("active")
                        }
                    }
                })
            })
        }

        const textarea = document.getElementById("js_text_area")
        const copyButton = document.getElementById("js_copy_button")
        if (copyButton) {
            copyButton.addEventListener("click", function(e) {
                // Выделяем текст в поле
                textarea.select()
                // Копируем текст в буфер обмена
                document.execCommand("copy")
            })
        }
    }

    if (document.body.classList.contains("js-market-balance")) {
        // let confirmInput = IMask(document.querySelector('.js_confirm_input'), {mask: /^[0-9]\d{0,4}$/});
        tabs()
    }
    if (document.body.classList.contains("js-market-orders")) {
        tabs()
        let inputDateFrom = document.getElementById("order-date-from")
        let inputDateTo = document.getElementById("order-date-to")

        let inputFrom = new Lightpick({
            format: "L",
            field: inputDateFrom,
            secondField: inputDateTo,
            singleDate: false,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.one
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other
                    return ""
                },
            },
            onSelect: function(start, end) {
                inputDateFrom.value = start.format("L")
                inputDateTo.value = end.format("L")
            },
        })
    }
    if (document.body.classList.contains("js-account-profile")) {
        avatarChange("image--loaded", 1)
        function avatarChange(container_loaded, max) {
            const fileInput = document.getElementById("file-input"), //  инпут с файлами
                delBtn = document.body.querySelector(".del-info"), // кнопка удаления (блок)
                submitBtn = document.body.querySelector("#submit_btn") // кнопка отправки формы

            let avatarImg = document.querySelector(".default-image")
            let defaultImg = avatarImg.getAttribute("src")

            fileInput.addEventListener("change", handleFileSelect)

            function clearInput() {
                avatarImg.setAttribute("src", defaultImg)
                avatarImg.setAttribute("title", "Стандартный аватар")
                fileInput.value = ""
                delBtn.classList.remove("active")
                submitBtn.classList.remove("active")
            }
            function handleFileSelect(e) {
                let files = e.target.files // объект с файлами
                let loadedImg = document.body.querySelectorAll(
                    `.${container_loaded}`,
                )
                for (let i = 0; i < loadedImg.length; i++) {
                    // очищаем отображенные картинки
                    loadedImg[i].remove()
                }
                // цикл рендерящий изображения из объекта file
                for (var i = 0; i < files.length; i++) {
                    let f = files[i]
                    if (!f.type.match("image.*")) {
                        showModal(
                            `Только картинки в формате .jpg, .png`,
                            "error",
                        )
                    } else if (f.size > 1024 * 512) {
                        showModal(
                            `Только изображения в размере не более 500кб`,
                            "error",
                        )
                    } else if (files.length > max) {
                        showModal(`Не больше ${max} изображений`, "error")
                    } else {
                        let reader = new FileReader()

                        reader.addEventListener("load", function(e) {
                            //Рендер картинки
                            let pic = e.target
                            avatarImg.setAttribute("src", `${pic.result}`)
                            avatarImg.setAttribute(
                                "title",
                                `${escape(pic.result.name)}`,
                            )
                            // let imageBox = document.createElement("div")
                            // imageBox.classList.add(container_loaded)
                            // imageBox.innerHTML = [
                            //     '<img class="thumb" title="',
                            //     escape(pic.result.name),
                            //     '" src="',
                            //     pic.result,
                            //     '" />',
                            // ].join("")
                            // loadedRow.insertBefore(imageBox, null)
                        })
                        //читает дата-урл файла
                        reader.readAsDataURL(f)
                        delBtn.addEventListener("click", clearInput, false)

                        delBtn.classList.add("active")
                        submitBtn.classList.add("active")
                    }
                }
            }
        }
        function isEmpty(str) {
            if (str.trim() == "") return true

            return false
        }
        Modal()
        const inputNum = document.getElementById("input-num-id"),
            inputPhone = document.getElementById("phone-num"),
            inputNumMask = IMask(inputNum, { mask: /^[0-9]\d{0,10}$/ }),
            inputMentor = document.getElementById("input-num-mentor"),
            maskPhone = IMask(inputPhone, {
                mask: "+num",
                blocks: {
                    num: {
                        // nested masks are available!
                        mask: Number,
                    },
                },
            }),
            // maskPhone = IMask(inputPhone, { mask: "+{7}(000)000-00-00" }),
            inputBirth = document.getElementById("birthday-input"),
            inputDateCreate = document.getElementById("create-date")

        let inputBirthCal = new Lightpick({
            format: "L",
            field: inputBirth,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.oneprofile
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other

                    return ""
                },
            },
            onOpen: function(date) {
                inputBirth.classList.add("focus")
            },
            onSelect: function(date) {
                inputBirth.value = date.format("L")
            },
            onClose: () => {
                inputBirth.classList.remove("focus")
            },
        })

        let frameDateCal = new Lightpick({
            format: "L",
            field: inputDateCreate,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.one
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other

                    return ""
                },
            },
            onOpen: function(date) {
                inputDateCreate.classList.add("focus")
            },
            onSelect: function(date) {
                inputDateCreate.value = date.format("L")
            },
            onClose: () => {
                inputDateCreate.classList.remove("focus")
            },
        })

        const formSettings = document.body.querySelector("[name=main-settings]")
        const formPassword = document.body.querySelector(
            "[name=password-settings]",
        )
        const mailPattern = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,5}$/i
        const errorSettings = document.body.querySelector(".error-settings")
        const errorPassword = document.body.querySelector(".error-password")
        const passwordNew = document.getElementById("new1")
        const confirmPasswordNew = document.getElementById("new2")

        let isCompliteForm

        function formError() {
            passwordNew.classList.add("error")
            confirmPasswordNew.classList.add("error")
            errorPassword.classList.add("active")
            isCompliteForm = false
            // "border: 2px solid #ed193f";
        }
        function formClear() {
            passwordNew.classList.remove("error")
            confirmPasswordNew.classList.remove("error")
            errorPassword.classList.remove("active")
            isCompliteForm = true
        }
        passwordNew.addEventListener("input", e => {
            validateFormPassword(e)
        })
        confirmPasswordNew.addEventListener("input", e => {
            validateFormPassword(e)
        })

        const validateFormPassword = e => {
            // значение форм сравниваем по id и значению
            let errors = []
            if (passwordNew.value.length < 8 && passwordNew.value.length > 0) {
                errors.push(
                    "<span>Пароль должен содержать не менее чем 8 символов!</span>",
                )
                formError()
            } else if (
                passwordNew.value.length === 0 &&
                confirmPasswordNew.value.length === 0
            ) {
                formClear()
                errors.push("")
            } else if (
                passwordNew.value.length === confirmPasswordNew.value.length
            ) {
                formClear()
                errors.push("")
            } else if (
                passwordNew.value != confirmPasswordNew.value &&
                (passwordNew.value.length !== 0 ||
                    confirmPasswordNew.value.length !== 0)
            ) {
                errors.push("<span>Введённые пароли не совпадают</span>")
                formError()
            } else if (
                confirmPpasswordNew.value.length < 8 &&
                confirmPpasswordNew.value.length > 0
            ) {
                errors.push(
                    "<span>Пароль должен содержать не менее чем 8 символов!</span>",
                )
                formError()
            }

            errorPassword.innerHTML = errors.join("")
        }

        formPassword.addEventListener("submit", e => {
            if (!isCompliteForm) {
                e.preventDefault()
                errorPassword.innerHTML =
                    "<span>Заполните форму паролей, чтобы продолжить</span>"
                return
            }
        })

        const validateFormSettings = e => {
            e.preventDefault()
            let form = e.target.form,
                errors = {}

            if (isEmpty(form.email.value)) {
                errors.email = null
                errorSettings.classList.remove("active")
                form.email.style = "border: 2px solid transparent"
            }
            if (!isEmpty(form.email.value)) {
                if (!mailPattern.test(form.email.value.trim())) {
                    errors.email = "<span>Введите валидный e-mail!</span>"
                    form.email.style = "border-color: #ed193f"
                } else {
                    errorSettings.classList.remove("active")
                }
            }
            if (inputPhone.value.length !== 0) {
                if (inputPhone.value.length < 10) {
                    errors.phone =
                        "<span>Введите корректный номер телефона</span>"
                    inputPhone.style = "border-color: rgb(237, 25, 63);"
                } else {
                    inputPhone.style = "border-color: transparent;"
                    errors.phone = null
                    errorSettings.classList.remove("active")
                }
                if (inputPhone.value.length >= 20) {
                    inputPhone.value = inputPhone.value.slice(0, 20)
                }
            } else if (inputPhone.value.length === 0) {
                errors.phone = null
                errorSettings.classList.remove("active")
                inputPhone.style = "border-color: transparent;"
            } else {
                errorSettings.classList.remove("active")
            }

            inputMentor.addEventListener("input", () => {
                // console.log(inputMentor.value.length)
                if (inputMentor.value.length >= 31) {
                    return
                }
                // без пробелов
                inputMentor.value = inputMentor.value.replace(/\s/g, "")
            })

            // console.log(errors, "errors")
            errorSettings.innerHTML = `${errors.phone ? errors.phone : ""} ${
                errors.email ? errors.email : ""
            }`
            if (errors.phone !== null || errors.email !== null) {
                errorSettings.classList.add("active")
            }
        }
        formSettings.addEventListener("change", validateFormSettings)

        let imgUpdInput = document.body.querySelector("#photo-update")
        // console.log(imgUpdInput)
        imgUpdInput.addEventListener("change", updateImg)
        function updateImg() {
            let form = document.forms.js_change_account_img
            form.submit()
        }
    }

    if (document.body.classList.contains("js-travel-tour")) {
        let tour = new Swiper(".tour-slider__wrapper", {
            draggable: false,
            spaceBetween: 10,
            observer: true,
            slidesPerView: 1,
            observeParents: true,
            navigation: {
                nextEl: ".item-slider__button-next",
                prevEl: ".item-slider__button-prev",
            },
        })
        Modal()
        seeMore()
        cropText(".info-descr", 150)
        // rangeSlider()
    }
    if (document.body.classList.contains("js-travel-main")) {
        // tabs();
        cropText(".info-descr", 150)
        scrollToTop()
        rangeSlider()
    }

    if (document.body.classList.contains("js-start-create")) {
        Modal()
        let inputNum = IMask(document.getElementById("input-num-ud"), {
            mask: "000000000000",
        })
        let inputIIN = IMask(document.getElementById("input-num-iin"), {
            mask: "000000000000",
        })
        let mask = IMask(document.getElementById("phone-number"), {
            mask: Number,
        })
        let inputBirth = document.getElementById("birthday-input")
        let inputFrameDate = document.getElementById("frame-date")
        let inputBirthCal = new Lightpick({
            format: "L",
            field: inputBirth,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.one
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other

                    return ""
                },
            },
            onOpen: function(date) {
                inputBirth.classList.add("focus")
            },
            onSelect: function(date) {
                inputBirth.value = date.format("L")
            },
            onClose: () => {
                inputBirth.classList.remove("focus")
            },
        })
        let frameDateCal = new Lightpick({
            format: "L",
            field: inputFrameDate,
            lang: "ru",
            locale: {
                tooltip: {
                    one: "день",
                    few: "дня",
                    many: "дней",
                },
                pluralize: function(i, locale) {
                    if ("one" in locale && i % 10 === 1 && !(i % 100 === 11))
                        return locale.one
                    if (
                        "few" in locale &&
                        i % 10 === Math.floor(i % 10) &&
                        i % 10 >= 2 &&
                        i % 10 <= 4 &&
                        !(i % 100 >= 12 && i % 100 <= 14)
                    )
                        return locale.few
                    if (
                        "many" in locale &&
                        (i % 10 === 0 ||
                            (i % 10 === Math.floor(i % 10) &&
                                i % 10 >= 5 &&
                                i % 10 <= 9) ||
                            (i % 100 === Math.floor(i % 100) &&
                                i % 100 >= 11 &&
                                i % 100 <= 14))
                    )
                        return locale.many
                    if ("other" in locale) return locale.other

                    return ""
                },
            },
            onOpen: function(date) {
                inputFrameDate.classList.add("focus")
            },
            onSelect: function(date) {
                inputFrameDate.value = date.format("L")
            },
            onClose: () => {
                inputFrameDate.classList.remove("focus")
            },
        })
        let projectDescrText = document.querySelector(".table-item__input.text")
        projectDescrText.addEventListener("input", e => {
            if (projectDescrText.value.lenth > 500) {
                console.log("ololo")
            }
        })
        let rewardsValute = document.querySelectorAll(".js_reward_valute")
        let startCurrencySelect = document.getElementById("input_start_valute")
        startCurrencySelect.addEventListener("change", e => {
            let text = e.target.value.toUpperCase()
            for (let i = 0; i < rewardsValute.length; i++) {
                const reward = rewardsValute[i]
                reward.innerText = text
            }
        })
        let option = startCurrencySelect.children[0]
        for (let i = 0; i < rewardsValute.length; i++) {
            const reward = rewardsValute[i]
            reward.innerText = option.getAttribute("value").toUpperCase()
        }
    }
    if (document.body.classList.contains("js-start-myprojects")) {
        // урезание строки описания
        cropText(".js_text_crop", 65)
        cropText(".js_title_crop", 50)
    }
    if (document.body.classList.contains("js-start-main")) {
        Modal()
        // урезание строки описания
        cropText(".js_text_crop", 65)
        cropText(".js_title_crop", 50)
    }
    if (document.body.classList.contains("js-start-project")) {
        let projectThumbs = new Swiper(".item-slider__wrapper--thumbs", {
            slidesPerView: 5,
            draggable: true,
            observer: true,
            observeParents: true,
        })

        let project = new Swiper(".item-slider", {
            draggable: false,
            observer: true,
            spaceBetween: 10,
            thumbs: {
                swiper: projectThumbs,
            },
            navigation: {
                nextEl: ".item-slider__button-next",
                prevEl: ".item-slider__button-prev",
            },
        })
        let inputRewards = document.querySelectorAll('input[type="number"]')
        if (inputRewards !== null && inputRewards !== undefined) {
            formatInputs(inputRewards)
        }
        // Modal();
        tabs()
    }
    if (document.body.classList.contains("js-start-modal")) {
        const openButtons = document.body.querySelectorAll(".js_modal_open"),
            overlay = document.body.querySelector(".js_overlayed_bg"),
            closeButtons = document.body.querySelectorAll(
                ".js_modal_button_close",
            ),
            body = document.querySelector("body")

        openButtons.forEach(function(item) {
            item.addEventListener("click", function(e) {
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
        closeButtons.forEach(function(item) {
            item.addEventListener("click", function(e) {
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
            function(e) {
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

        overlay.addEventListener("click", function(e) {
            var parentModal = document.body.querySelector(".js_modal.active")
            if (this == e.target) {
                parentModal.classList.remove("active")
                this.classList.remove("active")
                body.classList.remove("no-scroll")
            }
        })
        document.body
            .querySelectorAll(".js_switch_modal")
            .forEach(function(item) {
                var event = item.getAttribute("data-event")

                item.addEventListener(event, function(e) {
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
    if (document.body.classList.contains("js-start-clearinput")) {
        ;(function clearPrevImgInput() {
            function handleFileSelect(e) {
                const files = e.target.files, // FileList object
                    loadBox = document.body.querySelector(".js-loaded-imgPrev"), //
                    loaded = loadBox.childNodes,
                    btn = document.body.querySelector(".js_clear_imgPrev")

                let output = []
                for (var i = 0, f; (f = files[i]); i++) {
                    let reader = new FileReader()
                    // console.log(f)
                    if (files.length > 10) {
                        showModal(
                            "Вы можете загрузить не более 10 изображений",
                            "error",
                        )
                    } else {
                        reader.onload = (function(theFile) {
                            if (!theFile.type.match("image.*")) {
                                showModal(
                                    `Только изображения в формате .jpg, .png`,
                                    "error",
                                )
                            } else if (theFile.size > 1024 * 512) {
                                showModal(
                                    "Вы можете загрузить изображениe размером не более 500кб",
                                    "error",
                                )
                            } else {
                                return function(e) {
                                    output.push(
                                        "<span>" + theFile.name + "</span>",
                                    )
                                    let loaded = document.createElement("div")
                                    loaded.classList.add("loaded")
                                    loaded.innerHTML = output.join("")
                                    loadBox.insertAdjacentElement(
                                        "afterbegin",
                                        loaded,
                                    )
                                    output = []
                                }
                            }
                        })(f)
                        reader.readAsText(f)
                    }
                }
                btn.addEventListener("click", () => {
                    while (loadBox.lastChild) {
                        loadBox.removeChild(loadBox.lastChild)
                    }
                })
            }
            const inputImg = document.getElementById("file-load--imgPrev")
            inputImg.addEventListener("change", handleFileSelect, false)
        })()
        ;(function clearPresentationInput() {
            function handleFileSelect(e) {
                const files = e.target.files, // FileList object
                    loadBox = document.body.querySelector(".js-loaded-img"), //
                    loaded = loadBox.childNodes,
                    btn = document.body.querySelector(".js_clear_img")

                let output = []
                if (files.length > 10) {
                    showModal(
                        "Вы можете загрузить не более 10 изображений",
                        "error",
                    )
                } else {
                    for (var i = 0, f; (f = files[i]); i++) {
                        let reader = new FileReader()

                        reader.onload = (function(theFile) {
                            if (!theFile.type.match("image.*")) {
                                showModal(
                                    `Только изображения в формате .jpg, .png`,
                                    "error",
                                )
                            } else if (theFile.size > 1024 * 512) {
                                showModal(
                                    "Вы можете загрузить изображение размером не более 500кб",
                                    "error",
                                )
                            } else {
                                return function(e) {
                                    output.push(
                                        "<span>" + theFile.name + "</span>",
                                    )
                                    let loaded = document.createElement("div")
                                    loaded.classList.add("loaded")
                                    loaded.innerHTML = output.join("")
                                    loadBox.insertAdjacentElement(
                                        "afterbegin",
                                        loaded,
                                    )
                                    output = []
                                }
                            }
                        })(f)
                        reader.readAsText(f)
                    }
                }

                btn.addEventListener("click", () => {
                    while (loadBox.lastChild) {
                        loadBox.removeChild(loadBox.lastChild)
                    }
                })
            }
            const inputImg = document.getElementById("file-load--img")
            inputImg.addEventListener("change", handleFileSelect, false)
        })()
        ;(function clearPresentationInput() {
            function handleFileSelect(e) {
                const files = e.target.files, // FileList object
                    loadBox = document.body.querySelector(
                        ".js-loaded-presentation",
                    ), //
                    loaded = loadBox.childNodes,
                    btn = document.body.querySelector(".js_clear_presentation")

                let output = []
                for (var i = 0, f; (f = files[i]); i++) {
                    let reader = new FileReader()

                    reader.onload = (function(theFile) {
                        if (theFile.size > 1024 * 2048) {
                            showModal(
                                "Вы можете загрузить презентацию размером не более 2Мб",
                                "error",
                            )
                        } else {
                            return function(e) {
                                output.push("<span>" + theFile.name + "</span>")
                                let loaded = document.createElement("div")
                                loaded.classList.add("loaded")
                                loaded.innerHTML = output.join("")
                                loadBox.insertAdjacentElement(
                                    "afterbegin",
                                    loaded,
                                )
                                output = []
                            }
                        }
                    })(f)
                    reader.readAsText(f)
                }

                btn.addEventListener("click", () => {
                    while (loadBox.lastChild) {
                        loadBox.removeChild(loadBox.lastChild)
                    }
                })
            }
            const inputPresentation = document.getElementById(
                "file-load--presentation",
            )
            inputPresentation.addEventListener(
                "change",
                handleFileSelect,
                false,
            )
        })()
        ;(function clearFinanceInput() {
            function handleFileSelect(e) {
                const files = e.target.files, // FileList object
                    loadBox = document.body.querySelector(".js-loaded-finance"), //
                    loaded = loadBox.childNodes,
                    btn = document.body.querySelector(".js_clear_finance")

                let output = []
                for (var i = 0, f; (f = files[i]); i++) {
                    let reader = new FileReader()

                    reader.onload = (function(theFile) {
                        if (theFile.size > 1024 * 2048) {
                            showModal(
                                "Вы можете загрузить презентацию размером не более 2Мб",
                                "error",
                            )
                        } else {
                            return function(e) {
                                output.push("<span>" + theFile.name + "</span>")
                                let loaded = document.createElement("div")
                                loaded.classList.add("loaded")
                                loaded.innerHTML = output.join("")
                                loadBox.insertAdjacentElement(
                                    "afterbegin",
                                    loaded,
                                )
                                output = []
                            }
                        }
                    })(f)
                    reader.readAsText(f)
                }
                btn.addEventListener("click", () => {
                    while (loadBox.lastChild) {
                        loadBox.removeChild(loadBox.lastChild)
                    }
                })
            }
            const inputFinance = document.getElementById("file-load--finance")
            inputFinance.addEventListener("change", handleFileSelect, false)
        })()
        ;(function clearBusinessInput() {
            function handleFileSelect(e) {
                const files = e.target.files, // FileList object
                    loadBox = document.body.querySelector(
                        ".js-loaded-buisness",
                    ), //
                    loaded = loadBox.childNodes,
                    btn = document.body.querySelector(".js_clear_business")

                // output нужен для записи и чтения данных
                let output = []
                // в этом цикле
                for (var i = 0, f; (f = files[i]); i++) {
                    let reader = new FileReader()

                    reader.onload = (function(theFile) {
                        if (theFile.size > 1024 * 2048) {
                            showModal(
                                "Вы можете загрузить презентацию размером не более 2Мб",
                                "error",
                            )
                        } else {
                            return function(e) {
                                output.push("<span>" + theFile.name + "</span>")
                                let loaded = document.createElement("div")
                                loaded.classList.add("loaded")
                                loaded.innerHTML = output.join("")
                                loadBox.insertAdjacentElement(
                                    "afterbegin",
                                    loaded,
                                )
                                output = []
                            }
                        }
                    })(f)
                    reader.readAsText(f)
                }

                btn.addEventListener("click", () => {
                    while (loadBox.lastChild) {
                        loadBox.removeChild(loadBox.lastChild)
                    }
                })
            }
            const inputBusiness = document.getElementById("file-load--business")
            inputBusiness.addEventListener("change", handleFileSelect, false)
        })()
    }
    if (document.body.classList.contains("js-start-reward")) {
        ;(function editRewards() {
            const addBtn = document.body.querySelector(".js_add_reward"),
                hideBtn = document.body.querySelectorAll(".js_hide_reward"),
                errorBox = document.body.querySelector(".text-error.error")
            let rewards = document.body.querySelectorAll(".js_reward_item")
            addBtn.classList.add("active")
            if (addBtn && hideBtn && rewards) {
                hideBtn.forEach(btn => {
                    btn.addEventListener("click", function(e) {
                        e.preventDefault()
                        let activeRewards = document.body.querySelectorAll(
                                ".js_reward_item.active",
                            ).length,
                            thisReward = e.target.closest(".js_reward_item")

                        if (activeRewards < 0) {
                            return
                        } else if (!addBtn.classList.contains("active")) {
                            addBtn.classList.add("active")
                        }

                        thisReward.classList.remove("active")
                        thisReward.querySelector(".reward-value").value = ""
                    })
                })

                addBtn.addEventListener("click", function(e) {
                    e.preventDefault()
                    let activeRewards = document.body.querySelectorAll(
                        ".js_reward_item.active",
                    ).length
                    let rewards = document.body.querySelectorAll(
                        ".js_reward_item",
                    )
                    if (activeRewards === rewards.length) {
                        addBtn.classList.remove("active")
                        return
                    } else {
                        addBtn.classList.add("active")
                    }
                    for (let i = 0; i < rewards.length; i++) {
                        const reward = rewards[i]
                        if (!reward.classList.contains("active")) {
                            reward.classList.add("active")
                            return
                        }
                    }
                })
            } else {
                return
            }
        })()
    }
    if (document.body.classList.contains("js-store-mypurchases")) {
        cropText(".comment", 120)
        Modal()
    }
    if (document.body.classList.contains("js-shop-item")) {
        Modal()

        //////////////////////   слайдер Jewelry-item
        let itemSliderThumbs = new Swiper(".item-slider__wrapper--thumbs", {
            spaceBetween: 10,
            slidesPerView: 5,
            draggable: true,
            observer: true,
            observeParents: true,

            breakpoints: {},
        })

        let itemSlider = new Swiper(".item-slider", {
            draggable: false,
            observer: true,
            spaceBetween: 10,
            thumbs: {
                swiper: itemSliderThumbs,
            },
        })

        // let cropBox = '.prod-card-descr > p';
        // cropText(cropBox, 230);
        // seeMore2('.js_button_seemore','js_box_seemore', '.review-item');
    }

    if (document.body.classList.contains("js-shop-main")) {
        cropText(".prod-card-title", 25)
    }
    if (document.body.classList.contains("js-shop-items")) {
        cropText(".prod-card-title", 25)
        Modal()
        scrollToTop()
        rangeSlider()
    }
    if (document.body.classList.contains("js-shop-purchase")) {
        Modal()
        tabs()
        cropText(".comment", 90)
    }
    if (document.body.classList.contains("js-shop-add")) {
        // блок куда загружать, максимальное количество фотографий за раз
        imageLoading("shop-add__form-image--loaded", 10)
        let inputs = document.querySelectorAll(".shop-add__input--cost")
        formatInputs(inputs)
    }

    if (document.body.classList.contains("js-main-menu")) {
        const mainMenuButton = document.body.querySelector(".js_open_main_menu")
        const mainMenu = document.body.querySelector(".main-sidebar")
        function toggleMenu() {
            mainMenu.classList.toggle("active")
        }
        mainMenuButton.addEventListener("click", e => {
            e.stopPropagation()
            toggleMenu()
        })
        document.addEventListener("click", function(e) {
            const target = e.target
            const itsMenu = target == mainMenu || mainMenu.contains(target)
            const itsBtnMenu = target == mainMenuButton
            const menuIsActive = mainMenu.classList.contains("active")
            if (!itsMenu && !itsBtnMenu && menuIsActive) {
                toggleMenu()
            }
        })
    }
    if (document.body.classList.contains("js-mobile-menu")) {
        openMenu(".burger-menu", ".nav__menu-mobile")
    }
    if (document.body.classList.contains("js-jewelry-item-registry")) {
        Modal()
        seeMore()
        hideLabel()
        //////////////////////   слайдер Jewelry-item
        let itemSliderThumbs = new Swiper(".item-slider__wrapper--thumbs", {
            slidesPerView: 5,
            draggable: true,
            observer: true,
            observeParents: true,
        })
        let itemSlider = new Swiper(".item-slider", {
            draggable: false,
            observer: true,
            spaceBetween: 10,
            thumbs: {
                swiper: itemSliderThumbs,
            },
            navigation: {
                nextEl: ".item-slider__button-next",
                prevEl: ".item-slider__button-prev",
            },
        })
        // let inputsBit = document.querySelectorAll('.row.arrow > input[name=price]')
    }
    if (document.body.classList.contains("js-jewelry-item")) {
        let cropBox = ".prod-card-descr > p"
        cropText(cropBox, 90)
        Modal()
        seeMore2(".js_button_seemore", "js_box_seemore", ".review-item")

        //////////////////////   слайдер Jewelry-item
        let itemSliderThumbs = new Swiper(".item-slider__wrapper--thumbs", {
            slidesPerView: 5,
            draggable: true,
            observer: true,
            observeParents: true,
        })

        let itemSlider = new Swiper(".item-slider", {
            draggable: false,
            observer: true,
            spaceBetween: 10,
            thumbs: {
                swiper: itemSliderThumbs,
            },
            navigation: {
                nextEl: ".item-slider__button-next",
                prevEl: ".item-slider__button-prev",
            },
        })

        let itemsPopularSlider = new Swiper(".jewelry-popular__box-slider", {
            slidesPerView: 5,
            slidesPerGroup: 5,
            loop: true,
            loopFillGroupWithBlank: true,
            navigation: {
                nextEl: ".button-slider-next",
                prevEl: ".button-slider-prev",
            },
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                },
                650: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                },
                1000: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                },
                1200: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                },
                1900: {
                    slidesPerView: 6,
                    slidesPerGroup: 6,
                },
            },
        })
    }
    if (document.body.classList.contains("js-jewelry-items")) {
        Modal()
        cropText(".prod-card-title", 25)
        scrollToTop()
        rangeSlider()
    }

    if (document.body.classList.contains("js-jewelry-special")) {
        Modal()
        imageLoading("jewelry-selfmadeitem__form-image--loaded", 4)
        let inputCost = document.body.querySelector("#input-count")
        inputCost.setAttribute("type", "text")
        inputCost.addEventListener("change", () => {
            inputCost.value = parseFloat(+inputCost.value).toFixed(8)
        })
        inputCost.addEventListener("input", () => {
            // только одна точка
            inputCost.value = inputCost.value.replace(/(^[^.]*.)|[.]+/g, "$1")
            // и без пробелов
            inputCost.value = inputCost.value.replace(/\s/g, "")
            // и только цифры
            inputCost.value = inputCost.value.replace(/[^\d.]/g, "")
        })
        let inputCategory = document.body.querySelector(
            "#input-category-selfmadeitem",
        )
        inputCategory.addEventListener("change", e => {
            let ringsSizes = document.body.querySelector(".rings"),
                wristbandsSizes = document.body.querySelector(".wristbands"),
                categories = document.body.querySelectorAll(".js_category")
            function clearSelects() {
                categories.forEach(category => {
                    category.classList.remove("active")
                })
            }
            clearSelects()
            if (e.target.value === "Кольца") {
                ringsSizes.classList.add("active")
            }
            if (e.target.value === "Браслеты") {
                wristbandsSizes.classList.add("active")
            }
        })
    }

    if (document.body.classList.contains("js-slider-main")) {
        let MainSlider = new Swiper(".slider-main__slider", {
            loop: true,
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            pagination: {
                clickable: true,
                el: ".slider-main__slider-pagination",
            },
            navigation: {
                nextEl: ".slider-main__slider-button-next",
                prevEl: ".slider-main__slider-button-prev",
            },
        })
    }
    if (document.body.classList.contains("js-jewelry-main")) {
        sliderTabs()
        Modal()
        let jewelryMainSlider = new Swiper(".jewelry-main__slider", {
            draggable: false,
            observer: true,
            observeParents: true,
            pagination: {
                clickable: true,
                el: ".jewelry-main__slider-pagination",
            },
            navigation: {
                nextEl: ".jewelry-main__slider-button-next",
                prevEl: ".jewelry-main__slider-button-prev",
            },
        })
    }
    if (document.body.classList.contains("js-jewelry-purchase")) {
        Modal()
        const itemPaginator = ".purchase__box"
        // const paginator = ".paginator"
        // pagePagination(itemPaginator, paginator)
    }

    if (document.body.classList.contains("js-jewelry-registry")) {
        const itemPaginator = ".registry__box-item"
        // const paginator = ".paginator"
        // pagePagination(itemPaginator, paginator)
        hideLabel()
        showInput()
        function showInput() {
            const btn = document.body.querySelectorAll(".js_input_open"),
                closeBtn = document.body.querySelectorAll(".close-btn")
            closeBtn.forEach(btn => {
                btn.addEventListener("click", close)
            })
            btn.forEach(btn => {
                btn.addEventListener("click", open)
            })
            function open() {
                this.classList.remove("active")
                this.classList.add("hidden")
                for (let i = 0; i < this.parentNode.children.length; i++) {
                    const box = this.parentNode.children[i]

                    if (box.classList.contains("js_bitbox")) {
                        box.classList.add("active")
                    }
                }
            }
            function close() {
                this.closest(".js_bitbox").classList.remove("active")
                for (
                    let i = 0;
                    i < this.closest(".registry__item-buttons").children.length;
                    i++
                ) {
                    const btn = this.closest(".registry__item-buttons")
                        .children[i]
                    if (btn.classList.contains("js_input_open")) {
                        btn.classList.remove("hidden")
                        btn.classList.add("active")
                    }
                }
            }
        }
    }
    let inputsBit = document.querySelectorAll(".row.arrow > input")
    formatInputs(inputsBit)
})
const errorModal = document.querySelector(".js_info_modal.error")
const errorModalText = document.querySelector(".info-modal__error > p")
function showModal(text, type) {
    let modalCloseTimeout
    if (modalCloseTimeout !== undefined && modalCloseTimeout !== null) {
        clearTimeout(modalCloseTimeout)
    }
    if (type.toLowerCase() === "error") {
        errorModal.classList.add("active")
        errorModalText.innerText = text
        modalCloseTimeout = setTimeout(closeModals, 10000, type)
    }
}

function closeModals(type) {
    if (type !== undefined) {
        if (type.toLowerCase() === "error") {
            errorModal.classList.remove("active")
            errorModalText.innerText = ""
        }
    } else {
        allModals.forEach(modal => {
            modal.classList.remove("active")
        })
    }
}
// табы
function tabs() {
    const jsTriggers = document.body.querySelectorAll(".js-tab-trigger")

    jsTriggers.forEach(function(trigger) {
        trigger.addEventListener("click", function() {
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
function sliderTabs() {
    const jsTriggers = document.body.querySelectorAll(".js-tab-trigger")

    jsTriggers.forEach(function(trigger) {
        let tabsSlider = new Swiper(".tab-content__slider", {
            navigation: {
                nextEl: ".tab-content__button--next",
                prevEl: ".tab-content__button--prev",
            },
            draggable: false,
            observer: true,
            observeParents: true,
        })
        trigger.addEventListener("click", function() {
            const id = this.getAttribute("data-tab"),
                content = document.body.querySelector(
                    '.js-tab-content[data-tab="' + id + '"]',
                ),
                contentText = document.body.querySelector(
                    '.js-tab-content-text[data-tab="' + id + '"]',
                ),
                activeTrigger = document.body.querySelector(
                    ".js-tab-trigger.active",
                ),
                activeContent = document.body.querySelector(
                    ".js-tab-content.active",
                ),
                activeContentText = document.body.querySelector(
                    ".js-tab-content-text.active",
                )
            activeTrigger.classList.remove("active")
            trigger.classList.add("active")

            activeContentText.classList.remove("active")
            activeContent.classList.remove("active")
            activeContent.classList.remove("tab-content__slider")

            contentText.classList.add("active")
            content.classList.add("active")
            content.classList.add("tab-content__slider")

            let tabsSlider = new Swiper(".tab-content__slider", {
                navigation: {
                    nextEl: ".tab-content__button--next",
                    prevEl: ".tab-content__button--prev",
                },
                draggable: false,
                observer: true,
                observeParents: true,
            })
        })
    })
}
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
                reader.addEventListener("load", function(e) {
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
    openButtons.forEach(function(item) {
        item.addEventListener("click", function(e) {
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

    closeButtons.forEach(function(item) {
        item.addEventListener("click", function(e) {
            var parentModal = document.body.querySelector(".js_modal.active")
            parentModal.classList.remove("active")
            overlay.classList.remove("active")
            body.classList.remove("no-scroll")
        })
    })

    document.body.addEventListener(
        "keyup",
        function(e) {
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

    overlay.addEventListener("click", function(e) {
        var parentModal = document.body.querySelector(".js_modal.active")
        if (this == e.target) {
            parentModal.classList.remove("active")
            this.classList.remove("active")
            body.classList.remove("no-scroll")
        }
    })

    document.body.querySelectorAll(".js_switch_modal").forEach(function(item) {
        var event = item.getAttribute("data-event")

        item.addEventListener(event, function(e) {
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

///// Закрывает комментарии на высоту первого комментария
function seeMore2(buttons, box, box_items) {
    const showButtons = document.body.querySelectorAll(buttons)
    const boxItems = document.body.querySelectorAll(box_items)
    const showBox = document.getElementsByClassName(box)
    if (showButtons !== null && boxItems !== null && showBox !== null) {
        for (let i = 0; i < boxItems.length; i++) {
            showButtons.forEach(button => {
                button.style = "display: flex"
            })
            if (boxItems.length === 0) {
                showButtons.forEach(button => {
                    button.style = "display: none"
                })
            }
            if (boxItems.length > 0) {
                showBox[0].style.maxHeight = boxItems[0].clientHeight + "px"
            }
            if (boxItems.length > 1) {
                if (boxItems[0].clientHeight > boxItems[1].clientHeight) {
                    showBox[0].style.maxHeight = boxItems[0].clientHeight + "px"
                } else {
                    showBox[0].style.maxHeight = boxItems[1].clientHeight + "px"
                }
            }
            if (boxItems.length === 0) {
                showButtons.forEach(button => {
                    button.style = "display: none"
                })
            }
        }
        showButtons.forEach(button => {
            const showBox = document.getElementsByClassName(box)
            button.addEventListener("click", e => {
                event.preventDefault()
                const buttonArrow = e.target.lastChild
                showBox[0].classList.toggle("active")
                buttonArrow.classList.toggle("active")
            })
        })
    }
}

function openMenu(button, boxes) {
    const openButton = document.body.querySelector(button)
    openButton.addEventListener("click", e => {
        const showBox = document.body.querySelectorAll(boxes)
        e.preventDefault()
        showBox.forEach(function(box) {
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
    paginator.addEventListener("click", function() {
        pagination(event)
    })
    // добавляем атрибуты всем элементам
    div_num.forEach((div, index) => {
        div.setAttribute("data-num", index)
    })
}

function hideLabel() {
    const inputs = document.body.querySelectorAll(".js_input_hide_label")
    inputs.forEach(input => {
        input.addEventListener("click", hideLabel)
        input.addEventListener("focusout", function() {
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

    window.addEventListener("scroll", function() {
        if (pageYOffset > document.documentElement.clientHeight) {
            arrowTop.classList.add("active")
        } else {
            arrowTop.classList.remove("active")
        }
    })

    var scrolled
    var timer
    arrowTop.addEventListener("click", function() {
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

/// подсветка ссылки на активную страницу в основном сайдбаре
function mainsidebarActivePage() {
    if (document.body.classList.contains("multi")) {
        document.body.querySelector(".js_page_multi").classList.add("active")
    }
    if (document.body.classList.contains("js-market-balance")) {
        document.body.querySelector(".js_page_multi").classList.add("active")
    }
    if (document.body.classList.contains("partners")) {
        document.body.querySelector(".js_page_partners").classList.add("active")
    }
    if (document.body.classList.contains("travel")) {
        document.body.querySelector(".js_page_travel").classList.add("active")
    }
    if (document.body.classList.contains("jewelry")) {
        document.body.querySelector(".js_page_jewelry").classList.add("active")
    }
    if (document.body.classList.contains("market")) {
        document.body.querySelector(".js_page_market").classList.add("active")
    }
    if (document.body.classList.contains("pawnshop")) {
        document.body.querySelector(".js_page_pawnshop").classList.add("active")
    }
    if (document.body.classList.contains("store")) {
        document.body.querySelector(".js_page_store").classList.add("active")
    }
    if (document.body.classList.contains("jewelry")) {
        document.body.querySelector(".js_page_jewelry").classList.add("active")
    }
    if (document.body.classList.contains("start")) {
        document.body.querySelector(".js_page_start").classList.add("active")
    } else {
        return
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

////////////// кастомные селекты

customSelect(document.getElementById("mySelect"), {
    containerClass: "search__custom-select-container",
    openerClass: "search__custom-select-opener",
    panelClass: "search__custom-select-panel",
    optionClass: "search__custom-select-option",
    optgroupClass: "search__custom-select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

customSelect(document.getElementById("search_shop_mobile"), {
    containerClass: "search-mobile__custom-select-container",
    openerClass: "search-mobile__custom-select-opener",
    panelClass: "search-mobile__custom-select-panel",
    optionClass: "search-mobile__custom-select-option",
    optgroupClass: "search-mobile__custom-select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

customSelect(document.getElementById("input-location"), {
    containerClass: "shop-add-location__select-container",
    openerClass: "shop-add-location__select-opener",
    panelClass: "shop-add-location__select-panel",
    optionClass: "shop-add-location__select-option",
    optgroupClass: "shop-add-location__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

customSelect(document.body.querySelector(".js-lang-changer"), {
    containerClass: "lang__custom-select-container",
    openerClass: "lang__custom-select-opener",
    panelClass: "lang__custom-select-panel",
    optionClass: "lang__custom-select-option",
    optgroupClass: "lang__custom-select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.body.querySelector(".js-lang-changer-mobile"), {
    containerClass: "lang__custom-select-container",
    openerClass: "lang__custom-select-opener",
    panelClass: "lang__custom-select-panel",
    optionClass: "lang__custom-select-option",
    optgroupClass: "lang__custom-select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("filter-size"), {
    containerClass: "filter-small__select-container",
    openerClass: "filter-small__select-opener",
    panelClass: "filter-small__select-panel",
    optionClass: "filter-small__select-option",
    optgroupClass: "filter-small__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("input-category-selfmadeitem"), {
    containerClass: "input-category-selfmadeitem__select-container",
    openerClass: "input-category-selfmadeitem__select-opener",
    panelClass: "input-category-selfmadeitem__select-panel",
    optionClass: "input-category-selfmadeitem__select-option",
    optgroupClass: "input-category-selfmadeitem__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("filter-size-selfmadeitem1"), {
    containerClass: "filter-size-selfmadeitem__select-container",
    openerClass: "filter-size-selfmadeitem__select-opener",
    panelClass: "filter-size-selfmadeitem__select-panel",
    optionClass: "filter-size-selfmadeitem__select-option",
    optgroupClass: "filter-size-selfmadeitem__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("filter-size-selfmadeitem2"), {
    containerClass: "filter-size-selfmadeitem__select-container",
    openerClass: "filter-size-selfmadeitem__select-opener",
    panelClass: "filter-size-selfmadeitem__select-panel",
    optionClass: "filter-size-selfmadeitem__select-option",
    optgroupClass: "filter-size-selfmadeitem__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("input-valute-selfmadeitem"), {
    containerClass: "shop-add-valute__select-container",
    openerClass: "shop-add-valute__select-opener",
    panelClass: "shop-add-valute__select-panel",
    optionClass: "shop-add-valute__select-option",
    optgroupClass: "shop-add-valute__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
    // containerClass: 'input-valute-selfmadeitem__select-container',
    // openerClass: 'input-valute-selfmadeitem__select-opener',
    // panelClass: 'input-valute-selfmadeitem__select-panel',
    // optionClass: 'input-valute-selfmadeitem__select-option',
    // optgroupClass: 'input-valute-selfmadeitem__select-optgroup',
    // isSelectedClass: 'is-selected',
    // hasFocusClass: 'has-focus',
    // isDisabledClass: 'is-disabled',
    // isOpenClass: 'is-open'
})
customSelect(document.getElementById("input-valute-shop-add"), {
    containerClass: "shop-add-valute__select-container",
    openerClass: "shop-add-valute__select-opener",
    panelClass: "shop-add-valute__select-panel",
    optionClass: "shop-add-valute__select-option",
    optgroupClass: "shop-add-valute__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("filter-location"), {
    containerClass: "location-filter__select-container",
    openerClass: "location-filter__select-opener",
    panelClass: "location-filter__select-panel",
    optionClass: "location-filter__select-option",
    optgroupClass: "location-filter__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("start_all_projects"), {
    containerClass: "all_projects__select-container",
    openerClass: "all_projects__select-opener",
    panelClass: "all_projects__select-panel",
    optionClass: "all_projects__select-option",
    optgroupClass: "all_projects__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("start_all_projects--mobile"), {
    containerClass: "all_projects--mobile__select-container",
    openerClass: "all_projects--mobile__select-opener",
    panelClass: "all_projects--mobile__select-panel",
    optionClass: "all_projects--mobile__select-option",
    optgroupClass: "all_projects--mobile__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("input_valute_travel"), {
    containerClass: "input-travel-small__select-container",
    openerClass: "input-travel-small__select-opener",
    panelClass: "input-travel-small__select-panel",
    optionClass: "input-travel-small__select-option",
    optgroupClass: "input-travel-small__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

customSelect(document.getElementById("input_start_valute"), {
    containerClass: "input-valute-small__select-container",
    openerClass: "input-valute-small__select-opener",
    panelClass: "input-valute-small__select-panel",
    optionClass: "input-valute-small__select-option",
    optgroupClass: "input-valute-small__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
customSelect(document.getElementById("toggleBuySale"), {
    containerClass: "sale-toggle__select-container",
    openerClass: "sale-toggle__select-opener",
    panelClass: "sale-toggle__select-panel",
    optionClass: "sale-toggle__select-option",
    optgroupClass: "sale-toggle__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

customSelect(document.getElementById("filter-side"), {
    containerClass: "small__select-container",
    openerClass: "small__select-opener",
    panelClass: "small__select-panel",
    optionClass: "small__select-option",
    optgroupClass: "small__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

customSelect(document.getElementById("transact-valute"), {
    containerClass: "input-valute-wide__select-container",
    openerClass: "input-valute-wide__select-opener",
    panelClass: "input-valute-wide__select-panel",
    optionClass: "input-valute-wide__select-option",
    optgroupClass: "input-valute-wide__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})

let MultiInputServices = document.body.querySelectorAll(".services_multiwallet")
MultiInputServices.forEach(input => {
    customSelect(input, {
        containerClass: "services_multiwallet__select-container",
        openerClass: "services_multiwallet__select-opener",
        panelClass: "services_multiwallet__select-panel",
        optionClass: "services_multiwallet__select-option",
        optgroupClass: "services_multiwallet__select-optgroup",
        isSelectedClass: "is-selected",
        hasFocusClass: "has-focus",
        isDisabledClass: "is-disabled",
        isOpenClass: "is-open",
    })
})
let startInputsDonate = document.body.querySelectorAll(".input_donate_valute")

startInputsDonate.forEach(input => {
    customSelect(input, {
        containerClass: "input-donate-small__select-container",
        openerClass: "input-donate-small__select-opener",
        panelClass: "input-donate-small__select-panel",
        optionClass: "input-donate-small__select-option",
        optgroupClass: "input-donate-small__select-optgroup",
        isSelectedClass: "is-selected",
        hasFocusClass: "has-focus",
        isDisabledClass: "is-disabled",
        isOpenClass: "is-open",
    })
})
let registryInput = document.body.querySelectorAll(".bit_input")
registryInput.forEach(input => {
    customSelect(input, {
        containerClass: "input-valute-registry__select-container",
        openerClass: "input-valute-registry__select-opener",
        panelClass: "input-valute-registry__select-panel",
        optionClass: "input-valute-registry__select-option",
        optgroupClass: "input-valute-registry__select-optgroup",
        isSelectedClass: "is-selected",
        hasFocusClass: "has-focus",
        isDisabledClass: "is-disabled",
        isOpenClass: "is-open",
    })
})

let pawnshopAddSelects = document.body.querySelectorAll(
    ".pawnshop_add_currency",
)
pawnshopAddSelects.forEach(select => {
    customSelect(select, {
        containerClass: "shop-add-valute__select-container",
        openerClass: "shop-add-valute__select-opener",
        panelClass: "shop-add-valute__select-panel",
        optionClass: "shop-add-valute__select-option",
        optgroupClass: "shop-add-valute__select-optgroup",
        isSelectedClass: "is-selected",
        hasFocusClass: "has-focus",
        isDisabledClass: "is-disabled",
        isOpenClass: "is-open",
    })
})

let shopAddSelect = document.body.querySelector(".js_shop_add_category")
customSelect(shopAddSelect, {
    containerClass: "shop-add__select-container",
    openerClass: "shop-add__select-opener",
    panelClass: "shop-add__select-panel",
    optionClass: "shop-add__select-option",
    optgroupClass: "shop-add__select-optgroup",
    isSelectedClass: "is-selected",
    hasFocusClass: "has-focus",
    isDisabledClass: "is-disabled",
    isOpenClass: "is-open",
})
let filterCoinsMarket = document.body.querySelectorAll(".filter-coins")
filterCoinsMarket.forEach(select => {
    customSelect(select, {
        containerClass: "small__select-container",
        openerClass: "small__select-opener",
        panelClass: "small__select-panel",
        optionClass: "small__select-option",
        optgroupClass: "small__select-optgroup",
        isSelectedClass: "is-selected",
        hasFocusClass: "has-focus",
        isDisabledClass: "is-disabled",
        isOpenClass: "is-open",
    })
})

function rangeSlider() {
    // для отображения актуального макс. и мин. прайса,
    // нужно добавить инпутам slider-range-lower\upper дата атрибуты:
    // data-value-min
    // data-value-max
    const minValue = document.getElementById("slider-range-lower"),
        maxValue = document.getElementById("slider-range-upper"),
        inputMin = document.getElementById("slider-range-lower"),
        inputMax = document.getElementById("slider-range-upper"),
        rangeSlider = document.getElementById("slider-range-price")

    noUiSlider.create(rangeSlider, {
        start: [0, 10000],
        connect: true,
        decimals: 0,
        range: {
            min: [0.00000001],
            max: [10000.0],
        },
    })

    // выводим значения инпута, округляем до целых чисел
    formatInputs([inputMin, inputMax])
    rangeSlider.noUiSlider.on("update", function(values, handle) {
        if (handle) {
            inputMax.value = values[handle]
        } else {
            inputMin.value = values[handle]
        }
    })

    inputMin.addEventListener("change", function() {
        rangeSlider.noUiSlider.set([this.value, null])
    })

    inputMax.addEventListener("change", function() {
        rangeSlider.noUiSlider.set([null, this.value])
    })

    document
        .querySelector('input[type="reset"]')
        .addEventListener("click", () => {
            rangeSlider.noUiSlider.reset()
        })
}
