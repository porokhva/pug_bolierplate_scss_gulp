document.addEventListener("DOMContentLoaded", async function() {
    const apiUrl = "http://104.248.147.97/"
    const chatForm = document.querySelector(".chat-wrap"),
        userID = document
            .querySelector("#user_id")
            .getAttribute("data-user-id"),
        input = document.querySelector("#message_input"),
        chatBody = document.body.querySelector(".chat-body"),
        messageSendBtn = document.body.querySelector("#message_send_btn"),
        dataColumn = document.body.querySelector(".js_chat_box")
    const allModals = document.querySelectorAll(".js_info_modal")
    const errorModal = document.querySelector(".js_info_modal.error")
    const errorModalText = document.querySelector(".info-modal__error > p")
    function showModal(text, type) {
        if (type.toLowerCase() === "error") {
            errorModal.classList.add("active")
            errorModalText.innerText = text
        }
        if (type.toLowerCase() === "success") {
            successModal.classList.add("active")
            successModalText.innerText = text
        }
        if (type.toLowerCase() === "message") {
            messageModal.classList.add("active")
            messageModalText.innerText = text
        }
    }
    function isEmpty(str) {
        if (str.trim() == "") {
            return true
        }
        return false
    }
    function btnLoadingToggle(remove) {
        if (!remove) {
            messageSendBtn.classList.add("pending")
            messageSendBtn.setAttribute("disabled", "disabled")
        } else {
            messageSendBtn.classList.remove("pending")
            messageSendBtn.removeAttribute("disabled")
        }
    }

    getMessages()

    let socketChat = await new SockJS(`${apiUrl}chat`)
    let stompClient = Stomp.over(socketChat)
    stompClient.debug = null
    // console.log("chatLoaded")
    await stompClient.connect({}, function(frame) {
        stompClient.subscribe("/topic/market/chat", function(response) {
            let data = JSON.parse(response.body)
            // console.log(data, "chatSocket")
            renderMessage(data)
        })
        // stompClient.send("/app/market/chat", {},
        // JSON.stringify(messageBody));
    })

    input.addEventListener("input", e => {
        if (input.value.length == 0) {
            input.classList.remove("error")
        }
    })
    chatForm.addEventListener("submit", e => {
        e.preventDefault()
        if (isEmpty(input.value)) {
            input.classList.add("error")
            input.focus()
            return
        } else if (input.value.length > 254) {
            input.classList.add("error")
            showModal(
                "В сообщении можно отправить не более 254 символа",
                "error",
            )
            return
        } else {
            input.classList.remove("error")
            btnLoadingToggle()
            sendMessage(input.value)
            input.value = ""
        }
    })

    function renderMessage(data) {
        let nickname = data.user.username,
            message = data.message,
            date = moment(data.createdAt).format("LLL"),
            dataColumn = document.body.querySelector(".js_chat_box"),
            infoRow = document.createElement("p")
        if (dataColumn.children.length >= 50) {
            dataColumn.children[0].remove()
        }
        // console.log(date, "||||", data.createdAt, "data")
        infoRow.className = `message`
        infoRow.setAttribute("title", `Время отправки: ${date}`)
        infoRow.innerHTML = `
                    <a class="link-profile" href="#"></a>
                    <div class="nickname">${nickname}:</div>
                    <span class="text">${message}</span>
                    
                `
        dataColumn.appendChild(infoRow)
        chatBody.scrollTop = dataColumn.offsetHeight
        btnLoadingToggle(true)
    }
    function renderChat(data) {
        // console.log(data, "chatdata")
        if (data.length > 1) {
            let dataSorted = data.sort((a, b) => {
                let startTimeA = new Date(a["createdAt"].replace(/\s+/g, ""))
                let startTimeB = new Date(b["createdAt"].replace(/\s+/g, ""))
                return startTimeA.getTime() - startTimeB.getTime()
            })

            dataSorted.forEach(item => {
                let nickname = item.user.username,
                    message = item.message,
                    date = moment(item.createdAt).format("LLL")

                let dataColumn = document.body.querySelector(".js_chat_box"),
                    infoRow = document.createElement("p")
                infoRow.className = `message`
                infoRow.setAttribute(
                    "title",
                    `Время отправки сообщения: ${date}`,
                )
                infoRow.innerHTML = `
                    <a class="link-profile" href="#"></a>
                    <div class="nickname">${nickname}:</div>
                    ${message}
                `
                dataColumn.appendChild(infoRow)
            })
        }

        // прокрутка чата до конца при загрузке сообщений

        chatBody.scrollTop = dataColumn.offsetHeight
    }

    function sendMessage(message) {
        let messageBody = {
            // user_id: "f2db4e90-7459-42f6-bf2a-4feee3239fb6",
            user_id: userID,

            message: message,
        }

        const sendForm = axios
            .post(`${apiUrl}api/v1/market/chat`, messageBody)
            .then(function(response) {
                // console.log(response)
                if (response.status === 200) {
                    btnLoadingToggle(true)
                }
            })
            .catch(function(error) {
                btnLoadingToggle(true)
                // console.log(error.response.status)
                if (
                    error.response.status === 500 ||
                    error.response.data.error === "Internal Server Error"
                ) {
                    showModal(
                        "Ошибка сервера, попробуйте позднее либо обратитесь в поддержку",
                        "error",
                    )
                } else {
                    showModal(
                        "Что-то пошло не так, попробуйте позднее либо обратитесь в поддержку",
                        "error",
                    )
                }
            })
    }

    function getMessages() {
        const chatData = axios
            .get(`${apiUrl}api/v1/market/chat`)
            .then(function(response) {
                renderChat(response.data)
            })
            .catch(function(error) {
                // console.log(error.response, "chatMessagesError")
            })
    }
})
