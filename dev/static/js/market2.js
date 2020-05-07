;(() => {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("loaded")
        const apiUrl = "http://104.248.147.97/"
        const socketUrl = `${apiUrl}crypto`
        const inputs = document.querySelectorAll(".js_form_input")
        const inputsBlocked = document.querySelectorAll(".js_input_blocked")
        const regExp = new RegExp("/^[0]?[0-9]+[.]?[0-9]+/")
        const userID = document.body
            .querySelector("#user_id")
            .getAttribute("data-user-id")
        const btnSendBuy = document.querySelector("button#send_buy")
        const btnSendSell = document.querySelector("button#send_sell")
        const timeChartBtn = document.querySelectorAll(".button__time")
        const allModals = document.querySelectorAll(".js_info_modal")
        const errorModal = document.querySelector(".js_info_modal.error")
        const errorModalText = document.querySelector(".info-modal__error > p")
        const successModal = document.querySelector(".js_info_modal.success")
        const successModalText = document.querySelector(
            ".info-modal__success > p",
        )
        const messageModal = document.querySelector(".js_info_modal.message")
        const messageModalText = document.querySelector(
            ".info-modal__message > p",
        )
        const dataColumnSell = document.body.querySelector(
            `div[data-table="SELL"]`,
        )
        const dataColumnBuy = document.body.querySelector(
            `div[data-table="BUY"]`,
        )
        const baseBuyPrice = document.body.querySelector("#form_buy_base_price")
        const baseSellPrice = document.body.querySelector(
            "#form_sell_base_price",
        )
        const coursesRow = document.body.querySelector(
            `.table-head__valutes.base-market`,
        )
        const coursesTableBody = document.body.querySelector(`.js_courses_body`)
        const preloader = document.querySelector("#preloader")

        let reconnect = true
        let showPreloader = true
        let time = "HALF_DAY"
        let isEmptyOrder
        let countdownInterval
        let activeTokenTab
        let trade,
            order,
            course,
            chartDataSorted,
            tokensKeys,
            tokensData,
            tokensFee
        let userBalance
        let chart
        let chartHourTopic
        let updatingByInterval = null
        let Wsocket = new SockJS(socketUrl)
        let stompClient, tradeTopic, orderTopic, courseTopic
        let tokenPairCode = "cpnet-bsnew",
            baseToken,
            counterToken,
            baseVisible,
            counterVisible,
            pairVisible
        Decimal.set({
            rounding: 1,
        })

        function getSavedTokens() {
            baseToken =
                window.sessionStorage.getItem("base") === null
                    ? "bsnew"
                    : window.sessionStorage.getItem("base")
            counterToken =
                window.sessionStorage.getItem("counter") === null
                    ? "cpnet"
                    : window.sessionStorage.getItem("counter")
            baseVisible =
                window.sessionStorage.getItem("baseVisible") === null
                    ? "bsnew"
                    : window.sessionStorage.getItem("baseVisible")
            counterVisible =
                window.sessionStorage.getItem("counterVisible") === null
                    ? "cpnet"
                    : window.sessionStorage.getItem("counterVisible")
            tokenPairCode = `${baseToken}-${counterToken}`
            pairVisible = `${baseVisible}-${counterVisible}`
        }

        function setInitialTokens(base, counter, baseVisible, counterVisible) {
            window.sessionStorage.removeItem("base")
            window.sessionStorage.removeItem("counter")
            window.sessionStorage.removeItem("baseVisible")
            window.sessionStorage.removeItem("counterVisible")
            window.sessionStorage.setItem("base", base)
            window.sessionStorage.setItem("counter", counter)
            window.sessionStorage.setItem("baseVisible", baseVisible)
            window.sessionStorage.setItem("counterVisible", counterVisible)
        }

        function isEmpty(str) {
            if (str.trim() == "") return true

            return false
        }
        inputs.forEach(input => {
            formatInputs()
            input.addEventListener("input", e => {
                calculateInputsValue(e)
            })
            input.addEventListener("change", e => {
                formatInputs()
                calculateInputsValue(e)
            })
        })

        function formatInputs() {
            inputs.forEach(input => {
                formatThisInput(input)
            })
            inputsBlocked.forEach(input => {
                formatThisInput(input)
            })

            function formatThisInput(input) {
                let num1
                input.value = input.value.replace(/\s+/g, "")
                input.value = input.value.split(" ").join("")
                if (
                    input.value == NaN ||
                    input.value == "NaN" ||
                    input.value == Infinity ||
                    input.value == "Infinity" ||
                    isEmpty(input.value)
                ) {
                    num1 = new Decimal("0")
                    input.value = num1.toFixed(8)
                }
                if (!parseFloat(+input.value)) {
                    input.value = input.value.replace(regExp, "")
                    // input.value = input.value.replace(/[^.0-9]/g, '')
                    // input.value = input.value.replace(/^0{0,1}\d+\.{0,1}\d*$/, '')
                }
                num1 = new Decimal(input.value)
                input.value = num1.toFixed(8)
            }
        }

        function btnOrderLoadingToggle(type, remove) {
            if ((type === "buy") & !remove) {
                btnSendBuy.classList.add("pending")
                btnSendBuy.setAttribute("disabled", "disabled")
            }
            if ((type === "sell") & !remove) {
                btnSendSell.classList.add("pending")
                btnSendSell.setAttribute("disabled", "disabled")
            }
            if ((type === "remove") & remove) {
                btnSendBuy.removeAttribute("disabled")
                btnSendSell.removeAttribute("disabled")
                btnSendBuy.classList.remove("pending")
                btnSendSell.classList.remove("pending")
            }
        }
        btnSendBuy.addEventListener("click", () => {
            if (
                isEmpty(inputs[1].value) ||
                isEmpty(inputs[0].value) ||
                isEmpty(inputs[2].value)
            ) {
                showModal(
                    "Поля ордера содержат пустые значения, пожалуйста заполните ордер перед отправкой",
                    "error",
                )
                return
            } else {
                btnOrderLoadingToggle("buy")
                sendUsersBit(
                    inputs[1].value,
                    inputs[0].value,
                    inputsBlocked[1].value,
                    "BUY",
                )
            }
        })
        btnSendSell.addEventListener("click", () => {
            if (
                isEmpty(inputs[3].value) ||
                isEmpty(inputs[4].value) ||
                isEmpty(inputs[5].value)
            ) {
                showModal(
                    "Поля ордера содержат пустые значения, пожалуйста заполните ордер перед отправкой",
                    "error",
                )
                return
            } else {
                btnOrderLoadingToggle("sell")
                sendUsersBit(
                    inputs[4].value,
                    inputs[3].value,
                    inputsBlocked[3].value,
                    "SELL",
                )
            }
        })

        function showModal(text, type) {
            let modalCloseTimeout
            if (modalCloseTimeout !== undefined && modalCloseTimeout !== null) {
                clearTimeout(modalCloseTimeout)
            }
            if (type.toLowerCase() === "reload-error") {
                let count = 5
                countdownInterval = setInterval(countdown, 1000)
                errorModalText.innerText = ""
                errorModal.classList.add("active")

                function countdown() {
                    if (count !== -1) {
                        errorModalText.innerText = `Произошла ошибка, страница будет перезагружена через ${count} секунд. Если перезагрузка не помогает - проверьте интернет-соединение, обратитесь в поддержку`
                        count--
                    } else {
                        clearInterval(countdownInterval)
                        return
                    }
                }
            }
            if (type.toLowerCase() === "error") {
                errorModal.classList.add("active")
                errorModalText.innerText = text
                modalCloseTimeout = setTimeout(closeModals, 10000, type)
            }
            if (type.toLowerCase() === "success") {
                successModal.classList.add("active")
                successModalText.innerText = text
                modalCloseTimeout = setTimeout(closeModals, 10000, type)
            }
            if (type.toLowerCase() === "message") {
                messageModal.classList.add("active")
                messageModalText.innerText = text
                modalCloseTimeout = setTimeout(closeModals, 10000, type)
            }
        }

        function closeModals(type) {
            if (type !== undefined) {
                if (type.toLowerCase() === "error") {
                    errorModal.classList.remove("active")
                    errorModalText.innerText = ""
                }
                if (type.toLowerCase() === "success") {
                    successModal.classList.remove("active")
                    successModalText.innerText = ""
                }
                if (type.toLowerCase() === "message") {
                    messageModal.classList.remove("active")
                    messageModalText.innerText = ""
                }
            } else {
                allModals.forEach(modal => {
                    modal.classList.remove("active")
                })
            }
        }

        function sendUsersBit(price, amount, total, type) {
            let balance
            let decimalPrice = new Decimal(price),
                decimalAmount = new Decimal(amount),
                decimaTotal = new Decimal(total)

            if (parseInt(+userBalance["cpnet"].balance) < 30) {
                btnOrderLoadingToggle("remove", true)
                showModal(
                    "Для отправки ордера ваш баланс должен быть больше 30 CPNET",
                    "error",
                )
                return
            }
            if (
                decimalPrice.equals("0") ||
                decimalAmount.equals("0") ||
                decimaTotal.equals("0")
            ) {
                btnOrderLoadingToggle("remove", true)
                showModal(
                    "Поля ордера содержат пустые значения, пожалуйста заполните ордер перед отправкой",
                    "error",
                )
                return
            }
            if (type === "BUY") {
                for (const token in userBalance) {
                    if (token === counterToken) {
                        balance = +userBalance[token].balance > +total
                    }
                }
            } else if (type === "SELL") {
                for (const token in userBalance) {
                    if (token === baseToken) {
                        balance = +userBalance[token].balance > +amount
                    }
                }
            } else {
                btnOrderLoadingToggle("remove", true)
                return
            }
            if (balance) {
                // console.log(`${type}--type,${amount}--amount,${price}--price',${total}--total|||||-----sendedBit`)
                const sendForm = axios({
                    method: "post",
                    url: `${apiUrl}/order`,
                    data: {
                        tokenPairCode: `${tokenPairCode}`,
                        type: `${type}`,
                        amount: `${amount}`,
                        price: `${price}`,
                        userId: `${userID}`,
                    },
                    timeout: 10000,
                })
                    .then(function(response) {
                        if (response.status === 200) {
                            showModal("Ваш ордер принят", "success")
                            btnOrderLoadingToggle("remove", true)
                            // updatePage()
                            getUserBalance()
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                        // alert(error)
                        closeModals()
                        btnOrderLoadingToggle("remove", true)
                        if (error.response !== undefined) {
                            if (error.response.status === 406) {
                                if (
                                    error.response.data.message ==
                                    "CPN course greater than 10 UCP"
                                ) {
                                    console.log(error)
                                    showModal(
                                        "Вы можете указать сумму в эквиваленте не больше чем 10 UCP",
                                        "error",
                                    )
                                } else {
                                    showModal(
                                        "Вы не можете совершать транзакции покупки по токену CPN если ваш баланс более 500 CPN",
                                        "error",
                                    )
                                }
                            }
                            if (error.response.status === 403) {
                                showModal(
                                    "Недостаточно средств на балансе, пополните кошелёк",
                                    "error",
                                )
                            }
                            if (error.response.status === 404) {
                                showModal(
                                    "Такой валютной пары не существует",
                                    "error",
                                )
                            }
                            if (error.response.status === 500) {
                                showModal(
                                    "Ошибка сервера, попробуйте совершить эту операцию позднее, либо обратитесь в поддержку",
                                    "error",
                                )
                            }
                            if (error.response.status === 400) {
                                showModal("Что-то пошло не так..", "error")
                            }
                        } else {
                            showModal("Что-то пошло не так..", "error")
                        }
                    })
            } else {
                btnOrderLoadingToggle("remove", true)
                showModal(
                    "Недостаточно средств на балансе, пополните кошелёк",
                    "error",
                )
            }
        }
        getSavedTokens()
        getFirstData(baseToken, counterToken)

        function getFirstData(base, counter) {
            const existTokenPairKeys = new Promise((resolve, reject) => {
                axios
                    .get(`${apiUrl}api/v1/tokenPair`)
                    .then(function(response) {
                        if (response.status === 200) {
                            tokensKeys = response.data.map(token => token.code)
                            tokensData = response.data
                            // console.log(tokensKeys, "tokenKEYS")KO
                            // trade = response.data.tradeHistories;

                            resolve(true)
                        } else {
                            reject(false)
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                        showModal(
                            "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                            "error",
                        )

                        reject(false)
                    })
            })
            const firstTradesHistoryData = new Promise((resolve, reject) => {
                axios
                    .get(`${apiUrl}api/v1/market/trades`, {
                        params: {
                            tokenPair: `${base}-${counter}`,
                        },
                    })
                    .then(function(response) {
                        if (response.status === 200) {
                            // console.log(base, counter, 'itsPARAMS HISTORY ORDERS')
                            // console.log(response.data.tradeHistories, "firstTradesHistory");
                            trade = response.data.tradeHistories
                            resolve(true)
                        } else {
                            reject(false)
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                        showModal(
                            "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                            "error",
                        )

                        reject(false)
                    })
            })

            const firstOrdersData = new Promise((resolve, reject) => {
                axios
                    .get(`${apiUrl}api/v1/market/orders`, {
                        params: {
                            tokenPair: `${base}-${counter}`,
                        },
                    })
                    .then(function(response) {
                        if (response.status === 200) {
                            // console.log(response.data, "orders");
                            order = response.data
                            order.sellOrders = order.sellOrders.filter(
                                order => +order.amount > 0,
                            )
                            order.buyOrders = order.buyOrders.filter(
                                order => +order.amount > 0,
                            )
                            setOldOrders()
                            resolve(true)
                        } else {
                            console.log(response)

                            reject(false)
                        }
                    })
                    .catch(function(error) {
                        showModal(
                            "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                            "error",
                        )
                        console.log(error)
                        reject(error)
                    })
            })
            const firstCoursesData = new Promise((resolve, reject) => {
                axios
                    .get(`${apiUrl}api/v1/market/courses`)
                    .then(function(response) {
                        // console.log(response, "courses")
                        if (response.status === 200) {
                            course = response.data.courses
                            // for (const key in course) {
                            //   if (course.hasOwnProperty(key)) {
                            //     const courseItemData = course[key];
                            //     course[key] = {
                            //       data: course[key],
                            //       hasNew: false
                            //     }
                            //   }
                            // }
                            resolve(true)
                        } else {
                            console.log(response)
                            reject(false)
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                        showModal(
                            "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                            "error",
                        )

                        reject(error)
                    })
            })
            const firstUserBalance = new Promise((resolve, reject) => {
                axios
                    .get(`${apiUrl}api/balance/${userID}`)
                    .then(function(response) {
                        if (response.status === 200) {
                            userBalance = response.data
                            // console.log(userBalance)
                            resolve(true)
                        } else {
                            console.log(response)
                            reject(false)
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                        showModal(
                            "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                            "error",
                        )

                        reject(error)
                    })
            })
            const firstUserBalanceInCPNET = new Promise((resolve, reject) => {
                axios
                    .get(`${apiUrl}api/users/balance/converted/${userID}`)
                    .then(function(response) {
                        if (response.status === 200) {
                            document.querySelector(
                                ".exchange-table__total > .total",
                            ).innerText = parseFloat(response.data.sum).toFixed(
                                8,
                            )
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                        reject(error)
                        return error
                    })
            })
            Promise.all([
                firstTradesHistoryData,
                firstCoursesData,
                firstOrdersData,
                firstUserBalance,
                existTokenPairKeys,
            ])
                .then(function(responses) {
                    renderFirstData()
                    console.log("first data loaded")
                })
                .catch(function(error) {
                    console.log(error, "Ошибка")
                    showModal("", "reload-error")
                    errorModal.style = "z-index: 99999999"
                    setTimeout(reloadPage, 6000)
                })
        }

        function reloadPage() {
            window.location.reload()
        }

        function renderFirstData() {
            updateChart(time)
            fillerRowOrders(order)
            fillerCourse(course)
            fillerTradesHistory(trade)
            renderCurrencyBoxes(baseToken, counterToken)
            renderUserBalance(userBalance, baseToken, counterToken)
            fillInputsPrices()
            getCurrencyPair()
            connectSockets()
        }

        function gettingNewData(stompClient) {
            let // tradeTopic, orderTopic,
                decimalNumber
            console.log("socket connected")
            preloaderToggle(!showPreloader)

            tradeTopic = stompClient.subscribe(
                `/topic/closed-trades/${tokenPairCode}`,
                function(response) {
                    trade.unshift(JSON.parse(response.body))
                    trade.pop()
                    // console.log(trade, "trade");
                    fillerTradesHistory([JSON.parse(response.body)], true)
                    // updatePage()
                    getUserBalance()
                },
            )
            orderTopic = stompClient.subscribe(
                `/topic/open-orders/${tokenPairCode}/BUY`,
                function(response) {
                    let incomingOrder = JSON.parse(response.body)
                    incomingOrder.isNew = true
                    // console.log(incomingOrder, "incomingOrderBUY")
                    let existOrder = order.buyOrders.find(
                        order => order.price === incomingOrder.price,
                    )
                    if (existOrder !== undefined) {
                        isEmptyOrder = new Decimal(incomingOrder.amount).equals(
                            "0",
                        )
                        // console.log(isEmptyOrder, 'buyEmpty')
                        decimalNumber = new Decimal(
                            incomingOrder.amount,
                        ).toFixed(8)
                        existOrder.amount = decimalNumber
                        decimalNumber = new Decimal(
                            incomingOrder.totalPrice,
                        ).toFixed(8)
                        existOrder.totalPrice = decimalNumber
                        existOrder.isNew = true
                        if (isEmptyOrder) {
                            order.buyOrders = order.buyOrders.filter(
                                order => +order.amount > 0,
                            )
                            // console.log(order.buyOrders)
                        }
                        decimalNumber = new Decimal(
                            incomingOrder.amount,
                        ).toFixed(8)
                        existOrder.amount = decimalNumber
                        decimalNumber = new Decimal(
                            incomingOrder.totalPrice,
                        ).toFixed(8)
                        existOrder.totalPrice = decimalNumber
                        existOrder.isNew = true
                    } else {
                        order.buyOrders.push(incomingOrder)
                    }
                    // console.log(order.buyOrders, 'afterAddinfNewBUY')
                    // getUserBalance()
                    fillerRowOrders(order)
                    fillInputsPrices()
                },
            )
            orderTopic = stompClient.subscribe(
                `/topic/open-orders/${tokenPairCode}/SELL`,
                function(response) {
                    let incomingOrder = JSON.parse(response.body)
                    incomingOrder.isNew = true
                    // console.log(incomingOrder, "incomingOrderSELL")
                    let existOrder = order.sellOrders.find(
                        order => order.price === incomingOrder.price,
                    )
                    if (existOrder !== undefined) {
                        isEmptyOrder = new Decimal(incomingOrder.amount).equals(
                            "0",
                        )
                        // console.log(isEmptyOrder, 'sellEmpty')
                        decimalNumber = new Decimal(
                            incomingOrder.amount,
                        ).toFixed(8)
                        existOrder.amount = decimalNumber
                        decimalNumber = new Decimal(
                            incomingOrder.totalPrice,
                        ).toFixed(8)
                        existOrder.totalPrice = decimalNumber
                        existOrder.isNew = true
                        if (isEmptyOrder) {
                            order.sellOrders = order.sellOrders.filter(
                                order => +order.amount > 0,
                            )
                            // console.log(order.sellOrders)
                        }
                    } else {
                        order.sellOrders.push(incomingOrder)
                    }
                    // getUserBalance()
                    // console.log(order.sellOrders, 'afterAddinfNewSELL')
                    fillerRowOrders(order)
                    fillInputsPrices()
                },
            )
            // ${tokenPairCode}
            courseTopic = stompClient.subscribe(`/topic/courses`, function(
                response,
            ) {
                let newCourse = JSON.parse(response.body)
                let newObjectKey = Object.keys(newCourse)[0]
                // console.log(newObjectKey, "newCourseKeys")
                // console.log(newCourse, "newCourse")
                // console.log(course, "newCourse")
                renderCourseUpdate(newCourse, newObjectKey)

                // fillerCourse(course);
                // getCurrencyPair();
            })
        }

        function preloaderToggle(showPreloader) {
            if (preloader.classList.contains("active")) {
                preloader.classList.remove("active")
            }
            showPreloader
                ? preloader.classList.add("loadingMarket")
                : preloader.classList.remove("loadingMarket")
        }

        function clearAllWindows() {
            document.body.querySelector(`div[data-table="history"]`).innerText =
                ""
            document.body.querySelectorAll(".js-tab-trigger").forEach(item => {
                item.remove()
            })
            document.body.querySelectorAll(".js-tab-content").forEach(item => {
                item.remove()
            })
        }

        Wsocket.onclose = function() {
            Wsocket = new SockJS(socketUrl)
            connectSockets()
        }

        function checkConnection() {
            if (stompClient !== undefined && stompClient !== null) {
                if (!stompClient.connected) {
                    reconnectSockets(socketUrl, gettingNewData)
                }
            }
        }
        async function connectSockets() {
            if ((stompClient !== undefined) & (stompClient !== null)) {
                console.log("sockets connecting")
                if (stompClient.connected) {
                    await stompClient.disconnect(() => {
                        preloaderToggle(showPreloader)
                        clearAllWindows()
                        getFirstData(baseToken, counterToken)
                    })
                } else {
                    setTimeout(checkConnection, 0)
                }
            }
            stompClient = await Stomp.over(Wsocket)
            stompClient.heartbeat.outgoing = 1000
            stompClient.heartbeat.incoming = 1000
            stompClient.debug = null
            stompClient.reconnect_delay = 200
            setTimeout(() => {
                console.log(stompClient)
                if ((stompClient != undefined) & (stompClient !== null)) {
                    if (!stompClient.connected) {
                        console.log("reconnectTimeout")
                        reconnectSockets(socketUrl, gettingNewData)
                    }
                }
            }, 6000)
            await stompClient.connect({}, () => {
                console.log(Wsocket.readyState, "IsConnected")
                gettingNewData(stompClient)
            })
        }
        function reconnectSockets(socketUrl, gettingNewData) {
            console.log("reconnect")
            if (!preloader.classList.contains("loadingMarket")) {
                preloaderToggle(showPreloader)
            }
            let connected = false
            let reconInv = setInterval(() => {
                Wsocket = new SockJS(socketUrl)
                stompClient = Stomp.over(Wsocket)
                stompClient.debug = null
                stompClient.heartbeat.outgoing = 1000

                stompClient.heartbeat.incoming = 1000
                stompClient.debug = null
                stompClient.reconnect_delay = 200
                stompClient.connect(
                    {},
                    frame => {
                        clearInterval(reconInv)
                        ;("reconnecting")
                        connected = true
                        gettingNewData(stompClient)
                    },
                    () => {
                        if (connected) {
                            reconnectSockets(socketUrl, gettingNewData)
                        }
                    },
                )
            }, 999)
        }
        function animateOrdersRemove() {
            let itemToAnimateRemove = document.body.querySelectorAll(
                ".table-body__row.orders",
            )
            if (itemToAnimateRemove !== undefined) {
                itemToAnimateRemove.forEach(item => {
                    item.classList.remove("animr")
                })
            }
        }

        function animateCoursesRemove() {
            let currencyRow = document.body.querySelectorAll(".js_token_pair")
            let dataHeadItems = document.body.querySelectorAll(
                `.base-market > .valute`,
            )
            for (let i = 0; i < dataHeadItems.length; i++) {
                const item = dataHeadItems[i]
                item.classList.remove("animb")
            }
            for (let i = 0; i < currencyRow.length; i++) {
                const item = currencyRow[i]
                item.classList.remove("animr")
            }
        }

        function animateCourses(valute) {
            const dataValutePairsHead = document.body.querySelector(
                `div.valute[data-valute-base="${valute}"]`,
            )
            if (
                dataValutePairsHead !== undefined &&
                dataValutePairsHead !== null &&
                !dataValutePairsHead.classList.contains("active")
            ) {
                dataValutePairsHead.classList.add("animb")
            }
        }

        function listenToOrderRows() {
            const orderRows = document.querySelectorAll(".js_fill_form")
            orderRows.forEach(row => {
                row.addEventListener("click", e => {
                    // console.log(e.target.closest('.js_fill_form').dataset);
                    let rowDataOrder = row.dataset
                    fillInputsPrices(rowDataOrder, e)
                })
            })
        }

        const fillInputsPrices = dataByClick => {
            let isBuy = true
            if (dataByClick) {
                // console.log(dataByClick, 'dataFromOrderRow');
                inputs.forEach(input => {
                    input.value = ""
                })
                inputs[0].value = dataByClick.amount
                inputs[1].value = dataByClick.price
                inputs[2].value = dataByClick.counterSum
                inputs[3].value = dataByClick.amount
                inputs[4].value = dataByClick.price
                inputs[5].value = dataByClick.counterSum
                inputs[1].dispatchEvent(new Event("input"))
                inputs[4].dispatchEvent(new Event("input"))
                calculateInputsValue()
            } else {
                inputs[0].value = (1).toFixed(8)
                inputs[3].value = (1).toFixed(8)
                for (let i = 0; i < inputs.length; i++) {
                    if (
                        inputs[i].dataset.input == "buy-price" &&
                        inputs.length > 0
                    ) {
                        inputs[i].value = getPrice(order, !isBuy)
                        inputs[i].dispatchEvent(new Event("input"))
                        calculateInputsValue()
                    }
                    if (
                        inputs[i].dataset.input == "sell-price" &&
                        inputs.length > 0
                    ) {
                        inputs[i].value = getPrice(order, isBuy)
                        inputs[i].dispatchEvent(new Event("input"))
                        calculateInputsValue()
                    }
                }
            }
        }

        function getPrice(order, isBuy) {
            let priceValue
            if (order.buyOrders && isBuy && order.buyOrders.length > 0) {
                order.buyOrders.forEach(order => {
                    priceValue = new Decimal(order.price).toFixed(8)
                })
            } else if (
                order.sellOrders &&
                !isBuy &&
                order.sellOrders.length > 0
            ) {
                order.sellOrders.forEach(order => {
                    priceValue = new Decimal(order.price).toFixed(8)
                })
            } else {
                return
            }
            return priceValue
        }

        function calculateInputsValue(e) {
            let currentInput
            if (e) {
                currentInput = e.target
                calcThis(currentInput)
            }
        }

        function calcThis(currentInput) {
            let num1,
                num2,
                isError = false
            // currentInput.value = currentInput.value.replace(/[^0+]/g, '')

            // только одна точка
            currentInput.value = currentInput.value.replace(
                /(^[^.]*.)|[.]+/g,
                "$1",
            )
            // и без пробелов
            currentInput.value = currentInput.value.replace(/\s/g, "")
            // и только цифры
            currentInput.value = currentInput.value.replace(/[^\d.]/g, "")

            // console.log(currentInput.value.split('').join(','))
            // currentInput.value = currentInput.value.replace(/^0?[0-9]+\.?[0-9]+/g, '')
            // currentInput.value = currentInput.value.replace(/^0{2}/, '0')
            // currentInput.value = currentInput.value.replace(/^0+?\d+\.?\d+/g, '')
            // currentInput.value = currentInput.value.replace(/.{0,1)+[0-9]/g, '')
            // console.log(currentInput.value)
            if (currentInput.value.length > 0) {
                if (!parseFloat(+currentInput.value)) {
                    // console.log(currentInput.value);
                    currentInput.value = currentInput.value.replace(regExp, "")
                }
                // if (currentInput.value == Infinity || currentInput.value === "Infinity" || currentInput.value == NaN || currentInput.value === "NaN") {
                //   num1 = new Decimal("1");
                //   currentInput.value = num1.toFixed(8);
                // }
                if (currentInput == inputs[0] || currentInput == inputs[1]) {
                    // Всего = Цена * Количество покупка
                    // inputs[2].value = (parseFloat(inputs[1].value) * parseFloat(inputs[0].value)).toFixed(8).toString()
                    num1 = new Decimal(inputs[1].value)
                    num2 = new Decimal(inputs[0].value)
                    inputs[2].value = num1.mul(num2).toFixed(8)
                }
                if (currentInput == inputs[3] || currentInput == inputs[4]) {
                    // Всего = Цена * Количество продажа
                    // inputs[5].value = (parseFloat(inputs[4].value) * parseFloat(inputs[3].value)).toFixed(8).toString()
                    num1 = new Decimal(inputs[4].value)
                    num2 = new Decimal(inputs[3].value)
                    inputs[5].value = num1.mul(num2).toFixed(8)
                }
                if (currentInput == inputs[2]) {
                    // Цена = Всего / Количество покупка
                    // inputs[1].value = (parseFloat(inputs[2].value) / parseFloat(inputs[0].value)).toFixed(8).toString()
                    num1 = new Decimal(inputs[2].value)
                    num2 = new Decimal(inputs[0].value)
                    inputs[1].value = num1.div(num2).toFixed(8)
                    //  Количество = Всего / Цена покупка
                    // inputs[0].value = (parseFloat(inputs[2].value) / parseFloat(inputs[1].value)).toFixed(8).toString()
                    num1 = new Decimal(inputs[2].value)
                    num2 = new Decimal(inputs[1].value)
                    inputs[0].value = num1.div(num2).toFixed(8)
                }
                if (currentInput == inputs[5]) {
                    // Цена = Всего / Количество продажа
                    // inputs[4].value = (parseFloat(inputs[5].value) / parseFloat(inputs[3].value)).toFixed(8).toString()
                    num1 = new Decimal(inputs[5].value)
                    num2 = new Decimal(inputs[3].value)
                    inputs[4].value = num1.div(num2).toFixed(8)

                    //  Количество = Всего / Цена продажа
                    // inputs[3].value = (parseFloat(inputs[5].value) / parseFloat(inputs[4].value)).toFixed(8).toString()
                    num1 = new Decimal(inputs[5].value)
                    num2 = new Decimal(inputs[4].value)
                    inputs[3].value = num1.div(num2).toFixed(8)
                }
                inputs.forEach(i => {
                    if (
                        i.value == NaN ||
                        i.value == Infinity ||
                        i.value === "NaN" ||
                        i.value === "Infinity"
                    ) {
                        num1 = new Decimal("0")
                        i.value = num1.toFixed(8)
                        isError = true
                    }
                })
                if (isError) {
                    return
                } else {
                    if (
                        currentInput == inputs[0] ||
                        currentInput == inputs[1] ||
                        currentInput == inputs[2]
                    ) {
                        // Комиссия(0.5%) = Всего * 0.05 покупка
                        // inputsBlocked[0].value = (parseFloat(inputs[2].value * 0.05)).toFixed(8).toString()
                        num1 = new Decimal(inputs[2].value)
                        num2 = new Decimal(0.005)
                        inputsBlocked[0].value = num1.mul(num2).toFixed(8)

                        // Итого = Всего + Комиссия покупка
                        // inputsBlocked[1].value = (parseFloat(inputs[2].value) + parseFloat(inputsBlocked[0].value)).toFixed(8).toString()
                        num1 = new Decimal(inputs[2].value)
                        num2 = new Decimal(inputsBlocked[0].value)

                        inputsBlocked[1].value = num1.minus(num2).toFixed(8)
                    }
                    if (
                        currentInput == inputs[3] ||
                        currentInput == inputs[4] ||
                        currentInput == inputs[5]
                    ) {
                        // Комиссия(0.5%) = Всего * 0.05 продажа
                        // inputsBlocked[2].value = (parseFloat(inputs[5].value * 0.05)).toFixed(8).toString()
                        num1 = new Decimal(inputs[5].value)
                        num2 = new Decimal(0.005)
                        inputsBlocked[2].value = num1.mul(num2).toFixed(8)

                        // Итого = Всего + Комиссия продажа
                        // inputsBlocked[3].value = (parseFloat(inputs[5].value) + parseFloat(inputsBlocked[2].value)).toFixed(8).toString()
                        num1 = new Decimal(inputs[5].value)
                        num2 = new Decimal(inputsBlocked[2].value)
                        inputsBlocked[3].value = num1.minus(num2).toFixed(8)
                    }
                }
            }
        }

        function sortData(data, sortby, number) {
            let dataCopySorted = data.sort((a, b) => {
                let itemA
                let itemB
                if (number) {
                    itemA = a[sortby]
                    itemB = b[sortby]
                    return itemB - itemA
                } else {
                    itemA = a.sortby
                    itemB = b.sortby
                }
                return itemA - itemB
            })
            return dataCopySorted
        }

        function fillerRowOrders(order) {
            dataColumnSell.innerText = ""
            dataColumnBuy.innerText = ""
            let sellOrders = sortData(order.sellOrders, "price", true)
            let buyOrders = sortData(order.buyOrders, "price", true)
            if (buyOrders.length > 0) {
                // console.log(buyOrders, 'buyOrders')
                for (let prop in buyOrders) {
                    let price = new Decimal(buyOrders[prop].price).toFixed(8),
                        amount = new Decimal(buyOrders[prop].amount).toFixed(8),
                        isNew = buyOrders[prop].isNew,
                        // typeOrder = buyOrders[prop].type,
                        counterSum = (price * amount).toFixed(8)
                    renderOrdersRow(price, amount, "BUY", counterSum, isNew)
                }
            }
            if (sellOrders.length > 0) {
                // console.log(sellOrders, "sellOrders")
                for (let prop in sellOrders) {
                    let price = new Decimal(sellOrders[prop].price).toFixed(8),
                        amount = new Decimal(sellOrders[prop].amount).toFixed(
                            8,
                        ),
                        isNew = sellOrders[prop].isNew,
                        // date = moment(sellOrders[prop].createdAt).format("LTS"),
                        // typeOrder = sellOrders[prop].type,
                        counterSum = (price * amount).toFixed(8)
                    renderOrdersRow(price, amount, "SELL", counterSum, isNew)
                }
            }
            setOldOrders()
            listenToOrderRows()
        }

        function fillerTradesHistory(data, newOne) {
            let dataCopySorted = data.sort((a, b) => {
                let startTimeA = new Date(a.closedAt.replace(/\s+/g, ""))
                let startTimeB = new Date(b.closedAt.replace(/\s+/g, ""))
                return startTimeB.getTime() - startTimeA.getTime()
            })
            dataCopySorted.map(
                data => (data.closedAt = new Date(data.closedAt)),
            )
            // .toUTCString())
            // console.log(dataCopySorted, 'TradesHistorySorted')
            for (let dataItem in dataCopySorted) {
                let price = new Decimal(dataCopySorted[dataItem].price).toFixed(
                        8,
                    ),
                    amount = new Decimal(
                        dataCopySorted[dataItem].amount,
                    ).toFixed(8),
                    date = dataCopySorted[dataItem].closedAt,
                    typeTrade = dataCopySorted[dataItem].type
                renderTradesHistory(price, amount, date, typeTrade, newOne)
            }
        }

        function renderOrdersRow(price, amount, typeOrder, counterSum, isNew) {
            if (typeOrder === "SELL") {
                const infoRow = document.createElement("div")
                if (isNew) {
                    infoRow.className = `table-body__row orders js_order_sell js_fill_form animr`
                } else {
                    infoRow.className = `table-body__row orders js_order_sell js_fill_form`
                }
                infoRow.setAttribute(
                    "title",
                    `Цена: ${price}, Количество: ${amount}`,
                )
                infoRow.dataset.price = price
                infoRow.dataset.amount = amount
                infoRow.dataset.counterSum = counterSum
                baseBuyPrice.setAttribute("value", `${price}`)
                baseBuyPrice.value = price
                baseBuyPrice.dispatchEvent(new Event("input"))
                // baseBuyPriceTitle.innerText = `${price}`
                infoRow.innerHTML = `
            <div class="table-body__item price">${price}</div>
            <div class="table-body__item amount">${amount}</div>
            <div class="table-body__item counterSum">${counterSum}</div>
      `
                dataColumnSell.appendChild(infoRow)
                dataColumnSell.scrollTop = 0
            } else if (typeOrder == "BUY") {
                const infoRow = document.createElement("div")
                if (isNew) {
                    infoRow.className = `table-body__row orders js_order_buy js_fill_form animr`
                } else {
                    infoRow.className = `table-body__row orders js_order_buy js_fill_form`
                }
                infoRow.setAttribute(
                    "title",
                    `Цена: ${price}, Количество: ${amount}`,
                )
                infoRow.dataset.price = price
                infoRow.dataset.amount = amount
                infoRow.dataset.counterSum = counterSum
                baseSellPrice.setAttribute("value", `${price}`)
                baseSellPrice.value = price
                baseSellPrice.dispatchEvent(new Event("input"))
                // baseSellPriceTitle.innerText = `${price}`
                infoRow.innerHTML = `
            <div class="table-body__item price">${price}</div>
            <div class="table-body__item amount">${amount}</div>
            <div class="table-body__item counterSum">${counterSum}</div>
      `
                dataColumnBuy.appendChild(infoRow)
                dataColumnBuy.scrollTop = 0
            }
            setTimeout(animateOrdersRemove, 600)
            calculateInputsValue()
            return
        }

        function fillerCourse(data) {
            let tabsCount = 1
            removeAllTokenTabs()
            for (let prop in data) {
                let courseItem = document.createElement("div")
                let courseContentItem = document.createElement("div")

                // if (tabsCount === Object.keys(data.courses).length) {
                if (prop.toLowerCase() !== "bsnew") {
                    if (prop.toLowerCase() === "kcp") {
                        courseContentItem.className = `table-body body-${tabsCount} js-tab-content`
                        courseItem.className = `valute js-tab-trigger order-4`
                    }
                    if (prop.toLowerCase() === "ecp") {
                        courseContentItem.className = `table-body body-${tabsCount} js-tab-content`
                        courseItem.className = `valute js-tab-trigger order-3`
                    }
                    if (prop.toLowerCase() === "ucp") {
                        courseContentItem.className = `table-body body-${tabsCount} js-tab-content`
                        courseItem.className = `valute js-tab-trigger order-2`
                    }
                    if (prop.toLowerCase() === "cpnet") {
                        courseContentItem.className = `active table-body body-${tabsCount} js-tab-content `
                        courseItem.className = `active valute js-tab-trigger order-1 `
                    }
                    courseItem.setAttribute("title", `${prop.toUpperCase()}`)
                    courseItem.setAttribute("data-valute-base", prop)
                    courseItem.setAttribute("data-tab", tabsCount)
                    courseItem.innerText = prop.toUpperCase()
                    coursesRow.insertAdjacentElement("beforeend", courseItem)
                    // courseContentItem.setAttribute("title", `${prop}`);
                    courseContentItem.setAttribute("data-valute-column", prop)
                    courseContentItem.setAttribute("data-tab", tabsCount)
                    courseContentItem.innerText = ""
                    coursesTableBody.insertAdjacentElement(
                        "beforeend",
                        courseContentItem,
                    )
                    setTimeout(renderCourse(data[prop], prop), 0)
                    tabsCount++
                }
                // }
            }
            setTimeout(tabsValute, 0)
        }

        function renderCourse(infoItem, valute) {
            // добавление анимации каждому обновленному значению
            animateCourses(valute)
            let dataColumn = document.body.querySelector(
                `div[data-valute-column="${valute}"]`,
            )

            infoItem.forEach(item => {
                let value = new Decimal(item.price).toFixed(8)
                let currency = item.token
                let turnover = new Decimal(item.turnOver).toFixed(1)
                // let change = ;
                if (
                    !(
                        (currency.toLowerCase() === "ecp" ||
                            currency.toLowerCase() === "kcp" ||
                            currency.toLowerCase() === "ucp") &&
                        valute.toLowerCase() === "cpnet"
                    )
                ) {
                    let infoRow = document.createElement("div")
                    infoRow.className =
                        "table-body__row tokens js_token_pair animr"
                    // infoRow.setAttribute("data-valute-base", valute)
                    // infoRow.setAttribute("data-valute-counter", currency)
                    infoRow.dataset.valuteBase = valute
                    infoRow.dataset.valuteCounter = currency
                    infoRow.innerHTML = `
                        <div class="table-body__item valute">${currency.toUpperCase()}</div>
                        <div class="table-body__item value">${value}</div>
                        <div class="table-body__item percent">${
                            item.change
                        }</div>
                        <div class="table-body__item turn">${turnover}</div>
                    `
                    dataColumn.appendChild(infoRow)
                }
            })
            setTimeout(animateCoursesRemove, 600)
        }

        function renderCourseUpdate(infoItem, valute) {
            let dataHead = document.body.querySelector(
                `div.valute js-tab-trigger[data-valute-base="${valute}"]`,
            )
            animateCourses(valute)
            let dataColumnItem = document.body.querySelector(
                `div[data-valute-column="${valute}"]`,
            )
            if (dataColumnItem) {
                for (
                    let i = 0;
                    i < infoItem[valute].length, i < course[valute].length;
                    i++
                ) {
                    const itemNew = infoItem[valute][i]
                    const itemOld = course[valute][i]
                    if (JSON.stringify(itemNew) !== JSON.stringify(itemOld)) {
                        let value = new Decimal(itemNew.price).toFixed(8)
                        let currency = itemNew.token
                        let change = new Decimal(itemNew.change).toFixed(2)
                        let turnover = new Decimal(itemNew.turnOver).toFixed(1)
                        let infoRows = dataColumnItem.childNodes

                        infoRows.forEach(row => {
                            if (
                                row.dataset.valuteCounter.toLowerCase() ===
                                itemNew.token.toLowerCase()
                            ) {
                                row.innerHTML = ` <div class="table-body__item valute">${currency.toUpperCase()}</div>
                <div class="table-body__item value">${value}</div>
                <div class="table-body__item percent">${change}</div>
                <div class="table-body__item turn">${turnover}</div>
                
                `
                                row.classList.add("animr")
                            }
                        })
                        setTimeout(animateCoursesRemove, 600)
                    }
                }
            }

            // setTimeout(animateCoursesRemove, 600);
        }

        function renderTradesHistory(price, amount, date, typeTrade, newOne) {
            let dataColumn = document.body.querySelector(
                    `div[data-table="history"]`,
                ),
                dateFull = moment(date).format("LT DD.MM.YYYY"),
                dateHours = moment(date).format("LTS"),
                type,
                color

            if (typeTrade == "SELL") {
                type = "Продажа"
                color = "red"
            } else if (typeTrade == "BUY") {
                type = "Покупка"
                color = "green"
            }

            let infoRow = document.createElement("div")
            infoRow.className = `table-body__row history ${color}`
            infoRow.setAttribute("title", `${dateFull}`)
            infoRow.innerHTML = `
            <div class="text-dark table-body__item time">${dateHours}</div>
            <div class="table-body__item type">${type}</div>
            <div class="table-body__item price">${price}</div>
            <div class="table-body__item amount">${amount}</div>
        `

            if (newOne) {
                dataColumn.insertAdjacentElement("afterbegin", infoRow)
            } else {
                dataColumn.insertAdjacentElement("beforeend", infoRow)
            }
        }

        function setOldOrders() {
            order.sellOrders.forEach(item => {
                item.isNew = false
            })
            order.buyOrders.forEach(item => {
                item.isNew = false
            })
        }

        function getUserBalance() {
            axios
                .get(`${apiUrl}api/balance/${userID}`)
                .then(function(response) {
                    if (response.status === 200) {
                        // console.log(userBalance, 'oldBalance')
                        userBalance = response.data
                        // console.log(userBalance, 'newBalance')
                        renderUserBalance(userBalance)
                    }
                })
                .catch(function(error) {
                    console.log(error)
                    showModal(
                        "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                        "error",
                    )
                    return error
                })
            axios
                .get(`${apiUrl}api/users/balance/converted/${userID}`)
                .then(function(response) {
                    if (response.status === 200) {
                        document.querySelector(
                            ".exchange-table__total > .total",
                        ).innerText = parseFloat(response.data.sum).toFixed(8)
                    }
                })
                .catch(function(error) {
                    console.log(error)
                    return error
                })
        }

        function renderUserBalance(
            info,
            base = baseToken,
            counter = counterToken,
        ) {
            const dataColumn = document.body.querySelector(
                    "#user_balance_column",
                ),
                userBalanceRows = document.body.querySelectorAll(
                    ".js_userbalance_row",
                ),
                dataBalanceCounter = document.body.querySelector(
                    ".js_user_balance_counter > span",
                ),
                dataBalanceCounterToken = document.body.querySelector(
                    ".js_user_balance_counter > .valute",
                ),
                dataBalanceBase = document.body.querySelector(
                    ".js_user_balance_base > span",
                ),
                dataBalanceBaseToken = document.body.querySelector(
                    ".js_user_balance_base > .valute",
                )
            // let info = [...Object.keys(balanceInfo),...Object.values(balanceInfo)]
            if (userBalanceRows.length === 0) {
                for (let item in info) {
                    const value = parseFloat(info[item].balance).toFixed(8),
                        currency = item.toUpperCase()
                    let infoRow = document.createElement("div")
                    if (item.toLowerCase() === "cpnet") {
                        infoRow.className =
                            "table-body__row balance js_userbalance_row order-1"
                    }
                    if (item.toLowerCase() === "bsnew") {
                        infoRow.className =
                            "table-body__row balance js_userbalance_row order-2"
                    }
                    if (item.toLowerCase() === "kcp") {
                        infoRow.className =
                            "table-body__row balance js_userbalance_row order-5"
                    }
                    if (item.toLowerCase() === "ecp") {
                        infoRow.className =
                            "table-body__row balance js_userbalance_row order-4"
                    }
                    if (item.toLowerCase() === "ucp") {
                        infoRow.className =
                            "table-body__row balance js_userbalance_row order-3"
                    }
                    if (item.toLowerCase() === "brdi") {
                        continue
                    }
                    infoRow.dataset.valuteCurrency = currency
                    let infoRowItemValute = document.createElement("div")
                    infoRowItemValute.className = "table-body__item valute"
                    infoRowItemValute.textContent = currency
                    let infoRowItemValue = document.createElement("div")
                    infoRowItemValue.className = "table-body__item value"
                    infoRowItemValue.textContent = value
                    dataColumn.appendChild(infoRow)
                    infoRow.appendChild(infoRowItemValute)
                    infoRow.appendChild(infoRowItemValue)
                    if (item === baseToken) {
                        dataBalanceBase.innerText = `${value}`
                        dataBalanceBaseToken.innerText = `${currency}`
                    }
                    if (item === counterToken) {
                        dataBalanceCounter.innerText = `${value}`
                        dataBalanceCounterToken.innerText = `${currency}`
                    }
                }
            } else {
                for (let item in info) {
                    const value = new Decimal(info[item].balance).toFixed(8),
                        currency = item.toUpperCase()
                    userBalanceRows.forEach(row => {
                        if (row.dataset.valuteCurrency === currency) {
                            row.children[1].textContent = value
                        }
                    })
                    if (item === baseToken) {
                        dataBalanceBase.innerText = `${value}`
                    }
                    if (item === counterToken) {
                        dataBalanceCounter.innerText = `${value}`
                    }
                }
            }
        }

        timeChartBtn.forEach(btn => {
            btn.addEventListener("click", e => {
                if (
                    btn.classList.contains("isDisabled") ||
                    btn.classList.contains("active")
                ) {
                    e.preventDefault()
                    return
                } else {
                    timeChartBtn.forEach(btn => {
                        btn.classList.remove("active")
                        btn.classList.add("isDisabled")
                    })
                    e.preventDefault()
                    btn.classList.add("pending", "active")
                    time = btn.getAttribute("href")
                    updateChart(time, btn)
                }
            })
        })

        const getCurrencyPair = () => {
            // получаем пару валют при клике на валюту в колонке "Токены"
            let currencyRow = document.body.querySelectorAll(".js_token_pair")
            for (let i = 0; i < currencyRow.length; i++) {
                const row = currencyRow[i]
                row.addEventListener("click", function(e) {
                    e.stopPropagation()
                    baseVisible = row.dataset.valuteBase
                    counterVisible = row.dataset.valuteCounter
                    pairVisible = `${baseVisible}-${counterVisible}`.toLowerCase()
                    findToken(baseVisible, counterVisible)
                    // console.log(tokenPairCode, "GET IT!!!")
                    // console.log(pairVisible, "GET VISIBLEIT!!!")
                    // updatePage()
                    getUserBalance()
                    console.log(reconnect, "updatePageReconnect")
                    connectSockets()
                })
            }
        }

        function findToken(baseVisible, counterVisible) {
            let key = `${baseVisible}-${counterVisible}`.toLowerCase()
            let keyReverse = `${counterVisible}-${baseVisible}`.toLowerCase()
            tokensKeys.forEach(token => {
                if (token === key) {
                    // console.log(token, key, "keys")
                    baseToken = baseVisible
                    counterToken = counterVisible
                    tokenPairCode = token
                } else if (token === keyReverse) {
                    // console.log(token, keyReverse, "keys")
                    baseToken = counterVisible
                    counterToken = baseVisible
                    // baseToken = baseVisible
                    // counterToken = counterVisible
                    tokenPairCode = token
                }
            })
            setInitialTokens(
                baseToken,
                counterToken,
                baseVisible,
                counterVisible,
            )
        }

        function updatePage() {
            // обновляем пару валют и вызываем здесь все функции обновления данных

            getUserBalance()
            // renderCurrencyBoxes(baseToken, counterToken)
            // получение данных и отрисовка чарта
            // getChartData(base, counter, time);

            // setInterval(getChartData(baseToken, counterToken), 1000 * 60 * 60);
        }

        function renderCurrencyBoxes(base, counter) {
            console.log(base, counter, "render")
            const baseBoxes = document.querySelectorAll(".js_currency_box_base")
            const counterBoxes = document.querySelectorAll(
                ".js_currency_box_counter",
            )

            base = base.toUpperCase()
            counter = counter.toUpperCase()
            baseBoxes.forEach(box => {
                box.innerText = base
            })
            counterBoxes.forEach(box => {
                box.innerText = counter
            })
        }

        function removeAllTokenTabs() {
            document.body.querySelectorAll(".js-tab-trigger").forEach(item => {
                item.remove()
            })
            document.body.querySelectorAll(".js-tab-content").forEach(item => {
                item.remove()
            })
        }

        function getNewChartSticks(unsubscribe) {
            if (!unsubscribe) {
                // console.log('SUBSCRIBE')
                chartHourTopic = stompClient.subscribe(
                    `/topic/charts/${tokenPairCode}`,
                    function(response) {
                        chartDataSorted.unshift(
                            filterByDate(JSON.parse(response.body))[0],
                        )
                        chartDataSorted.pop()
                        // console.log(chartDataSorted, 'chartDataUpdated')
                        // console.log(chart, 'CHART')
                        // renderChart(JSON.parse(response.body)[0], time, true)
                        renderChart(chartDataSorted, time, true)
                    },
                )
            } else if (
                chartHourTopic !== undefined &&
                chartHourTopic !== null &&
                unsubscribe
            ) {
                chartHourTopic.unsubscribe()
                // console.log(chartHourTopic, 'unSUBSCRIBE')
            }
        }

        function updateChart(time, btn) {
            // console.log("updateChart");
            let timer
            if (updatingByInterval !== null) {
                // console.log(updatingByInterval, `there was some interval, now it's dead`)
                clearInterval(updatingByInterval)
            }
            let awaitChartData = new Promise((resolve, reject) => {
                // console.log("awaitChartData")
                resolve(getChartData(baseToken, counterToken, time))
            })
                .then(response => {
                    if (btn !== undefined && btn !== null) {
                        // btn.classList.remove("pending")
                        // timeChartBtn.forEach(btn => {
                        //     btn.classList.remove("pending", "isDisabled")
                        // })
                    }
                    if (time === "HOUR") {
                        getNewChartSticks()
                    } else {
                        getNewChartSticks(true)
                    }
                    if (time === "HALF_DAY") {
                        // console.log(`its ${time} interval`)
                        timer = 1000 * 60 * 10
                        updateChartByInterval(time, timer)
                    }
                    if (time === "DAY") {
                        // console.log(`its ${time} interval`)
                        timer = 1000 * 60 * 20
                        updateChartByInterval(time, timer)
                    }
                })
                .catch(function(error) {
                    console.log(error, "error")
                })

            function updateChartByInterval(time, timer) {
                updatingByInterval = setInterval(() => {
                    getChartData(baseToken, counterToken, time)
                }, timer)
                // console.log(updatingByInterval, 'its interval')
            }
        }
        let getChartData = (base, counter, time) => {
            // console.log(base, counter, time, 'chartOptionsGettingData')
            const url = `${apiUrl}/api/v1/market/charts`
            // console.log("getting chartdata");
            axios
                .get(url, {
                    params: {
                        // tokenPair: `${currencyPair}`,
                        type: `${time}`,
                        tokenPairCode: `${base}-${counter}`,
                    },
                })
                .then(function(response) {
                    // responseData = response.data
                    // надо отсортировать данные
                    chartDataSorted = filterByDate(response.data)
                    renderChart(chartDataSorted, time)
                    timeChartBtn.forEach(btn => {
                        btn.classList.remove("isDisabled")
                    })
                    // timeChartBtn.forEach(btn => {
                    //     btn.classList.remove("pending", "isDisabled")
                    // })
                })
                .catch(function(error) {
                    showModal(
                        "Не удалось получить данные пользователя, обновите страницу и проверьте соединение с интернет",
                        "error",
                    )
                    console.log(error)
                })
        }

        function renderChart(newData, time, newOne) {
            if (newData !== null && newData !== undefined) {
                am4core.ready(function() {
                    am4core.useTheme(am4themes_animated)
                    chart = am4core.create("chart", am4charts.XYChart)

                    chart.dateFormatter.inputDateFormat = "dd-MM-YYYY"
                    chart.data = newData

                    chart.marginRight = 20
                    chart.language.locale["_date_month_"] = "MMM"

                    const dateAxis = chart.xAxes.push(new am4charts.DateAxis())
                    dateAxis.renderer.grid.template.location = 0
                    // dateAxis.parseDates = false
                    dateAxis.renderer.minGridDistance = 50
                    // console.log(dateAxis, 'dateAxis')
                    // dateAxis.groupData = false;
                    // dateAxis.dateFormats.setKey("day", "MMMM dt");
                    // dateAxis.periodChangeDateFormats.setKey("day", "MM dt");
                    if (time === "HOUR") {
                        dateAxis.baseInterval = {
                            timeUnit: "minute",
                            // 'count': '1'
                        }
                    }
                    if (time === "HALF_DAY") {
                        chartHourTopic = null
                        dateAxis.baseInterval = {
                            timeUnit: "minute",
                            // 'count': '10'
                        }
                    }
                    if (time === "DAY") {
                        chartHourTopic = null
                        dateAxis.baseInterval = {
                            timeUnit: "minute",
                            // 'count': '1'
                        }
                    }
                    if (time === "WEEK") {
                        chartHourTopic = null
                        dateAxis.baseInterval = {
                            timeUnit: "hour",
                            // 'count': '2'
                        }
                    }
                    if (time === "MONTH") {
                        chartHourTopic = null
                        dateAxis.baseInterval = {
                            timeUnit: "hour",
                            // 'count': '3'
                        }
                    }
                    if (time === "HALF_YEAR") {
                        chartHourTopic = null
                        dateAxis.baseInterval = {
                            timeUnit: "day",
                            // 'count': '3'
                        }
                    }
                    timeChartBtn.forEach(btn => btn.classList.remove("pending"))
                    const valueAxis = chart.yAxes.push(
                        new am4charts.ValueAxis(),
                    )

                    const series = chart.series.push(
                        new am4charts.CandlestickSeries(),
                    )
                    valueAxis.tooltip.disabled = true
                    valueAxis.draggable = false
                    series.dataFields.dateX = "dateInterval"
                    series.minWidth = 40
                    series.dataFields.valueY = "close"
                    series.dataFields.openValueY = "open"
                    series.dataFields.lowValueY = "low"
                    series.dataFields.highValueY = "high"
                    series.tooltipText = `[font-size: 12px;] Цена [/]\n
                              Открытие:  [bold]  {openValueY.value.formatNumber('#')}[/]\n
                              Мин.: [bold; #ed193f] {lowValueY.value.formatNumber('#')}[/]\n
                              Макс: [bold; #2db43a] {highValueY.value.formatNumber('#')}[/]\n
                              Закрытие: [bold] {valueY.value.formatNumber('#')}[/]`
                    // console.log(series.tooltipText, "lololo")

                    series.tooltip.getFillFromObject = false
                    series.tooltip.background.cornerRadius = 0
                    series.tooltip.background.fill = am4core.color("#fafafa")
                    series.tooltip.label.fill = am4core.color("#0C2146")
                    series.dropFromOpenState.properties.fill = am4core.color(
                        "#ed193f",
                    )
                    series.dropFromOpenState.properties.stroke = am4core.color(
                        "#ed193f",
                    )
                    series.riseFromOpenState.properties.fill = am4core.color(
                        "#2db43a",
                    )
                    series.riseFromOpenState.properties.stroke = am4core.color(
                        "#2db43a",
                    )
                    chart.cursor = new am4charts.XYCursor()
                    chart.cursor.behavior = "panX"
                    chart.scale = 0.95
                })
            }
        }

        function filterByDate(dataToSort) {
            let dataCopySorted = dataToSort.sort((a, b) => {
                let startTimeA = new Date(
                    a["dateInterval"]["end"].replace(/\s+/g, ""),
                )
                let startTimeB = new Date(
                    b["dateInterval"]["end"].replace(/\s+/g, ""),
                )
                return startTimeB.getTime() - startTimeA.getTime()
            })
            let newSortedData = dataCopySorted.map(item => {
                let itemCopy = JSON.parse(JSON.stringify(item))
                itemCopy.dateInterval = new Date(itemCopy.dateInterval.end)
                return itemCopy
            })
            return newSortedData
        }

        function tabsValute() {
            const jsTriggers = document.body.querySelectorAll(".js-tab-trigger")

            jsTriggers.forEach(function(trigger) {
                trigger.addEventListener("click", function() {
                    const id = trigger.getAttribute("data-tab"),
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
            changeActiveTokenTab()
        }

        function changeActiveTokenTab() {
            const jsTriggers = document.body.querySelectorAll(".js-tab-trigger")
            const jsContent = document.body.querySelectorAll(".js-tab-content")
            if (jsTriggers !== null && jsTriggers !== undefined) {
                jsTriggers.forEach(item => {
                    if (item.dataset.valuteBase === counterToken) {
                        item.classList.add("active")
                    } else {
                        item.classList.remove("active")
                    }
                })
            }
            if (jsContent !== null && jsContent !== undefined) {
                jsContent.forEach(item => {
                    if (item.dataset.valuteColumn === counterToken) {
                        item.classList.add("active")
                    } else {
                        item.classList.remove("active")
                    }
                })
            }
        }
    })
})()

// chart.scrollbarX = new am4core.Scrollbar();
// chart.scrollbarY = new am4core.Scrollbar();
// chart.scrollbarX.maxHeight = 4;
// chart.scrollbarY.maxHeight = 4;
// chart.scrollbarX.background.fill = am4core.color("#6dcff6");
// chart.scrollbarY.marginBottom = 30;
// chart.scrollbarY.showSystemTooltip = false;
// chart.scrollbarY.thumb.showSystemTooltip = false;
// chart.scrollbarY.thumb.hoverable = false;
// chart.scrollbarY.thumb.background.fill = am4core.color("#20C4F4");
// chart.scrollbarY.thumb.background.states.getKey('hover').properties.fill = am4core.color("#20C4F4");
// chart.scrollbarY.thumb.background.states.getKey('hover').properties.fillOpacity = 0.7;
// chart.scrollbarY.thumb.background.states.getKey('down').properties.fill = am4core.color("#20C4F4");
// chart.scrollbarY.thumb.background.states.getKey('down').properties.fillOpacity = 0.7;
// chart.scrollbarY.startGrip.showSystemTooltip = false;
// chart.scrollbarY.endGrip.showSystemTooltip = false;
// chart.scrollbarX.background.fill = am4core.color("#6dcff6");
// chart.scrollbarX.marginBottom = 0;
// chart.scrollbarX.showSystemTooltip = false;
// chart.scrollbarX.thumb.showSystemTooltip = false;
// chart.scrollbarX.thumb.hoverable = false;
// chart.scrollbarX.thumb.background.fill = am4core.color("#20C4F4");
// chart.scrollbarX.thumb.background.states.getKey('hover').properties.fill = am4core.color("#20C4F4");
// chart.scrollbarX.thumb.background.states.getKey('hover').properties.fillOpacity = 0.7;
// chart.scrollbarX.thumb.background.states.getKey('down').properties.fill = am4core.color("#20C4F4");
// chart.scrollbarX.thumb.background.states.getKey('down').properties.fillOpacity = 0.7;
// chart.scrollbarX.startGrip.showSystemTooltip = false;
// chart.scrollbarX.endGrip.showSystemTooltip = false;
// function customizeGrip(grip, isX) {
//   // Remove default grip image
//   grip.icon.disabled = true;

//   // Disable background
//   grip.background.disabled = true;
//   if(isX){
//       // Add rotated rectangle as bi-di arrow
//       var img = grip.createChild(am4core.Circle);
//       img.width = 15;
//       img.height = 15;
//       img.fill = am4core.color("#cdcdcd");
//       img.rotation = 45;
//       img.translate = 0;
//       img.align = "center";
//       img.valign = "middle";

//   }else{
//     // Add rotated rectangle as bi-di arrow
//       var img = grip.createChild(am4core.Circle);
//       img.width = 15;
//       img.height = 15;
//       img.fill = am4core.color("#cdcdcd");
//       img.rotation = 45;
//       img.align = "center";
//       img.valign = "middle";

//   }
// }
// customizeGrip(chart.scrollbarX.startGrip, true);
// customizeGrip(chart.scrollbarX.endGrip, true);
// customizeGrip(chart.scrollbarY.startGrip);
// customizeGrip(chart.scrollbarY.endGrip);
