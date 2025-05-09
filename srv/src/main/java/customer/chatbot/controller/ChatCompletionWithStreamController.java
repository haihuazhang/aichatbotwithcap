package customer.chatbot.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import customer.chatbot.model.EntityInfo;
import customer.chatbot.model.StreamChatRequest;
import customer.chatbot.service.AI.AIServiceI;
import jakarta.servlet.http.HttpServletResponse;


import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/chat/completion")
public class ChatCompletionWithStreamController {

    private final AIServiceI aiService;

    public ChatCompletionWithStreamController(@Qualifier("deepseekAIService") AIServiceI aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/streaming")
    public SseEmitter stream(@RequestBody StreamChatRequest request, HttpServletResponse response) {
        // Set Cache-Control header
        // To disable compression of the response by SAP Approuter
        response.setHeader("Cache-Control", "no-transform");

        return aiService.chatWithStream(request.getContent(),
                new EntityInfo(request.getId()));

    }

}
