document.getElementById('notifications-icon').addEventListener('click', async (event) => {
    event.stopPropagation(); // Prevent the click event from bubbling up to the document
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; // Toggle dropdown visibility

    if (dropdown.style.display === 'block') {
        await fetchNotifications();
    }
});

// Function to hide the dropdown
function hideDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.style.display = 'none'; // Hide the dropdown
}

// Event listener for clicks outside the dropdown
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('notification-dropdown');
    const notificationIcon = document.getElementById('notifications-icon');

    // Check if the click was outside the dropdown and the notification icon
    if (!dropdown.contains(event.target) && !notificationIcon.contains(event.target)) {
        hideDropdown(); // Hide the dropdown
    }
});

async function fetchNotifications() {
    try {
        const response = await fetch('/api/notifications'); // Adjust the endpoint as necessary
        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }
        const notifications = await response.json();
        populateNotificationList(notifications);
        updateNotificationDot(notifications); // Update the notification dot
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

function populateNotificationList(notifications) {
    const notificationList = document.getElementById('notification-list');
    notificationList.innerHTML = ''; // Clear existing notifications

    notifications.forEach(notification => {
        const listItem = document.createElement('li');
        listItem.textContent = notification.message;
        listItem.className = notification.read ? 'read' : 'unread'; // Add class based on read status
        listItem.addEventListener('click', () => markAsRead(notification._id));
        notificationList.appendChild(listItem);
    });
}

function updateNotificationDot(notifications) {
    const notificationDot = document.getElementById('notification-dot');
    const unreadCount = notifications.filter(notification => !notification.read).length;

    if (unreadCount > 0) {
        notificationDot.style.display = 'block'; // Show the dot
    } else {
        notificationDot.style.display = 'none'; // Hide the dot
    }
}

async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }
        fetchNotifications(); // Refresh notifications
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
}