import uuid 
from django.db import models

# Create your models here.
class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    

class ConversationFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    file = models.FileField(upload_to="conversation_files/")
    processed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.conversation.title} - {self.file.name}"
    

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=20)
    text = models.TextField()

    def __str__(self):
        return str(self.id)