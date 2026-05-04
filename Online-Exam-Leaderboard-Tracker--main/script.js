// Data Structures Implementation

// User Authentication System
class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.accounts = [];
    }
}

// Node class for Binary Search Tree
class Node {
    constructor(accountNumber, balance, owner, accountDetails) {
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.owner = owner;
        this.accountDetails = accountDetails || {};
        this.left = null;
        this.right = null;
    }
}

// Binary Search Tree for Account Management
class AccountBST {
    constructor() {
        this.root = null;
    }

    insert(accountNumber, balance, owner, accountDetails) {
        const newNode = new Node(accountNumber, balance, owner, accountDetails);

        if (this.root === null) {
            this.root = newNode;
            return;
        }

        let current = this.root;
        while (true) {
            if (accountNumber < current.accountNumber) {
                if (current.left === null) {
                    current.left = newNode;
                    break;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = newNode;
                    break;
                }
                current = current.right;
            }
        }
    }

    find(accountNumber) {
        let current = this.root;
        while (current !== null) {
            if (accountNumber === current.accountNumber) {
                return current;
            }
            if (accountNumber < current.accountNumber) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null;
    }

    // Get all accounts for a specific user
    getUserAccounts(username) {
        const accounts = [];
        this.inOrderTraversal(this.root, username, accounts);
        return accounts;
    }

    inOrderTraversal(node, username, accounts) {
        if (node !== null) {
            this.inOrderTraversal(node.left, username, accounts);
            if (node.owner === username) {
                accounts.push({
                    accountNumber: node.accountNumber,
                    balance: node.balance,
                    accountDetails: node.accountDetails
                });
            }
            this.inOrderTraversal(node.right, username, accounts);
        }
    }
}

// Queue class for Transaction Processing
class TransactionQueue {
    constructor() {
        this.items = [];
    }

    enqueue(transaction) {
        this.items.push(transaction);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }
}

// Banking System Implementation
class BankingSystem {
    constructor() {
        this.currentUser = null;
        this.accounts = new AccountBST();
        this.transactionQueue = new TransactionQueue();
        this.transactions = [];
        this.users = new Map();
    }

    // User Authentication
    register(username, password) {
        if (this.users.has(username)) {
            return false;
        }
        this.users.set(username, new User(username, password));
        return true;
    }

    login(username, password) {
        const user = this.users.get(username);
        if (user && user.password === password) {
            this.currentUser = username;
            this.updateUI();
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        this.updateUI();
    }

    createAccount(initialBalance, accountDetails) {
        if (!this.currentUser) return false;
        const accountNumber = Date.now();
        this.accounts.insert(accountNumber, initialBalance, this.currentUser, accountDetails);
        this.updateUI(); // Ensure UI is updated immediately after account creation
        return accountNumber;
    }

    processTransaction(type, amount, fromAccount, toAccount = null) {
        const transaction = {
            id: Date.now(),
            type: type,
            amount: amount,
            fromAccount: fromAccount,
            toAccount: toAccount,
            date: new Date(),
            status: 'pending'
        };

        this.transactionQueue.enqueue(transaction);
        this.processTransactionQueue();
    }

    processTransactionQueue() {
        while (!this.transactionQueue.isEmpty()) {
            const transaction = this.transactionQueue.dequeue();
            const fromAccount = this.accounts.find(transaction.fromAccount);

            if (transaction.type === 'transfer' && transaction.toAccount) {
                const toAccount = this.accounts.find(transaction.toAccount);
                if (fromAccount && toAccount && fromAccount.balance >= transaction.amount) {
                    fromAccount.balance -= transaction.amount;
                    toAccount.balance += transaction.amount;
                    transaction.status = 'completed';
                } else {
                    transaction.status = 'failed';
                }
            } else {
                if (fromAccount) {
                    if (transaction.type === 'deposit') {
                        fromAccount.balance += transaction.amount;
                        transaction.status = 'completed';
                    } else if (transaction.type === 'withdraw') {
                        if (fromAccount.balance >= transaction.amount) {
                            fromAccount.balance -= transaction.amount;
                            transaction.status = 'completed';
                        } else {
                            transaction.status = 'failed';
                        }
                    }
                } else {
                    transaction.status = 'failed';
                }
            }

            this.transactions.unshift(transaction);
            this.updateUI();
        }
    }





    updateUI() {
        const loginSection = document.getElementById('loginSection');
        const bankingSection = document.getElementById('bankingSection');
        const accountsList = document.getElementById('accountsList');
        const transactionList = document.getElementById('transactionList');
        const userDisplay = document.getElementById('userDisplay');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.currentUser) {
            loginSection.classList.add('d-none');
            bankingSection.classList.remove('d-none');
            logoutBtn.classList.remove('d-none');
            userDisplay.textContent = `Welcome, ${this.currentUser}!`;

            // Update accounts list
            const userAccounts = this.accounts.getUserAccounts(this.currentUser);
            accountsList.innerHTML = '';
            userAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.accountNumber;
                const accountName = account.accountDetails?.name || 'Unnamed Account';
                option.textContent = `${accountName} (*${account.accountNumber.toString().slice(-4)}) | Balance: ₹${account.balance.toFixed(2)}`;
                accountsList.appendChild(option);
            });

            // Update transaction history
            transactionList.innerHTML = '';
            this.transactions
                .filter(t => {
                    const account = this.accounts.find(t.fromAccount);
                    return account && account.owner === this.currentUser;
                })
                .slice(0, 5)
                .forEach(transaction => {
                    const row = document.createElement('tr');
                    const fromAccount = this.accounts.find(transaction.fromAccount);
                    const fromAccountName = fromAccount?.accountDetails?.name || 'Unknown';
                    let transactionDescription = `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - ${fromAccountName}`;
                    
                    if (transaction.type === 'transfer' && transaction.toAccount) {
                        const toAccount = this.accounts.find(transaction.toAccount);
                        const toAccountName = toAccount?.accountDetails?.name || 'Unknown';
                        transactionDescription += ` → ${toAccountName}`;
                    }
                    
                    row.innerHTML = `
                        <td>${transaction.date.toLocaleDateString()}</td>
                        <td>${transactionDescription}</td>
                        <td>₹${transaction.amount.toFixed(2)}</td>
                        <td><span class="status-${transaction.status.toLowerCase()}">${transaction.status}</span></td>
                    `;
                    transactionList.appendChild(row);
                });
        } else {
            loginSection.classList.remove('d-none');
            bankingSection.classList.add('d-none');
            logoutBtn.classList.add('d-none');
            userDisplay.textContent = '';
        }
    }
}

// Initialize Banking System
const bankSystem = new BankingSystem();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {

    // Initial UI update
    bankSystem.updateUI();
    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        if (bankSystem.register(username, password)) {
            alert('Registration successful! Please login.');
            document.getElementById('registerForm').reset();
        } else {
            alert('Username already exists!');
        }
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        if (bankSystem.login(username, password)) {
            alert('Login successful!');
            document.getElementById('loginForm').reset();
        } else {
            alert('Invalid credentials!');
        }
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        bankSystem.logout();
    });

    // Create account button
    document.getElementById('createAccountBtn').addEventListener('click', () => {
        if (!bankSystem.currentUser) {
            console.error('No user logged in');
            alert('Please log in first');
            return;
        }

        const accountName = prompt('Enter account holder name:');
        if (!accountName) {
            console.log('Account creation cancelled - no name provided');
            return;
        }

        const accountDetails = {
            name: accountName,
            dateOfBirth: prompt('Enter date of birth (YYYY-MM-DD):') || '',
            address: prompt('Enter address:') || '',
            phone: prompt('Enter phone number:') || ''
        };

        const initialBalance = parseFloat(prompt('Enter initial balance:'));
        if (!isNaN(initialBalance) && initialBalance > 0) {
            const accountNumber = bankSystem.createAccount(initialBalance, accountDetails);
            if (accountNumber) {
                const accountId = accountNumber.toString().slice(-4);
                console.log('Account created successfully:', { accountNumber, initialBalance, accountDetails });
                alert(`Account created successfully!\nName: ${accountDetails.name}\nAccount number: *${accountId}\nInitial balance: ₹${initialBalance.toFixed(2)}`);
                bankSystem.updateUI(); // Force UI update after successful creation
            } else {
                console.error('Account creation failed');
                alert('Failed to create account. Please try again.');
            }
        } else {
            console.error('Invalid initial balance:', initialBalance);
            alert('Please enter a valid initial balance greater than 0');
        }
    });

    // Transaction buttons
    document.getElementById('depositBtn').addEventListener('click', () => {
        const account = document.getElementById('accountsList').value;
        const amount = parseFloat(prompt('Enter deposit amount:'));
        if (!isNaN(amount) && amount > 0) {
            bankSystem.processTransaction('deposit', amount, parseInt(account));
        }
    });

    document.getElementById('withdrawBtn').addEventListener('click', () => {
        const account = document.getElementById('accountsList').value;
        const amount = parseFloat(prompt('Enter withdrawal amount:'));
        if (!isNaN(amount) && amount > 0) {
            bankSystem.processTransaction('withdraw', amount, parseInt(account));
        }
    });

    document.getElementById('transferBtn').addEventListener('click', () => {
        const accountSelect = document.getElementById('accountsList');
        if (accountSelect.options.length === 0 || accountSelect.options[0].disabled) {
            alert('Please create an account first!');
            return;
        }
        const fromAccount = accountSelect.value;
        const toAccount = parseInt(prompt('Enter recipient account number:'));
        if (isNaN(toAccount)) {
            alert('Invalid account number');
            return;
        }

        // Validate recipient account exists and get account details
        const recipientAccount = bankSystem.accounts.find(toAccount);
        if (!recipientAccount) {
            alert('Recipient account not found!');
            return;
        }

        const recipientName = recipientAccount.accountDetails?.name || 'Unknown';
        const amount = parseFloat(prompt(`Enter transfer amount to ${recipientName}:`));
        
        if (!isNaN(amount) && amount > 0) {
            const senderAccount = bankSystem.accounts.find(parseInt(fromAccount));
            const senderName = senderAccount.accountDetails?.name || 'Unknown';
            
            if (confirm(`Transfer ₹${amount.toFixed(2)} from ${senderName} to ${recipientName}?`)) {
                bankSystem.processTransaction('transfer', amount, parseInt(fromAccount), toAccount);
            }
        } else if (!isNaN(amount) && amount <= 0) {
            alert('Transfer amount must be greater than ₹0.00');
        }
    });
});