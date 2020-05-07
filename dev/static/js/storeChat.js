;(() => {
    if (window.navigator.onLine) {
        const apiUrl = "http://104.248.147.97/",
            chatLink = document.body.querySelector(".js_chat_link"),
            userID = document.querySelector("#user_id").dataset.userId,
            chatSearchInput = document.querySelector("#chat_search"),
            confirmModal = document.querySelector(".confirmation_modal"),
            chatLinks = document.querySelectorAll(".chat-link"),
            chatInput = document.body.querySelector("#input_text"),
            chatCloseBtn = document.body.querySelector(".js_chat_close"),
            chatBackBtn = document.body.querySelector(".js_chat_back"),
            chatLabel = document.querySelector(".js_sender_name"),
            chatHistory = document.body.querySelector(".js_chat_history"),
            loadingLayer = document.querySelector(".chat-body > .loading"),
            chatHistoryActive = document.querySelector(
                ".js_chat_history.active > .chat_messages_box",
            ),
            chatInner = document.body.querySelector(".js_chat_inner"),
            chatInnerMessages = document.querySelector(
                ".js_chat_inner_messages",
            ),
            footerHistory = document.body.querySelector(".js_footer_history"),
            footerInner = document.body.querySelector(".js_footer_inner"),
            chatForm = document.body.querySelector(".js_chat_form"),
            messageSendBtn = document.body.querySelector(
                ".js_chat_form > button",
            ),
            chatBox = document.body.querySelector(".js_chat_box"),
            sendMessageUrl = `${apiUrl}api/v1/store/chat`
        let activeChatId,
            online,
            chatsUrl,
            hasMessages,
            incomingMessage,
            chatsData = [],
            messageToSend,
            companionId = ""
        if (userID) {
            chatsUrl = `${apiUrl}api/v1/store/chat?userId=${userID}`

            chatLink.addEventListener("click", chatToggleActive, false)
            window.addEventListener("resize", scrollChatDownAndFocus)

            function isEmpty(str) {
                if (str.trim() == "") return true

                return false
            }
            function chatToggleActive(e) {
                e.preventDefault()
                changePageToHistory(e)
                chatBox.classList.toggle("active")
            }

            function changePageToHistory(e) {
                e.preventDefault()
                chatBackBtn.classList.remove("active")
                footerInner.classList.remove("active")
                chatInner.classList.remove("active")
                chatHistory.classList.add("active")
                footerHistory.classList.add("active")
                clearChatInner()
                chatLabel.innerText = "Выберите чат"
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
            function changePageToInner(e) {
                e.preventDefault()
                if (confirmModal.classList.contains("active")) {
                    confirmModal.classList.remove("active")
                }
                chatBackBtn.classList.add("active")
                footerInner.classList.add("active")
                chatInner.classList.add("active")
                chatHistory.classList.remove("active")
                footerHistory.classList.remove("active")
                scrollChatDownAndFocus()
            }

            if (chatLinks) {
                //console.log(chatLinks)
                chatLinks.forEach(link => {
                    link.addEventListener("click", e => {
                        e.preventDefault()
                        chatLabel.innerText = "Напишите сообщение"
                        companionId = e.target.closest(".chat-link").dataset
                            .companionId
                        const currentChat = chatsData.find(
                            chat => chat.companionUser.id === companionId,
                        )
                        //console.log(companionId)
                        changePageToInner(e)
                        clearChatInner()
                        if (!chatBox.classList.contains("active")) {
                            chatBox.classList.add("active")
                        }
                        if (currentChat) {
                            //console.log(currentChat)
                            renderChatsMessages(currentChat)
                            activeChatId = currentChat.chatId
                        }
                    })
                })
            }
            // messageToSend = {
            // 	"senderId": `User2`,
            // 	"receiverId": `User4`,
            // 	"message": `123`
            // }
            // console.log("messageToSend", messageToSend)
            // const sendddMessage = fetch(sendMessageUrl, {
            // 	method: 'POST',
            // 	headers: {
            // 		'Content-Type': 'application/json',
            // 	},
            // 	body: JSON.stringify(messageToSend)
            // })
            // 	.then(function(response) {
            // 		console.log(response)
            // 		if(response.ok){
            // 			return response.text();
            // 		}else{
            // 			console.log(`Error: ${response.status} - ${response.statusText}`)
            // 			return
            // 		}
            // 	})
            // 	.then(function(data) {
            // 		// let copyData = JSON.parse(data);
            // 		console.log(data)
            // 		chatInput.value = '';
            // 	})

            const socketChat = new SockJS(`${apiUrl}chat`)
            const stompClient = Stomp.over(socketChat)
            stompClient.debug = null
            stompClient.reconnect_delay = 1000

            const stompConnect = () => {
                stompClient.subscribe(`/topic/store/chat/${userID}`, function(
                    message,
                ) {
                    if (message) {
                        loadingLayer.classList.add("active")
                    } else {
                        loadingLayer.classList.remove("active")
                    }
                    let copyData = JSON.parse(message.body)
                    checkNewMessages()
                    // console.log(copyData, "данные на входе")
                    incomingMessage = sortedByLast(copyData)
                    setTimeout(addNewMessageToChatsData(copyData), 0)
                    //console.log(chatsData, 'checkDataAfterAdding')
                    if (!chatInner.classList.contains("active")) {
                        checkNewMessages()
                        renderChats(incomingMessage, true)
                        //console.log('renderClosed')
                    } else if (
                        activeChatId &&
                        chatInner.classList.contains("active")
                    ) {
                        checkNewMessages()
                        //console.log('activeRender')
                        renderChatsMessages(incomingMessage, true)
                        scrollChatDownAndFocus()
                    }
                })
            }
            let stompFailureCallback = function(error) {
                console.log("stompClient: " + error)
                chatLink.classList.remove("connected")
                loadingLayer.classList.add("active")
                setInterval(stompConnect, 999)
                console.log("stompClient: Reconecting in 1 seconds")
            }
            const getChats = () => {
                fetch(chatsUrl, {
                    method: "GET",
                })
                    .then(function(response) {
                        if (response.ok) {
                            loadingLayer.classList.add("active")
                            // console.log(response)
                            return response.text()
                        } else {
                            console.log(
                                `Error: ${response.status} - ${response.statusText}`,
                                error,
                            )
                        }
                    })
                    .then(function(data) {
                        chatLink.classList.add("connected")
                        let copyData = JSON.parse(data)
                        chatsData = sortedByLast(copyData)
                        renderChats(chatsData)
                        setTimeout(checkNewMessages(), 0)
                    })
                    .then(() => {
                        stompClient.connect(
                            {},
                            stompConnect,
                            stompFailureCallback,
                        )
                        return
                    })
                    .catch(function(error) {
                        console.log("Request failed", error)
                        if (window.navigator.onLine) {
                            getChats()
                        }
                    })
            }

            // function connect(){
            // 	stompClient.connect({}, () => {
            // 			stompClient.subscribe(`/topic/store/chat/${userID}`, function (message) {
            // 			let copyData = JSON.parse(message.body)
            // 			incomingMessage = sortedByLast(copyData)
            // 			addNewMessageToChatsData(copyData)
            // 			if (!chatInner.classList.contains('active')) {
            // 				renderChats(incomingMessage, true)
            // 			} else if (activeChatId && chatInner.classList.contains('active')) {
            // 				renderChatsMessages(incomingMessage, true)
            // 			}
            // 		});
            // 	})
            // }

            const checkNewMessages = oneMessage => {
                // const isNew = chatsData.find(chat => chat.hasNew === true)

                if (chatsData.length > 0) {
                    loadingLayer.classList.remove("active")
                    chatLink.classList.remove("hasMessages")
                    hasMessages = chatsData.find(chat => chat.hasNew === true)
                    // console.log(chatsData, 'checkData')
                    // console.log(hasMessages)
                    chatsData.forEach(chat => {
                        if (chat.hasNew === true) {
                            //console.log(chatsData, 'oneNewChat')
                            chatLink.classList.add("hasMessages")
                        } else if (hasMessages) {
                            chatLink.classList.add("hasMessages")
                        }
                    })
                } else {
                    return
                }
            }
            function sendReadedChat(readedChat) {
                // stompClient.send("/app/store/checked",{}, readedChat)
                const sendCheckedChat = fetch(
                    `${apiUrl}/api/v1/store/checked?chatId=${readedChat}`,
                    {
                        method: "PUT",
                    },
                )
                    .then(function(response) {
                        if (response.ok) {
                            //console.log(response)
                            return response.text()
                        } else {
                            console.log(
                                `Error: ${response.status} - ${response.statusText}`,
                            )
                        }
                    })
                    .then(function(data) {
                        // let copyData = JSON.parse(data);
                        // console.log(data)
                        const sendedChat = chatsData.find(
                            chat => chat.chatId === readedChat,
                        )
                        sendedChat.hasNew = false
                        renderChats(sortedByLast(chatsData))
                    })
            }

            function addEventListenerToInner() {
                const chatHistoryItems = document.body.querySelectorAll(
                    ".js_chat_history_item",
                )
                chatHistoryItems.forEach(item => {
                    item.addEventListener(
                        "click",
                        e => {
                            changePageToInner(e)
                            activeChatId = e.target.closest(
                                ".js_chat_history_item",
                            ).dataset.chatId
                            const currentChat = chatsData.find(
                                chat => chat.chatId === activeChatId,
                            )
                            //console.log(currentChat)
                            renderChatsMessages(currentChat, false)
                            if (
                                e.target
                                    .closest(".js_chat_history_item")
                                    .classList.contains("hasMessages")
                            ) {
                                sendReadedChat(activeChatId)
                            }
                        },
                        false,
                    )
                })
            }

            chatBackBtn.addEventListener(
                "click",
                e => {
                    changePageToHistory(e)
                    checkNewMessages()
                    activeChatId = null
                    renderChats(sortedByLast(chatsData))
                },
                false,
            )
            chatCloseBtn.addEventListener(
                "click",
                e => {
                    chatToggleActive(e)
                    changePageToHistory(e)
                    checkNewMessages()
                    activeChatId = null
                    renderChats(sortedByLast(chatsData))
                },
                false,
            )

            function addNewMessageToChatsData(incomingMessage) {
                const currentChat = chatsData.find(
                    chat => chat.chatId === incomingMessage.chatId,
                )

                if (!currentChat) {
                    //(chatsData, "newCHat")
                    //console.log(incomingMessage, "newChatNewMessage")
                    chatsData.push(incomingMessage)
                    // renderChatsMessages(incomingMessage)
                    // renderChats(sortedByLast(incomingMessage), true)
                    activeChatId = incomingMessage.chatId
                } else if (currentChat) {
                    // console.log(currentChat)
                    // console.log(activeChatId)
                    currentChat.messages.unshift(...incomingMessage.messages)
                    currentChat.hasNew = true
                    if (currentChat.chatId === activeChatId) {
                        // sendReadedChat(activeChatId)
                        currentChat.hasNew = false
                    }
                } else if (currentChat.chatId !== activeChatId) {
                    currentChat.hasNew = true
                    return
                } else {
                    currentChat.hasNew = false
                }
            }

            function findChatByUsername(e) {
                const chatHistoryItems = document.body.querySelectorAll(
                    ".js_chat_history_item",
                )
                if (chatHistoryItems && !isEmpty(e.target.value)) {
                    chatHistoryItems.forEach(item => {
                        let thisChatUsername = item.dataset.userName.toLowerCase()
                        if (
                            thisChatUsername.indexOf(
                                e.target.value.toLowerCase(),
                            ) > -1
                        ) {
                            item.style.display = "flex"
                        } else {
                            item.style.display = "none"
                        }
                    })
                } else if (chatHistoryItems && isEmpty(e.target.value)) {
                    chatHistoryItems.forEach(item => {
                        item.style.display = "flex"
                    })
                } else {
                    return
                }
            }

            chatSearchInput.addEventListener("input", findChatByUsername, false)

            const sendMessage = e => {
                e.preventDefault()
                const textMessage = e.target.input_text.value
                if (isEmpty(textMessage)) {
                    e.target.input_text.focus()
                    chatForm.classList.remove("error")
                    return
                } else if (textMessage.length > 254) {
                    e.target.input_text.focus()
                    chatForm.classList.add("error")
                    return
                } else {
                    chatForm.classList.remove("error")
                    btnLoadingToggle()
                    messageToSend = {
                        senderId: `${userID}`,
                        receiverId: `${companionId}`,
                        message: `${textMessage}`,
                    }
                    // console.log("messageToSend", messageToSend)
                    const sendMessage = fetch(sendMessageUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(messageToSend),
                    })
                        .then(function(response) {
                            if (response.ok) {
                                btnLoadingToggle(true)
                            } else {
                                console.log(
                                    `Error: ${response.status} - ${response.statusText}`,
                                )
                            }
                        })
                        .then(function() {
                            chatInput.value = ""
                            scrollChatDownAndFocus()
                        })
                        .catch(function(error) {
                            console.log(error)
                        })
                }
            }
            chatForm.addEventListener("submit", sendMessage)

            function sortedByLast(data) {
                let dataArray = []
                if (data instanceof Array) {
                    let dataC = JSON.parse(JSON.stringify(data)).filter(
                        chat => chat.messages.length !== 0,
                    )

                    let dataCopySorted = dataC.sort((a, b) => {
                        let startTimeA = new Date(
                            a["messages"][0]["createdAt"].replace(/\s+/g, ""),
                        )
                        let startTimeB = new Date(
                            b["messages"][0]["createdAt"].replace(/\s+/g, ""),
                        )
                        return startTimeB.getTime() - startTimeA.getTime()
                    })
                    if (dataCopySorted.length !== 0) {
                        return dataCopySorted
                    } else {
                        return dataArray
                    }
                } else {
                    dataArray.push(data)
                    return dataArray
                }
            }

            function clearChatInner() {
                chatInnerMessages.innerText = ""
                chatInput.value = ""
            }

            function renderChatsMessages(incomingChat, newMesssages) {
                // console.log(incomingChat)
                let labelText, chat
                if (!newMesssages) {
                    clearChatInner()
                    chat = incomingChat
                } else {
                    chat = incomingChat[0]
                    if (chat.chatId !== activeChatId) {
                        return
                    }
                }
                messageToSend = null

                if (chat.companionUser.username.length > 30) {
                    labelText = chat.companionUser.username.substr(0, 30)
                    chatLabel.innerText = labelText.trim() + "..."
                } else {
                    labelText = chat.companionUser.username
                    chatLabel.innerText = labelText
                }
                chatLabel.setAttribute("title", labelText)

                for (let i = 0; i < chat.messages.length; i++) {
                    const msg = chat.messages[i],
                        timeMsg = moment(msg.createdAt).format("HH:mm:ss")
                    let chatMessage = document.createElement("div")
                    chatMessage.setAttribute("title", `${timeMsg}`)
                    let chatMessageAvatar = document.createElement("a")
                    chatMessageAvatar.className = "flex-center img"
                    chatMessage.appendChild(chatMessageAvatar)
                    let chatMessageAvatarImg = document.createElement("img")
                    chatMessageAvatarImg.setAttribute(
                        "alt",
                        `${msg.senderUsername}`,
                    )
                    chatMessageAvatar.appendChild(chatMessageAvatarImg)
                    let chatMessageText = document.createElement("div")
                    chatMessageText.className = "text"
                    chatMessageText.innerText = `${msg.message}`
                    chatMessage.appendChild(chatMessageText)

                    if (chat.user.username === msg.senderUsername) {
                        //сообщение отправителя
                        chatMessage.className = "message myMessage"
                        chatMessageAvatarImg.setAttribute(
                            "src",
                            `${chat.user.avatarUrl}`,
                        )
                    } else {
                        //сообщение получателя
                        chatMessage.className = "message receivedMessage"
                        chatMessageAvatarImg.setAttribute(
                            "src",
                            `${chat.companionUser.avatarUrl}`,
                        )
                    }
                    if (!newMesssages) {
                        chatInnerMessages.insertAdjacentElement(
                            "afterbegin",
                            chatMessage,
                        )
                    } else {
                        chatInnerMessages.insertAdjacentElement(
                            "beforeend",
                            chatMessage,
                        )
                    }
                }

                scrollChatDownAndFocus()
                // setTimeout((chatBody.scrollTop = chatInnerMessages.offsetHeight), 0)
                // chatBody.scrollTop = 9999;

                companionId = chat.companionUser.id
            }

            function scrollChatDownAndFocus() {
                setTimeout(
                    (chatInner.scrollTop =
                        chatInnerMessages.offsetHeight + 9999),
                    500,
                )
                // chatInput.focus()
            }

            function removeExistingChats(incomingChat) {
                document.body
                    .querySelectorAll(".js_chat_history_item")
                    .forEach(chat => {
                        if (chat.dataset.chatId === incomingChat[0].chatId) {
                            chat.remove()
                        }
                    })
            }
            function deleteChatItem(companionId) {
                fetch(
                    `${apiUrl}api/v1/store/chats?userId=${userID}&companionId=${companionId}`,
                    {
                        method: "DELETE",
                    },
                )
                    .then(function(response) {
                        if (response.ok) {
                            //console.log(response)
                            //console.log(chatsData)
                            chatsData = chatsData.filter(
                                chat => chat.companionUser.id !== companionId,
                            )
                            renderChats(sortedByLast(chatsData))
                            confirmModal.classList.remove("active")
                        } else {
                            console.log(
                                `Error: ${response.status} - ${response.statusText}`,
                            )
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                    })
            }
            function closeDeletehatConfirm(companionId) {
                let companion = companionId
                let closeConfirmBtn = document.querySelector(
                    ".js_confirm_close",
                )
                let delBtn = document.querySelector(".js_del_chat")
                closeConfirmBtn.addEventListener("click", () => {
                    //console.log('ololo')
                    confirmModal.classList.remove("active")
                })
                delBtn.addEventListener("click", () => {
                    deleteChatItem(companion)
                })
            }
            function deleteChatConfirm() {
                let openBtns = document.querySelectorAll(".open_confirm_btn")

                openBtns.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.stopPropagation()
                        confirmModal.classList.add("active")
                        closeDeletehatConfirm(btn.dataset.companionId)
                    })
                })
            }
            function renderNewChats(chats, oneNew) {
                let lastMessageTimeHours, lastMessageTimeMonths

                if (chats.length < 1) {
                    //console.log('[ololo]')
                    loadingLayer.classList.remove("active")
                    let helpText = document.createElement("p")
                    helpText.className = "help_chat_text"
                    helpText.innerText =
                        'Создайте диалог, нажав кнопку "Начать чат" на одном из объявлений'
                    return
                } else {
                    if (document.querySelector(".help_chat_text")) {
                        document.querySelector(".help_chat_text").remove()
                    }
                }
                chats.forEach(chat => {
                    lastMessageTimeHours = moment(
                        chat.messages[0].createdAt,
                    ).format("HH:mm:ss")
                    lastMessageTimeMonths = moment(
                        chat.messages[0].createdAt,
                    ).format("DD:MM:YYYY")

                    let newChatAvatar = document.createElement("div")
                    newChatAvatar.className = "img"
                    let newChatAvatarImg = document.createElement("img")
                    newChatAvatarImg.setAttribute(
                        "src",
                        `${chat.companionUser.avatarUrl}`,
                    )
                    newChatAvatarImg.setAttribute(
                        "alt",
                        `${chat.companionUser.username}`,
                    )
                    newChatAvatar.appendChild(newChatAvatarImg)
                    let newChatUsername = document.createElement("div")
                    newChatUsername.className = "nickname"
                    newChatUsername.innerText = chat.companionUser.username
                    let newChatStatus = document.createElement("div")
                    newChatStatus.className = "last_message "
                    let newChatStatusTime = document.createElement("div")
                    newChatStatusTime.className = "time"
                    newChatStatus.appendChild(newChatStatusTime)
                    let statusTimeHours = document.createElement("span")
                    statusTimeHours.className = "hours"
                    statusTimeHours.innerText = lastMessageTimeHours
                    newChatStatusTime.appendChild(statusTimeHours)
                    let statusTimeMonths = document.createElement("span")
                    statusTimeMonths.className = "months"
                    statusTimeMonths.innerText = lastMessageTimeMonths
                    newChatStatusTime.appendChild(statusTimeMonths)
                    let newChatStatusCircle = document.createElement("div")
                    newChatStatusCircle.className = "status_circle"
                    let deleteChatBtn = document.createElement("div")
                    deleteChatBtn.className = "open_confirm_btn"
                    deleteChatBtn.setAttribute("title", "Удалить чат")
                    deleteChatBtn.dataset.companionId = chat.companionUser.id
                    let infoBlock = document.createElement("div")
                    infoBlock.className = "info"

                    let newChat = document.createElement("div")
                    newChat.className =
                        "history-chat__item js_chat_history_item"
                    if (chat.hasNew === true) {
                        newChat.className =
                            "history-chat__item js_chat_history_item hasMessages"
                    }

                    infoBlock.appendChild(newChatStatusCircle)
                    infoBlock.appendChild(newChatAvatar)
                    infoBlock.appendChild(newChatUsername)
                    infoBlock.appendChild(deleteChatBtn)
                    newChat.appendChild(infoBlock)
                    newChat.appendChild(newChatStatus)
                    newChat.dataset.chatId = chat.chatId
                    newChat.dataset.userName = chat.companionUser.username
                    if (oneNew && chat.hasNew === true) {
                        newChat.className =
                            "history-chat__item js_chat_history_item hasMessages flashBG animated"
                        chatHistoryActive.insertAdjacentElement(
                            "afterbegin",
                            newChat,
                        )
                    } else {
                        chatHistoryActive.insertAdjacentElement(
                            "beforeend",
                            newChat,
                        )
                    }
                    deleteChatConfirm()
                })
            }

            function renderChats(incomingChats, newNesssages = false) {
                if (newNesssages === false) {
                    chatHistoryActive.innerText = ""
                    renderNewChats(incomingChats)
                } else if (incomingChats.length === 0) {
                    return
                } else {
                    removeExistingChats(incomingChats)
                    renderNewChats(incomingChats, true)
                }
                addEventListenerToInner()
            }

            getChats()
        } else {
            console.log("User not found, please login")

            return
        }
    } else {
        alert("Проверьте соединение с интернетом")
        let count = 1
        const checkConnection = () => {
            fetch(`google.com`, {
                method: "GET",
            })
                .then(function(response) {
                    if (response.ok) {
                        getChats()
                        count = 1001
                        return
                    } else {
                        console.log(
                            `Error: ${response.status} - ${response.statusText}`,
                        )
                        count++
                        checkCount()
                    }
                })
                .catch(function(error) {
                    console.log(error)
                    count++
                    checkCount()
                })
        }
        function checkCount() {
            if (count < 1000) {
                //console.log(123)
                setTimeout(checkConnection(), 1000)
            }
        }
    }
})()
