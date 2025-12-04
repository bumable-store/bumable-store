/**
 * BUMABLE - Complete FREE GitHub Issues Database System
 * Uses GitHub Issues API for real-time data synchronization
 * No external accounts or costs required - completely FREE!
 */

class GitHubDatabase {
    constructor() {
        this.owner = 'learneverythingandtryit';
        this.repo = 'bumable-store';
        this.baseUrl = 'https://api.github.com';
    }

    /**
     * Get GitHub token from session storage or URL parameter
     * SECURE: No hardcoded tokens - loaded dynamically
     */
    getToken() {
        // Try sessionStorage first
        let token = sessionStorage.getItem('github_token');
        
        if (!token) {
            // Try URL parameter (for admin setup)
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get('token');
            
            if (token) {
                sessionStorage.setItem('github_token', token);
            }
        }
        
        if (!token) {
            console.warn('GitHub token not found. Database operations will fail.');
            // Redirect to setup page if no token
            if (window.location.pathname !== '/github-setup.html') {
                // Don't redirect immediately for public pages
                console.log('Token missing - admin features disabled');
            }
        }
        
        return token;
    }

    /**
     * Make authenticated request to GitHub API
     */
    async makeRequest(endpoint, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('GitHub token required for database operations');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API Error ${response.status}: ${errorText}`);
        }

        return response.json();
    }

    /**
     * Save contact to GitHub Issues
     * Creates a new issue with contact details
     */
    async saveContact(contactData) {
        try {
            const { name, email, subject, message, timestamp = new Date().toISOString() } = contactData;
            
            const issueData = {
                title: `💬 Contact: ${subject} - ${name}`,
                body: `## 📧 New Contact Submission

**Customer Details:**
- **Name:** ${name}
- **Email:** ${email}
- **Subject:** ${subject}
- **Submitted:** ${new Date(timestamp).toLocaleString()}

---

**Message:**
${message}

---

**Status:** 🆕 New
**Priority:** 📋 Normal

> This issue was automatically created from the BUMABLE website contact form.
> Reply here to communicate with the customer.`,
                labels: ['contact', 'customer-support', 'new']
            };

            const result = await this.makeRequest(`/repos/${this.owner}/${this.repo}/issues`, {
                method: 'POST',
                body: JSON.stringify(issueData)
            });

            console.log('✅ Contact saved to GitHub Issues:', result.html_url);
            return {
                success: true,
                issueId: result.number,
                issueUrl: result.html_url,
                data: result
            };
        } catch (error) {
            console.error('❌ Error saving contact to GitHub:', error);
            throw error;
        }
    }

    /**
     * Get all contacts from GitHub Issues
     * Returns issues with 'contact' label
     */
    async getContacts(state = 'all') {
        try {
            const contacts = await this.makeRequest(
                `/repos/${this.owner}/${this.repo}/issues?labels=contact&state=${state}&sort=created&direction=desc`
            );

            return contacts.map(issue => ({
                id: issue.number,
                title: issue.title,
                name: this.extractNameFromTitle(issue.title),
                email: this.extractEmailFromBody(issue.body),
                subject: this.extractSubjectFromTitle(issue.title),
                message: this.extractMessageFromBody(issue.body),
                timestamp: issue.created_at,
                status: issue.state,
                url: issue.html_url,
                replies: issue.comments,
                labels: issue.labels.map(label => label.name)
            }));
        } catch (error) {
            console.error('❌ Error fetching contacts from GitHub:', error);
            return [];
        }
    }

    /**
     * Reply to contact (add comment to issue)
     */
    async replyToContact(issueId, replyMessage, closeIssue = false) {
        try {
            // Add comment
            const commentData = {
                body: `## 💬 Admin Reply

${replyMessage}

---
*Reply sent from BUMABLE Admin Dashboard*`
            };

            await this.makeRequest(`/repos/${this.owner}/${this.repo}/issues/${issueId}/comments`, {
                method: 'POST',
                body: JSON.stringify(commentData)
            });

            // Close issue if requested
            if (closeIssue) {
                await this.makeRequest(`/repos/${this.owner}/${this.repo}/issues/${issueId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        state: 'closed',
                        labels: ['contact', 'customer-support', 'resolved']
                    })
                });
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error replying to contact:', error);
            throw error;
        }
    }

    /**
     * Save order to GitHub Issues
     */
    async saveOrder(orderData) {
        try {
            const { orderId, customer, items, total, timestamp = new Date().toISOString() } = orderData;
            
            const itemsList = items.map(item => 
                `- **${item.name}** (${item.size}) - Qty: ${item.quantity} - $${item.price}`
            ).join('\n');

            const issueData = {
                title: `🛍️ Order #${orderId} - ${customer.name} ($${total})`,
                body: `## 🛒 New Order

**Order Details:**
- **Order ID:** ${orderId}
- **Date:** ${new Date(timestamp).toLocaleString()}
- **Total:** $${total}

**Customer:**
- **Name:** ${customer.name}
- **Email:** ${customer.email}
- **Phone:** ${customer.phone || 'Not provided'}
- **Address:** ${customer.address || 'Not provided'}

**Items:**
${itemsList}

---

**Status:** 🆕 New Order
**Payment:** Pending
**Fulfillment:** Pending

> This order was automatically created from the BUMABLE website.`,
                labels: ['order', 'fulfillment', 'new-order']
            };

            const result = await this.makeRequest(`/repos/${this.owner}/${this.repo}/issues`, {
                method: 'POST',
                body: JSON.stringify(issueData)
            });

            console.log('✅ Order saved to GitHub Issues:', result.html_url);
            return {
                success: true,
                issueId: result.number,
                issueUrl: result.html_url,
                data: result
            };
        } catch (error) {
            console.error('❌ Error saving order to GitHub:', error);
            throw error;
        }
    }

    /**
     * Get all orders from GitHub Issues
     */
    async getOrders(state = 'all') {
        try {
            const orders = await this.makeRequest(
                `/repos/${this.owner}/${this.repo}/issues?labels=order&state=${state}&sort=created&direction=desc`
            );

            return orders.map(issue => ({
                id: issue.number,
                orderId: this.extractOrderId(issue.title),
                title: issue.title,
                customer: this.extractCustomerFromBody(issue.body),
                total: this.extractTotalFromTitle(issue.title),
                items: this.extractItemsFromBody(issue.body),
                timestamp: issue.created_at,
                status: issue.state,
                url: issue.html_url,
                labels: issue.labels.map(label => label.name)
            }));
        } catch (error) {
            console.error('❌ Error fetching orders from GitHub:', error);
            return [];
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(issueId, status, notes = '') {
        try {
            const statusLabels = {
                'pending': ['order', 'fulfillment', 'pending'],
                'processing': ['order', 'fulfillment', 'processing'],
                'shipped': ['order', 'fulfillment', 'shipped'],
                'delivered': ['order', 'fulfillment', 'delivered', 'completed'],
                'cancelled': ['order', 'fulfillment', 'cancelled']
            };

            const updateData = {
                labels: statusLabels[status] || ['order', 'fulfillment', 'pending']
            };

            if (status === 'delivered' || status === 'cancelled') {
                updateData.state = 'closed';
            }

            await this.makeRequest(`/repos/${this.owner}/${this.repo}/issues/${issueId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData)
            });

            // Add status update comment
            if (notes) {
                const commentData = {
                    body: `## 📋 Order Status Update

**New Status:** ${status.toUpperCase()}

**Notes:** ${notes}

---
*Update from BUMABLE Admin Dashboard*`
                };

                await this.makeRequest(`/repos/${this.owner}/${this.repo}/issues/${issueId}/comments`, {
                    method: 'POST',
                    body: JSON.stringify(commentData)
                });
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            throw error;
        }
    }

    // Helper methods for extracting data from issue bodies
    extractNameFromTitle(title) {
        const match = title.match(/Contact:.*? - (.+)$/);
        return match ? match[1] : 'Unknown';
    }

    extractSubjectFromTitle(title) {
        const match = title.match(/Contact: (.+?) - /);
        return match ? match[1] : 'No Subject';
    }

    extractEmailFromBody(body) {
        const match = body.match(/\*\*Email:\*\* (.+)/);
        return match ? match[1] : 'unknown@email.com';
    }

    extractMessageFromBody(body) {
        const match = body.match(/\*\*Message:\*\*\n(.+)\n\n---/s);
        return match ? match[1].trim() : 'No message';
    }

    extractOrderId(title) {
        const match = title.match(/Order #(.+?) -/);
        return match ? match[1] : 'Unknown';
    }

    extractTotalFromTitle(title) {
        const match = title.match(/\(\$(.+)\)$/);
        return match ? match[1] : '0.00';
    }

    extractCustomerFromBody(body) {
        const nameMatch = body.match(/\*\*Name:\*\* (.+)/);
        const emailMatch = body.match(/\*\*Email:\*\* (.+)/);
        return {
            name: nameMatch ? nameMatch[1] : 'Unknown',
            email: emailMatch ? emailMatch[1] : 'unknown@email.com'
        };
    }

    extractItemsFromBody(body) {
        const itemsSection = body.match(/\*\*Items:\*\*\n(.+)\n\n---/s);
        if (!itemsSection) return [];
        
        const itemLines = itemsSection[1].split('\n').filter(line => line.trim().startsWith('-'));
        return itemLines.map(line => {
            const match = line.match(/- \*\*(.+)\*\* \((.+)\) - Qty: (\d+) - \$(.+)/);
            return match ? {
                name: match[1],
                size: match[2],
                quantity: parseInt(match[3]),
                price: match[4]
            } : null;
        }).filter(Boolean);
    }
}

// Initialize global GitHub database instance
window.githubDB = new GitHubDatabase();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubDatabase;
}

console.log('🚀 GitHub Database System Loaded - FREE Real-time Sync Ready!');