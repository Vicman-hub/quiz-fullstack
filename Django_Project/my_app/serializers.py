from datetime import date
from rest_framework import serializers
# from .models import StudentRegistration
# from django.contrib.auth.models import User  ##
# Import your CustomUser model, or use the get_user_model function
from django.contrib.auth import get_user_model 
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from .models import QuizResult
from .models import QuizResult, Question


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        max_length=254,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Email already exists.")]
    )
    
    class Meta:
        model = User
        # Include your new fields in the fields list
        fields = ['username', 'email', 'phone_number', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        """Security: Enforce password complexity rules from settings.py"""
        validate_password(value)
        return value

    def create(self, validated_data):
        # Use create_user to securely hash the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', ''), # Extract new field
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user




class QuizResultSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = QuizResult
        fields = ['id', 'first_name', 'last_name', 'score', 'total_questions', 'time_taken', 'date_taken']
        read_only_fields = ['user', 'date_taken']





# NEW: what the browser is allowed to see. No correct_index, no explanation.
class QuestionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "topic", "difficulty", "question", "code_block", "options"]


class QuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.IntegerField(min_value=0),
        required=False,
        default=dict,
    )
    question_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    time_taken = serializers.CharField(max_length=10, required=False, default="00:00")



# @api_view(['POST'])
# def register_user(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid(): # This checks the max_length limits automatically
#         serializer.save()
#         return Response({"message": "User created!"}, status=201)
    
#     # If the phone number is too long, this returns {"phone_number": ["Ensure this field has no more than 15 characters."]}
#     return Response(serializer.errors, status=400)




# User = get_user_model()


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         # Include your new fields in the fields list
#         fields = ['username', 'password', 'email', 'phone_number']
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             password=validated_data['password'],
#             email=validated_data.get('email', ''),
#             phone_number=validated_data.get('phone_number', '')
#         )
#         return user






# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'password']
#         # Ensure the password is never returned in API responses
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         # We override the create method to use create_user()
#         # This ensures the password is securely hashed in the database.
#         # If we didn't do this, it would save the password as plain text.
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             password=validated_data['password']
#         )
#         return user

    



# class StudentRegistrationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StudentRegistration
#         fields = [
#             'id',
#             'first_name',
#             'last_name',
#             'email',
#             'phone_number',
#             'date_of_birth',
#             'course_of_interest',
#             'reason_for_joining',
#         ]
#         read_only_fields = ['id', 'created_at']

#         # Or fields = '__all__' to include every field automatically

#     #When you should add it
#     # Add 'created_at' to fields if the client needs the timestamp, e.g.:
#     # - the frontend displays "Registered on: ..." 
#     # - the client sorts or filters by registration date
#     # - you want a "newest submissions first" list in the UI

#     # Custom Validation: Prevent future dates of birth
#     def validate_date_of_birth(self, value):
#         if value >= date.today():
#             raise serializers.ValidationError("Date of birth must be in the past.")
#         return value

#     # Custom Validation: Basic phone length or character check
#     def validate_phone_number(self, value):
#         if not value.isdigit():
#             raise serializers.ValidationError("Phone number must contain only digits.")
#         return value




# class RegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('username', 'password', 'email')
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password'] # create_user automatically hashes this
#         )
#         return user