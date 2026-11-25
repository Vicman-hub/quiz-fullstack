# NEW: one place that knows how to talk to QuizAPI and how to normalize its shape.
# The API key stays on the server (read from .env), never in quiz.js.
import os
import requests

QUIZAPI_URL = "https://quizapi.io/api/v1/questions"
TAG_BY_TOPIC = {"javascript": "JavaScript", "python": "Python"}
ANSWER_KEYS = ("answer_a", "answer_b", "answer_c", "answer_d", "answer_e", "answer_f")


def fetch_questions(topic, limit=10):
    api_key = os.getenv("QUIZAPI_KEY")
    if not api_key:
        return []

    response = requests.get(
        QUIZAPI_URL,
        params={"apiKey": api_key, "tags": TAG_BY_TOPIC[topic], "limit": limit},
        timeout=15,
    )
    response.raise_for_status()

    normalised = []
    for item in response.json():
        mapped = _normalise(item, topic)
        if mapped:  # skip malformed items instead of crashing the sync
            normalised.append(mapped)
    return normalised


def _normalise(item, topic):
    answers = item.get("answers") or {}
    correct = item.get("correct_answers") or {}

    keys = [k for k in ANSWER_KEYS if answers.get(k)]
    options = [answers[k] for k in keys]

    # Convert QuizAPI's answer_a_correct style into a 0-based index.
    correct_index = next(
        (i for i, key in enumerate(keys) if correct.get(f"{key}_correct") == "true"),
        None,
    )
    if correct_index is None or len(options) < 2:
        return None

    return {
        "topic": topic,
        "difficulty": (item.get("difficulty") or "").lower(),
        "question": item.get("question") or "",
        "code_block": item.get("description") or "",
        "options": options,
        "correct_index": correct_index,
        "explanation": item.get("explanation") or "",
        "source": "quizapi",
        "external_id": f"quizapi-{item.get('id')}",
    }

