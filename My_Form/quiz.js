
let questions = [];
const API_BASE = window.APP_CONFIG.API_BASE;
// Then use ${API_BASE}/signup/, ${API_BASE}/login/, etc.


let quizContainer = document.querySelector("#container");

let currentQuestion = 0;
let userAnswers = [];
let gradingResult = null;

let timerInterval = null;
let timerStatus = "stopped";
let seconds = 60;
let minutes = 7;
let leadingSeconds = "00";
let leadingMinutes = "08";




// CHANGED: the theme button may not exist, so guard it
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        themeToggle.textContent = document.body.classList.contains("light-theme") ? "☀️" : "🌙";
    });
}



function startScreenMarkup() {
    return `
        <div class="quiz-header">
            <span class="badge">Dynamic • Advanced</span>
            <h1 class="quiz-title">Programming Quiz</h1>
            <p class="quiz-subtitle">A freshly generated set of questions just for you.</p>
        </div>

        <div class="topic-picker">
            <label><input type="radio" name="topic" value="javascript" checked> JavaScript</label>
            <label><input type="radio" name="topic" value="python"> Python</label>
        </div>

        <ul class="rules-list">
            <li>The exam consists of multiple-choice questions.</li>
            <li>You have exactly <strong>8 minutes</strong> to complete the test.</li>
            <li>Ensure you submit before the timer reaches zero.</li>
            <li>Answers are saved automatically when you click an option.</li>
        </ul>

        <div class="quiz-action">
            <p class="action-text">// Ready to test your limits?</p>
            <button id="start-btn">Start Exam</button>
        </div>
    `;
}

async function fetchQuestions(topic) {
    const response = await fetch(
        `${API_BASE}/questions/?topic=${encodeURIComponent(topic)}&limit=10`,
        { method: "GET", credentials: "include" }
    );
    if (!response.ok) throw new Error("Could not load questions. Is the backend running and seeded?");
    return response.json();
}

function showQuestion() {
    const q = questions[currentQuestion];
    const selectedAnswer = userAnswers[currentQuestion];
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const progressPercentage = (answeredCount / questions.length) * 100;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;

    const optionsHtml = q.options.map((option, index) => {
        const isSelected = selectedAnswer === index ? "selected" : "";
        const isChecked = selectedAnswer === index ? "checked" : "";
        return `<li class="option ${isSelected}" data-index="${index}">
            <label>
                <input type="radio" name="question-option" value="${index}" ${isChecked}>
                <span class="option-text">${option}</span>
            </label>
        </li>`;
    }).join("");

    quizContainer.innerHTML = `
        <div class="progress-container">
            <svg class="progress-circle" width="80" height="80">
                <circle class="progress-bg" cx="40" cy="40" r="${radius}"></circle>
                <circle class="progress-bar" cx="40" cy="40" r="${radius}"
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"></circle>
                <text x="40" y="45" class="progress-text" transform="rotate(90, 40, 40)">${answeredCount}/${questions.length}</text>
            </svg>
        </div>

        <div id="header-section">
            <h3> Question ${currentQuestion + 1} of ${questions.length} </h3>
            <h3 id="timer">&#9201; ${leadingMinutes}:${leadingSeconds}</h3>
        </div>

        <p> ${q.question} </p>

        ${q.code_block ? `<pre class="code-block"> ${q.code_block} </pre>` : ""}

        <ul id="options-list">${optionsHtml}</ul>

        <div class="nav-buttons">
            <button id="prev-btn" ${currentQuestion === 0 ? "disabled" : ""}>Prev</button>
            <button id="next-btn" ${currentQuestion === questions.length - 1 ? "disabled" : ""}>Next</button>
        </div>

        <button id="submit-quiz-btn" class="submit-all"> Submit Quiz </button>
    `;
}

function stopWatch() {
    seconds--;

    if (seconds < 0) {
        seconds = 59;
        minutes--;
    }

    if (seconds === 0 && minutes === 0) {
        showResults();
    }

    leadingSeconds = seconds < 10 ? "0" + seconds.toString() : seconds;
    leadingMinutes = minutes < 10 ? "0" + minutes.toString() : minutes;

    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.innerHTML = "&#9201; " + leadingMinutes + ":" + leadingSeconds;
}

const popUp = document.getElementById("pop-container");
const yesBtn = document.getElementById("Yes-btn");
const noBtn = document.getElementById("No-btn");

yesBtn.addEventListener("click", () => {
    popUp.style.display = "none";
    showResults();
});

noBtn.addEventListener("click", () => {
    popUp.style.display = "none";
    timerInterval = window.setInterval(stopWatch, 1000);
});

quizContainer.addEventListener("click", async (e) => {
    if (e.target.id === "start-btn") {
        const topic = document.querySelector('input[name="topic"]:checked')?.value || "javascript";
        quizContainer.innerHTML = `<p class="loading-text">Loading ${topic} questions...</p>`;

        try {
            questions = await fetchQuestions(topic);
            if (!questions.length) throw new Error("No questions available.");

            currentQuestion = 0;
            userAnswers = new Array(questions.length).fill(null);
            gradingResult = null;

            if (timerStatus === "stopped") {
                timerInterval = window.setInterval(stopWatch, 1000);
                timerStatus = "started";
            }
            showQuestion();
        } catch (error) {
            quizContainer.innerHTML = `
                <div class="error-box">
                    <p>${error.message}</p>
                    <button id="start-btn">Retry</button>
                </div>`;
        }
        return;
    }

    if (e.target.id === "next-btn") {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion();
        } else {
            showResults();
        }
    }

    if (e.target.id === "prev-btn") {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
        }
    }

    if (e.target.id === "submit-quiz-btn") {
        popUp.style.display = "block";
        window.clearInterval(timerInterval);
    }

    const optionEl = e.target.closest(".option");
    if (optionEl) {
        const optionIndex = parseInt(optionEl.dataset.index);
        userAnswers[currentQuestion] = optionIndex;
        showQuestion();
    }

    if (e.target.id === "restart-btn") restartQuiz();
    if (e.target.id === "view-corrections-btn") viewCorrections();
    if (e.target.id === "view-results-btn") window.location.href = "results.html";
});





// async function showResults() {
//     quizContainer.innerHTML = '<p class="loading-text">Saving your result...</p>';
//     const answers = {};
//     const payload = JSON.stringify({
//         answers,
//         question_ids: questions.map(q => q.id),
//         time_taken: formattedTimeTaken,
//     });

//     try {
//         // Step A: Attempt primary submission (browser automatically attaches HttpOnly cookies)
//         let response = await fetch(`${API_BASE}/quiz/submit/`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             credentials: "include", // Ensures HttpOnly cookies are sent
//             body: payload,
//         });

//         // Step B: If 401 (Access cookie expired), request a token refresh
//         if (response.status === 401) {
//             console.log("Access cookie expired. Retrying with refresh endpoint...");

//             const refreshResponse = await fetch(`${API_BASE}/auth/refresh/`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 credentials: "include", // Sends HttpOnly refresh cookie to Django
//             });

//             if (refreshResponse.ok) {
//                 // The backend just updated the HttpOnly access cookie via 'Set-Cookie'.
//                 // Now retry the original submit request.
//                 response = await fetch(`${API_BASE}/quiz/submit/`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     credentials: "include",
//                     body: payload,
//                 });
//             } else {
//                 // Refresh cookie is also expired or invalid
//                 quizContainer.innerHTML = `<h2>Session expired.</h2><a href="new_login.html">Log in again</a>`;
//                 return;
//             }
//         }

//         // Step C: Handle 403 (Permission denied or CSRF issue)
//         if (response.status === 403) {
//             quizContainer.innerHTML = `<h2>Access denied. Please log in again.</h2><a href="new_login.html">Log in again</a>`;
//             return;
//         }

//         if (!response.ok) throw new Error("Could not save your result.");

//         // Step D: Process success response
//         const gradingResult = await response.json();
       
//         // ... continue rendering your quiz results ...

//     } catch (error) {
//         console.error(error);
//         quizContainer.innerHTML = `<p>Error saving results. Please try again.</p>`;
//     }
// }




// Helper function to extract the CSRF token from browser cookies
// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

async function showResults() {
    window.clearInterval(timerInterval);

    const totalExamSeconds = 8 * 60;
    const secondsRemaining = minutes * 60 + seconds;
    const timeSpentSeconds = Math.max(0, totalExamSeconds - secondsRemaining);
    const formattedTimeTaken =
        String(Math.floor(timeSpentSeconds / 60)).padStart(2, "0") + ":" +
        String(timeSpentSeconds % 60).padStart(2, "0");

    const answers = {};
    questions.forEach((q, index) => {
        if (userAnswers[index] !== null) answers[q.id] = userAnswers[index];
    });

    quizContainer.innerHTML = `<p class="loading-text">Saving your result...</p>`;

    const payload = JSON.stringify({
        answers,
        question_ids: questions.map(q => q.id),
        time_taken: formattedTimeTaken,
    });

    try {
        let response = await fetch(`${API_BASE}/quiz/submit/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: payload,
        });

        if (response.status === 401) {
            const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
                method: "POST",
                credentials: "include",
            });

            if (refreshResponse.ok) {
                response = await fetch(`${API_BASE}/quiz/submit/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: payload,
                });
            } else {
                quizContainer.innerHTML = `<h2>Session expired.</h2><a href="new_login.html">Log in again</a>`;
                return;
            }
        }

        if (!response.ok) throw new Error("Could not save your result.");

        gradingResult = await response.json();

       sessionStorage.setItem("lastQuizAttempt", JSON.stringify({
            gradingResult,
            questions,
            userAnswers
        }));

        quizContainer.innerHTML = `
            <div class="completion-container">
                <div class="completion-icon">
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <h2 class="completion-title">Assessment Complete!</h2>
                <p class="completion-subtitle">Your results have been securely logged.</p>

                <div class="score-card">
                    <div class="score-label">Final Score</div>
                    <div class="score-value">${gradingResult.score}<span> / ${gradingResult.total}</span></div>
                    <div class="score-meta">
                        <i class="fa-regular fa-clock"></i> Time Taken: ${formattedTimeTaken}
                    </div>
                </div>

                <p id="save-status" style="font-size: 0.95rem; font-weight: 600; margin-bottom: 24px; color: #166534;">
                    <i class="fa-solid fa-check-circle"></i> Result saved successfully.
                </p>
                
                <div class="results-action-buttons">
                    <button id="view-corrections-btn" class="btn-full">
                        <i class="fa-solid fa-list-check"></i> View Corrections
                    </button>
                    <button id="view-results-btn">
                        <i class="fa-solid fa-chart-simple"></i> Dashboard
                    </button>
                    <button id="restart-btn">
                        <i class="fa-solid fa-rotate-right"></i> Retake
                    </button>
                </div>
            </div>
        `;
        } catch (error) {
        quizContainer.innerHTML = `<h2>${error.message}</h2><button id="restart-btn">Restart</button>`;
    }
}



// async function showResults() {
//     window.clearInterval(timerInterval);

//     const totalExamSeconds = 8 * 60;
//     const secondsRemaining = minutes * 60 + seconds;
//     const timeSpentSeconds = Math.max(0, totalExamSeconds - secondsRemaining);
//     const formattedTimeTaken =
//         String(Math.floor(timeSpentSeconds / 60)).padStart(2, "0") + ":" +
//         String(timeSpentSeconds % 60).padStart(2, "0");

//     const answers = {};
//     questions.forEach((q, index) => {
//         if (userAnswers[index] !== null) answers[q.id] = userAnswers[index];
//     });

//     quizContainer.innerHTML = `<p class="loading-text">Saving your result...</p>`;

//     try {
//         const response = await fetch(`${API_BASE}/quiz/submit/`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify({
//                 answers,
//                 question_ids: questions.map(q => q.id),
//                 time_taken: formattedTimeTaken,
//             }),
//         });

//         if (response.status === 401 || response.status === 403) {
//             quizContainer.innerHTML = `<h2>Session expired.</h2><a href="new_login.html">Log in again</a>`;
//             return;
//         }

//         if (!response.ok) throw new Error("Could not save your result.");

//         gradingResult = await response.json();

//         quizContainer.innerHTML = `
//             <div style="text-align: center;">
//                 <h2>Quiz Completed!</h2>
//                 <p class="score-display">Your Score: ${gradingResult.score} / ${gradingResult.total}</p>
//                 <button id="view-corrections-btn">View Corrections</button>
//                 <button id="view-results-btn">View My Results</button>
//                 <button id="restart-btn">Restart</button>
//             </div>`;
//     } catch (error) {
//         quizContainer.innerHTML = `<h2>${error.message}</h2><button id="restart-btn">Restart</button>`;
//     }
// }





function viewCorrections() {
    if (!gradingResult) {
        quizContainer.innerHTML = `<p>No graded result available.</p><button id="restart-btn">Back to Start</button>`;
        return;
    }

    const resultById = Object.fromEntries(
        gradingResult.results.map(r => [String(r.question_id), r])
    );

    let correctionsHtml = `<h2>Corrections</h2>`;

    questions.forEach((q, index) => {
        const result = resultById[String(q.id)];
        if (!result) return;

        const userAnswer = userAnswers[index];
        const correctAnswer = result.correct_index;
        const isCorrect = result.is_correct;

        correctionsHtml += `
            <div class="correction-item">
                <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                ${q.code_block ? `<pre class="code-block">${q.code_block}</pre>` : ""}
                <p> Options: ${q.options.map((opt, i) => `<strong>${String.fromCharCode(65 + i)}.</strong> ${opt}`).join(" &nbsp;&nbsp; ")} </p>
                <p>Your Answer: <span class="${isCorrect ? "correct-answer" : "incorrect-answer"}">${userAnswer !== null ? q.options[userAnswer] : "No answer"}</span></p>
                <p>Correct Answer: <span class="correct-answer">${q.options[correctAnswer]}</span></p>
                <p class="correction-explanation">Explanation: ${result.explanation}</p>
            </div>`;
    });

    correctionsHtml += `<button id="restart-btn">Back to Start</button>`;
    quizContainer.innerHTML = `<div id="corrections-container">${correctionsHtml}</div>`;
}

function restartQuiz() {
    currentQuestion = 0;
    questions = [];
    userAnswers = [];
    gradingResult = null;
    window.clearInterval(timerInterval);
    timerStatus = "stopped";
    seconds = 60;
    minutes = 7;
    leadingSeconds = "00";
    leadingMinutes = "08";
    quizContainer.innerHTML = startScreenMarkup();
}

quizContainer.innerHTML = startScreenMarkup();













// const questions = [

//     {
//         id: 1,
//         question: "What will be the output of the following code?", 
//         code_Block: "console.log(typeof null);",
//         options: ["null",  "object", "undefined", "boolean"],
//         answer: 2,
//         explanation: `In JavaScript, typeof null returns "object" 
//         due to a historical bug in the language that has been preserved for backward compatibility.`
//     },
 
//       {
//         id: 2,
//         question: "What is the output of the following Python code?",
//         code_Block: `   def append_to(element, to=[]):  
//         to.append(element)  
//         return to 
//     my_list = append_to(12)  
//     my_list = append_to(42)   
//     print(my_list) `,
//         options:[[12], [42], [12, 42], "AttributeError"],
//         answer: 3,
//         explanation: "In Python, default arguments are evaluated once when the function is defined, not each time the function is called. Because to defaults to a mutable list [], the same list object is reused across consecutive calls if no explicit list is provided."
//     },

//      {
//         id: 3,
//         question: "What will this code log?",
//         code_Block: "let x = 0; <br> console.log(x++ + ++x);",
//         options:[1, 2, 3, 4],
//         answer: 3,
//         explanation: "JavaScript does not have a Character type; single characters are stored as strings of length 1."
//     },

//        {
//         id: 4,
//         question: "What is the output of the following code?",
//         code_Block: 
// `def create_multipliers(): 
//     return [lambda x: i * x for i in range(4)]

//  multipliers = create_multipliers() 
//  print([m(2) for m in multipliers])`,

//         options:["[0, 2, 4, 6]", "[6, 6, 6, 6]", "[0, 0, 0, 0]", "[2, 2, 2, 2]"],
//         answer: 2,
//         explanation: "Python's closures look up variables in the enclosing scope dynamically at execution time (late binding). By the time the lambda functions are called, the loop has completed, and the variable i is left at its final value of 3. Therefore, every lambda computes $3 \times 2 = 6$."
//     },

//      {
//         id: 5,
//         question: "What will be logged?",
//         code_Block: "console.log(2 + '2' - 1); ",
//         options:[21, 21, 3, "NaN"],
//         answer: 2,
//         explanation: "\" 2 + '2' → \"22\" (string concatenation) \"22\" - 1 → 21 (string converted to number for subtraction)."
//     },

//         {
//         id: 6,
//         question: "What does the following statement log?",
//         code_Block: 
//         `const arr = Array(3); <br> const result = arr.map((_, i) => i); <br> console.log(result);`,
//         options:[" [0, 1, 2]", "[undefined, undefined, undefined]", "[empty × 3]", "[ , , ]"],
//         answer: 3,
//         explanation: "Array(3) creates an array with 3 empty slots, not slots filled with undefined. Built-in array iteration methods like map(), forEach(), and filter() skip unassigned/empty slots entirely, preserving the empty structure."
//     },

//       {
//         id: 7,
//         question: "What will this output?",
//         code_Block: "console.log([1, 2, 3] + [4, 5, 6]);",
//         options:[ "[1,2,3,4,5,6]", "1,2,34,5,6",  "\"1,2,34,5,6\" (string)", "\"1,2,34,5,6\" (string concatenation)" ],
//         answer: 4,
//         explanation: "Arrays are converted to strings when using +, so it concatenates \"1,2,3\" and \"4,5,6\"."
//     },

//      {
//         id: 8,
//         question: "Which of these is a falsy value in JavaScript?",
//         options:[ "false", 0,  "[]", "{}" ],
//         answer: 2,
//         explanation: 'Falsy values include 0, "", null, undefined, NaN, and false. Empty arrays and objects are truthy.'
//     },

//        {
//         id: 9,
//         question: "What is the evaluation result of the following expression?",
//         code_Block: `result = [[]] or False or (1, 2) and "Python" <br> print(result)`,
//         options:["False", "[[]]", "(1, 2)", "Python"],
//         answer: 4,
//         explanation: `Python evaluates logical operators from left to right using short-circuiting. <br>
//              [[]] is a list containing an empty list, which evaluates to truthy. <br> Therefore, [[]] or False evaluates to [[]]. <br>
//             However, the and operator has higher precedence. Let's look at the remaining expression: ... or ((1, 2) and "Python").  <br>
//             (1, 2) is truthy, so and moves to the next operand and returns "Python". <br>
//             Finally, [[]] or "Python" evaluates to [[]] because [[]] is truthy.   `
//     },

//         {
//         id: 10,
//         question: "What is the output of the following console log?",
//         code_Block: "console.log(0.1 + 0.2 === 0.3);",
//         options:[true, false, undefined , "TypeError"],
//         answer: 2,
//         explanation: "JavaScript numbers are represented as double-precision floats (IEEE 754 standard). Numbers like 0.1 and 0.2 cannot be perfectly represented in binary, resulting in tiny rounding errors. $0.1 + 0.2$ actually equals $0.30000000000000004$, making the comparison false."
//     },

//      {
//         id: 11,
//         question: "What is the output of this snippet in Python 3?",
//         code_Block: 
//         `x = 5 <br> y = [x for x in range(3)] <br> print(x)`,
//         options:[2, 3, 5, "NameError"],
//         answer: 3,
//         explanation: "In Python 3, list comprehensions have their own local scope. The loop variable x inside the comprehension does not overwrite or leak into the outer variable x."
//     },

//        {
//         id: 12,
//         question: "What is the evaluation output of the following statement?",
//         code_Block: 'console.log(1 + "2" + 3 - 1); ',
//         options:[15, 122, 123, "NaN"],
//         answer: 2,
//         explanation: ` Operations run sequentially from left to right:
//         1 + "2" undergoes string concatenation and yields "12".<br> "12" + 3 also concatenates to yield "123".
//          <br> Next is subtraction: "123" - 1. Because the subtraction operator (-) does not work on strings, 
//          JavaScript automatically coerces "123" back into a number, calculating $123 - 1 = 122$.  `
//     },

//        {
//         id: 13,
//         question: "What is the output of this snippet in Python 3?",
//         code_Block: `text = "Python" <br> print(text[1:4:-1])`,
//         options:["tyP", "noht", "\"\" (Empty string)" , "IndexError"],
//         answer: 3,
//         explanation: "The slice parameters are [start:stop:step]. With a negative step (-1), the slice moves from right to left. Since the start index 1 is to the left of the stop index 4, the slice cannot step backward to reach it, resulting in an empty string"
//     },

//       {
//         id: 14,
//         question: 'In Object-Oriented JavaScript, what does <b>"this"</b> keyword refer to inside a standard object method?',
//         options:["The global window or global object.", 
//           "The class that defined the method.",  
//           "The specific object the method is being called on.", 
//           "The first argument passed to the function."],
//         answer: 3,
//         explanation: `When a function is called as a method of an object, <b>"this"</b> is bound to the object the method is called on. This allows the method to access the object's properties and other methods dynamically.`
//     },

//       {
//         id: 15,
//         question: "What does the spread operator (...) do when used inside an array literal?",
//         options:[ "It combines two functions together.", 
//             "It expands an iterable object (like an array) into individual elements." ,  
//             "It creates a new reference to the exact same array in memory.", 
//             "It restricts the number of arguments a function can take." ],
//         answer: 2,
//         explanation: 'Falsy values include 0, "", null, undefined, NaN, and false. Empty arrays and objects are truthy.'
//     }

// ]


// let quizContainer = document.querySelector("#container");

// let currentQuestion = 0;
// let userAnswers = new Array(questions.length).fill(null);

// // document.getElementById('theme-toggle').addEventListener('click', () => {
// //     document.body.classList.toggle('light-theme');
// //     document.getElementById('theme-toggle').textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
// // });

// // Function to display question
// function showQuestion() {

//     // Get current question
//     let q = questions[currentQuestion];
//     let selectedAnswer = userAnswers[currentQuestion];
//     let answeredCount = userAnswers.filter(ans => ans !== null).length;
//     let progressPercentage = (answeredCount / questions.length) * 100;
    
//     // Circle properties for SVG
//     const radius = 30;
//     const circumference = 2 * Math.PI * radius;
//     const offset = circumference - (progressPercentage / 100) * circumference;

//     // Create options HTML using map
//     const optionsHtml = q.options.map((option, index) => {
//         const isSelected = selectedAnswer === index ? 'selected' : '';
//         const isChecked = selectedAnswer === index ? 'checked' : '';
//         return `<li class="option ${isSelected}" data-index="${index}">
//             <label>
//                 <input type="radio" name="question-option" value="${index}" ${isChecked}>
//                 <span class="option-text">${option}</span>
//             </label>
//         </li>`
//     }).join("");

//     // Display Question
//   quizContainer.innerHTML = `
//     <div class="progress-container">
//         <svg class="progress-circle" width="80" height="80">
//             <circle class="progress-bg" cx="40" cy="40" r="${radius}"></circle>
//             <circle class="progress-bar" cx="40" cy="40" r="${radius}" 
//                 style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"></circle>
//             <text x="40" y="45" class="progress-text" transform="rotate(90, 40, 40)">${answeredCount}/${questions.length}</text>
           
//         </svg>
//     </div>

//     <div id="header-section"> 
//         <h3> Question ${q.id} of ${questions.length} </h3>
//         <h3 id="timer">&#9201; ${leadingMinutes}:${leadingSeconds}</h3>
//     </div>

//     <p> ${q.question} </p> 

//     ${q.code_Block ? `
//         <pre class="code-block"> ${q.code_Block} </pre>` : ""}  

//     <ul id="options-list">
//         ${optionsHtml}
//     </ul>
    
//     <div class="nav-buttons">
//         <button id="prev-btn" ${currentQuestion === 0 ? 'disabled' : ''}>
//             Prev
//         </button>
//         <button id="next-btn" ${currentQuestion === questions.length - 1 ? 'disabled' : ''}>
//             Next
//         </button>
//     </div>

//     <button id="submit-quiz-btn" class="submit-all"> Submit Quiz </button>
//    `;
//  }

    
// let timerInterval = null;
// let timerStatus = "stopped";

// let seconds = 60;
// let minutes = 7;

// let leadingSeconds = "00";
// let leadingMinutes = "08";


//  function stopWatch(){

//      seconds--;

//     if (seconds < 0) {
//         seconds = 59;
//         minutes--;
//     }

//     if(seconds === 0 && minutes === 0){
//         showResults();
//     }
    
//     if (seconds < 10) {
//         leadingSeconds = "0" + seconds.toString();
//     }else{
//         leadingSeconds = seconds;
//     }
    
//     if (minutes < 10) {
//         leadingMinutes = "0" + minutes.toString();
//     }else{
//         leadingMinutes = minutes;
//     }

//     let displayTimer = document.getElementById('timer').innerHTML = "&#9201; " + leadingMinutes + ":" + leadingSeconds;
//  }

//     let popUp = document.getElementById('pop-container');
//     let yesBtn = document.getElementById('Yes-btn');
//     let noBtn = document.getElementById('No-btn');

//     yesBtn.addEventListener('click', function(){
//     popUp.style.display = 'none';
//      showResults();
//     });

//     noBtn.addEventListener('click', function(){
//     popUp.style.display = 'none';
//      timerInterval = window.setInterval(stopWatch, 1000);
//     });

// quizContainer.addEventListener('click', (e) =>{

//     if (e.target.id === 'start-btn') {
//         quizContainer.innerHTML = "";
//         if (timerStatus === "stopped") {
//             timerInterval = window.setInterval(stopWatch, 1000);
//             timerStatus = "started";
//         }
//         showQuestion();
//     }

//     if (e.target.id === 'next-btn') {
//         if (currentQuestion < questions.length -1) {
//              currentQuestion++; // Move to the next index
//             showQuestion();
//             displayTimer = timerInterval;
//         } else {
//             showResults();
//         }
//     } 

//     if (e.target.id === 'submit-quiz-btn') {
//      popUp.style.display = 'block';
     
//      window.clearInterval(timerInterval);
//   }
        
//     if(e.target && e.target.id === "prev-btn"){
//         if (currentQuestion > 0) {
//              currentQuestion--; // Move to the previous question
//             showQuestion();
//         } 
//     }

//  // Handle Option Selection
//     const optionEl = e.target.closest('.option');
//     if (optionEl) {
//         const optionIndex = parseInt(optionEl.dataset.index);
//         userAnswers[currentQuestion] = optionIndex;
//         showQuestion();
//     }

//     if (e.target.id === 'restart-btn') {
//         restartQuiz();
//     }

//     if (e.target.id === 'view-corrections-btn') {
//         viewCorrections();
//     }

//      if (e.target.id === 'view-results-btn') {
//         window.location.href = 'results.html';
//     }
    
//     });

        
//     let timeInterval = "hi";
//     let timeStatus = "stop"



// //   function showResults() {
// //     let score = 0;
// //     questions.forEach((q, index) => {
// //         // answer is 1-indexed in the questions array
// //         if (userAnswers[index] === q.answer - 1) {
// //             score++;
// //         }
// //     });

// //     quizContainer.innerHTML = `
// //         <div style="text-align: center;">
// //             <h2>Quiz Completed!</h2>
// //             <p class="score-display">Your Score: ${score} / ${questions.length}</p>
// //             <button id="restart-btn">Restart</button>
// //             <button id="view-corrections-btn">View Corrections</button>
// //         </div>
// //     `;


// //    async function showResults() {
// //     let score = 0;
// //     questions.forEach((q, index) => {
// //         if (userAnswers[index] === q.answer - 1) {
// //             score++;
// //         }
// //     });

// //     // Calculate time taken
// //     const totalExamSeconds = 8 * 60; 
// //     const secondsRemaining = (minutes * 60) + seconds;
// //     const timeSpentSeconds = totalExamSeconds - secondsRemaining;
    
// //     const spentMinutes = Math.floor(timeSpentSeconds / 60);
// //     const spentSeconds = timeSpentSeconds % 60;
// //     const formattedTimeTaken = `${spentMinutes.toString().padStart(2, '0')}:${spentSeconds.toString().padStart(2, '0')}`;

// //     quizContainer.innerHTML = `
// //         <div style="text-align: center;">
// //             <h2>Saving Results...</h2>
// //             <div class="loader"></div>
// //         </div>
// //     `;

// //     try {
// //         const response = await fetch('http://localhost:8000/api/results/', {
// //             method: 'POST',
// //             headers: { 
// //                 'Content-Type': 'application/json'
// //             },
// //             credentials: 'include', // Automatically sends the HttpOnly JWT cookie
// //             body: JSON.stringify({
// //                 score: score,
// //                 total_questions: questions.length,
// //                 time_taken: formattedTimeTaken
// //             })
// //         });

// //         if (response.ok) {
// //             window.location.href = 'results.html';
// //         } else {
// //             quizContainer.innerHTML = `<h2>Error saving results. Please try again.</h2>`;
// //         }
// //     } catch (error) {
// //         console.error("Network Error:", error);
// //         quizContainer.innerHTML = `<h2>Network error while saving.</h2>`;
// //     }
// // }

// // }







// // function showResults() {
// //     window.clearInterval(timerInterval);

// //     let score = 0;
// //     questions.forEach((q, index) => {
// //         if (userAnswers[index] === q.answer - 1) score++;
// //     });

// //     const totalExamSeconds = 8 * 60;
// //     const secondsRemaining = (minutes * 60) + seconds;
// //     const timeSpentSeconds = Math.max(0, totalExamSeconds - secondsRemaining);
// //     const formattedTimeTaken =
// //         String(Math.floor(timeSpentSeconds / 60)).padStart(2, '0') + ':' +
// //         String(timeSpentSeconds % 60).padStart(2, '0');

// //     quizContainer.innerHTML = `<h2>Saving Results...</h2>`;
// //     saveQuizResult(score, formattedTimeTaken);
// // }


// function showResults() {
//     window.clearInterval(timerInterval);

//     let score = 0;
//     questions.forEach((q, index) => {
//         if (userAnswers[index] === q.answer - 1) score++;
//     });

//     const totalExamSeconds = 8 * 60;
//     const secondsRemaining = (minutes * 60) + seconds;
//     const timeSpentSeconds = Math.max(0, totalExamSeconds - secondsRemaining);
//     const formattedTimeTaken =
//         String(Math.floor(timeSpentSeconds / 60)).padStart(2, '0') + ':' +
//         String(timeSpentSeconds % 60).padStart(2, '0');



//     // quizContainer.innerHTML = `
//     //     <div style="text-align: center;">
//     //         <h2>Quiz Completed!</h2>
//     //         <p class="score-display">Your Score: ${score} / ${questions.length}</p>
//     //         <p id="save-status">Saving your result...</p>
//     //         <button id="view-corrections-btn">View Corrections</button>
//     //         <button id="view-results-btn">View My Results</button>
//     //         <button id="restart-btn">Restart</button>
//     //     </div>
//     // `;


// // Wrap the buttons in the .results-action-buttons div
//     quizContainer.innerHTML = `
//         <div style="text-align: center; padding: 20px 0;">
//             <div style="width: 64px; height: 64px; background: #dcfce7; color: #166534; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px;">
//                 <i class="fa-solid fa-check"></i>
//             </div>
//             <h2 style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Assessment Complete</h2>
//             <p class="score-display" style="font-size: 2.5rem; font-weight: 800; color: #4f46e5; margin: 16px 0;">
//                 ${score} <span style="font-size: 1.2rem; color: #64748b;">/ ${questions.length}</span>
//             </p>
//             <p id="save-status" style="font-size: 0.95rem; font-weight: 600; margin-bottom: 24px;">Saving your result...</p>
            
//             <div class="results-action-buttons">
//                 <button id="view-corrections-btn">
//                     <i class="fa-solid fa-list-check"></i> View Corrections
//                 </button>
//                 <button id="view-results-btn">
//                     <i class="fa-solid fa-chart-simple"></i> View My Results
//                 </button>
//                 <button id="restart-btn">
//                     <i class="fa-solid fa-rotate-right"></i> Retake Assessment
//                 </button>
//             </div>
//         </div>
//     `;

//     saveQuizResult(score, formattedTimeTaken);
// }


// async function saveQuizResult(score, formattedTimeTaken) {
//     const statusEl = document.getElementById('save-status');

//     try {
//         const response = await fetch('http://localhost:8000/api/results/', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include',
//             body: JSON.stringify({
//                 score: score,
//                 total_questions: questions.length,
//                 time_taken: formattedTimeTaken
//             })
//         });

//         if (response.status === 401) {
//             statusEl.textContent = "Session expired. Please log in again.";
//             statusEl.style.color = "red";
//             return;                       // do NOT redirect
//         }

//         if (response.ok) {
//             statusEl.textContent = "Result saved.";
//             statusEl.style.color = "green";
//         } else {
//             const err = await response.json().catch(() => ({}));
//             console.error("Save rejected:", err);
//             statusEl.textContent = "Result could not be saved.";
//             statusEl.style.color = "red";
//         }
//     } catch (error) {
//         console.error("Save failed:", error);
//         statusEl.textContent = "Network error while saving.";
//         statusEl.style.color = "red";
//     }
// }


// // async function saveQuizResult(score, formattedTimeTaken) {
// //     try {
// //         const response = await fetch('http://localhost:8000/api/results/', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             credentials: 'include',          // sends the HttpOnly JWT cookie
// //             body: JSON.stringify({
// //                 score: score,
// //                 total_questions: questions.length,
// //                 time_taken: formattedTimeTaken
// //             })
// //         });

// //         if (response.status === 401) {
// //             window.location.href = 'new_login.html';
// //             return;
// //         }

// //         if (response.ok) {
// //             window.location.href = 'results.html';
// //         } else {
// //             const err = await response.json().catch(() => ({}));
// //             console.error("Save rejected:", err);
// //             quizContainer.innerHTML = `<h2>Error saving results.</h2>`;
// //         }
// //     } catch (error) {
// //         console.error("Save failed:", error);
// //         quizContainer.innerHTML = `<h2>Network error while saving.</h2>`;
// //     }
// // }





// function restartQuiz() {
//     currentQuestion = 0;
//     userAnswers = new Array(questions.length).fill(null);
//     window.clearInterval(timerInterval);
//     timerStatus = "stopped";
//     seconds = 60;
//     minutes = 7;
//     leadingSeconds = "00";
//     leadingMinutes = "08";

//     quizContainer.innerHTML = `
//       <div>  
        
//         <div class="quiz-header">
//             <span class="badge">
//                 V1.0 • Advanced
//             </span>
//             <h1 class="quiz-title">Programming Quiz</h1>
//             <p class="quiz-subtitle">
//               Welcome to this curated collection of challenging Python and JavaScript conceptual exam questions.
//             </p>
//         </div>

//         <ul class="rules-list">
//             <li>The exam consists of multiple-choice questions.</li>
//             <li>You have exactly <strong>8 minutes</strong> to complete the test.</li>
//             <li>Ensure you submit before the timer reaches zero.</li>
//             <li>Answers are saved automatically when you click an option.</li>
//         </ul>

//         <div class="quiz-action">
//             <p class="action-text">// Ready to test your limits?</p>
//             <button id="start-btn">Start Exam</button>
//         </div>

//      </div>   

//     `;
// }

// function viewCorrections() {
//     let correctionsHtml = `<h2>Corrections</h2>`;
    
//     questions.forEach((q, index) => {
//         const userAnswer = userAnswers[index];
//         const correctAnswer = q.answer - 1;
//         const isCorrect = userAnswer === correctAnswer;

//         correctionsHtml += `
//           <div class="correction-item">
//               <p><strong>Question ${q.id}:</strong> ${q.question}</p>
//               ${q.code_Block ? `<pre class="code-block">${q.code_Block}</pre>` : ""}
//              <p> Options: ${q.options.map((opt, i) => `<strong>${String.fromCharCode(65 + i)}.</strong> ${opt}`).join(' &nbsp;&nbsp; ')} </p>
//               <p>Your Answer: <span class="${isCorrect ? 'correct-answer' : 'incorrect-answer'}">${userAnswer !== null ? q.options[userAnswer] : "No answer"}</span></p>
//               <p>Correct Answer: <span class="correct-answer">${q.options[correctAnswer]}</span></p>
//               <p class="correction-explanation">Explanation: ${q.explanation}</p>
//           </div>
//         `;
//     });

//     correctionsHtml += `<button id="restart-btn">Back to Start</button>`;
    
//     quizContainer.innerHTML = `
//         <div id="corrections-container">
//             ${correctionsHtml}
//         </div>
//     `;
// }








//     // quizContainer.innerHTML = `
//     //     <div style="text-align: center;">
//     //         <h2>Quiz Completed!</h2>
//     //         <p class="score-display">Your Score: ${score} / ${questions.length}</p>
//     //         <p id="save-status">Saving your result...</p>
//     //         <button id="view-corrections-btn">View Corrections</button>
//     //         <button id="view-results-btn">View My Results</button>
//     //         <button id="restart-btn">Restart</button>
//     //     </div>
//     // `;