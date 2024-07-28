$(document).ready(function() {
    // Initially show the login page
    showPage('loginPage');

    // Event listeners for the navbar links
    $('#homeLink').click(function() { showPage('homePage'); loadSnippets(); });
    $('#loginLink').click(function() { showPage('loginPage'); });
    $('#registerLink').click(function() { showPage('registerPage'); });
    $('#logoutLink').click(logout);

    // Functions to show different pages
    function showPage(pageId) {
        $('.page').hide();
        $('#' + pageId).show();
    }

    // Event listeners for forms
    $('#snippetForm').submit(addSnippet);
    $('#loginForm').submit(login);
    $('#registerForm').submit(register);
    $('#updateSnippetForm').submit(function(event) {
        event.preventDefault();
        updateSnippet($('#updateSnippetForm').data('id'));
    });

    // AJAX functions
    function login(event) {
        event.preventDefault();
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();

        $.ajax({
            url: 'https://hack-back-zeta.vercel.app/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function(response) {
                localStorage.setItem('token', response.token);
                console.log('Login successful, token:', response.token);
                showPage('homePage');
                loadSnippets();
            },
            error: function(error) {
                alert('Login failed');
                console.log('Login error:', error);
            }
        });
    }

    function register(event) {
        event.preventDefault();
        const username = $('#registerName').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();

        $.ajax({
            url: 'https://hack-back-zeta.vercel.app/api/auth/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password }),
            success: function(response) {
                alert('Registration successful');
                showPage('loginPage');
            },
            error: function(error) {
                alert('Registration failed');
                console.log('Registration error:', error);
            }
        });
    }

    function logout() {
        localStorage.removeItem('token');
        showPage('loginPage');
    }

    function addSnippet(event) {
        event.preventDefault();
        const title = $('#snippetTitle').val();
        const description = $('#snippetDescription').val();
        const code = $('#snippetCode').val();
        const token = localStorage.getItem('token');

        console.log('Adding snippet, token:', token);

        $.ajax({
            url: 'https://hack-back-zeta.vercel.app/api/snippets',
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'x-auth-token': token
            },
            data: JSON.stringify({ title, description, code }),
            success: function(response) {
                loadSnippets();
                $('#snippetForm')[0].reset();
            },
            error: function(error) {
                alert('Failed to add snippet');
                console.log('Add snippet error:', error);
            }
        });
    }

    function loadSnippets() {
        const token = localStorage.getItem('token');
        console.log('Loading snippets, token:', token);

        $.ajax({
            url: 'https://hack-back-zeta.vercel.app/api/snippets',
            method: 'GET',
            headers: {
                'x-auth-token': token
            },
            success: function(response) {
                $('#snippets').empty();
                response.forEach(function(snippet) {
                    const snippetCard = `
                        <div class="bg-white shadow-md rounded-lg p-6 snippet">
                            <h3 class="text-xl font-bold mb-2">${snippet.title}</h3>
                            <p class="text-gray-700 mb-4">${snippet.description}</p>
                            <pre class="bg-gray-100 p-4 rounded-lg mb-4 whitespace-pre-wrap overflow-auto hidden" style="max-height: 200px;">${snippet.code}</pre>
                            <div class="flex justify-between">
                                <button class="viewCodeBtn px-4 py-2 bg-blue-500 text-white rounded-lg">Copy Code</button>
                                <button class="editBtn px-4 py-2 bg-yellow-500 text-white rounded-lg" data-id="${snippet._id}">Edit</button>
                                <button class="deleteBtn px-4 py-2 bg-red-500 text-white rounded-lg" data-id="${snippet._id}">Delete</button>
                            </div>
                        </div>`;
                    $('#snippets').append(snippetCard);
                });

                // Add click event listeners for view, edit, and delete buttons
                $('.viewCodeBtn').click(function() {
                    const code = $(this).closest('.snippet').find('pre').text();
                    copyToClipboard(code);
                });
                $('.editBtn').click(function() {
                    const snippetId = $(this).data('id');
                    loadSnippetForUpdate(snippetId);
                });
                $('.deleteBtn').click(function() {
                    const snippetId = $(this).data('id');
                    deleteSnippet(snippetId);
                });
            },
            error: function(error) {
                alert('Failed to load snippets');
                console.log('Load snippets error:', error);
            }
        });
    }

    function loadSnippetForUpdate(snippetId) {
        const token = localStorage.getItem('token');

        $.ajax({
            url: `https://hack-back-zeta.vercel.app/api/snippets/${snippetId}`,
            method: 'GET',
            headers: {
                'x-auth-token': token
            },
            success: function(snippet) {
                $('#updateSnippetTitle').val(snippet.title);
                $('#updateSnippetDescription').val(snippet.description);
                $('#updateSnippetCode').val(snippet.code);
                $('#updateSnippetForm').data('id', snippet._id);
                showPage('updateSnippetPage');
            },
            error: function(error) {
                alert('Failed to load snippet');
                console.log('Load snippet error:', error);
            }
        });
    }

    function updateSnippet(snippetId) {
        const title = $('#updateSnippetTitle').val();
        const description = $('#updateSnippetDescription').val();
        const code = $('#updateSnippetCode').val();
        const token = localStorage.getItem('token');

        $.ajax({
            url: `https://hack-back-zeta.vercel.app/api/snippets/${snippetId}`,
            method: 'PUT',
            contentType: 'application/json',
            headers: {
                'x-auth-token': token
            },
            data: JSON.stringify({ title, description, code }),
            success: function(response) {
                showPage('homePage');
                loadSnippets();
            },
            error: function(error) {
                alert('Failed to update snippet');
                console.log('Update snippet error:', error);
            }
        });
    }

    function deleteSnippet(snippetId) {
        const token = localStorage.getItem('token');

        $.ajax({
            url: `https://hack-back-zeta.vercel.app/api/snippets/${snippetId}`,
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            },
            success: function(response) {
                loadSnippets();
            },
            error: function(error) {
                alert('Failed to delete snippet');
                console.log('Delete snippet error:', error);
            }
        });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Code copied to clipboard!');
        }, function(error) {
            alert('Failed to copy code');
            console.log('Copy to clipboard error:', error);
        });
    }
});
