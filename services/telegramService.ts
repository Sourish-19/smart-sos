
export const sendTelegramMessage = async (botToken: string, chatId: string, message: string): Promise<boolean> => {
    if (!botToken || !chatId) {
        console.warn("Telegram credentials missing");
        return false;
    }

    try {
        // We use a GET request with query parameters and 'no-cors' mode.
        // This bypasses the CORS (Cross-Origin Resource Sharing) block that browsers enforce on the Telegram API.
        // Note: In 'no-cors' mode, we cannot read the response to check if the token was actually valid, 
        // so we assume success if the network request doesn't throw an error.
        
        const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
        
        await fetch(url, {
            method: 'GET',
            mode: 'no-cors'
        });

        return true;
    } catch (error) {
        console.error("Network Error sending Telegram:", error);
        return false;
    }
};
