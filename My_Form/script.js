// // Example Vanilla JS Form Submission
// const formData = {
//   full_name: document.getElementById('nameInput').value,
//   email: document.getElementById('emailInput').value,
//   subject: document.getElementById('subjectInput').value,
//   message: document.getElementById('messageInput').value
// };

// fetch('http://127.0.0.1:8000/api/submissions/', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify(formData)
// })
// .then(response => {
//   if (!response.ok) throw new Error('Submission failed');
//   return response.json();
// })
// .then(data => {
//   console.log('Successfully created in Django:', data);
// })
// .catch(error => console.error('Error:', error));




// 1. Target the form and the message box
const form = document.getElementById('studentRegistrationForm');
const messageBox = document.getElementById('messageBox');

// 2. Attach an event listener to intercept the submit action
form.addEventListener('submit', async function(event) {
    // Prevent the browser from refreshing the page
    event.preventDefault(); 

    // 3. Extract the data from the input fields
    const first_Name = document.getElementById('firstName').value;
    const last_Name = document.getElementById('lastName').value;
    const studentEmail = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phone').value;
    const dateOfBirth = document.getElementById('dob').value;
    const courseOfInterest = document.getElementById('course').value;
    const cohortReason = document.getElementById('bio').value;
    // 4. Create a JavaScript object formatted for your Django Serializer
    
    const payload = {
        first_name: first_Name,
        last_name: last_Name,
        email: studentEmail,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        course_of_interest: courseOfInterest,
        reason_for_joining: cohortReason,
    };

    try {
        // 5. Send the request to Django
        const response = await fetch('http://127.0.0.1:8000/api/students/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Tells Django to expect JSON
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload) // Converts the JS object to a JSON string
        });

        // 6. Parse the response from Django
        const responseData = await response.json();

        // 7. Handle Success or Failure
        if (response.ok) {
            // HTTP 200-299 indicates success
            messageBox.innerHTML = `<p style="color: green;">Registration successful for ${responseData.first_name}!</p>`;
            form.reset(); // Clears the form fields
        } else {
            // HTTP 400 indicates a validation error from your Django Serializer
            console.error("Backend validation errors:", responseData);
            // messageBox.innerHTML = `<p style="color: red;">Error: ${JSON.stringify(responseData)}</p>`;

            const formattedMessage = formatErrors(responseData);
            messageBox.innerHTML = `<p style="color: red;">${formattedMessage}</p>`;
        }

    } catch (error) {
        // 8. Handle network errors (e.g., Django server is offline)
        console.error("Network Error:", error);
        messageBox.innerHTML = '<p style="color: red;">Failed to connect to the server.</p>';
    }
});


// // 7. Handle Success or Failure
//         if (response.ok) {
//             // HTTP 200-299 indicates success
//             messageBox.innerHTML = `<p style="color: green;">Registration successful for ${responseData.first_name}!</p>`;
//             form.reset(); // Clears the form fields
//         } else {
//             // HTTP 400+ formats backend object array into clean string
//             console.error("Backend validation errors:", responseData);
            // const formattedMessage = formatErrors(responseData);
            // messageBox.innerHTML = `<p style="color: red;">${formattedMessage}</p>`;
//         }

//     } catch (error) {