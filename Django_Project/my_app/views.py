from django.shortcuts import render
# from rest_framework.decorators import api_view, viewsets, AnonRateThrottle
# from rest_framework import viewsets
# from .models import StudentRegistration
# from .serializers import StudentRegistrationSerializer
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import AllowAny, IsAdminUser
# from rest_framework import generics
# from django.contrib.auth.models import User ##
# from .serializers import RegisterSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import QuizResult
from .serializers import QuizResultSerializer

from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
# CHANGED: extra imports for the question endpoints
import random
from .models import QuizResult, Question
from .serializers import (
    UserSerializer,
    QuizResultSerializer,
    QuestionPublicSerializer,
    QuizSubmissionSerializer,
)




@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """Creates a new user using the UserSerializer."""
    # 1. Pass the incoming JSON data to the serializer
    serializer = UserSerializer(data=request.data)

    # 2. Check if the data is valid (e.g., username is unique, no missing fields)
    if serializer.is_valid():
        # 3. Save triggers the create() method in our serializer
        serializer.save()
        return Response({"message": "Secure account created successfully."}, status=status.HTTP_201_CREATED)
    
    # Returns specific security errors (e.g., "Password is too short")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_dashboard(request):
    return Response({
        "message": f"Welcome {request.user.username}!",
        "phone": request.user.phone_number
    })



class QuizResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all results for the logged-in user, newest first
        results = QuizResult.objects.filter(user=request.user).order_by('-date_taken')
        serializer = QuizResultSerializer(results, many=True)
        return Response(serializer.data)

    # def post(self, request):
    #     serializer = QuizResultSerializer(data=request.data)
    #     if serializer.is_valid():
    #         # Automatically associate the result with the logged-in user making the request
    #         serializer.save(user=request.user) 
    #         return Response(serializer.data, status=201)
    #     return Response(serializer.errors, status=400)





@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    response = Response({'message': 'Logged out.'})
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response


class CookieTokenObtainPairView(TokenObtainPairView):
    """Login view that stores the JWT pair in HttpOnly cookies."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access = response.data.get('access')
            refresh = response.data.get('refresh')

            response.set_cookie(
                key='access_token',
                value=access,
                max_age=30 * 60,          # matches ACCESS_TOKEN_LIFETIME
                httponly=True,            # JavaScript cannot read it
                secure=True,             # True in production (HTTPS only)
                samesite='None',
                path='/',
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                max_age=2 * 24 * 60 * 60, # matches REFRESH_TOKEN_LIFETIME
                httponly=True,
                secure=True,
                samesite='None',
                path='/',
            )

            # Do not hand the raw tokens to the browser's JS
            response.data.pop('access', None)
            response.data.pop('refresh', None)
            response.data['message'] = 'Login successful.'

        return response
    


class CookieLogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Successfully logged out."}, status=200)
        # Delete the cookie by setting its expiration to the past
        response.delete_cookie('access_token')
        return response







# NEW: returns random questions for one topic, without answers/explanations.
@api_view(["GET"])
@permission_classes([AllowAny])
def get_questions(request):
    topic = request.query_params.get("topic")
    if topic not in dict(Question.TOPIC_CHOICES):
        return Response(
            {"error": "topic must be 'javascript' or 'python'"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        limit = int(request.query_params.get("limit", 10))
    except ValueError:
        limit = 10
    limit = max(1, min(limit, 50))  # clamp so users cannot request everything

    ids = list(
        Question.objects.filter(is_active=True, topic=topic).values_list("id", flat=True)
    )
    if not ids:
        return Response(
            {"error": "No questions available for this topic."},
            status=status.HTTP_404_NOT_FOUND,
        )

    chosen = random.sample(ids, min(limit, len(ids)))
    questions = Question.objects.filter(id__in=chosen)
    return Response(QuestionPublicSerializer(questions, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_quiz(request):
    serializer = QuizSubmissionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    answers = serializer.validated_data.get("answers") or {}
    question_ids = serializer.validated_data.get("question_ids") or []
    time_taken = serializer.validated_data["time_taken"]

    ids = question_ids or list(answers.keys())
    by_id = {str(q.id): q for q in Question.objects.filter(id__in=ids)}

    results = []
    score = 0

    for qid in ids:
        q = by_id.get(str(qid))
        if q is None:
            continue

        user_index = answers.get(str(qid))
        is_correct = user_index is not None and user_index == q.correct_index
        if is_correct:
            score += 1

        results.append({
            "question_id": q.id,
            "correct_index": q.correct_index,
            "explanation": q.explanation,
            "is_correct": is_correct,
        })

    total = len(results)
    QuizResult.objects.create(
        user=request.user,
        score=score,
        total_questions=total,
        time_taken=time_taken,
    )

    return Response({"score": score, "total": total, "results": results})





class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')
        if not refresh:
            return Response(
                {"detail": "Refresh token missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0])

        data = serializer.validated_data

        response = Response(
            {"detail": "Token refreshed."},
            status=status.HTTP_200_OK,
        )
        response.set_cookie(
            key='access_token',
            value=data['access'],
            max_age=25 * 60,
            httponly=True,
            secure=True,
            samesite='None',
            path='/',
        )

        if 'refresh' in data:
            response.set_cookie(
                key='refresh_token',
                value=data['refresh'],
                max_age=2 * 24 * 60 * 60,
                httponly=True,
                secure=True,
                samesite='None',
                path='/',
            )

        return response







# @api_view(['POST'])
# @permission_classes([AllowAny])
# def signup(request):
#     """Creates a new user using the UserSerializer."""
#     # 1. Pass the incoming JSON data to the serializer
#     serializer = UserSerializer(data=request.data)
    
#     # 2. Check if the data is valid (e.g., username is unique, no missing fields)
#     if serializer.is_valid():
#         # 3. Save triggers the create() method in our serializer
#         serializer.save() 
#         return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
    
#     # 4. If invalid, return the specific errors generated by the serializer
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def protected_dashboard(request):
#     """A secure endpoint that requires a valid JWT."""
#     user = request.user
#     return Response({
#         "message": f"Welcome to the dashboard, {user.username}!",
#         "secret_data": "This data is only visible to authorized users."
#     }, status=status.HTTP_200_OK)






# class StudentRegistrationViewSet(viewsets.ModelViewSet):
#     queryset = StudentRegistration.objects.all()
#     serializer_class = StudentRegistrationSerializer

#     # Restricts unauthenticated users (e.g., max 5 submissions per hour)
#     throttle_classes = [AnonRateThrottle]

#      # Dynamically assign permissions based on the action
#     def get_permissions(self):
#         if self.action == 'create':
#             # Anyone can submit the form (POST)
#             permission_classes = [AllowAny]
#         else:
#             # Only Django superusers/staff can GET, PUT, PATCH, or DELETE
#             permission_classes = [IsAdminUser]
#         return [permission() for permission in permission_classes]

   

# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     permission_classes = (AllowAny,)
#     serializer_class = RegisterSerializer



# class FormSubmissionViewSet(viewsets.ModelViewSet):
#     queryset = FormSubmission.objects.all().order_by('-created_at')
#     serializer_class = FormSubmissionSerializer
