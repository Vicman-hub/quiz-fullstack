const API_BASE = window.APP_CONFIG.API_BASE;


document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('tableBody');

    try {
        const response = await fetch(`${API_BASE}/results/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            // CRITICAL: Tells the browser to send your HttpOnly JWT cookie to Django
            credentials: 'include' 
        });

        // If the cookie is missing, expired, or invalid, kick the user back to login
        if (response.status === 401 || response.status === 403) {
            window.location.href = 'new_login.html';
            return;
        }

        if (response.ok) {
            const results = await response.json();
            
            // Handle edge case where a user has registered but hasn't taken a quiz yet
            if (results.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px;">No results found. Take a quiz to see your history!</td></tr>`;
                return;
            }

            // Map the Django data to HTML table rows
            tableBody.innerHTML = results.map(result => {
                const dateObj = new Date(result.date_taken);
                const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                
                // Calculate passing logic (60% threshold)
                const percentage = (result.score / result.total_questions) * 100;
                const isPass = percentage >= 60;
                const statusHtml = isPass 
                    ? `<span class="status-badge status-pass">Pass</span>` 
                    : `<span class="status-badge status-fail">Fail</span>`;

                return `
                    <tr>
                        <td><strong>${result.score}</strong> / ${result.total_questions}</td>
                        <td>${statusHtml}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">${result.time_taken}</td>
                        <td>${formattedDate}</td>
                    </tr>
                `; 
            }).join('');
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Failed to load results.</td></tr>`;
        }
    } catch (error) {
        console.error("Error fetching results:", error);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Network error. Is the backend running?</td></tr>`;
    }
});

  
let resultsContainer = document.querySelector(".auth-container");

resultsContainer.addEventListener("click", (e) => {
    if (e.target.id === "view-corrections-btn") viewCorrections();
    if (e.target.id === "back-dashboard-btn") window.location.href = "results.html";
});





function viewCorrections() {
    const raw = sessionStorage.getItem("lastQuizAttempt");

    if (!raw) {
        alert("No corrections available. Take an assessment first.");
        return;
    }

    const { gradingResult, questions, userAnswers } = JSON.parse(raw);

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
    <div class="correction-item ${isCorrect ? "is-correct" : "is-incorrect"}">
        <div class="correction-item-head">
            <span class="correction-number">Question ${index + 1}</span>
            <span class="correction-status ${isCorrect ? "correct" : "wrong"}">
                <i class="fa-solid ${isCorrect ? "fa-circle-check" : "fa-circle-xmark"}"></i>
                ${isCorrect ? "Correct" : "Incorrect"}
            </span>
        </div>

        <p class="correction-question">${q.question}</p>

        ${q.code_block ? `<pre class="code-block">${q.code_block}</pre>` : ""}

        <div class="correction-options">
            ${q.options.map((opt, i) => `
                <span class="correction-option">
                    ${String.fromCharCode(65 + i)}. ${opt}
                </span>
            `).join("")}
        </div>

        <div class="answer-row ${isCorrect ? "correct" : "wrong"}">
            <span class="answer-label">Your Answer</span>
            <span class="answer-value">
                ${userAnswer !== null ? q.options[userAnswer] : "No answer"}
            </span>
        </div>

        <div class="answer-row correct">
            <span class="answer-label">Correct Answer</span>
            <span class="answer-value">${q.options[correctAnswer]}</span>
        </div>

        <div class="correction-explanation">
            <span class="explanation-label">
                <i class="fa-solid fa-lightbulb"></i> Explanation
            </span>
            <p>${result.explanation}</p>
        </div>
    </div>`;
            });




        correctionsHtml += `
            <button id="back-dashboard-btn">
                <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
            </button>`;
  

    document.querySelector(".dashboard-card").innerHTML =
        `<div id="corrections-container">${correctionsHtml}</div>`;
}






  // <td style="font-weight: 600; color: #0f172a;">${result.first_name} ${result.last_name}</td>

    //   correctionsHtml += `
    //         <div class="correction-item">
    //             <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
    //             ${q.code_block ? `<pre class="code-block">${q.code_block}</pre>` : ""}
    //             <p>Options: ${q.options.map((opt, i) =>
    //                 `<strong>${String.fromCharCode(65 + i)}.</strong> ${opt}`
    //             ).join(" &nbsp;&nbsp; ")}</p>
    //             <p>Your Answer: <span class="${isCorrect ? "correct-answer" : "incorrect-answer"}">
    //                 ${userAnswer !== null ? q.options[userAnswer] : "No answer"}
    //             </span></p>
    //             <p>Correct Answer: <span class="correct-answer">${q.options[correctAnswer]}</span></p>
    //             <p class="correction-explanation">Explanation: ${result.explanation}</p>
    //         </div>`;
    // });


// document.addEventListener('DOMContentLoaded', async () => {
//     const tableBody = document.getElementById('tableBody');

//     try {
//         const response = await fetch('http://localhost:8000/api/results/', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             credentials: 'include' // Automatically sends the HttpOnly JWT cookie
//         });

//         if (response.status === 401 || response.status === 403) {
//             // Token is missing or expired, redirect to login
//             window.location.href = 'new_login.html';
//             return;
//         }

//         if (response.ok) {
//             const results = await response.json();
            
//             if (results.length === 0) {
//                 tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No results found.</td></tr>`;
//                 return;
//             }

//             tableBody.innerHTML = results.map(result => {
//                 const dateObj = new Date(result.date_taken);
//                 const formattedDate = dateObj.toLocaleDateString() + ' at ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

//                 return `
//                     <tr>
//                         <td>${result.first_name} ${result.last_name}</td>
//                         <td><strong>${result.score}</strong> / ${result.total_questions}</td>
//                         <td>${result.time_taken}</td>
//                         <td>${formattedDate}</td>
//                     </tr>
//                 `;
//             }).join('');
//         } else {
//             tableBody.innerHTML = `<tr><td colspan="4">Failed to load results.</td></tr>`;
//         }
//     } catch (error) {
//         console.error("Error fetching results:", error);
//         tableBody.innerHTML = `<tr><td colspan="4">Network error. Is the backend running?</td></tr>`;
//     }
// });




// // Inside your fetch success block in results.js:
// tableBody.innerHTML = results.map(result => {
//     const dateObj = new Date(result.date_taken);
//     const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
//     // Calculate passing logic (e.g., > 60% is a pass)
//     const percentage = (result.score / result.total_questions) * 100;
//     const isPass = percentage >= 60;
//     const statusHtml = isPass 
//         ? `<span class="status-badge status-pass">Pass</span>` 
//         : `<span class="status-badge status-fail">Fail</span>`;

//     return `
//         <tr>
//             <td style="font-weight: 600; color: #0f172a;">${result.first_name} ${result.last_name}</td>
//             <td><strong>${result.score}</strong> / ${result.total_questions}</td>
//             <td>${statusHtml}</td>
//             <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">${result.time_taken}</td>
//             <td>${formattedDate}</td>
//         </tr>
//     `;
// }).join('');





