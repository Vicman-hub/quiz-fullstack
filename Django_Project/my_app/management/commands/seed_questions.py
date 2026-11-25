from django.core.management.base import BaseCommand
from my_app.models import Question


SEED_QUESTIONS = [
    {
        "external_id": "seed-1", "topic": "javascript",
        "question": "What will be the output of the following code?",
        "code_block": "console.log(typeof null);",
        "options": ["null", "object", "undefined", "boolean"],
        "correct_index": 1,
        "explanation": 'In JavaScript, typeof null returns "object" due to a historical bug preserved for backward compatibility.',
    },
    {
        "external_id": "seed-2", "topic": "python",
        "question": "What is the output of the following Python code?",
        "code_block": "def append_to(element, to=[]):\n    to.append(element)\n    return to\n\nmy_list = append_to(12)\nmy_list = append_to(42)\nprint(my_list)",
        "options": ["[12]", "[42]", "[12, 42]", "AttributeError"],
        "correct_index": 2,
        "explanation": "Default arguments are evaluated once when the function is defined. Because to defaults to a mutable list, the same list is reused across calls.",
    },
    {
        "external_id": "seed-3", "topic": "javascript",
        "question": "What will this code log?",
        "code_block": "let x = 0; <br> console.log(x++ + ++x);",
        "options": [1, 2, 3, 4],
        "correct_index": 1,  # CORRECTED: x++ is 0, ++x is 2, so the result is 2
        "explanation": "x++ returns 0 and sets x to 1. ++x then sets x to 2 and returns 2. 0 + 2 = 2.",
    },
    {
        "external_id": "seed-4", "topic": "python",
        "question": "What is the output of the following code?",
        "code_block": "def create_multipliers():\n    return [lambda x: i * x for i in range(4)]\n\nmultipliers = create_multipliers()\nprint([m(2) for m in multipliers])",
        "options": ["[0, 2, 4, 6]", "[6, 6, 6, 6]", "[0, 0, 0, 0]", "[2, 2, 2, 2]"],
        "correct_index": 1,
        "explanation": "Python closures use late binding. By the time the lambdas run, i is 3, so every lambda computes 3 * 2 = 6.",
    },
    {
        "external_id": "seed-5", "topic": "javascript",
        "question": "What will be logged?",
        "code_block": "console.log(2 + '2' - 1);",
        "options": [21, 21, 3, "NaN"],
        "correct_index": 1,
        "explanation": "2 + '2' becomes '22', then '22' - 1 becomes 21.",
    },
    {
        "external_id": "seed-6", "topic": "javascript",
        "question": "What does the following statement log?",
        "code_block": "const arr = Array(3); <br> const result = arr.map((_, i) => i); <br> console.log(result);",
        "options": ["[0, 1, 2]", "[undefined, undefined, undefined]", "[empty x 3]", "[ , , ]"],
        "correct_index": 2,
        "explanation": "Array(3) creates empty slots, and map() skips empty slots.",
    },
    {
        "external_id": "seed-7", "topic": "javascript",
        "question": "What will this output?",
        "code_block": "console.log([1, 2, 3] + [4, 5, 6]);",
        "options": ["[1,2,3,4,5,6]", "1,2,34,5,6", '"1,2,34,5,6" (string)', '"1,2,34,5,6" (string concatenation)'],
        "correct_index": 3,
        "explanation": "Arrays are converted to strings when using +, so '1,2,3' and '4,5,6' are concatenated.",
    },
    {
        "external_id": "seed-8", "topic": "javascript",
        "question": "Which of these is a falsy value in JavaScript?",
        "options": ["false", 0, "[]", "{}"],
        "correct_index": 1,
        "explanation": 'Falsy values include 0, "", null, undefined, NaN, and false. Empty arrays and objects are truthy.',
    },
    {
        "external_id": "seed-9", "topic": "python",
        "question": "What is the evaluation result of the following expression?",
        "code_block": 'result = [[]] or False or (1, 2) and "Python" <br> print(result)',
        "options": ["False", "[[]]", "(1, 2)", "Python"],
        "correct_index": 1,  # CORRECTED: [[]] is truthy, so the expression short-circuits to [[]]
        "explanation": "[[]] is truthy, so the or chain immediately returns [[]].",
    },
    {
        "external_id": "seed-10", "topic": "javascript",
        "question": "What is the output of the following console log?",
        "code_block": "console.log(0.1 + 0.2 === 0.3);",
        "options": [True, False, "undefined", "TypeError"],
        "correct_index": 1,
        "explanation": "0.1 + 0.2 equals 0.30000000000000004, so the comparison is false.",
    },
    {
        "external_id": "seed-11", "topic": "python",
        "question": "What is the output of this snippet in Python 3?",
        "code_block": "x = 5 <br> y = [x for x in range(3)] <br> print(x)",
        "options": [2, 3, 5, "NameError"],
        "correct_index": 2,
        "explanation": "In Python 3, list comprehensions have their own scope, so the outer x stays 5.",
    },
    {
        "external_id": "seed-12", "topic": "javascript",
        "question": "What is the evaluation output of the following statement?",
        "code_block": 'console.log(1 + "2" + 3 - 1);',
        "options": [15, 122, 123, "NaN"],
        "correct_index": 1,
        "explanation": "1 + '2' gives '12', '12' + 3 gives '123', then '123' - 1 converts '123' back to a number, giving 122.",
    },
    {
        "external_id": "seed-13", "topic": "python",
        "question": "What is the output of this snippet in Python 3?",
        "code_block": 'text = "Python" <br> print(text[1:4:-1])',
        "options": ["tyP", "noht", '"" (Empty string)', "IndexError"],
        "correct_index": 2,
        "explanation": "With a negative step, the slice moves right to left. Start 1 is left of stop 4, so the result is an empty string.",
    },
    {
        "external_id": "seed-14", "topic": "javascript",
        "question": 'In Object-Oriented JavaScript, what does <b>"this"</b> keyword refer to inside a standard object method?',
        "options": [
            "The global window or global object.",
            "The class that defined the method.",
            "The specific object the method is being called on.",
            "The first argument passed to the function.",
        ],
        "correct_index": 2,
        "explanation": 'When a function is called as a method of an object, "this" is bound to that object.',
    },
    {
        "external_id": "seed-15", "topic": "javascript",
        "question": "What does the spread operator (...) do when used inside an array literal?",
        "options": [
            "It combines two functions together.",
            "It expands an iterable object (like an array) into individual elements.",
            "It creates a new reference to the exact same array in memory.",
            "It restricts the number of arguments a function can take.",
        ],
        "correct_index": 1,
        "explanation": "The spread operator expands an iterable into individual elements.",
    },
     {
        "external_id": "seed-16", "topic": "javascript",
        "question": "What will the following code log?",
        "code_block": "console.log(typeof NaN);",
        "options": ["number", "NaN", "undefined", "object"],
        "correct_index": 0,
        "explanation": 'NaN stands for "Not-a-Number", but its type is still "number".',
       
    },
    {
        "external_id": "seed-17", "topic": "javascript",
        "question": "What will this comparison evaluate to?",
        "code_block": "console.log([] == false);",
        "options": [True, False, "undefined", "TypeError"],
        "correct_index": 0,
        "explanation": "With loose equality, [] is converted to an empty string '', which becomes 0, and false also becomes 0, so they are equal.",
        
    },
    {
        "external_id": "seed-18", "topic": "javascript",
        "question": "What will be logged?",
        "code_block": "const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);",
        "options": [3, 4, 5, "undefined"],
        "correct_index": 1,
        "explanation": "Arrays are objects. b = a copies the reference, so both variables point to the same array; pushing through b also changes a.",
        
    },
    {
        "external_id": "seed-19", "topic": "javascript",
        "question": "In what order will the following code log?",
        "code_block": "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
        "options": ["A B C D", "A D B C", "A D C B", "A C D B"],
        "correct_index": 2,
        "explanation": "Synchronous code runs first (A, D). Microtasks then run (Promise callback C) before the macrotask queue (setTimeout callback B).",
       
    },
    {
        "external_id": "seed-20", "topic": "javascript",
        "question": "What is the output of the following code?",
        "code_block": "console.log([10, 1, 2].sort());",
        "options": ["[1, 10, 2]", "[1, 2, 10]", "[10, 1, 2]", "TypeError"],
        "correct_index": 0,
        "explanation": "By default, sort() converts elements to strings and compares them lexicographically, so '10' comes before '2'.",
        
    },
    {
        "external_id": "seed-21", "topic": "python",
        "question": "What is the output of the following code?",
        "code_block": "print(bool('False'))",
        "options": [True, False, "False", "TypeError"],
        "correct_index": 0,
        "explanation": "Any non-empty string is truthy in Python, even the string 'False'.",
      
    },
    {
        "external_id": "seed-22", "topic": "python",
        "question": "What will this code print?",
        "code_block": "print(1 == True, 0 == False)",
        "options": ["True True", "True False", "False True", "False False"],
        "correct_index": 0,
        "explanation": "In Python, bool is a subclass of int: True equals 1 and False equals 0, so both comparisons are True.",
        
    },
    {
        "external_id": "seed-23", "topic": "python",
        "question": "What happens when this code runs?",
        "code_block": "a = (1, 2, 3)\na[0] = 5",
        "options": ["a becomes (5, 2, 3)", "TypeError: 'tuple' object does not support item assignment", "a becomes [5, 2, 3]", "IndexError"],
        "correct_index": 1,
        "explanation": "Tuples are immutable, so assigning to one of their indexes raises a TypeError.",
        
    },
    {
        "external_id": "seed-24", "topic": "python",
        "question": "What is the output of this expression?",
        "code_block": "print(3 * 'ab')",
        "options": ["ababab", "ab3", "3ab", "TypeError"],
        "correct_index": 0,
        "explanation": "Multiplying a string by an integer repeats the string that many times.",
      
    },
    {
        "external_id": "seed-25", "topic": "python",
        "question": "What will be printed?",
        "code_block": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
        "options": ["[1, 2, 3]", "[1, 2, 3, 4]", "[4, 1, 2, 3]", "None"],
        "correct_index": 1,
        "explanation": "b = a does not copy the list; both names point to the same list object, so appending through b also affects a.",
        
    },
    {
        "external_id": "seed-26", "topic": "python",
        "question": "What is the output of the following code?",
        "code_block": "print(-7 // 2)",
        "options": [-3, -4, -3.5, 3],
        "correct_index": 1,
        "explanation": "// is floor division, which rounds down to the nearest integer, so -3.5 becomes -4.",
        
    },
    {
        "external_id": "seed-27", "topic": "python",
        "question": "What will this code print?",
        "code_block": "print('2' + '3' * 2)",
        "options": ["232", "233", "222", "TypeError"],
        "correct_index": 1,
        "explanation": "String repetition has higher precedence than concatenation: '3' * 2 becomes '33', then '2' + '33' becomes '233'.",
       
    },
    {
        "external_id": "seed-28", "topic": "python",
        "question": "What is the output of the following code?",
        "code_block": "d = {'a': 1}\nprint(d.get('b', 0) + d['a'])",
        "options": [0, 1, 2, "KeyError"],
        "correct_index": 1,
        "explanation": "d.get('b', 0) returns the default 0 because 'b' is missing, and d['a'] is 1, so the result is 1.",
        
    },
    {
        "external_id": "seed-29", "topic": "python",
        "question": "What is the output of this code?",
        "code_block": "print(list(zip([1, 2, 3], 'ab')))",
        "options": ["[(1, 'a'), (2, 'b'), (3, None)]", "[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b'), (3,)]", "TypeError"],
        "correct_index": 1,
        "explanation": "zip stops at the shortest iterable, so only two pairs are produced.",
        
    },
    {
        "external_id": "seed-30", "topic": "python",
        "question": "What is the output of the following code?",
        "code_block": "print(len({1, 2, 2, 3, 3, 3}))",
        "options": [1, 3, 6, "TypeError"],
        "correct_index": 1,
        "explanation": "A set stores only unique values, so {1, 2, 2, 3, 3, 3} becomes {1, 2, 3}, whose length is 3.",
       
    },
]


class Command(BaseCommand):
    help = "Load the original hand-written quiz questions into the database."

    def handle(self, *args, **options):
        created = 0
        for data in SEED_QUESTIONS:
            _, was_created = Question.objects.get_or_create(
                external_id=data["external_id"],
                defaults=data,
            )
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new questions."))