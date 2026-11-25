from django.contrib import admin
# from .models import StudentRegistration
# from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import QuizResult, Question, CustomUser

# Register your models here.


class CustomUserAdmin(UserAdmin):
    # Display the phone number in the user list
    list_display = ('username', 'email', "first_name", "last_name", 'phone_number',)
    ordering = ('-date_joined',)
    
    # Inject your custom fields into the existing admin interface
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Information', {
            'fields': ('phone_number', ),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)



# NEW: lets you review/edit/disable bad questions from the Django admin
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ( "topic", "difficulty", "is_active", "created_at")
    list_filter = ("topic", "difficulty", "is_active", "created_at")
    search_fields = ("question", "explanation",'user__username')
    readonly_fields = ("created_at",)




# Registers the QuizResult model to show scores and usernames
@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    # These become the exact columns left-to-right in your database view
    list_display = ('user', 'score', 'total_questions', 'time_taken', 'date_taken')
    
    # Adds a search bar at the top to quickly find a specific student's score
    search_fields = ('user__username',)
    
    # Adds a filter sidebar to sort scores by the day they were taken
    list_filter = ('date_taken',)








## THis is a customization of the Django admin interface for the built-in User model. It allows you to modify how users are displayed and managed in the admin panel.
# 1. Unregister the default built-in User model
# admin.site.unregister(User)

# # 2. Create a new Admin class inheriting from UserAdmin
# class CustomDefaultUserAdmin(UserAdmin):
    
#     # Overwrite the columns displayed in the table
#     # For example, let's remove 'last_name' and add 'date_joined'
#     list_display = ('username', 'email', 'first_name')
    
#     # Add filtering by the date they joined
#     list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
#     ordering = ('-date_joined',)

# # 3. Re-register the default User model with your new Admin class
# admin.site.register(User, CustomDefaultUserAdmin)




# @admin.register(StudentRegistration)
# class StudentRegistrationAdmin(admin.ModelAdmin):
#     list_display = ('id', 'first_name', 'last_name', 'email', 'phone_number', 'course_of_interest')
#     search_fields = ('first_name', 'last_name', 'email', 'phone_number')
#     list_filter = ('course_of_interest', 'created_at')
#     readonly_fields = ('created_at',)


