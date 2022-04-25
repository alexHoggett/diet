'use strict';

const displayNumbers = document.querySelector('.login-keyed-numbers');

const inputKeys = document.querySelector('.login-input__keys');
let numbersInputted = 0;

inputKeys.addEventListener('click', (e) => {
  const clicked = e.target.closest('button');
  console.log(clicked);

  if (clicked.classList.contains('login-input__key--clear')){
    // select all blanks
    const blanks = document.querySelectorAll('.login-keyed__number');
    blanks.forEach((blank => {
      blank.innerHTML = '_';
    }));
    numbersInputted = 0;
  } else if (numbersInputted < 4){
    // select next blank number
    const nextBlank = document.querySelector(`.login-keyed__number--${numbersInputted + 1}`);
    //update to number selected
    nextBlank.innerHTML = clicked.dataset.value;
    numbersInputted++;
  }
});



