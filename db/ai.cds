using {
    cuid,
    managed
} from '@sap/cds/common';


namespace ai;

entity Chats : cuid, managed {
    title   : String; // Title of chat
    messages : Composition of many Messages
                  on messages.chat = $self; // Composition of messages within the chat
}

entity Messages : cuid, managed {
    chat      : Association to Chats; // Reference to the associated chat
    role      : String; // user, assistant, system
    content   : LargeString; // message content
    chatTime  : Timestamp; // Time stamp of the record
}

