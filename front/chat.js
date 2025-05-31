document.addEventListener('DOMContentLoaded', function() {
    // Элементы чата
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.querySelector('.close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const quickReplies = document.getElementById('quick-replies');

    // Элементы формы добавления растения
    const showAddPlantFormBtn = document.getElementById('show-add-plant-form');
    const addPlantFormContainer = document.getElementById('add-plant-form-container');
    const plantForm = document.getElementById('plant-form');
    const cancelAddPlantBtn = document.getElementById('cancel-add-plant');
    const successMessage = document.getElementById('success-message');

    // Telegram Bot API токен и ID чата
    const BOT_TOKEN = '6988421773:AAFHpqFJcf2DyQeTlhjPtaSBxxIWR9WXJSI';
    const CHAT_ID = '808803838'; // Замените на ваш CHAT_ID
    const CHAT_HISTORY_KEY = 'chatHistory';

    // Проверка настроек бота
    if (!BOT_TOKEN || !CHAT_ID || CHAT_ID === '808803838') {
        console.error('Не настроен Telegram бот! Пожалуйста, укажите CHAT_ID');
        addMessage("Извините, чат временно не работает. Администратору нужно настроить систему.", 'bot');
    }

    // Показать/скрыть чат
    chatToggle.addEventListener('click', function() {
        chatWidget.classList.toggle('hidden');
        if (!chatWidget.classList.contains('hidden')) {
            loadChatHistory();
        }
    });

    closeChat.addEventListener('click', function() {
        chatWidget.classList.add('hidden');
    });

    // Показать форму добавления растения
    showAddPlantFormBtn.addEventListener('click', function() {
        addPlantFormContainer.classList.remove('hidden');
        showAddPlantFormBtn.classList.add('hidden');
    });

    // Отмена добавления растения
    cancelAddPlantBtn.addEventListener('click', function() {
        addPlantFormContainer.classList.add('hidden');
        showAddPlantFormBtn.classList.remove('hidden');
        plantForm.reset();
    });

    // Отправка сообщения
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            showTypingIndicator();

            sendToTelegram(message).then(() => {
                setTimeout(() => {
                    hideTypingIndicator();
                    respondToUser(message);
                }, 1000 + Math.random() * 2000);
            }).catch(() => {
                hideTypingIndicator();
                addMessage("Не удалось отправить сообщение. Пожалуйста, попробуйте позже.", 'bot');
            });
        }
    }

    // Ответ бота на сообщение пользователя
    function respondToUser(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('добавить растение')) {
            addMessage("Чтобы добавить растение:\n1. Нажмите 'Добавить растение'\n2. Заполните форму\n3. Укажите название, описание и контакты\n4. Нажмите 'Добавить'", 'bot');
        }
        else if (lowerMessage.includes('как работает обмен')) {
            addMessage("Процесс обмена:\n1. Найдите растение в каталоге\n2. Нажмите 'Обменять'\n3. Дождитесь ответа владельца\n4. Договоритесь о встрече", 'bot');
        }
        else if (lowerMessage.includes('правила сообщества')) {
            addMessage("Основные правила:\n✔ Только живые растения\n✔ Честные описания\n✔ Уважительное общение\n❌ Запрещена продажа растений", 'bot');
        }
        else if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуйте')) {
            addMessage("Привет! Чем могу помочь? Вы можете спросить о добавлении растений, правилах обмена или как работает наша платформа.", 'bot');
        }
        else {
            addMessage("Спасибо за ваше сообщение! Если у вас есть вопросы, попробуйте выбрать один из предложенных вариантов или уточните ваш вопрос.", 'bot');
        }
    }

    // Быстрые ответы
    quickReplies.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion')) {
            const reply = e.target.textContent;
            addMessage(reply, 'user');
            showTypingIndicator();

            sendToTelegram(reply).then(() => {
                setTimeout(() => {
                    hideTypingIndicator();
                    handleQuickReply(reply);
                }, 1000);
            });
        }
    });

    // Обработка быстрых ответов
    function handleQuickReply(reply) {
        let botResponse = "";
        switch(reply) {
            case "Как добавить растение?":
                botResponse = "Чтобы добавить растение:\n1. Перейдите в раздел 'Добавить растение'\n2. Заполните форму\n3. Укажите название, описание и фото\n4. Нажмите 'Отправить'";
                break;
            case "Как работает обмен?":
                botResponse = "Процесс обмена:\n1. Найдите растение в каталоге\n2. Нажмите 'Предложить обмен'\n3. Дождитесь ответа владельца\n4. Договоритесь о встрече";
                break;
            case "Правила сообщества":
                botResponse = "Основные правила:\n✔ Только живые растения\n✔ Честные описания\n✔ Уважительное общение\n❌ Запрещена продажа растений";
                break;
            default:
                botResponse = "Спасибо за ваш вопрос! Я свяжусь с вами в ближайшее время.";
        }

        addMessage(botResponse, 'bot');
    }

    // Отправка сообщения в Telegram
    function sendToTelegram(message) {
        return new Promise((resolve, reject) => {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: `Новое сообщение от пользователя:\n${message}`,
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сети');
                }
                return response.json();
            })
            .then(data => {
                console.log('Сообщение отправлено в Telegram:', data);
                resolve(data);
            })
            .catch(error => {
                console.error('Ошибка отправки в Telegram:', error);
                reject(error);
            });
        });
    }

    // Индикатор набора сообщения
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    // Добавление сообщения в чат
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // Сохраняем переносы строк
        const formattedText = text.replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedText;

        chatMessages.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 10);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        saveChatHistory();
    }

    // Сохранение истории чата
    function saveChatHistory() {
        const messages = Array.from(chatMessages.children)
            .filter(el => el.id !== 'typing-indicator')
            .map(el => ({
                text: el.innerHTML,
                class: el.className
            }));
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }

    function loadChatHistory() {
        const history = localStorage.getItem(CHAT_HISTORY_KEY);
        if (history) {
            chatMessages.innerHTML = '';
            JSON.parse(history).forEach(msg => {
                const div = document.createElement('div');
                div.className = msg.class;
                div.innerHTML = msg.text;
                chatMessages.appendChild(div);
                setTimeout(() => {
                    div.classList.add('show');
                }, 10);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            // Приветственное сообщение только если нет истории
            setTimeout(() => {
                addMessage("Привет! Я бот 'Мухоловка'. Чем могу помочь?", 'bot');
            }, 1500);
        }
    }

    // Обработка формы добавления растения
    plantForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Здесь должна быть логика отправки данных на сервер
        // Для демонстрации просто покажем сообщение об успехе
        successMessage.textContent = "Растение успешно добавлено! Ожидайте проверки модератором.";
        successMessage.classList.remove('hidden');
        plantForm.reset();

        // Скрыть сообщение через 5 секунд
        setTimeout(() => {
            successMessage.classList.add('hidden');
            addPlantFormContainer.classList.add('hidden');
            showAddPlantFormBtn.classList.remove('hidden');
        }, 5000);
    });

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Загрузка истории при открытии чата
    if (!chatWidget.classList.contains('hidden')) {
        loadChatHistory();
    }
});
