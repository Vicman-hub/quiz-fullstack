from django.core.management.base import BaseCommand
from my_app.models import Question
from my_app.services.quizapi import fetch_questions


class Command(BaseCommand):
    help = "Fetch JavaScript/Python questions from QuizAPI and store new ones."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=10)

    def handle(self, *args, **options):
        for topic in ("javascript", "python"):
            for data in fetch_questions(topic, limit=options["limit"]):
                _, created = Question.objects.get_or_create(
                    external_id=data["external_id"],
                    defaults=data,
                )
                if created:
                    self.stdout.write(f"Added {data['external_id']}")
        self.stdout.write(self.style.SUCCESS("Sync complete."))

        