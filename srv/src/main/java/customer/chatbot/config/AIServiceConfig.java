package customer.chatbot.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import customer.chatbot.service.AI.AIServiceI;
import customer.chatbot.service.AI.DeepSeekAIService;
import customer.chatbot.service.EntityService;
import customer.chatbot.helper.ChatHelper;
import cds.gen.aiservice.AIService;

@Configuration
public class AIServiceConfig {
    @Bean
    @Primary
    @Qualifier("deepseekAIService")
    public AIServiceI deepseekAIService(
            AIServicePropertiesConfig aiProperties,
            EntityService entityService,
            AIService aiService,
            ChatHelper chatHelper) {
        return new DeepSeekAIService(aiProperties, entityService, aiService, chatHelper);
    }
}
