from django.urls import path
from .views import *

urlpatterns = [
    path('new_chat/', CreateNewChat.as_view()), # creating new chat
    path('fetch_chat_list/', FetchChatsList.as_view()), # return list of all the chats
    path('fetch_old_chats/', FetchOldChats.as_view()), # fetch old messages
    path('query/', QueryLLM.as_view()), # store message (query)
]
