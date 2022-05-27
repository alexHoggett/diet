'use strict';

/// // ///// // ///// // ///// // ///// // ///// // //
/// Was for number login but no longer used
/// // ///// // ///// // ///// // ///// // ///// // //

// const displayNumbers = document.querySelector('.login-keyed-numbers');

// const inputKeys = document.querySelector('.login-input__keys');
// let numbersInputted = 0;

// inputKeys.addEventListener('click', (e) => {
//   const clicked = e.target.closest('button');
//   console.log(clicked);

//   if (clicked.classList.contains('login-input__key--clear')){
//     // select all blanks
//     const blanks = document.querySelectorAll('.login-keyed__number');
//     blanks.forEach((blank => {
//       blank.innerHTML = '_';
//     }));
//     numbersInputted = 0;
//   } else if (numbersInputted < 4){
//     // select next blank number
//     const nextBlank = document.querySelector(`.login-keyed__number--${numbersInputted + 1}`);
//     //update to number selected
//     nextBlank.innerHTML = clicked.dataset.value;
//     numbersInputted++;
//   }
// });

const addIcon = document.querySelector('.add-icon');

addIcon.addEventListener('click', (e) => {
  const panels = document.querySelectorAll('.panel');
  if (addIcon.classList.contains('add-icon--animation-show')){
    // hide button
    // hide panels first
    panels.forEach(panel => {
      panel.classList.remove('fade-in');
      panel.classList.add('fade-out');
    })

    // then button
    addIcon.classList.remove('add-icon--animation-show');
    addIcon.classList.add('add-icon--animation-hide')
    return;
  }

  // show button
  panels.forEach(panel => {
    panel.classList.remove('fade-out');
    panel.classList.add('fade-in');
  })
  addIcon.classList.remove('add-icon--animation-hide');
  addIcon.classList.add('add-icon--animation-show');
})

const foodSearchInput = document.querySelector('.food-search__input');
const results = document.querySelector('#result');

foodSearchInput.addEventListener('keyup', async function(e){
  console.log(foodSearchInput.value);
  console.log(e);
  if (foodSearchInput.value !== "" && e.key !== 'Backspace'){
    console.log('test');
  }
  e.preventDefault();
  let response = await fetch(`http://localhost:3000/api/${foodSearchInput.value}`);
  let data = await response.json();
  console.log(data);
  if (data.common.length !== 0) document.querySelector('.food-result').src=data.common[0].photo.thumb;
})

