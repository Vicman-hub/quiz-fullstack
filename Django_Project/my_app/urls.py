from django.urls import path
# from django.urls import include
from rest_framework.routers import DefaultRouter
# from .views import StudentRegistrationViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from my_app.views import signup, protected_dashboard, QuizResultView, CookieTokenObtainPairView
from my_app.views import (
    signup,
    protected_dashboard,
    QuizResultView,
    logout,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    get_questions,
    submit_quiz,
)

# And change the refresh route:
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health/", health, name="health"),
    path('signup/', signup, name='signup'),
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/', protected_dashboard, name='dashboard'),
    path('results/', QuizResultView.as_view(), name='results'),
    path('logout/', logout, name='logout'),
     # NEW: dynamic question feed + server-side grading
    path("questions/", get_questions, name="questions"),
    path("quiz/submit/", submit_quiz, name="quiz-submit"),
]







#urlpatterns = [    
#     # Authentication Endpoints  (e.g., domain.com/api/signup/)
#     path('signup/', signup, name='signup'),
#     path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Returns JWT
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
#     # Protected Endpoint
#     path('dashboard/', protected_dashboard, name='dashboard'),
#  path('results/', QuizResultView.as_view(), name='results'),]






# I should use the router below when I want to use a viewset in my views.py file. The router will automatically generate the necessary URLs for the viewset actions (list, create, retrieve, update, delete).

# # Initialize the router
# router = DefaultRouter()

# # Register the viewset. 
# # The first argument 'applications' becomes the base URL.
# router.register(r'students', StudentRegistrationViewSet, basename='studentregistration')

# urlpatterns = [
#     # Include all auto-generated URLs
#     path('', include(router.urls)),
# ]



# urlpatterns = [
#     path('api/register/', RegisterView.as_view(), name='register'),
#     path('api/login/', TokenObtainPairView.as_view(), name='login'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# ]