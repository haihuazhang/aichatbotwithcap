package customer.chatbot.service.AI;

import java.io.IOException;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import customer.chatbot.model.EntityInfo;
import jakarta.annotation.Nonnull;

public interface AIServiceI {
    public String chat(String userContent, EntityInfo entityInfo);

    public SseEmitter chatWithStream(String userContent, EntityInfo entityInfo);

    /**
     * Send a chunk to the emitter
     *
     * @param emitter The emitter to send the chunk to
     * @param chunk   The chunk to send
     */
    public static void send(@Nonnull final SseEmitter emitter, @Nonnull final String chunk) {
        try {
            emitter.send(chunk);
        } catch (final IOException e) {
            emitter.completeWithError(e);
        }
    }
}
