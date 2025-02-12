// Function to toggle between login and registration forms
function toggleForms() {
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
    const showLoginLink = document.getElementById('showLoginLink');
    const showRegistrationLink = document.getElementById('showRegistrationLink');

    // Toggle visibility of forms
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    showRegistrationLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Toggle form links
    toggleForms();

    document.getElementById('registrationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, name, password })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                
                // Clear form and switch to login form
                this.reset();
                document.getElementById('registrationForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            } else {
                alert(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const loginUsername = document.getElementById('loginUsername').value;
        const loginPassword = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username: loginUsername, 
                    password: loginPassword 
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Store current user in localStorage
                localStorage.setItem('currentUser', loginUsername);
                
                // Redirect to welcome page
                window.location.href = 'welcome.html';
            } else {
                alert(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    });

    // Support Ticket Modal Interactions
    const supportTicketLink = document.getElementById('supportTicketLink');
    const supportTicketModal = document.getElementById('supportTicketModal');
    const closeSupportModal = document.querySelector('.close-support-modal');
    const loginSupportForm = document.getElementById('loginSupportForm');

    // Open support ticket modal
    supportTicketLink.addEventListener('click', function(e) {
        e.preventDefault();
        supportTicketModal.style.display = 'block';
    });

    // Close support ticket modal
    closeSupportModal.addEventListener('click', function() {
        supportTicketModal.style.display = 'none';
    });

    // Close modal if clicked outside
    window.addEventListener('click', function(e) {
        if (e.target === supportTicketModal) {
            supportTicketModal.style.display = 'none';
        }
    });

    // Submit support ticket
    loginSupportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('supportUsername').value;
        const issueType = document.getElementById('supportIssueType').value;
        const issueDetails = document.getElementById('supportIssueDetails').value;

        try {
            const response = await fetch('http://localhost:3000/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    issueType, 
                    issueDetails 
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Support ticket submitted successfully. An admin will review your request.');
                
                // Reset and close modal
                loginSupportForm.reset();
                supportTicketModal.style.display = 'none';
            } else {
                alert(result.message || 'Failed to submit support ticket');
            }
        } catch (error) {
            console.error('Support ticket error:', error);
            alert('An error occurred while submitting support ticket');
        }
    });
});

// Expose functions globally for use in other scripts
window.updateUserProfile = async function(username, newData) {
    try {
        const response = await fetch(`http://localhost:3000/profile/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Profile updated successfully');
            return true;
        } else {
            alert(result.message || 'Failed to update profile');
            return false;
        }
    } catch (error) {
        console.error('Profile update error:', error);
        alert('An error occurred while updating profile');
        return false;
    }
};

window.deleteUserProfile = async function(username) {
    try {
        const response = await fetch(`http://localhost:3000/profile/${username}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            // Remove user-specific data
            localStorage.removeItem(`tasks_${username}`);
            localStorage.removeItem('currentUser');
            
            // Redirect to login page
            window.location.href = 'index.html';
            
            return true;
        } else {
            alert(result.message || 'Failed to delete profile');
            return false;
        }
    } catch (error) {
        console.error('Profile delete error:', error);
        alert('An error occurred while deleting profile');
        return false;
    }
};

window.isUsernameTaken = async function(username) {
    try {
        const response = await fetch(`http://localhost:3000/profile/${username}`);
        return response.ok;
    } catch (error) {
        return false;
    }
};