package customer.chatbot.helper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import cds.gen.aiservice.AIService;
import cds.gen.aiservice.Chats;
import cds.gen.aiservice.Messages;
import customer.chatbot.config.AIServicePropertiesConfig;
import customer.chatbot.model.CommonAIMessage;
import customer.chatbot.model.EntityInfo;
import customer.chatbot.service.EntityService;

@Component
public class ChatHelper {
    private final AIServicePropertiesConfig aiProperties;
    private final EntityService entityService;

    public ChatHelper(AIServicePropertiesConfig aiProperties, EntityService entityService) {
        this.aiProperties = aiProperties;
        this.entityService = entityService;
    }

    public List<CommonAIMessage> prepareMessages(AIService aiService, String userContent, EntityInfo entityInfo) {
        List<CommonAIMessage> allMessages = new ArrayList<>();

        if (entityService.isFirstChat(aiService, entityInfo.getId())) {
            allMessages.add(new CommonAIMessage("system", aiProperties.getSystemPrompt()));
            // Save system message for first chat
            entityService.saveMessage(aiService, entityInfo.getId(), "system", aiProperties.getSystemPrompt());

        } else {
            // List<Messages> chatHistory = entityService.getChatHistory(aiService, entityInfo.getId());
            // chatHistory.forEach(msg -> allMessages.add(new CommonAIMessage(msg.getRole(), msg.getContent())));
            allMessages = getChatHistory(aiService, entityInfo.getId());
        }

        allMessages.add(new CommonAIMessage("user", userContent));
        return allMessages;
    }

    public List<CommonAIMessage> getChatHistory(AIService aiService, String chatId) {
        List<Messages> chatHistory = entityService.getChatHistory(aiService, chatId);
        List<CommonAIMessage> allMessages = new ArrayList<>();
        chatHistory.forEach(msg -> allMessages.add(new CommonAIMessage(msg.getRole(), msg.getContent())));
        return allMessages;
    }

    public void saveUserMessage(AIService aiService, String content, EntityInfo entityInfo) {
        entityService.saveMessage(aiService, entityInfo.getId(), "user", content);
    }

    public void saveAssistantMessage(AIService aiService, String content, EntityInfo entityInfo) {
        entityService.saveMessage(aiService, entityInfo.getId(), "assistant", content);
    }

    public Chats getChat(AIService aiService, String chatId) {
        return entityService.getChat(aiService, chatId);
    }

    public void updateChatTitle(AIService aiService, Chats chat, String title) {
        entityService.updateChatTitle(aiService, chat, title);
    }
}