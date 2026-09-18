'use strict';
const id = new URLSearchParams(location.search).get('id');
document.getElementById('label').textContent = ['A', 'B', 'C'].includes(id) ? id : '?';
