package customer.chatbot.service.AI;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.JsonBoolean;
import com.openai.core.http.StreamResponse;
import com.openai.models.chat.completions.ChatCompletionAssistantMessageParam;
import com.openai.models.chat.completions.ChatCompletionChunk;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
// import com.openai.models.chat.completions.ChatCompletionMessage;
import com.openai.models.chat.completions.ChatCompletionMessageParam;
import com.openai.models.chat.completions.ChatCompletionSystemMessageParam;
import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
import com.openai.models.completions.CompletionUsage;

import cds.gen.aiservice.AIService;
import cds.gen.aiservice.Chats;
import customer.chatbot.model.CommonAIMessage;
import customer.chatbot.model.EntityInfo;
import customer.chatbot.config.AIServicePropertiesConfig;
import customer.chatbot.exception.BusinessException;
import customer.chatbot.helper.ChatHelper;
import customer.chatbot.service.EntityService;

@Service
public class DeepSeekAIService implements AIServiceI {
    private final AIServicePropertiesConfig aiProperties;
    private final ChatHelper chatHelper;
    private final AIService aiService;
    private static final Logger logger = LoggerFactory.getLogger(DeepSeekAIService.class);

    public DeepSeekAIService(
            AIServicePropertiesConfig aiProperties,
            EntityService entityService,
            AIService aiService,
            ChatHelper chatHelper) {
        this.aiProperties = aiProperties;
        this.aiService = aiService;
        this.chatHelper = chatHelper;
    }

    @Override
    public String chat(String userContent, EntityInfo entityInfo) {
        // Implement the chat logic here
        return null;
    }

    @Override
    public SseEmitter chatWithStream(String userContent, EntityInfo entityInfo) {

        Chats chat = chatHelper.getChat(aiService, entityInfo.getId());
        if (chat == null) {
            throw new BusinessException("Chat not found");
        }

        final ExecutorService executor = Executors.newCachedThreadPool();
        SecurityContext securityContext = SecurityContextHolder.getContext();
        SseEmitter emitter = new SseEmitter(20 * 60 * 1000L);
        final var totalUsage = new AtomicReference<CompletionUsage>();
        final StringBuilder responseBuilder = new StringBuilder();

        executor.execute(() -> {
            try {
                SecurityContextHolder.setContext(securityContext);

                List<CommonAIMessage> allMessages = chatHelper.prepareMessages(aiService, userContent, entityInfo);
                chatHelper.saveUserMessage(aiService, userContent, entityInfo);

                // Stream AI completion
                this.streamAICompletion(allMessages).stream().flatMap(completionchunk -> {
                    final var usage = completionchunk.usage().orElse(null);
                    totalUsage.compareAndExchange(null, usage);
                    return completionchunk.choices().stream();
                }).filter(choice -> choice.delta().content().isPresent())
                        .flatMap(choice -> choice.delta().content().stream()).forEach(delta -> {
                            responseBuilder.append(delta);
                            logger.info("Delta: " + delta);
                            AIServiceI.send(emitter, delta);
                        });

            } finally {
                // Save the assistant message after streaming
                chatHelper.saveAssistantMessage(aiService, responseBuilder.toString(), entityInfo);

                // Update the chat title with the summary
                if (chat.getTitle() == null || chat.getTitle().isEmpty()) {

                    // 1.Get all messages for the chat
                    List<CommonAIMessage> allMessages = chatHelper.getChatHistory(aiService, entityInfo.getId());
                    // 2.get summary from AI
                    String summary = getSummaryfromAI(allMessages,
                            "Please summarize the conversation. and give me a title");
                    chatHelper.updateChatTitle(aiService, chat, summary);
                }

                SecurityContextHolder.clearContext();
                AIServiceI.send(emitter, "-----Total Usage-----" + totalUsage.get());
                emitter.complete();
            }
        });

        return emitter;
    }

    private StreamResponse<ChatCompletionChunk> streamAICompletion(List<CommonAIMessage> commonAIMessages) {
        // Implement the logic to stream AI completion here
        OpenAIClient client = OpenAIOkHttpClient.builder()
                .apiKey(aiProperties.getDeepseek().getApiKey())
                .baseUrl(aiProperties.getDeepseek().getApiUrl())
                .build();
        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .model(aiProperties.getDeepseek().getModel())
                .messages(
                        commonAIMessages.stream()
                                .map(message -> switch (message.role()) {
                                    case "user" -> ChatCompletionMessageParam.ofUser(ChatCompletionUserMessageParam
                                            .builder().content(message.content()).build());
                                    case "assistant" ->
                                        ChatCompletionMessageParam.ofAssistant(ChatCompletionAssistantMessageParam
                                                .builder().content(message.content()).build());
                                    case "system" ->
                                        ChatCompletionMessageParam.ofSystem(ChatCompletionSystemMessageParam.builder()
                                                .content(message.content()).build());
                                    default -> throw new IllegalArgumentException("Invalid role: " + message.role());
                                })
                                .toList())
                .putAdditionalBodyProperty("enable_thinking", JsonBoolean.of(false)) // 添加 enable_thinking 参数
                .build();
        return client.chat().completions().createStreaming(params);
    }

    @Override
    public String getSummaryfromAI(List<CommonAIMessage> messages, String prompt) {
        // Add the summary prompt as a user message
        List<CommonAIMessage> summaryMessages = new ArrayList<>(messages);
        summaryMessages.add(new CommonAIMessage("user",
                "Please give me a brief title (maximum 250 characters) for this conversation. Only return the title, no explanation needed."));

        // Create OpenAI client
        OpenAIClient client = OpenAIOkHttpClient.builder()
                .apiKey(aiProperties.getDeepseek().getApiKey())
                .baseUrl(aiProperties.getDeepseek().getApiUrl())
                .build();

        // Create completion parameters
        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .model(aiProperties.getDeepseek().getModel())
                .messages(summaryMessages.stream()
                        .map(message -> switch (message.role()) {
                            case "user" -> ChatCompletionMessageParam.ofUser(ChatCompletionUserMessageParam
                                    .builder().content(message.content()).build());
                            case "assistant" ->
                                ChatCompletionMessageParam.ofAssistant(ChatCompletionAssistantMessageParam
                                        .builder().content(message.content()).build());
                            case "system" ->
                                ChatCompletionMessageParam.ofSystem(ChatCompletionSystemMessageParam.builder()
                                        .content(message.content()).build());
                            default -> throw new IllegalArgumentException("Invalid role: " + message.role());
                        })
                        .toList())
                .putAdditionalBodyProperty("enable_thinking", JsonBoolean.of(false))
                .build();

        try {
            // Get completion response
            var response = client.chat().completions().create(params);

            // Extract the summary text and ensure it's not too long
            String title = response.choices().get(0).message().content().orElse("");
            // Truncate if longer than 250 chars (leaving room for potential encoding)
            return title.length() > 250 ? title.substring(0, 250) : title;
        } catch (Exception e) {
            logger.error("Error getting summary from AI: ", e);
            throw new BusinessException("Failed to generate summary: " + e.getMessage());
        }
    }

}
