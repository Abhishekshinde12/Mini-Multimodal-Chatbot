from .models import Message, Conversation
from rest_framework import serializers

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "user_type", "text", "conversation"]
        read_only_fields = ["id"]


class ConversationSerializer(serializers.ModelSerializer):
    # Nested serializer to serialize the messages related to the conversation
    messages = MessageSerializer(many=True, read_only=True, source='message_set')
    class Meta:
        model = Conversation
        fields = ["id", "title", "created_at", "messages"]
        read_only_fields = ["id", "created_at"]