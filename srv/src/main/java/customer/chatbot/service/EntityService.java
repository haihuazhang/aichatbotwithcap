package customer.chatbot.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sap.cds.CdsData;
import com.sap.cds.Result;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.StructuredType;

import com.sap.cds.ql.cqn.CqnSelect;


import cds.gen.aiservice.Messages;
import cds.gen.aiservice.Messages_;
import cds.gen.aiservice.AIService;
import cds.gen.aiservice.Chats;
import cds.gen.aiservice.Chats_;
import customer.chatbot.exception.BusinessException; // Changed from AIServiceException

// Rename from EntityServiceUtil.java
@Service
public class EntityService {

    public Messages saveMessage(AIService service, String chatId, String role, String content) {
        Messages message = Messages.create();
        message.setChatId(chatId);
        message.setRole(role);
        message.setContent(content);
        message.setChatTime(java.time.Instant.now());
        
        return insert(service, Messages_.class, message)
            .single(Messages.class);
    }

    public List<Messages> getChatHistory(AIService service, String chatId) {
        CqnSelect select = Select.from(Messages_.class)
            .where(m -> m.chat_ID().eq(chatId))
            .orderBy(m -> m.chatTime().asc());
        
        return selectList(service, select, Messages.class);
    }

    public boolean isFirstChat(AIService service, String chatId) {
        CqnSelect select = Select.from(Messages_.class)
            .where(m -> m.chat_ID().eq(chatId));
        
        Result result = service.run(select);
        return result.rowCount() == 0;
    }

    // Select operations
    public <T extends CdsData> T selectSingle(AIService service, CqnSelect select, Class<T> type,
            String errorMessage) {
        Result result = service.run(select);
        if (result.rowCount() == 0) {
            throw new BusinessException(errorMessage); // Changed exception type
        }
        return result.single(type);
    }

    public <T extends CdsData> List<T> selectList(AIService service, CqnSelect select, Class<T> type) {
        Result result = service.run(select);
        return result.listOf(type);
    }

    public Chats getChat(AIService service, String chatId) {
        var select = Select.from(Chats_.class)
            .where(c -> c.ID().eq(chatId));
        
        return selectSingle(service, select, Chats.class, "Chat not found with ID: " + chatId);
    }

    /* Get current user using SecurityContextHolder */
    public String getCurrentUser() {
        // Get the current user from the SecurityContextHolder
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        String username = authentication.getName();
        // .getAttribute("user", RequestAttributes.SCOPE_REQUEST);
        // return user != null ? user.getName() : null;
        return username;
    }

    // Insert operations
    private <T extends CdsData, E extends StructuredType<E>> Result insert(
            AIService service,
            Class<E> entityClass,
            T entity) {
        // if (isActiveEntity) {
            return service.run(Insert.into(entityClass).entry(entity));
        // } else {
            // return serviceDraft.newDraft(Insert.into(entityClass).entry(entity));
        // }
    }

    // public void updateReport(
    //         AIService service,
    //         AIService.Draft serviceDraft,
    //         Reports report) {
    //     if (report.getIsActiveEntity()) {
    //         service.run(Update.entity(Reports_.class).data(report));
    //     } else {
    //         serviceDraft.patchDraft(Update.entity(Reports_.class).data(report));
    //     }
    // }
}
