import uuid 
from rest_framework import status 
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message, Conversation
from .serializers import MessageSerializer, ConversationSerializer


class CreateNewChat(APIView):
    def post(self, request):
        try:
            title = request.data.get('title')
            convo = Conversation.objects.create(title=title)
            serializer = ConversationSerializer(convo)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)



class FetchChatsList(APIView):
    def get(self, request):
        try:
            convos = Conversation.objects.all()
            serializer = ConversationSerializer(convos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class FetchOldChats(APIView):
    def get(self, request, chat_id):
        try:
            convo = Conversation.objects.get(pk=chat_id)
            serializer = ConversationSerializer(convo)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)



class QueryLLM(APIView):
    def post(self, request):
        chat_id = request.data.get('chat_id')
        query = request.data.gete('query')

        if not chat_id or not query:
            return Response(
                {"error": "chat_id and text are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. get the convo first
            conversation = Conversation.objects.get(pkd=chat_id)
            # 2. store user message
            Message.objects.create(
                conversation=conversation,
                user_type='user',
                text=query
            )

            # 3. LangChain call goes here
            text = "llm_output_from_langchain"
            
            # 4. storing LLM response
            llm_message = Message.objects.create(
                conversation=conversation,
                user_type='llm',
                text=text
            )

            serializer = MessageSerializer(llm_message)
            if serializer.is_valid():
                # 5. storing response
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)