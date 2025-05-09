package customer.chatbot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "ai")
public class AIServicePropertiesConfig {
    private DeepseekConfig deepseek;
    private OpenAIConfig openai;
    private ClaudeConfig claude;
    private String systemPrompt = "You are Claude 3.5 Sonnet, a helpful AI assistant.";

    @Data
    public static class DeepseekConfig {
        private String apiKey;
        private String apiUrl;
        private String model;
    }

    @Data
    public static class OpenAIConfig {
        private String apiKey;
        private String apiUrl;
    }

    @Data
    public static class ClaudeConfig {
        private String apiKey;
        private String apiUrl;
    }
}
