document.addEventListener('DOMContentLoaded', function() {
    const ticketInfoDiv = document.getElementById('ticket-info');
    const checkInButton = document.getElementById('check-in-button');
    let currentTicketId = null;

    // Initialize the QR Code Scanner
    const html5QrCode = new Html5Qrcode("qr-reader");

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        fetchTicketInfo(decodedText);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);

    // Manual Search
    document.getElementById('search-button').addEventListener('click', function() {
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            searchTicketByName(query);
        } else {
            alert('Please enter a name to search.');
        }
    });

    // Fetch Ticket Information
    function fetchTicketInfo(ticketId) {
        fetch(`http://localhost:5000/ticket/${ticketId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ticket not found');
                }
                return response.json();
            })
            .then(ticket => {
                displayTicketInfo(ticket);
                currentTicketId = ticket.id;
            })
            .catch(error => {
                ticketInfoDiv.innerHTML = `<p>${error.message}</p>`;
                checkInButton.style.display = 'none';
            });
    }

    // Search Ticket by Name
    function searchTicketByName(name) {
        fetch(`http://localhost:5000/search?q=${encodeURIComponent(name)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Search failed');
                }
                return response.json();
            })
            .then(results => {
                if (results.length > 0) {
                    displayTicketInfo(results[0]);
                    currentTicketId = results[0].id;
                } else {
                    ticketInfoDiv.innerHTML = `<p>No ticket found for "${name}".</p>`;
                    checkInButton.style.display = 'none';
                }
            })
            .catch(error => {
                ticketInfoDiv.innerHTML = `<p>${error.message}</p>`;
                checkInButton.style.display = 'none';
            });
    }

    // Display Ticket Information
    function displayTicketInfo(ticket) {
        ticketInfoDiv.innerHTML = `
            <p><strong>Name:</strong> ${ticket.name}</p>
            <p><strong>Event:</strong> ${ticket.event}</p>
            <p><strong>Status:</strong> ${ticket.checkedIn ? 'Checked In' : 'Not Checked In'}</p>
        `;
        if (!ticket.checkedIn) {
            checkInButton.style.display = 'block';
        } else {
            checkInButton.style.display = 'none';
        }
    }

    // Check-In Button Click Event
    checkInButton.addEventListener('click', function() {
        if (currentTicketId) {
            fetch(`http://localhost:5000/checkin/${currentTicketId}`, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Check-in failed');
                    }
                    return response.json();
                })
                .then(result => {
                    alert('Check-in successful');
                    fetchTicketInfo(currentTicketId); // Refresh ticket info
                })
                .catch(error => {
                    alert(error.message);
                });
        }
    });
});
