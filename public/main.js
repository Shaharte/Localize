const chatWindow = document.querySelector('.chat-messages')
const chatForm = document.getElementById('chat-form');

const socket = io();

const renderMessage = (message, side) => {
    const div = document.createElement('div')
    div.classList.add(`bubble-${side}`)
    div.classList.add(`bubble-bottom-${side}`)
    div.innerText = message
    chatWindow.appendChild(div)
}

const renderConnection = (message) => {
    const div = document.createElement('div')
    // div.classList.add(`bubble-${side}`)
    // div.classList.add(`bubble-bottom-${side}`)
    div.innerText = message
    chatWindow.appendChild(div)
}


function outputMessage(message) {
    console.log('message',message)
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
  }



// Message submit
chatForm.addEventListener('submit', (e) => {
    console.log('e', e)
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});



socket.on('botMessage', message => {
    console.log('botMessage',message)
    const {conversation = []} =  message
    conversation.forEach(element => {
        outputMessage(element)
    });
    // make sure to modify this
    // renderMessage(message, 'left')
})



// socket.on('connect', message => {
//     renderConnection('Connected')
// })
// socket.on('disconnect', message => {
//     renderConnection('Disconnect')
// })