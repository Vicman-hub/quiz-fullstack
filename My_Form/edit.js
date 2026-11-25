
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

    try {
        const response = await fetch(`${API_BASE}/quiz/submit/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                answers,
                question_ids: questions.map(q => q.id),
                time_taken: formattedTimeTaken,
            }),
        });

        if (response.status === 401 || response.status === 403) {
            quizContainer.innerHTML = `<h2>Session expired.</h2><a href="new_login.html">Log in again</a>`;
            return;
        }

        if (!response.ok) throw new Error("Could not save your result.");

        gradingResult = await response.json();

        quizContainer.innerHTML = `
            <div style="text-align: center;">
                <h2>Quiz Completed!</h2>
                <p class="score-display">Your Score: ${gradingResult.score} / ${gradingResult.total}</p>
                <button id="view-corrections-btn">View Corrections</button>
                <button id="view-results-btn">View My Results</button>
                <button id="restart-btn">Restart</button>
            </div>`;
    } catch (error) {
        quizContainer.innerHTML = `<h2>${error.message}</h2><button id="restart-btn">Restart</button>`;
    }
}

