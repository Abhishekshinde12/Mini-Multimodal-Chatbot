import uuid 
from rest_framework import status 
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message, Conversation, ConversationFile
from .serializers import MessageSerializer, ConversationSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from ai.llm import model
from ai.rag import ingest_from_document, retrieve_documents

# disabling csrf - as no auth setted up
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')
class CreateNewChat(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        try:
            title = request.data.get('title')
            convo = Conversation.objects.create(title=title)
            serializer = ConversationSerializer(convo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)



class FetchChatsList(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request):
        try:
            convos = Conversation.objects.all()
            serializer = ConversationSerializer(convos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)



class FetchOldChats(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, chat_id):
        try:
            convo = Conversation.objects.get(pk=chat_id)
            serializer = ConversationSerializer(convo)
            return Response(serializer.data['messages'], status=status.HTTP_200_OK)

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)


# Can further add here limit of document upload for each chat
@method_decorator(csrf_exempt, name='dispatch')
class UploadConversationFile(APIView):
    authentication_classes = []
    permission_classes = []
    # by DRF to parse the HTML files
    parser_classes = [MultiPartParser, FormParser]
    def post(self, request, chat_id):
        convesation = Conversation.objects.get(pk=chat_id)
        # uploaded_files = request.FILES.get("file") # for single file
        uploaded_files = request.FILES.getlist("file")

        if not uploaded_files:
            return Response({"error": "File is required."}, status=status.HTTP_400_BAD_REQUEST)       
         
        for f in uploaded_files:
            obj = ConversationFile.objects.create(
                conversation=convesation,
                file=f
            )

            ingest_from_document(obj.file.path)

        return Response({"message": "Files uploaded and processing done"}, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class QueryLLM(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request, chat_id):
        query = request.data.get('query')

        if not chat_id or not query:
            return Response(
                {"error": "chat_id and query are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. get the convo first
            conversation = Conversation.objects.get(pk=chat_id)
            
            # 2. store user message
            msg = Message.objects.create(
                conversation=conversation,
                user_type='user',
                text=query
            )

            # 3. RAG Retrieval
            context = retrieve_documents(query)

            # 4. Build prompt
            prompt = f"""
            You are an intelligent and helpful AI assistant.

            You will receive:
            - A user question
            - Additional reference information (may or may not be relevant)

            Your task:
            1. Use the reference information **only if it meaningfully helps answer the question**.
            2. If the reference information is irrelevant or unhelpful, **ignore it completely**.
            3. Do NOT mention:
            - the words "context", "documents", "RAG", "retrieval", or "knowledge base".
            - that you used any external references.
            4. Provide a clear, direct, and correct answer.
            5. Keep the answer concise but helpful.

            <reference_information>
            {context if context else "None"}
            </reference_information>

            User Question:
            {query}

            Your Answer:
            """

            # 5. LLM response
            response = model.invoke(prompt)
            text = response.content

            # 6. Store LLM response
            llm_message = Message.objects.create(
                conversation=conversation,
                user_type='llm',
                text=text
            )

            serializer = MessageSerializer(llm_message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"Following error occurred": str(e)}, status=status.HTTP_400_BAD_REQUEST)