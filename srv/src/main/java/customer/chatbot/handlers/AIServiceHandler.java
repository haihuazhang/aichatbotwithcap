package customer.chatbot.handlers;

import java.time.Instant;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import cds.gen.aiservice.AIService_;
import cds.gen.aiservice.Messages;
import cds.gen.aiservice.Messages_;


@Component
@ServiceName(AIService_.CDS_NAME)
public class AIServiceHandler implements EventHandler {

    @Before(event = CqnService.EVENT_CREATE, entity = Messages_.CDS_NAME)
    public void beforeCreateMessages(Stream<Messages> messages) {
        // Implement your logic here
        messages.forEach(message -> {
            message.setChatTime(Instant.now());
        });
    }
}
