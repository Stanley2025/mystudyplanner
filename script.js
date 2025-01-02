/**
 * Study Planner
 * Copyright (c) 2024 Your Name or Organization
 * All rights reserved.
 */
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
   const loginForm = document.getElementById('login-form');
   const showRegisterButton = document.getElementById('show-register');
   const showLoginButton = document.getElementById('show-login');
   const registerSection = document.getElementById('register-section');
   const loginSection = document.getElementById('login-section');
   const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');

   const sessionForm = document.getElementById('session-form');
   const sessionList = document.getElementById('session-list');
   const editIdInput = document.getElementById('edit-id');
   const submitButton = document.getElementById('submit-button');
   const cancelButton = document.getElementById('cancel-button');
    const notificationPermission = document.getElementById('notification-permission');

    const userProfile = document.getElementById('user-profile');
     const usernameDisplay = document.getElementById('username-display');
   const logoutButton = document.getElementById('logout-button');


   let currentUser = null; // keep track of the current user

   checkAuthState();
   
  showRegisterButton.addEventListener('click', function(){
       loginSection.style.display = 'none';
       registerSection.style.display = 'block';
  })
    showLoginButton.addEventListener('click', function(){
       loginSection.style.display = 'block';
       registerSection.style.display = 'none';
   })

     const forgotPasswordButton = document.getElementById('forgot-password');
       const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
       const forgotSubmitButton = document.getElementById('forgot-submit');
       const forgotUsernameInput = document.getElementById('forgot-username');
       const forgotMessageDiv = document.getElementById('forgot-password-message');
      const forgotFormDiv = document.getElementById('forgot-password-form');


        forgotPasswordButton.addEventListener('click', function () {
               forgotMessageDiv.textContent = "";
            forgotPasswordModal.show();
        });


        forgotSubmitButton.addEventListener('click', function(){
            const username = forgotUsernameInput.value;
              forgotPassword(username);
        })

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        if (username && password) {
               registerUser(username, password);
               login(username,password);
         }
   })

   loginForm.addEventListener('submit', function (e) {
       e.preventDefault();
       const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

         if (username && password) {
            login(username,password);
          }
   });

      logoutButton.addEventListener('click', function(){
         logout();
   });


    notificationPermission.addEventListener('click', requestNotificationPermission);

    sessionForm.addEventListener('submit', function(e) {
       e.preventDefault();

       const course = document.getElementById('course').value;
       const date = document.getElementById('date').value;
       const time = document.getElementById('time').value;
       const duration = document.getElementById('duration').value;
       const notes = document.getElementById('notes').value;
       const id = editIdInput.value;

     const sessionDateTime = new Date(`${date}T${time}`);
       const sessionTimestamp = sessionDateTime.getTime(); // store the timestamp
     
       const session = {
           id : id || generateId(),
           course: course,
           date: date,
           time: time,
            timestamp: sessionTimestamp,
           duration: duration,
           notes: notes
       };

        if (id) {
           updateSession(session);
        } else {
            addSessionToDOM(session);
            saveSession(session);
        }

        cancelEdit();
        sessionForm.reset();
   });

   cancelButton.addEventListener('click', function(){
       cancelEdit();
       sessionForm.reset();
   })

  function addSessionToDOM(session) {
      const listItem = document.createElement('li');
       listItem.dataset.id = session.id;
        listItem.classList.add('list-group-item', 'd-flex','justify-content-between','align-items-center')

       const sessionDetails = document.createElement('div');
       sessionDetails.classList.add('session-details');
       sessionDetails.textContent = `${session.course} - ${session.date} at ${session.time}, Duration ${session.duration} minutes: ${session.notes || 'No Notes'}`;


       const sessionActions = document.createElement('div');
       sessionActions.classList.add('session-actions');

       const editButton = document.createElement('button');
       editButton.textContent = 'Edit';
       editButton.classList.add('edit-button','btn', 'btn-sm','btn-primary')
       editButton.addEventListener('click', () => editSession(session.id));

       const deleteButton = document.createElement('button');
       deleteButton.textContent = 'Delete';
       deleteButton.classList.add('delete-button','btn', 'btn-sm','btn-danger', 'ms-1')
       deleteButton.addEventListener('click', () => deleteSession(session.id));

       sessionActions.appendChild(editButton);
       sessionActions.appendChild(deleteButton);
       listItem.appendChild(sessionDetails);
        listItem.appendChild(sessionActions);
       sessionList.appendChild(listItem);
   }

   function generateId() {
         return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
   }

     function saveSession(session) {
         if (!currentUser) return; // can only save if user is logged in
        let sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser.username}`) || '[]');
        sessions.push(session);
        localStorage.setItem(`studySessions_${currentUser.username}`, JSON.stringify(sessions));
    }

   function loadSessions(){
        if (!currentUser) return;
      let sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser.username}`) || '[]');
       sessions.forEach(session => {
           if(!session.id){
               session.id = generateId();
           }
           addSessionToDOM(session);
        });
   }

    function deleteSession(id) {
        if (!currentUser) return;
        let sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser.username}`) || '[]');
        sessions = sessions.filter(session => session.id !== id);
        localStorage.setItem(`studySessions_${currentUser.username}`, JSON.stringify(sessions));

        const listItem = document.querySelector(`li[data-id="${id}"]`);
        if(listItem){
           listItem.remove();
        }
    }
   function editSession(id) {
       if (!currentUser) return;
        let sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser.username}`) || '[]');
        const session = sessions.find(session => session.id === id);

       if(session){
           document.getElementById('course').value = session.course;
            document.getElementById('date').value = session.date;
            document.getElementById('time').value = session.time;
           document.getElementById('duration').value = session.duration;
           document.getElementById('notes').value = session.notes;
           editIdInput.value = session.id;
            submitButton.textContent = 'Update Session';
           cancelButton.style.display = 'inline-block'
       }
   }

    function updateSession(updatedSession) {
        if (!currentUser) return;
       let sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser.username}`) || '[]');
       sessions = sessions.map(session => {
               if (session.id === updatedSession.id) {
                 return updatedSession;
               }
               return session;
       });
        localStorage.setItem(`studySessions_${currentUser.username}`, JSON.stringify(sessions));

       const listItem = document.querySelector(`li[data-id="${updatedSession.id}"]`);
       if(listItem){
           const sessionDetails = listItem.querySelector('.session-details');
           sessionDetails.textContent = `${updatedSession.course} - ${updatedSession.date} at ${updatedSession.time}, Duration ${updatedSession.duration} minutes: ${updatedSession.notes || 'No Notes'}`;
       }
    }

   function cancelEdit() {
        editIdInput.value = '';
       submitButton.textContent = 'Add Session';
       cancelButton.style.display = 'none';
   }

   function checkNotifications() {
        setInterval(() => {
            if (!currentUser) return;
            let sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser.username}`) || '[]');
            sessions.forEach(session => {
                   const now = Date.now();
                   const timeLeft = session.timestamp - now;
                   if(timeLeft > 0 && timeLeft <= 10 * 60 * 1000){ // remind 10 minutes before the session
                       showNotification(session.course, session.date, session.time);
                    }
                 });
       }, 60 * 1000); //check every minute
   }

    async function requestNotificationPermission() {
       if (Notification.permission === 'default') {
           const permission = await Notification.requestPermission();
          if(permission === 'granted'){
              notificationPermission.style.display = 'none';
          }
       }else if (Notification.permission === 'granted'){
            notificationPermission.style.display = 'none';
        }
   }

   function showNotification(course, date, time) {
       if (Notification.permission === 'granted') {
         new Notification('Study Session Reminder!', {
           body: `Your study session for ${course} on ${date} at ${time} is starting soon!`,
          });
     }
  }

  function registerUser(username, password) {
       let users = JSON.parse(localStorage.getItem('users') || '[]');
       const newUser = {
           username : username,
           password : password
       }
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      alert("User successfully registered");
  }

    function forgotPassword(username) {
         let users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(user => user.username === username);
      
       if (user) {
           forgotMessageDiv.textContent = `Your password is: ${user.password}`;
          forgotFormDiv.style.display = 'none';
       } else {
          forgotMessageDiv.textContent = "User not found. Please check your username."
            forgotFormDiv.style.display = 'block';
        }
    }

  function login(username, password) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(user => user.username === username && user.password === password);
         if(user){
             currentUser = user;
             localStorage.setItem('currentUser', JSON.stringify(currentUser));
             loadSessions();
             updateAuthUI();
               loginSection.style.display = 'none';
               registerSection.style.display = 'none';
         }else{
            alert('Invalid username or password');
         }
   }
    function logout() {
       currentUser = null;
        localStorage.removeItem('currentUser');
      updateAuthUI();
        sessionList.innerHTML = '';

       loginSection.style.display = 'block';
        registerSection.style.display = 'none';
   }

   function checkAuthState() {
         currentUser = JSON.parse(localStorage.getItem('currentUser'));
       if(currentUser){
           loadSessions();
           updateAuthUI();
           loginSection.style.display = 'none';
            registerSection.style.display = 'none';
        }
   }

   function updateAuthUI(){
       if(currentUser){
           mainContainer.style.display = 'block';
           authContainer.style.display = 'none';
           userProfile.style.display = 'block';
           usernameDisplay.textContent = `Welcome, ${currentUser.username}`;
          checkNotifications()
        } else{
              mainContainer.style.display = 'none';
              authContainer.style.display = 'block';
            userProfile.style.display = 'none';
       }
   }
});