from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
# import uuid
from django.conf import settings


# Create your models here.

# I can choose to extend the default User model if I want to add extra fields.


class CustomUser(AbstractUser):
    # AbstractUser already provides username, password, email, first_name, last_name.
    # You only need to define the EXTRA fields you want.

    # public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)    
    email = models.EmailField(unique=True, blank=False, max_length=50)
    phone_number = models.CharField(max_length=15, null=False)
    # bio = models.TextField(blank=True, null=True)
    # profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return self.username




# User = get_user_model()

class QuizResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='quiz_results')
    score = models.IntegerField()
    total_questions = models.IntegerField(default=15)
    time_taken = models.CharField(max_length=10) # e.g., "04:23"
    date_taken = models.DateTimeField(auto_now_add=True)



    # ADDED: This makes the database stack the newest exam results at the top
    class Meta:
        ordering = ['-date_taken']

    def __str__(self):
        # CHANGED: Fixed the multiline syntax error
        return f"{self.user.username} - {self.score}/{self.total_questions}"




class Question(models.Model):
    JAVASCRIPT = "javascript"   
    PYTHON = "python"
    TOPIC_CHOICES = [
        (JAVASCRIPT, "JavaScript"),
        (PYTHON, "Python"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES, db_index=True)
    difficulty = models.CharField(max_length=20, blank=True)
    question = models.TextField()
    code_block = models.TextField(blank=True)
    options = models.JSONField()  # e.g. ["null", "object", "undefined", "boolean"]
    correct_index = models.PositiveSmallIntegerField()  # 0-based, unlike your old 1-based `answer`
    explanation = models.TextField(blank=True)
    source = models.CharField(max_length=50, default="seed")  # seed / quizapi / llm
    external_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)



    class Meta:
        ordering = ['-created_at']


    def __str__(self):
        # CHANGED: Reverted to display the actual question text in the admin panel
        return f"[{self.topic}] {self.question[:60]}"












# class CustomUser(AbstractUser):
   
#     phone_number = models.CharField(max_length=15, blank=True, null=True)

    # Optional: If you want them to log in with email instead of username, uncomment this:
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username'] # Fields required when creating a superuser




# class StudentRegistration(models.Model):
#     first_name = models.CharField(max_length=50)
#     last_name = models.CharField(max_length=50)
#     email = models.EmailField(unique=True)
#     phone_number = models.CharField(max_length=15, unique=True)
#     date_of_birth = models.DateField()
#     created_at = models.DateTimeField(auto_now_add=True, db_index=True)
#     reason_for_joining = models.TextField(blank=True, null=True)

    
#     class CourseChoices(models.TextChoices):
#         FRONTEND = 'frontend', 'Frontend Development'
#         BACKEND = 'backend', 'Backend Development'
#         FULLSTACK = 'fullstack', 'Full-Stack Web Development'

#     course_of_interest = models.CharField(
#                 max_length=20,
#                 choices=CourseChoices.choices,
#             )
    
#     def __str__(self):
#         return f"{self.first_name} {self.last_name}"


    # class Meta:
    #     ordering = ['-created_at']