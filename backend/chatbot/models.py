import uuid 
from django.db import models

# Create your models here.
class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=20)
    text = models.TextField()

    def __str__(self):
        return str(self.id)