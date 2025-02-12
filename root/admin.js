document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('currentUser');
    
    // Admin access for both pbishop9000 and admin
    const adminUsers = ['admin', 'pbishop9000', 'support'];
    
    if (adminUsers.includes(username)) {
        initializeAdminPanel();
    } else {
        alert('Unauthorized access. Redirecting to login.');
        window.location.href = 'index.html';
    }

    async function fetchUsersFromDatabase() {
        try {
            const response = await fetch('/api/users'); // Adjust the URL to your API endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const users = await response.json();
            return users;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return [];
        }
    }

    function initializeAdminPanel() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="admin-panel">
                <div class="dashboard-header">
                    <h1>Admin Panel</h1>
                    <div class="header-actions">
                        <button id="backToDashboardBtn" class="back-btn">Dashboard</button>
                        <button id="logoutBtn" class="logout-btn">Logout</button>
                    </div>
                </div>
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="users">Users</button>
                    <button class="admin-tab" data-tab="support">Support Tickets</button>
                    <button class="admin-tab" data-tab="messages">Messages</button>
                </div>
                <div id="usersTab" class="admin-tab-content active">
                    <table id="userTable">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Name</th>
                                <th>Protection Status</th>
                                <th>Activation Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            <!-- Users will be dynamically populated here -->
                        </tbody>
                    </table>
                </div>
                <div id="supportTab" class="admin-tab-content">
                    <div id="adminSupportTickets">
                        <div id="openTicketsSection">
                            <h3>Open Tickets <span id="ticketStatusIndicator" class="ticket-status-dot"></span></h3>
                            <div id="openTicketsList"></div>
                        </div>
                        <details id="resolvedTicketsSection">
                            <summary>Resolved Tickets</summary>
                            <div id="resolvedTicketsList"></div>
                        </details>
                    </div>
                </div>
                <div id="messagesTab" class="admin-tab-content">
                    <div id="messageUsers">
                        <h2>User Conversations 
                            <span id="unreadMessagesIndicator" class="unread-messages-dot"></span>
                        </h2>
                        <div id="messageUserList"></div>
                    </div>
                    <div id="messageChatArea" style="display:none;">
                        <div class="chat-header">
                            <button id="backToUserListBtn">&larr; Back to Users</button>
                            <h3 id="currentChatUsername"></h3>
                        </div>
                        <div id="messageContainer" class="message-list"></div>
                        <div class="message-input-area">
                            <textarea id="adminMessageInput" placeholder="Type your message..."></textarea>
                            <button id="sendAdminMessageBtn">Send</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Existing modal code -->
            <div id="userModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h2 id="modalTitle">Add/Edit User</h2>
                    <form id="userForm">
                        <input type="text" id="modalUsername" placeholder="Username" required>
                        <input type="text" id="modalName" placeholder="Full Name">
                        <input type="password" id="modalPassword" placeholder="Password">
                        <button type="submit">Save</button>
                    </form>
                </div>
            </div>

            <!-- Modal for Update Password -->
            <div id="passwordModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h2>Update Password</h2>
                    <p id="passwordUsername"></p>
                    <input type="text" id="currentPassword" readonly>
                    <input type="password" id="newPassword" placeholder="New Password">
                    <button id="updatePasswordBtn">Update Password</button>
                </div>
            </div>
        `;

        // Fetch users from the database and populate the table
    fetchUsersFromDatabase().then(users => {
        populateUserTable(users);
    });

        // Add styles for modal
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .modal {
                position: fixed;
                z-index: 1;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            }
            .modal-content {
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 500px;
                border-radius: 8px;
            }
            .close-btn {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            .dashboard-header {
                position: relative;
            }
            .header-actions {
                position: absolute;
                top: 0;
                right: 0;
                display: flex;
                gap: 10px;
            }
        `;
        document.head.appendChild(modalStyle);

        // Add CSS for messages and notifications
        const messageStyle = document.createElement('style');
        messageStyle.textContent = `
            .admin-tabs {
                display: flex;
                margin-bottom: 20px;
            }
            .admin-tab {
                flex-grow: 1;
                padding: 10px;
                background-color: #f4f4f4;
                border: none;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .admin-tab.active {
                background-color: #4CAF50;
                color: black;
            }
            .admin-tab-content {
                display: none;
            }
            .admin-tab-content.active {
                display: block;
            }
            .message-user-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background-color: #f9f9f9;
                border-bottom: 1px solid #ddd;
                cursor: pointer;
            }
            .message-user-item:hover {
                background-color: #f0f0f0;
            }
            .unread-messages-dot {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-left: 10px;
            }
            .unread-messages-red {
                background-color: red;
            }
            .unread-messages-green {
                background-color: green;
            }
            .message-list {
                max-height: 400px;
                overflow-y: auto;
                padding: 10px;
                background-color: #f9f9f9;
            }
            .message-item {
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 5px;
                max-width: 80%;
            }
            .message-item.user-message {
                background-color: #e6f2ff;
                align-self: flex-start;
                margin-right: auto;
            }
            .message-item.admin-message {
                background-color: #e6ffe6;
                align-self: flex-end;
                margin-left: auto;
                text-align: right;
            }
            .message-input-area {
                display: flex;
                margin-top: 10px;
            }
            #adminMessageInput {
                flex-grow: 1;
                margin-right: 10px;
                min-height: 100px;
            }
            .chat-header {
                display: flex;
                align-items: center;
                background-color: #f4f4f4;
                padding: 10px;
            }
            #backToUserListBtn {
                margin-right: 10px;
                background-color: #ddd;
                border: none;
                padding: 5px 10px;
                cursor: pointer;
            }
            #messageChatArea #messageContainer {
                display: flex;
                flex-direction: column;
            }
        `;
        document.head.appendChild(messageStyle);

        // Add CSS for ticket styling
        const ticketStyle = document.createElement('style');
        ticketStyle.textContent = `
            .ticket-item {
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 10px;
            }
            .ticket-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .admin-ticket-actions {
                margin-top: 10px;
            }
            .admin-response-input {
                width: 100%;
                min-height: 80px;
                margin-bottom: 10px;
                padding: 10px;
            }
            .ticket-button-group {
                display: flex;
                gap: 10px;
            }
            .ticket-button-group button {
                flex-grow: 1;
                padding: 8px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .send-response-btn {
                background-color: #4CAF50;
                color: white;
            }
            .resolve-ticket-btn {
                background-color: #2196F3;
                color: white;
            }
            .reopen-ticket-btn {
                background-color: #f44336;
                color: white;
                width: 100%;
                padding: 8px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(ticketStyle);

        // Add CSS for ticket status indicator
        const ticketIndicatorStyle = document.createElement('style');
        ticketIndicatorStyle.textContent = `
            .ticket-status-dot {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-left: 10px;
            }
            .ticket-status-red {
                background-color: red;
            }
            .ticket-status-green {
                background-color: green;
            }
            .open-ticket {
                border-left: 4px solid #f44336;
            }
            .resolved-ticket {
                border-left: 4px solid #4CAF50;
            }
        `;
        document.head.appendChild(ticketIndicatorStyle);

        const userTableBody = document.getElementById('userTableBody');
        const logoutBtn = document.getElementById('logoutBtn');
        const backToDashboardBtn = document.getElementById('backToDashboardBtn');
        const userModal = document.getElementById('userModal');
        const passwordModal = document.getElementById('passwordModal');
        const closeButtons = document.querySelectorAll('.close-btn');
        const userForm = document.getElementById('userForm');
        const updatePasswordBtn = document.getElementById('updatePasswordBtn');

        // Add Logout Button Event Listener
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });

        // Back to Dashboard Button Event Listener
        backToDashboardBtn.addEventListener('click', () => {
            window.location.href = 'welcome.html';
        });

        // Tab Switching Logic
        const adminTabs = document.querySelectorAll('.admin-tab');
        const adminTabContents = document.querySelectorAll('.admin-tab-content');

        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Update active tab button
                adminTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active tab content
                adminTabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabName}Tab`) {
                        content.classList.add('active');
                    }
                });

                // If messages tab is activated, render messages
                if (tabName === 'messages') {
                    renderMessageUsers();
                }
            });
        });

        // Modify the table headers and row generation
        function populateUserTable(users) {
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.protected ? 'Protected' : 'Unprotected'}</td>
                    <td>${user.active ? 'Active' : 'Inactive'}</td>
                    <td>
                        <button class="view-password-btn" data-username="${user.username}">View/Change</button>
                    </td>
                    <td>
                        ${['admin', 'pbishop9000'].includes(user.username) ? `
                            <button class="edit-btn" data-username="${user.username}">Edit</button>
                        ` : `
                            <button class="edit-btn" data-username="${user.username}">Edit</button>
                        `}
                    </td>
                </tr>
            `).join('');

            attachTableEventListeners();
        }

        // Modify the edit user modal to include activation toggle
        function attachTableEventListeners() {
            // Edit User Buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const usernameToEdit = e.target.dataset.username;
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const user = users.find(u => u.username === usernameToEdit);

                    // Prevent editing if user is protected and not an admin
                    if (!adminUsers.includes(username) && user.protected) {
                        alert('This user account is protected and cannot be edited.');
                        return;
                    }

                    // Populate modal with user data and add protect/delete/activate buttons
                    const modalContent = `
                        <div class="user-edit-modal">
                            <input type="text" id="modalUsername" value="${user.username}" readonly>
                            <input type="text" id="modalName" value="${user.name || ''}" placeholder="Full Name">
                            <input type="password" id="modalPassword" placeholder="Password">
                            <div class="user-edit-actions">
                                <button type="submit">Save</button>
                                <button type="button" id="protectUserBtn" class="toggle-protection-btn">
                                    ${user.protected ? 'Unprotect User' : 'Protect User'}
                                </button>
                                <button type="button" id="activateUserBtn" class="toggle-activation-btn">
                                    ${user.active ? 'Deactivate User' : 'Activate User'}
                                </button>
                                <button type="button" id="deleteUserBtn" class="admin-delete-btn">
                                    Delete User
                                </button>
                            </div>
                        </div>
                    `;

                    // Replace the existing form with new modal content
                    const userForm = document.getElementById('userForm');
                    userForm.innerHTML = modalContent;

                    document.getElementById('modalTitle').textContent = 'Edit User';
                    userModal.style.display = 'block';

                    // Add event listener for activation toggle
                    document.getElementById('activateUserBtn').addEventListener('click', () => {
                        let users = JSON.parse(localStorage.getItem('users')) || [];
                        const userIndex = users.findIndex(u => u.username === usernameToEdit);

                        if (userIndex !== -1) {
                            // Toggle account activation
                            users[userIndex].active = !users[userIndex].active;
                            localStorage.setItem('users', JSON.stringify(users));
                            
                            // Update button text
                            const activateBtn = document.getElementById('activateUserBtn');
                            activateBtn.textContent = users[userIndex].active 
                                ? 'Deactivate User' 
                                : 'Activate User';

                            alert(`User ${usernameToEdit} is now ${users[userIndex].active ? 'activated' : 'deactivated'}.`);

                            // Repopulate the table
                            populateUserTable();
                        }
                    });

                    // Add event listeners for new buttons
                    document.getElementById('protectUserBtn').addEventListener('click', () => {
                        let users = JSON.parse(localStorage.getItem('users')) || [];
                        const userIndex = users.findIndex(u => u.username === usernameToEdit);

                        if (userIndex !== -1) {
                            // Even admins can protect/unprotect any account
                            users[userIndex].protected = !users[userIndex].protected;
                            localStorage.setItem('users', JSON.stringify(users));
                            
                            // Update button text
                            const protectBtn = document.getElementById('protectUserBtn');
                            protectBtn.textContent = users[userIndex].protected 
                                ? 'Unprotect User' 
                                : 'Protect User';

                            alert(`User ${usernameToEdit} is now ${users[userIndex].protected ? 'protected' : 'unprotected'}.`);
                        }
                    });

                    document.getElementById('deleteUserBtn').addEventListener('click', () => {
                        const confirmDelete = confirm(`Are you sure you want to delete the user ${usernameToEdit}?`);
                        
                        if (confirmDelete) {
                            let users = JSON.parse(localStorage.getItem('users')) || [];
                            const userToDelete = users.find(u => u.username === usernameToEdit);

                            // Prevent deletion if user is protected and not an admin
                            if (!adminUsers.includes(usernameToEdit) && userToDelete.protected) {
                                alert('This user account is protected and cannot be deleted.');
                                return;
                            }

                            users = users.filter(u => u.username !== usernameToEdit);
                            localStorage.setItem('users', JSON.stringify(users));
                            
                            // Remove user-specific data
                            localStorage.removeItem(`tasks_${usernameToEdit}`);
                            
                            // Close modal and reload table
                            userModal.style.display = 'none';
                            populateUserTable();
                        }
                    });
                });
            });

            // Delete User Buttons
            document.querySelectorAll('.admin-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const usernameToDelete = e.target.dataset.username;
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const userToDelete = users.find(u => u.username === usernameToDelete);

                    // Prevent deletion if user is protected and not an admin
                    if (!adminUsers.includes(usernameToDelete) && userToDelete.protected) {
                        alert('This user account is protected and cannot be deleted.');
                        return;
                    }

                    const confirmDelete = confirm(`Are you sure you want to delete the user ${usernameToDelete}?`);
                    
                    if (confirmDelete) {
                        let users = JSON.parse(localStorage.getItem('users')) || [];
                        users = users.filter(u => u.username !== usernameToDelete);
                        localStorage.setItem('users', JSON.stringify(users));
                        
                        // Remove user-specific data
                        localStorage.removeItem(`tasks_${usernameToDelete}`);
                        
                        // Reload the user table
                        populateUserTable();
                    }
                });
            });

            // Update password modal to check for protection
            document.querySelectorAll('.view-password-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const username = e.target.dataset.username;
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const user = users.find(u => u.username === username);

                    // Prevent viewing/changing password if user is protected and not an admin
                    if (!adminUsers.includes(username) && user.protected) {
                        alert('This user account is protected and password cannot be changed.');
                        return;
                    }

                    // Populate password modal
                    document.getElementById('passwordUsername').textContent = username;
                    document.getElementById('currentPassword').value = user.password || 'No password set';
                    document.getElementById('newPassword').value = '';
                    
                    passwordModal.style.display = 'block';
                });
            });

            // Add event listener for toggling user protection
            document.querySelectorAll('.toggle-protection-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const username = e.target.dataset.username;
                    let users = JSON.parse(localStorage.getItem('users')) || [];
                    const userIndex = users.findIndex(u => u.username === username);

                    if (userIndex !== -1) {
                        users[userIndex].protected = !users[userIndex].protected;
                        localStorage.setItem('users', JSON.stringify(users));
                        
                        // Repopulate the table to reflect changes
                        populateUserTable();

                        // Show a notification about the protection status change
                        alert(`User ${username} is now ${users[userIndex].protected ? 'protected' : 'unprotected'}.`);
                    }
                });
            });

            // Close Modal Buttons
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    userModal.style.display = 'none';
                    passwordModal.style.display = 'none';
                });
            });

            // User Form Submit (Add/Edit)
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const usernameToEdit = document.getElementById('modalUsername').value;
                const name = document.getElementById('modalName').value;
                const password = document.getElementById('modalPassword').value;

                let users = JSON.parse(localStorage.getItem('users')) || [];
                
                // Check if we're editing an existing user or adding a new one
                const existingUserIndex = users.findIndex(u => u.username === usernameToEdit);

                if (existingUserIndex !== -1) {
                    // Check if user is protected
                    if (users[existingUserIndex].protected) {
                        alert('This user is protected and cannot be edited.');
                        userModal.style.display = 'none';
                        return;
                    }

                    // Editing existing user
                    users[existingUserIndex] = {
                        ...users[existingUserIndex],
                        name: name || users[existingUserIndex].name,
                        password: password || users[existingUserIndex].password
                    };
                } else {
                    // Use the existing registration logic from app.js
                    // Check if username already exists
                    if (window.isUsernameTaken(usernameToEdit)) {
                        alert('Username already exists. Please choose another.');
                        return;
                    }

                    // Create user object similar to registration form
                    const user = { 
                        username: usernameToEdit, 
                        name,
                        password,
                        protected: false,  // New users are not protected by default
                        active: false  // New users are not active by default
                    };
                    users.push(user);
                }

                localStorage.setItem('users', JSON.stringify(users));
                userModal.style.display = 'none';
                populateUserTable();
            });
        }

        // Modify the updatePasswordBtn event listener
        updatePasswordBtn.addEventListener('click', () => {
            const username = document.getElementById('passwordUsername').textContent;
            const newPassword = document.getElementById('newPassword').value;

            if (!newPassword) {
                alert('Please enter a new password');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === username);

            if (userIndex !== -1) {
                // Prevent password change if user is protected and not an admin
                if (!adminUsers.includes(username) && users[userIndex].protected) {
                    alert('This user account is protected and password cannot be changed.');
                    return;
                }

                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                alert('Password updated successfully!');
                passwordModal.style.display = 'none';
                
                // Refresh current password display
                document.getElementById('currentPassword').value = newPassword;
            }
        });

        // Close modal if clicked outside
        window.addEventListener('click', (e) => {
            if (e.target === userModal) {
                userModal.style.display = 'none';
            }
            if (e.target === passwordModal) {
                passwordModal.style.display = 'none';
            }
        });

        function renderSupportTickets() {
            const supportTicketsContainer = document.getElementById('adminSupportTickets');
            const openTicketsList = document.getElementById('openTicketsList');
            const resolvedTicketsList = document.getElementById('resolvedTicketsList');
            const ticketStatusIndicator = document.getElementById('ticketStatusIndicator');
            const tickets = JSON.parse(localStorage.getItem('support_tickets')) || [];

            if (tickets.length === 0) {
                openTicketsList.innerHTML = '<p>No support tickets.</p>';
                ticketStatusIndicator.classList.add('ticket-status-green');
                return;
            }

            // Sort tickets by timestamp (newest first)
            tickets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Separate open and resolved tickets
            const openTickets = tickets.filter(ticket => ticket.status !== 'resolved');
            const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');

            // Update ticket status indicator
            if (openTickets.length > 0) {
                ticketStatusIndicator.classList.add('ticket-status-red');
            } else {
                ticketStatusIndicator.classList.add('ticket-status-green');
            }

            // Render Open Tickets
            if (openTickets.length > 0) {
                const openTicketsHTML = openTickets.map(ticket => `
                    <div class="ticket-item open-ticket" data-ticket-id="${ticket.id}">
                        <div class="ticket-header">
                            <strong>User: ${ticket.username}</strong>
                            <small>${new Date(ticket.timestamp).toLocaleString()}</small>
                        </div>
                        <p>${ticket.message}</p>
                        <div class="admin-ticket-actions">
                            <textarea class="admin-response-input" placeholder="Type your response..."></textarea>
                            <div class="ticket-button-group">
                                <button class="send-response-btn">Send Response</button>
                                <button class="resolve-ticket-btn">Mark as Resolved</button>
                            </div>
                        </div>
                        ${ticket.responses.length > 0 ? `
                            <details>
                                <summary>Previous Responses (${ticket.responses.length})</summary>
                                ${ticket.responses.map(response => `
                                    <div class="admin-response">
                                        <p><strong>Admin:</strong> ${response.message}</p>
                                        <small>${new Date(response.timestamp).toLocaleString()}</small>
                                    </div>
                                `).join('')}
                            </details>
                        ` : ''}
                    </div>
                `).join('');
                openTicketsList.innerHTML = openTicketsHTML;
            } else {
                openTicketsList.innerHTML = '<p>No open tickets.</p>';
            }

            // Render Resolved Tickets
            if (resolvedTickets.length > 0) {
                const resolvedTicketsHTML = resolvedTickets.map(ticket => `
                    <div class="ticket-item resolved-ticket" data-ticket-id="${ticket.id}">
                        <div class="ticket-header">
                            <strong>User: ${ticket.username}</strong>
                            <small>${new Date(ticket.timestamp).toLocaleString()}</small>
                        </div>
                        <p>${ticket.message}</p>
                        <button class="reopen-ticket-btn">Reopen Ticket</button>
                        ${ticket.responses.length > 0 ? `
                            <details>
                                <summary>Previous Responses (${ticket.responses.length})</summary>
                                ${ticket.responses.map(response => `
                                    <div class="admin-response">
                                        <p><strong>Admin:</strong> ${response.message}</p>
                                        <small>${new Date(response.timestamp).toLocaleString()}</small>
                                    </div>
                                `).join('')}
                            </details>
                        ` : ''}
                    </div>
                `).join('');
                resolvedTicketsList.innerHTML = resolvedTicketsHTML;
            } else {
                resolvedTicketsList.innerHTML = '<p>No resolved tickets.</p>';
            }

            // Attach event listeners for ticket actions
            attachTicketActionListeners();
        }

        function attachTicketActionListeners() {
            // Send Response Buttons
            document.querySelectorAll('.send-response-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ticketItem = e.target.closest('.ticket-item');
                    const ticketId = parseInt(ticketItem.dataset.ticketId);
                    const responseInput = ticketItem.querySelector('.admin-response-input');
                    const responseMessage = responseInput.value.trim();

                    if (!responseMessage) {
                        alert('Please enter a response.');
                        return;
                    }

                    // Get support tickets and find the specific ticket
                    let supportTickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
                    const ticketIndex = supportTickets.findIndex(t => t.id === ticketId);

                    if (ticketIndex !== -1) {
                        // Add response to the ticket
                        if (!supportTickets[ticketIndex].responses) {
                            supportTickets[ticketIndex].responses = [];
                        }
                        
                        supportTickets[ticketIndex].responses.push({
                            message: responseMessage,
                            timestamp: new Date().toISOString(),
                            admin: username
                        });

                        // Save updated tickets
                        localStorage.setItem('support_tickets', JSON.stringify(supportTickets));

                        // Clear response input
                        responseInput.value = '';

                        // Re-render tickets
                        renderSupportTickets();
                    }
                });
            });

            // Resolve Ticket Buttons
            document.querySelectorAll('.resolve-ticket-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ticketItem = e.target.closest('.ticket-item');
                    const ticketId = parseInt(ticketItem.dataset.ticketId);

                    // Get support tickets and find the specific ticket
                    let supportTickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
                    const ticketIndex = supportTickets.findIndex(t => t.id === ticketId);

                    if (ticketIndex !== -1) {
                        // Mark ticket as resolved
                        supportTickets[ticketIndex].status = 'resolved';

                        // Save updated tickets
                        localStorage.setItem('support_tickets', JSON.stringify(supportTickets));

                        // Re-render tickets
                        renderSupportTickets();
                    }
                });
            });

            // Reopen Ticket Buttons
            document.querySelectorAll('.reopen-ticket-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ticketItem = e.target.closest('.ticket-item');
                    const ticketId = parseInt(ticketItem.dataset.ticketId);

                    // Get support tickets and find the specific ticket
                    let supportTickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
                    const ticketIndex = supportTickets.findIndex(t => t.id === ticketId);

                    if (ticketIndex !== -1) {
                        // Mark ticket as open
                        supportTickets[ticketIndex].status = 'open';

                        // Save updated tickets
                        localStorage.setItem('support_tickets', JSON.stringify(supportTickets));

                        // Re-render tickets
                        renderSupportTickets();
                    }
                });
            });
        }

        // Existing initialization methods
        populateUserTable();
        renderSupportTickets();

        function renderMessageUsers() {
            const messageUserList = document.getElementById('messageUserList');
            const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
            
            // Get unique users who have sent messages
            const userMessages = {};
            messages.forEach(msg => {
                if (!userMessages[msg.sender]) {
                    userMessages[msg.sender] = {
                        unreadCount: messages.filter(m => m.sender === msg.sender && !m.read).length,
                        latestMessage: msg
                    };
                }
            });

            // Check if there are any unread messages
            const unreadMessagesIndicator = document.getElementById('unreadMessagesIndicator');
            const hasUnreadMessages = Object.values(userMessages).some(user => user.unreadCount > 0);
            
            unreadMessagesIndicator.classList.remove('unread-messages-red', 'unread-messages-green');
            unreadMessagesIndicator.classList.add(hasUnreadMessages ? 'unread-messages-red' : 'unread-messages-green');

            // Render user list
            messageUserList.innerHTML = Object.entries(userMessages)
                .sort((a, b) => new Date(b[1].latestMessage.timestamp) - new Date(a[1].latestMessage.timestamp))
                .map(([username, data]) => `
                    <div class="message-user-item" data-username="${username}">
                        <span>${username}</span>
                        <div>
                            ${data.unreadCount > 0 ? `<span class="unread-badge">${data.unreadCount}</span>` : ''}
                            <small>${new Date(data.latestMessage.timestamp).toLocaleString()}</small>
                        </div>
                    </div>
                `).join('');

            // Add click event to user items to open chat
            document.querySelectorAll('.message-user-item').forEach(item => {
                item.addEventListener('click', () => {
                    const selectedUsername = item.dataset.username;
                    openUserChat(selectedUsername);
                });
            });
        }

        function openUserChat(selectedUsername) {
            const messageUserList = document.getElementById('messageUsers');
            const messageChatArea = document.getElementById('messageChatArea');
            const currentChatUsername = document.getElementById('currentChatUsername');
            const messageContainer = document.getElementById('messageContainer');

            // Hide user list, show chat area
            messageUserList.style.display = 'none';
            messageChatArea.style.display = 'block';
            currentChatUsername.textContent = selectedUsername;

            // Render messages for this user
            const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
            const userMessages = messages.filter(msg => msg.sender === selectedUsername);

            // Mark all messages from this user as read
            messages.forEach(msg => {
                if (msg.sender === selectedUsername) {
                    msg.read = true;
                }
            });
            localStorage.setItem('user_messages', JSON.stringify(messages));

            // Render messages
            messageContainer.innerHTML = userMessages
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map(msg => `
                    <div class="message-item ${msg.sender === selectedUsername ? 'user-message' : 'admin-message'}">
                        <p>${msg.message}</p>
                        <small>${new Date(msg.timestamp).toLocaleString()}</small>
                    </div>
                `).join('');

            // Scroll to bottom
            messageContainer.scrollTop = messageContainer.scrollHeight;

            // Rerender message users to update unread indicators
            renderMessageUsers();
        }

        function attachMessageHandlers() {
            const backToUserListBtn = document.getElementById('backToUserListBtn');
            const sendAdminMessageBtn = document.getElementById('sendAdminMessageBtn');
            const adminMessageInput = document.getElementById('adminMessageInput');

            // Back to user list
            backToUserListBtn.addEventListener('click', () => {
                const messageUserList = document.getElementById('messageUsers');
                const messageChatArea = document.getElementById('messageChatArea');

                messageUserList.style.display = 'block';
                messageChatArea.style.display = 'none';
            });

            // Send message
            sendAdminMessageBtn.addEventListener('click', () => {
                const messageText = adminMessageInput.value.trim();
                const currentChatUsername = document.getElementById('currentChatUsername').textContent;

                if (!messageText) return;

                // Create message
                const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
                const message = {
                    id: Date.now(),
                    sender: username, // admin username
                    recipient: currentChatUsername,
                    message: messageText,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                messages.push(message);
                localStorage.setItem('user_messages', JSON.stringify(messages));

                // Clear input
                adminMessageInput.value = '';

                // Reopen chat to refresh messages
                openUserChat(currentChatUsername);
            });

            // Allow sending message with Enter key
            adminMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendAdminMessageBtn.click();
                }
            });
        }

        renderMessageUsers();
        attachMessageHandlers();
        renderSupportTickets();
    }
});