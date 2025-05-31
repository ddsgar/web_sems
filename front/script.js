document.addEventListener('DOMContentLoaded', () => {
    // ============== Регистрация/Авторизация ==============
    const authForm = document.getElementById('auth-form');
    const authMessage = document.getElementById('auth-message');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authContainer = document.getElementById('auth-container');
    const userInfoContainer = document.getElementById('user-info-container');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const notificationContainer = document.getElementById('notification-container');

    // Получаем текущего пользователя
    const getCurrentUser = () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };

    // Проверяем, авторизован ли пользователь
    const checkAuth = () => {
        const user = getCurrentUser();
        if (user) {
            usernameDisplay.textContent = `Пользователь: ${user.username}`;
            authContainer.style.display = 'none';
            userInfoContainer.classList.remove('hidden');
            return true;
        }
        return false;
    };

    // Показать уведомление
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    };

    // Обработка выхода
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        authContainer.style.display = 'block';
        userInfoContainer.classList.add('hidden');
        authForm.reset();
    });

    // Обработка входа
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            usernameDisplay.textContent = `Пользователь: ${user.username}`;
            authMessage.textContent = 'Вход выполнен успешно!';
            authMessage.classList.remove('hidden');
            authContainer.style.display = 'none';
            userInfoContainer.classList.remove('hidden');

            setTimeout(() => {
                authMessage.classList.add('hidden');
            }, 2000);
        } else {
            authMessage.textContent = 'Неверное имя пользователя или пароль!';
            authMessage.classList.remove('hidden');
        }
    });

    // Обработка регистрации
    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            authMessage.textContent = 'Пожалуйста, заполните все поля!';
            authMessage.classList.remove('hidden');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.username === username)) {
            authMessage.textContent = 'Пользователь с таким именем уже существует!';
            authMessage.classList.remove('hidden');
            return;
        }

        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));

        authMessage.textContent = 'Регистрация прошла успешно! Теперь вы можете войти.';
        authMessage.classList.remove('hidden');
    });

    // ============== Растения и обмен ==============
    const plantList = document.getElementById('plant-list');
    const plantForm = document.getElementById('plant-form');
    const successMessage = document.getElementById('success-message');
    const searchInput = document.getElementById('search-input');
    const showAddPlantFormBtn = document.getElementById('show-add-plant-form');
    const addPlantFormContainer = document.getElementById('add-plant-form-container');
    const cancelAddPlantBtn = document.getElementById('cancel-add-plant');

    // Ключ для localStorage
    const PLANTS_STORAGE_KEY = 'plantsData';
    const EXCHANGE_REQUESTS_KEY = 'exchangeRequests';
    let allPlants = [];

    // Загрузка растений из localStorage
    const loadPlantsFromStorage = () => {
        const storedPlants = localStorage.getItem(PLANTS_STORAGE_KEY);
        if (storedPlants) {
            try {
                allPlants = JSON.parse(storedPlants);
                displayPlants(allPlants);
            } catch (e) {
                console.error('Ошибка при загрузке растений:', e);
                allPlants = [];
            }
        } else {
            // Если нет сохраненных данных, используем начальные данные
            allPlants = [
                { id: 1, name: "Монстера", description: "Крупное декоративное растение", city: "Москва", contact: "user1@example.com", owner: "admin" },
                { id: 2, name: "Фикус", description: "Популярное комнатное растение", city: "Санкт-Петербург", contact: "user2@example.com", owner: "admin" },
                { id: 3, name: "Алоэ", description: "Лекарственное растение", city: "Казань", contact: "user3@example.com", owner: "admin" }
            ];
            displayPlants(allPlants);
        }
    };

    // Сохранение растений в localStorage
    const savePlantsToStorage = () => {
        localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(allPlants));
    };

    // Загрузка запросов на обмен
    const loadExchangeRequests = () => {
        const requests = JSON.parse(localStorage.getItem(EXCHANGE_REQUESTS_KEY) || '[]');
        const currentUser = getCurrentUser();

        if (currentUser) {
            const userRequests = requests.filter(r => r.owner === currentUser.username);
            userRequests.forEach(request => {
                showNotification(`Пользователь ${request.requester} хочет обменять ваше растение "${request.plantName}"`);
            });

            // Очищаем уведомления после показа
            localStorage.setItem(EXCHANGE_REQUESTS_KEY, JSON.stringify(
                requests.filter(r => r.owner !== currentUser.username)
            ));
        }
    };

    const displayPlants = (plants) => {
        if (!plantList) return;

        plantList.innerHTML = '';
        plants.forEach(plant => {
            const plantItem = document.createElement('div');
            plantItem.classList.add('plant-item');
            plantItem.innerHTML = `
                <h2>${escapeHtml(plant.name)}</h2>
                <p><strong>Тип:</strong> ${escapeHtml(plant.description)}</p>
                <p><strong>Город:</strong> ${escapeHtml(plant.city)}</p>
                <p><strong>Контакты:</strong> ${escapeHtml(plant.contact)}</p>
                ${plant.owner ? `<p><strong>Добавил:</strong> ${escapeHtml(plant.owner)}</p>` : ''}
                <div class="plant-buttons">
                    ${getCurrentUser()?.username === plant.owner ?
                        `<button onclick="deletePlant(${plant.id})" class="delete-btn">Удалить</button>
                         <button onclick="editPlant(${plant.id})" class="edit-btn">Редактировать</button>` : ''}
                    <button onclick="exchangePlant(${plant.id})" class="exchange-btn">Обмен</button>
                </div>
            `;
            plantList.appendChild(plantItem);
        });
    };

    // Функция для экранирования HTML
    function escapeHtml(unsafe) {
        return unsafe
            ? unsafe.toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
            : '';
    }

    // Показать форму добавления растения
    showAddPlantFormBtn.addEventListener('click', function() {
        if (!checkAuth()) {
            alert('Пожалуйста, авторизуйтесь для добавления растений');
            return;
        }
        addPlantFormContainer.classList.remove('hidden');
        showAddPlantFormBtn.classList.add('hidden');
    });

    // Отмена добавления растения
    cancelAddPlantBtn.addEventListener('click', function() {
        addPlantFormContainer.classList.add('hidden');
        showAddPlantFormBtn.classList.remove('hidden');
        plantForm.reset();
    });

    if (plantForm) {
        plantForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!checkAuth()) {
                alert('Пожалуйста, авторизуйтесь для добавления растений');
                return;
            }

            const name = document.getElementById('plant-name').value;
            const description = document.getElementById('plant-description').value;
            const city = document.getElementById('plant-city').value;
            const contact = document.getElementById('plant-contact').value;

            try {
                // Генерируем уникальный ID
                const newId = allPlants.length > 0 ? Math.max(...allPlants.map(p => p.id)) + 1 : 1;

                // Получаем имя текущего пользователя
                const currentUser = getCurrentUser();
                const owner = currentUser ? currentUser.username : 'Гость';

                const newPlant = {
                    id: newId,
                    name,
                    description,
                    city,
                    contact,
                    owner: owner  // Добавляем имя пользователя
                };

                allPlants.push(newPlant);
                displayPlants(allPlants);
                savePlantsToStorage(); // Сохраняем в localStorage

                plantForm.reset();
                successMessage.textContent = `Растение "${escapeHtml(name)}" успешно добавлено!`;
                successMessage.classList.remove('hidden');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                    addPlantFormContainer.classList.add('hidden');
                    showAddPlantFormBtn.classList.remove('hidden');
                }, 3000);
            } catch (error) {
                console.error('Error adding plant:', error);
                successMessage.textContent = 'Ошибка при добавлении растения. Пожалуйста, попробуйте снова.';
                successMessage.classList.remove('hidden');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filteredPlants = allPlants.filter(plant =>
                plant.name.toLowerCase().includes(query) ||
                plant.description.toLowerCase().includes(query) ||
                plant.city.toLowerCase().includes(query) ||
                plant.contact.toLowerCase().includes(query) ||
                (plant.owner && plant.owner.toLowerCase().includes(query))
            );
            displayPlants(filteredPlants);
        });
    }

    window.deletePlant = async (id) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, авторизуйтесь для удаления растений');
            return;
        }

        const plant = allPlants.find(p => p.id === id);
        if (!plant) return;

        if (plant.owner !== currentUser.username) {
            alert('Вы можете удалять только свои растения!');
            return;
        }

        if (!confirm('Вы уверены, что хотите удалить это растение?')) return;

        try {
            allPlants = allPlants.filter(plant => plant.id !== id);
            displayPlants(allPlants);
            savePlantsToStorage(); // Сохраняем изменения
        } catch (error) {
            console.error('Error deleting plant:', error);
            alert('Ошибка при удалении растения. Пожалуйста, попробуйте снова.');
        }
    };

    window.editPlant = async (id) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, авторизуйтесь для редактирования растений');
            return;
        }

        const plant = allPlants.find(p => p.id === id);
        if (!plant) return;

        if (plant.owner !== currentUser.username) {
            alert('Вы можете редактировать только свои растения!');
            return;
        }

        const newName = prompt('Введите новое название:', plant.name);
        if (newName === null) return;

        const newDescription = prompt('Введите новое описание:', plant.description);
        const newCity = prompt('Введите новый город:', plant.city);
        const newContact = prompt('Введите новые контакты:', plant.contact);

        try {
            const updatedPlant = {
                ...plant,
                name: newName,
                description: newDescription,
                city: newCity,
                contact: newContact
            };

            allPlants = allPlants.map(p => p.id === id ? updatedPlant : p);
            displayPlants(allPlants);
            savePlantsToStorage(); // Сохраняем изменения
        } catch (error) {
            console.error('Error updating plant:', error);
            alert('Ошибка при обновлении растения. Пожалуйста, попробуйте снова.');
        }
    };

    // Функция для обработки обмена
    window.exchangePlant = async (id) => {
        const plant = allPlants.find(p => p.id === id);
        if (!plant) return;

        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, авторизуйтесь для обмена растениями');
            return;
        }

        // Проверяем, не является ли пользователь владельцем растения
        if (currentUser.username === plant.owner) {
            alert('Вы не можете обменять свое собственное растение!');
            return;
        }

        // Сохраняем запрос на обмен
        const requests = JSON.parse(localStorage.getItem(EXCHANGE_REQUESTS_KEY) || '[]');
        requests.push({
            plantId: plant.id,
            plantName: plant.name,
            owner: plant.owner,
            requester: currentUser.username,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(EXCHANGE_REQUESTS_KEY, JSON.stringify(requests));

        // Показываем уведомление
        showNotification(`Запрос на обмен растения "${plant.name}" отправлен владельцу ${plant.owner}`);

        // В реальном приложении здесь будет отправка уведомления владельцу
        console.log(`Запрос на обмен растения ${plant.id} от пользователя ${currentUser.username}`);
    };

    // ============== Чат-бот ==============
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.querySelector('.close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const quickReplies = document.getElementById('quick-replies');

    // Telegram Bot API токен и ID чата
    const BOT_TOKEN = '6988421773:AAFHpqFJcf2DyQeTlhjPtaSBxxIWR9WXJSI';
    const CHAT_ID = '808803838';
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
            userInput.value = reply;
            sendMessage();
        }
    });

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

    // Инициализация - загрузка растений и проверка авторизации
    loadPlantsFromStorage();
    checkAuth();
    loadExchangeRequests();
});
