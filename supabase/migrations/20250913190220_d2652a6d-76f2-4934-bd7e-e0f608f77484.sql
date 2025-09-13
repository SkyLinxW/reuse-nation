-- Test if we can update messages to read=true for debugging
UPDATE messages 
SET read = true 
WHERE conversation_id = '3f43a741-98e4-4895-814b-baff8bd9bca5' 
  AND sender_id != 'df23c245-5593-4dfa-813f-07fe63a72981' 
  AND read = false;