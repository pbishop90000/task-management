// Task Management System with Homework Feature
class TaskManager {
  constructor(username) {
    this.username = username;
    this.tasks = this.loadTasks('tasks');
    this.homework = this.loadTasks('homework');
    this.courses = this.loadTasks('courses');
    this.initializeUI();
    this.updateCourseDropdown(); // Add this line to ensure dropdown is populated on load
  }

  loadTasks(type) {
    const userTasks = localStorage.getItem(`${type}_${this.username}`);
    return userTasks ? JSON.parse(userTasks) : [];
  }

  saveTasks(type, tasks) {
    localStorage.setItem(`${type}_${this.username}`, JSON.stringify(tasks));
  }

  addTask(taskText) {
    if (taskText.trim()) {
      const task = {
        id: Date.now(),
        text: taskText,
        completed: false
      };
      this.tasks.push(task);
      this.saveTasks('tasks', this.tasks);
      this.renderTasks();
    }
  }

  addHomework(assignment) {
    if (assignment.name.trim()) {
      assignment.id = Date.now();
      assignment.completed = false;
      this.homework.push(assignment);
      this.saveTasks('homework', this.homework);
      this.renderHomework();
    }
  }

  addCourse(courseData) {
    if (courseData.name.trim()) {
      const course = {
        id: Date.now(),
        name: courseData.name,
        instructor: courseData.instructor
      };
      this.courses.push(course);
      this.saveTasks('courses', this.courses);
      this.renderCourses();
      this.updateCourseDropdown();
    }
  }

  deleteTask(taskId, type) {
    const list = type === 'tasks' ? this.tasks : this.homework;
    const updatedList = list.filter(task => task.id !== taskId);
    
    if (type === 'tasks') {
      this.tasks = updatedList;
      this.saveTasks('tasks', this.tasks);
      this.renderTasks();
    } else {
      this.homework = updatedList;
      this.saveTasks('homework', this.homework);
      this.renderHomework();
    }
  }

  deleteCourse(courseId) {
    this.courses = this.courses.filter(course => course.id !== courseId);
    this.saveTasks('courses', this.courses);
    this.renderCourses();
    this.updateCourseDropdown();
  }

  toggleTaskCompletion(taskId, type) {
    const list = type === 'tasks' ? this.tasks : this.homework;
    const task = list.find(task => task.id === taskId);
    
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(type, list);
      
      type === 'tasks' ? this.renderTasks() : this.renderHomework();
    }
  }

  renderTasks() {
    const activeTasks = document.getElementById('tasks');
    const completedTasks = document.getElementById('completedTasks');
    activeTasks.innerHTML = '';
    completedTasks.innerHTML = '';
    
    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${task.text}</span>
        <div class="task-actions">
          <button class="complete-btn" data-type="tasks" data-id="${task.id}">✓</button>
          <button class="delete-btn" data-type="tasks" data-id="${task.id}">✕</button>
        </div>
      `;

      if (task.completed) {
        completedTasks.appendChild(li);
      } else {
        activeTasks.appendChild(li);
      }
    });

    // Only show Completed Tasks section if there are completed tasks
    const completedTaskSection = document.getElementById('completedTaskSection');
    completedTaskSection.style.display = this.tasks.some(t => t.completed) ? 'block' : 'none';

    this.attachTaskListeners();
  }

  renderHomework() {
    const activeHomework = document.getElementById('homeworkItems');
    const completedHomework = document.getElementById('completedHomeworkItems');
    activeHomework.innerHTML = '';
    completedHomework.innerHTML = '';
    
    this.homework.forEach(hw => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="homework-item">
          <strong>${hw.name}</strong>
          <p>Course: ${hw.course || 'No Course'}</p>
          <p>Due: ${hw.dueDate || 'No due date'}</p>
          <p>Priority: ${hw.priority || 'Not set'}</p>
          <details>
            <summary>Description</summary>
            <p>${hw.description || 'No description'}</p>
          </details>
          <div class="task-actions">
            <button class="complete-btn" data-type="homework" data-id="${hw.id}">✓</button>
            <button class="delete-btn" data-type="homework" data-id="${hw.id}">✕</button>
          </div>
        </div>
      `;

      if (hw.completed) {
        completedHomework.appendChild(li);
      } else {
        activeHomework.appendChild(li);
      }
    });

    // Only show Completed Homework section if there are completed assignments
    const completedHomeworkSection = document.getElementById('completedHomeworkSection');
    completedHomeworkSection.style.display = this.homework.some(hw => hw.completed) ? 'block' : 'none';

    this.attachTaskListeners();
  }

  renderCourses() {
    const coursesList = document.getElementById('courses');
    coursesList.innerHTML = '';
    
    this.courses.forEach(course => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="course-item">
          <strong>${course.name}</strong>
          <p>Instructor: ${course.instructor || 'N/A'}</p>
          <button class="delete-btn" data-id="${course.id}">✕</button>
        </div>
      `;
      coursesList.appendChild(li);
    });

    this.attachCourseListeners();
  }

  updateCourseDropdown() {
    const courseDropdown = document.getElementById('homeworkCourse');
    courseDropdown.innerHTML = '<option value="">Select Course</option>';
    
    this.courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.name;
      option.textContent = course.name;
      courseDropdown.appendChild(option);
    });
  }

  attachTaskListeners() {
    // Complete button listeners
    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.dataset.id);
        const type = e.target.dataset.type;
        this.toggleTaskCompletion(taskId, type);
      });
    });

    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.dataset.id);
        const type = e.target.dataset.type;
        if (type) {
          this.deleteTask(taskId, type);
        } else {
          const courseId = parseInt(e.target.dataset.id);
          this.deleteCourse(courseId);
        }
      });
    });
  }

  attachCourseListeners() {
    // Delete course buttons
    document.querySelectorAll('#courses .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = parseInt(e.target.dataset.id);
        this.deleteCourse(courseId);
      });
    });
  }

  initializeUI() {
    // Task related event listeners
    const addTaskBtn = document.getElementById('addTaskBtn');
    const newTaskInput = document.getElementById('newTaskInput');
    const logoutBtn = document.getElementById('logoutBtn');

    addTaskBtn.addEventListener('click', () => {
      this.addTask(newTaskInput.value);
      newTaskInput.value = '';
    });

    newTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTask(newTaskInput.value);
        newTaskInput.value = '';
      }
    });

    // Homework related event listeners
    const addHomeworkBtn = document.getElementById('addHomeworkBtn');

    addHomeworkBtn.addEventListener('click', () => {
      const homeworkAssignment = {
        name: document.getElementById('homeworkName').value,
        course: document.getElementById('homeworkCourse').value,
        dueDate: document.getElementById('homeworkDueDate').value,
        description: document.getElementById('homeworkDescription').value,
        priority: document.getElementById('homeworkPriority').value
      };

      this.addHomework(homeworkAssignment);

      // Reset form
      document.getElementById('homeworkName').value = '';
      document.getElementById('homeworkCourse').value = ''; // Reset course dropdown
      document.getElementById('homeworkDueDate').value = '';
      document.getElementById('homeworkDescription').value = '';
      document.getElementById('homeworkPriority').value = '';
    });

    // Add Course Event Listener
    const addCourseBtn = document.getElementById('addCourseBtn');
    addCourseBtn.addEventListener('click', () => {
      const courseData = {
        name: document.getElementById('courseName').value,
        instructor: document.getElementById('courseInstructor').value
      };

      this.addCourse(courseData);

      // Reset form
      document.getElementById('courseName').value = '';
      document.getElementById('courseInstructor').value = '';
    });

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === `${tabName}Tab`) {
            content.classList.add('active');
          }
        });
      });
    });

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });

    // Update course dropdown when tab loads
    this.renderTasks();
    this.renderHomework();
    this.renderCourses();
    this.updateCourseDropdown();

    // Messages Tab Initialization
    this.initializeMessagesTab();
  }

  initializeMessagesTab() {
    const username = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users.find(u => u.username === username);

    // Determine if current user is an admin
    const adminUsers = ['admin', 'pbishop9000', 'support'];
    const isAdmin = adminUsers.includes(username);

    // Recipient Search and Dropdown
    const recipientSearchInput = document.getElementById('recipientSearchInput');
    const recipientDropdown = document.getElementById('recipientDropdown');
    const existingChatsList = document.getElementById('existingChatsList');
    const chatSection = document.getElementById('chatSection');
    const currentRecipientSpan = document.getElementById('currentRecipient');
    const backToRecipientsBtn = document.getElementById('backToRecipientsBtn');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messagesContainer = document.getElementById('messagesContainer');

    // Populate Recipients Dropdown
    function populateRecipientsDropdown() {
        const searchTerm = recipientSearchInput.value.toLowerCase().trim();
        const dropdownContent = document.createElement('div');
        dropdownContent.classList.add('recipient-dropdown-content');
        
        // Filter users based on search term
        let filteredUsers;
        if (isAdmin) {
            // Admins can message anyone
            filteredUsers = users.filter(user => 
                user.username !== username && (
                    user.username.toLowerCase().includes(searchTerm) ||
                    (user.name && user.name.toLowerCase().includes(searchTerm))
                )
            );
        } else {
            // Non-admin users can only start chats with admins
            filteredUsers = users.filter(user => 
                adminUsers.includes(user.username) && 
                user.username !== username && (
                    user.username.toLowerCase().includes(searchTerm) ||
                    (user.name && user.name.toLowerCase().includes(searchTerm))
                )
            );
        }

        // Create dropdown items
        if (filteredUsers.length === 0) {
            const noResultsItem = document.createElement('div');
            noResultsItem.classList.add('recipient-dropdown-item');
            noResultsItem.textContent = isAdmin 
                ? 'No recipients found' 
                : 'You can only message admin users';
            dropdownContent.appendChild(noResultsItem);
        } else {
            filteredUsers.forEach(user => {
                const dropdownItem = document.createElement('div');
                dropdownItem.classList.add('recipient-dropdown-item');
                dropdownItem.textContent = `${user.username}${user.name ? ` (${user.name})` : ''}`;
                dropdownItem.addEventListener('click', () => {
                    openChatWithRecipient(user.username);
                    recipientDropdown.innerHTML = '';
                    recipientSearchInput.value = '';
                });
                dropdownContent.appendChild(dropdownItem);
            });
        }

        // Clear previous dropdown content and add new
        recipientDropdown.innerHTML = '';
        recipientDropdown.appendChild(dropdownContent);

        // Show/hide dropdown based on search input
        if (searchTerm) {
            dropdownContent.classList.add('show');
        } else {
            dropdownContent.classList.remove('show');
        }
    }

    // Render Existing Chats
    function renderExistingChats() {
        const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
        
        // Get unique chat partners based on user's conversations
        const chatPartners = new Set();
        const chatDetails = {};

        messages.forEach(msg => {
            // Only show chats user is directly involved in
            if (msg.sender !== username && msg.recipient !== username) return;

            // Determine the other party in the conversation
            const otherParty = msg.sender === username ? msg.recipient : msg.sender;
            chatPartners.add(otherParty);

            // Track last message and unread count
            if (!chatDetails[otherParty]) {
                chatDetails[otherParty] = {
                    lastMessage: msg.message,
                    lastTimestamp: msg.timestamp,
                    unreadCount: 0,
                    totalMessageCount: 0
                };
            }

            // Update last message and timestamp
            if (new Date(msg.timestamp) > new Date(chatDetails[otherParty].lastTimestamp)) {
                chatDetails[otherParty].lastMessage = msg.message;
                chatDetails[otherParty].lastTimestamp = msg.timestamp;
            }

            // Count total messages and unread messages
            chatDetails[otherParty].totalMessageCount++;
            if (msg.recipient === username && !msg.read) {
                chatDetails[otherParty].unreadCount++;
            }
        });

        // If no chats
        if (chatPartners.size === 0) {
            existingChatsList.innerHTML = '<p>No chat history found. Start a new message!</p>';
            return;
        }

        // Render chats
        const chatsHTML = Array.from(chatPartners)
            .sort((a, b) => new Date(chatDetails[b].lastTimestamp) - new Date(chatDetails[a].lastTimestamp))
            .map(partner => `
                <div class="chat-list-item" data-username="${partner}">
                    <div class="chat-info-container">
                        <div class="chat-primary-info">
                            <strong>${partner}</strong>
                            <p class="last-message">${chatDetails[partner].lastMessage}</p>
                        </div>
                        <div class="chat-secondary-info">
                            <div>
                                <small>${new Date(chatDetails[partner].lastTimestamp).toLocaleString()}</small>
                                ${chatDetails[partner].unreadCount > 0 ? 
                                    `<span class="unread-count">${chatDetails[partner].unreadCount}</span>` 
                                    : ''}
                            </div>
                        </div>
                        <div class="chat-info-icon-container">
                            <button class="chat-info-btn" data-username="${partner}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="chat-details-modal" style="display:none;">
                            <div class="chat-details-content">
                                <h3>Chat Details with ${partner}</h3>
                                <p>Total Messages: ${chatDetails[partner].totalMessageCount}</p>
                                <p>Last Message: ${new Date(chatDetails[partner].lastTimestamp).toLocaleString()}</p>
                                <button class="delete-chat-btn" data-username="${partner}">Delete Chat History</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

        existingChatsList.innerHTML = chatsHTML;

        // Add event listeners for chat info button
        existingChatsList.querySelectorAll('.chat-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening chat
                const chatListItem = btn.closest('.chat-list-item');
                const detailsModal = chatListItem.querySelector('.chat-details-modal');
                
                // Toggle visibility of details modal
                detailsModal.style.display = detailsModal.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Add click event to open chat
        existingChatsList.querySelectorAll('.chat-primary-info').forEach(item => {
            item.addEventListener('click', () => {
                const selectedUsername = item.closest('.chat-list-item').dataset.username;
                openChatWithRecipient(selectedUsername);
            });
        });

        // Add delete chat event listeners
        existingChatsList.querySelectorAll('.delete-chat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening chat
                const usernameToDelete = e.target.dataset.username;
                
                const confirmDelete = confirm(`Are you sure you want to delete your chat history with ${usernameToDelete}?`);
                
                if (confirmDelete) {
                    deleteChatHistory(usernameToDelete);
                }
            });
        });
    }

    // Open Chat with Specific Recipient
    function openChatWithRecipient(selectedUsername) {
        const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
        
        // Check if any messages exist between current user and selected username
        const existingMessages = messages.filter(msg => 
            (msg.sender === username && msg.recipient === selectedUsername) ||
            (msg.sender === selectedUsername && msg.recipient === username)
        );

        // Switch to chat section
        existingChatsList.style.display = 'none';
        recipientSearchInput.style.display = 'none';
        recipientDropdown.style.display = 'none';
        chatSection.style.display = 'block';
        currentRecipientSpan.textContent = selectedUsername;
        
        // Render messages
        renderMessagesWithRecipient(selectedUsername);
    }

    // Render Messages with a Specific Recipient
    function renderMessagesWithRecipient(selectedUsername) {
        const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
        
        // Filter messages between current user and selected recipient
        const filteredMessages = messages.filter(msg => 
            (msg.sender === username && msg.recipient === selectedUsername) ||
            (msg.sender === selectedUsername && msg.recipient === username)
        );

        // Sort messages chronologically
        filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Mark messages as read
        messages.forEach(msg => {
            if (msg.sender === selectedUsername && msg.recipient === username) {
                msg.read = true;
            }
        });
        localStorage.setItem('user_messages', JSON.stringify(messages));

        // Render messages
        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = '<p>No messages yet. Start a conversation!</p>';
            return;
        }

        messagesContainer.innerHTML = filteredMessages.map(msg => `
            <div class="message-item ${msg.sender === username ? 'sent' : 'received'}" 
                 data-message-id="${msg.id}" 
                 data-sender="${msg.sender}">
                <div class="message-content">
                    <p>${msg.message}</p>
                    <small>${msg.sender}: ${new Date(msg.timestamp).toLocaleString()}</small>
                    ${msg.sender === username ? `
                        <div class="message-actions">
                            <button class="edit-message-btn">Edit</button>
                            <button class="delete-message-btn">Delete</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Attach edit and delete message event listeners
        attachMessageEditDeleteListeners(selectedUsername);
    }

    // Function to attach edit and delete message event listeners
    function attachMessageEditDeleteListeners(selectedUsername) {
        const editButtons = document.querySelectorAll('.edit-message-btn');
        const deleteButtons = document.querySelectorAll('.delete-message-btn');

        // Verify if the current user can edit/delete messages
        const canEditDelete = (senderId) => {
            return senderId === username;
        };

        // Edit message logic 
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageItem = e.target.closest('.message-item');
                const messageId = parseInt(messageItem.dataset.messageId);
                const messageContent = messageItem.querySelector('.message-content p');
                
                const senderId = messageItem.dataset.sender;
                if (!canEditDelete(senderId)) {
                    alert('You can only edit your own messages.');
                    return;
                }
                
                const originalText = messageContent.textContent;
                messageContent.innerHTML = `
                    <input type="text" class="edit-message-input" value="${originalText}">
                    <div class="edit-message-actions">
                        <button class="save-edit-btn">Save</button>
                        <button class="cancel-edit-btn">Cancel</button>
                    </div>
                `;

                // Save edit button listener
                messageItem.querySelector('.save-edit-btn').addEventListener('click', () => {
                    const newMessageText = messageItem.querySelector('.edit-message-input').value.trim();
                    
                    if (newMessageText && newMessageText !== originalText) {
                        let messages = JSON.parse(localStorage.getItem('user_messages')) || [];
                        const messageIndex = messages.findIndex(m => m.id === messageId);
                        
                        if (messageIndex !== -1) {
                            messages[messageIndex].message = newMessageText;
                            localStorage.setItem('user_messages', JSON.stringify(messages));
                            
                            renderMessagesWithRecipient(selectedUsername);
                        }
                    }
                });

                // Cancel edit button listener
                messageItem.querySelector('.cancel-edit-btn').addEventListener('click', () => {
                    messageContent.innerHTML = originalText;
                });
            });
        });

        // Delete message logic 
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageItem = e.target.closest('.message-item');
                const messageId = parseInt(messageItem.dataset.messageId);
                
                const senderId = messageItem.dataset.sender;
                if (!canEditDelete(senderId)) {
                    alert('You can only delete your own messages.');
                    return;
                }
                
                const confirmDelete = confirm('Are you sure you want to delete this message?');
                
                if (confirmDelete) {
                    let messages = JSON.parse(localStorage.getItem('user_messages')) || [];
                    const updatedMessages = messages.filter(m => m.id !== messageId);
                    
                    localStorage.setItem('user_messages', JSON.stringify(updatedMessages));
                    
                    renderMessagesWithRecipient(selectedUsername);
                }
            });
        });
    }

    // Send Message Event Listener
    sendMessageBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        const recipient = currentRecipientSpan.textContent;
        
        // Validate recipient for normal messages (cannot be admin)
        if (adminUsers.includes(recipient)) {
            alert('You cannot send messages to admin users from the dashboard. Use the Support tab for support.');
            return;
        }

        if (!message || !recipient) {
            alert('Please enter a message and select a recipient.');
            return;
        }

        // Create message
        const messages = JSON.parse(localStorage.getItem('user_messages')) || [];
        const newMessage = {
            id: Date.now(),
            sender: username,
            recipient: recipient,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        messages.push(newMessage);
        localStorage.setItem('user_messages', JSON.stringify(messages));

        // Clear input and refresh messages
        messageInput.value = '';
        renderMessagesWithRecipient(recipient);
    });

    // Back to Recipients Button
    backToRecipientsBtn.addEventListener('click', () => {
        chatSection.style.display = 'none';
        existingChatsList.style.display = 'block';
        recipientSearchInput.style.display = 'block';
        recipientDropdown.style.display = 'block';
        
        // Refresh existing chats list
        renderExistingChats();
    });

    // Add event listener for recipient search
    recipientSearchInput.addEventListener('input', populateRecipientsDropdown);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!recipientDropdown.contains(e.target) && e.target !== recipientSearchInput) {
            const dropdownContent = recipientDropdown.querySelector('.recipient-dropdown-content');
            if (dropdownContent) {
                dropdownContent.classList.remove('show');
            }
        }
    });

    // Initial renders
    renderExistingChats();

    // Delete chat history function
    function deleteChatHistory(otherUsername) {
        let messages = JSON.parse(localStorage.getItem('user_messages')) || [];
        
        // Filter out messages involving the current user and the specified other user
        const updatedMessages = messages.filter(msg => 
            !(msg.sender === username && msg.recipient === otherUsername) &&
            !(msg.sender === otherUsername && msg.recipient === username)
        );

        // Save the updated messages
        localStorage.setItem('user_messages', JSON.stringify(updatedMessages));

        // Re-render existing chats to reflect the changes
        renderExistingChats();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('currentUser');
  
  const userGreeting = document.getElementById('userGreeting');
  const adminPanelLink = document.getElementById('adminPanelLink');
  
  if (userGreeting) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users.find(u => u.username === username);
    
    // Display name if available, otherwise fallback to username
    userGreeting.textContent = (currentUser && currentUser.name) 
      ? currentUser.name 
      : username || 'Guest';

    // Show admin panel link for admin users and support user
    const adminUsers = ['admin', 'pbishop9000', 'support'];
    if (adminUsers.includes(username)) {
      adminPanelLink.style.display = 'block';
    }
  }

  if (username) {
    new TaskManager(username);
  } else {
    window.location.href = 'index.html';
  }
});