package customer.chatbot.model;

import lombok.Data;

@Data
public class StreamChatRequest {
    private String id;
    private String content;
}
