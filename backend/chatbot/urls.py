from django.urls import path
from .views import *

urlpatterns = [
    path('new_chat/', CreateNewChat.as_view()), # creating new chat
    path('fetch_chat_list/', FetchChatsList.as_view()), # return list of all the chats
    path('fetch_messages/<uuid:chat_id>/', FetchOldChats.as_view()), # fetch old messages
    path('upload_files/<uuid:chat_id>/', UploadConversationFile.as_view()),
    path('query/<uuid:chat_id>/', QueryLLM.as_view()), # store message (query)
]