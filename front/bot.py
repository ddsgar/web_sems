from flask import Flask, request, jsonify
from flask_cors import CORS
import telebot
import threading
from threading import Lock

app = Flask(__name__)
CORS(app)
API_TOKEN = '8005990970:AAG6jwazOfdzo7HVQ0jupJxD80DmZH-byTg'
bot = telebot.TeleBot(API_TOKEN)


user_messages = {}
messages_lock = Lock()

@app.route('/')
def home():
    return "Bot server is running! Use /send_message to send messages."

@app.route('/send_message', methods=['POST', 'OPTIONS'])
def send_message():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
        
    chat_id = data.get('chat_id')
    message = data.get('message')
    
    if not chat_id or not message:
        return jsonify({"error": "Missing chat_id or message"}), 400
    
    with messages_lock:
        if chat_id not in user_messages:
            user_messages[chat_id] = []
        user_messages[chat_id].append({"from": "user", "text": message})
    
    try:
        bot.send_message(chat_id, message)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_messages/<int:chat_id>')
def get_messages(chat_id):
    with messages_lock:
        return jsonify(user_messages.get(chat_id, []))

def run_bot():
    bot.polling(none_stop=True)

if __name__ == '__main__':
    bot_thread = threading.Thread(target=run_bot)
    bot_thread.daemon = True  # Daemonize thread
    bot_thread.start()
    app.run(port=5000, debug=False)
