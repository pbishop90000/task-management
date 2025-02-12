document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('currentUser');
    
    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Submit Support Ticket
    const supportMessageInput = document.getElementById('supportMessage');
    const submitSupportTicketBtn = document.getElementById('submitSupportTicketBtn');
    const ticketContainer = document.getElementById('ticketContainer');

    submitSupportTicketBtn.addEventListener('click', () => {
        const message = supportMessageInput.value.trim();
        
        if (!message) {
            alert('Please enter a support message.');
            return;
        }

        // Create support ticket
        window.createSupportTicket(username, message);
        
        // Clear input
        supportMessageInput.value = '';
        
        // Refresh tickets
        renderSupportTickets();
    });

    // Render Support Tickets 
    function renderSupportTickets() {
        const tickets = window.getUserSupportTickets(username);
        
        if (tickets.length === 0) {
            ticketContainer.innerHTML = '<p>No support tickets found.</p>';
            return;
        }

        // Separate active and resolved tickets
        const activeTickets = tickets.filter(ticket => ticket.status !== 'resolved');
        const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');

        // Render Active Tickets
        const activeTicketsHTML = activeTickets.length > 0 
            ? activeTickets.map(ticket => createTicketHTML(ticket, false)).join('')
            : '<p>No active tickets.</p>';

        // Render Resolved Tickets
        const resolvedTicketsHTML = resolvedTickets.length > 0
            ? resolvedTickets.map(ticket => createTicketHTML(ticket, true)).join('')
            : '<p>No resolved tickets.</p>';

        // Update the container with both active and resolved tickets
        ticketContainer.innerHTML = `
            <div id="activeTicketsSection">
                <h2>Active Tickets</h2>
                ${activeTicketsHTML}
            </div>
            <details id="resolvedTicketsSection">
                <summary>Resolved Tickets (${resolvedTickets.length})</summary>
                ${resolvedTicketsHTML}
            </details>
        `;

        // Add event listeners for ticket actions
        attachTicketEventListeners();
    }

    // Create ticket HTML with conditional actions based on status
    function createTicketHTML(ticket, isResolved) {
        return `
            <div class="ticket-item" data-ticket-id="${ticket.id}">
                <div class="ticket-header">
                    <span class="ticket-status ${ticket.status}">
                        ${ticket.status.toUpperCase()}
                    </span>
                    <small>${new Date(ticket.timestamp).toLocaleString()}</small>
                </div>
                <p>${ticket.message}</p>
                ${ticket.responses.length > 0 ? `
                    <details>
                        <summary>Admin Responses (${ticket.responses.length})</summary>
                        ${ticket.responses.map(response => `
                            <div class="admin-response">
                                <p><strong>Admin:</strong> ${response.message}</p>
                                <small>${new Date(response.timestamp).toLocaleString()}</small>
                            </div>
                        `).join('')}
                    </details>
                ` : ''}
                <div class="ticket-actions">
                    ${!isResolved ? `
                        <button class="resolve-ticket-btn">Mark as Resolved</button>
                    ` : `
                        <button class="reopen-ticket-btn">Reopen Ticket</button>
                    `}
                </div>
            </div>
        `;
    }

    // Attach event listeners for ticket actions
    function attachTicketEventListeners() {
        // Resolve Ticket Buttons
        document.querySelectorAll('.resolve-ticket-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ticketElement = e.target.closest('.ticket-item');
                const ticketId = ticketElement.dataset.ticketId;
                
                // Update ticket status to resolved
                updateTicketStatus(parseInt(ticketId), 'resolved');
            });
        });

        // Reopen Ticket Buttons
        document.querySelectorAll('.reopen-ticket-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ticketElement = e.target.closest('.ticket-item');
                const ticketId = ticketElement.dataset.ticketId;
                
                // Update ticket status to open
                updateTicketStatus(parseInt(ticketId), 'open');
            });
        });
    }

    // Update ticket status
    function updateTicketStatus(ticketId, newStatus) {
        const supportTickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
        const ticketIndex = supportTickets.findIndex(ticket => ticket.id === ticketId);
        
        if (ticketIndex !== -1) {
            supportTickets[ticketIndex].status = newStatus;
            localStorage.setItem('support_tickets', JSON.stringify(supportTickets));
            
            // Re-render tickets
            renderSupportTickets();
        }
    }

    // Extend createSupportTicket function 
    window.createSupportTicket = function(username, message) {
        const tickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
        const ticket = {
            id: Date.now(),
            username: username,
            message: message,
            status: 'open',
            timestamp: new Date().toISOString(),
            responses: []
        };
        tickets.push(ticket);
        localStorage.setItem('support_tickets', JSON.stringify(tickets));
        return ticket.id;
    };

    // Initial render
    renderSupportTickets();
});