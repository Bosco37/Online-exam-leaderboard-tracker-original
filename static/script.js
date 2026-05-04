const quizzesData = {
    python: {
        title: "Take the Python Quiz",
        examName: "Python Basics",
        questions: [
            { text: "1. What keyword is used to define a function in Python?", options: ["func", "def", "function"], correct: 1 },
            { text: "2. Which of these is a mutable data type in Python?", options: ["List", "Tuple", "String"], correct: 0 },
            { text: "3. How do you insert comments in Python code?", options: ["// This is a comment", "/* This is a comment */", "# This is a comment"], correct: 2 }
        ]
    },
    cpp: {
        title: "Take the C++ Quiz",
        examName: "C++ Basics",
        questions: [
            { text: "1. Which operator is used for output in C++?", options: [">>", "<<", "||"], correct: 1 },
            { text: "2. How do you declare a pointer to an int?", options: ["int *p;", "int &p;", "pointer int p;"], correct: 0 },
            { text: "3. Which memory allocation function is used in C++?", options: ["malloc()", "alloc()", "new"], correct: 2 }
        ]
    },
    js: {
        title: "Take the JavaScript Quiz",
        examName: "JavaScript Basics",
        questions: [
            { text: "1. Which keyword is used to declare variables in modern JS?", options: ["var", "let", "declare"], correct: 1 },
            { text: "2. How do you write an arrow function?", options: ["() => {}", "function() => {}", "=> {}"], correct: 0 },
            { text: "3. What is the output of '2' + 2 in JS?", options: ["4", "22", "NaN"], correct: 1 }
        ]
    }
};

function loadQuiz(quizKey) {
    const quiz = quizzesData[quizKey];
    document.getElementById('quizTitle').innerHTML = `<i class="fa-solid fa-clipboard-question"></i> ${quiz.title}`;
    
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    quiz.questions.forEach((q, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        let html = `<p>${q.text}</p>`;
        q.options.forEach((opt, optIndex) => {
            const isCorrect = (optIndex === q.correct) ? "1" : "0";
            html += `<label><input type="radio" name="q${qIndex}" value="${isCorrect}" required> ${opt}</label>`;
        });
        
        questionDiv.innerHTML = html;
        container.appendChild(questionDiv);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch leaderboard on load
    fetchLeaderboard();

    const examSelect = document.getElementById('examSelect');
    loadQuiz(examSelect.value);
    
    examSelect.addEventListener('change', (e) => {
        loadQuiz(e.target.value);
        document.getElementById('statusMessage').textContent = '';
        document.getElementById('statusMessage').className = '';
    });

    const quizForm = document.getElementById('quizForm');
    
    quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = 'Grading quiz...';
        statusMessage.className = '';

        // Automate Scoring logic
        let score = 0;
        const currentQuizKey = document.getElementById('examSelect').value;
        const totalQuestions = quizzesData[currentQuizKey].questions.length;
        
        // Get values from dynamically generated radio buttons
        for (let i = 0; i < totalQuestions; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                score += parseInt(selected.value);
            }
        }

        // Calculate percentage
        const finalScorePercentage = Math.round((score / totalQuestions) * 100);
        
        const studentName = document.getElementById('studentName').value;
        const examName = quizzesData[currentQuizKey].examName;

        try {
            // Send scored result to Flask backend
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_name: studentName,
                    exam_name: examName,
                    score: finalScorePercentage
                })
            });

            const data = await response.json();

            if (response.ok) {
                statusMessage.textContent = `Success! You scored ${finalScorePercentage}%. Added to leaderboard.`;
                statusMessage.className = 'success';
                quizForm.reset();
                // Reset back to currently selected quiz visually
                loadQuiz(document.getElementById('examSelect').value);
                fetchLeaderboard(); // Refresh the table automatically
            } else {
                statusMessage.textContent = data.error || 'Failed to submit score.';
                statusMessage.className = 'error';
            }
        } catch (error) {
            statusMessage.textContent = 'Network error. Could not connect to server.';
            statusMessage.className = 'error';
        }
    });
});

async function fetchLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    
    try {
        const response = await fetch('/api/scores');
        const scores = await response.json();
        
        tbody.innerHTML = '';

        if (scores.error) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#f87171;">Error: ${scores.error}</td></tr>`;
            return;
        }

        if (scores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No scores found. Be the first to take the quiz!</td></tr>';
            return;
        }

        scores.forEach((score, index) => {
            const rank = index + 1;
            let rankDisplay = `<strong>#${rank}</strong>`;
            
            if (rank === 1) rankDisplay = `<i class="fa-solid fa-trophy rank-icon rank-1"></i> ${rank}`;
            else if (rank === 2) rankDisplay = `<i class="fa-solid fa-medal rank-icon rank-2"></i> ${rank}`;
            else if (rank === 3) rankDisplay = `<i class="fa-solid fa-medal rank-icon rank-3"></i> ${rank}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rankDisplay}</td>
                <td><strong>${score.student_name}</strong></td>
                <td>${score.exam_name}</td>
                <td><span class="score-badge">${score.score}%</span></td>
                <td>${score.exam_date}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#f87171;">Failed to load data. Is the backend running?</td></tr>';
    }
}
