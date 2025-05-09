using { ai } from '../db/ai';

service AIService {
    entity Chats as projection on ai.Chats
        actions{
            action chatCompletion(content: String) returns String;
        }
    entity Messages as projection on ai.Messages;
}
// This service exposes the Chats and Messages entities from the ai namespace.