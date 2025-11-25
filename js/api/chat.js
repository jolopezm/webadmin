import { API_URL, getAuthHeaders } from './config.js'

export async function getChatsByUserId(userId) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/chat/?user_id=${userId}`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching chats by user ID:', error)
        throw error
    }
}

export async function createChat(chatData) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/chat/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(chatData),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error creating chat:', error)
        throw error
    }
}

export async function getChatByParticipants(user1, user2) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(
            `${API_URL}/chat/participants?user1_id=${user1}&user2_id=${user2}`,
            {
                method: 'GET',
                headers,
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching chat by participants:', error)
        throw error
    }
}

export async function sendMessage(messageData) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/chat/message/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(messageData),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error sending message:', error)
        throw error
    }
}

export async function getMessagesByChatId(chatId) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(
            `${API_URL}/chat/messages?chat_id=${chatId}`,
            {
                method: 'GET',
                headers,
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching messages by chat ID:', error)
        throw error
    }
}
