'use strict';

$(document).ready(function(){
  const addIcon = $('.add-icon');
  const panels = $('.panel');
  const foodSearchResultsContainer = $('.food-search__results');
  const foodSearchInput = $('.food-search__input');
  const searchResults = $('.food-search__item');
  const addFoodContainer = $('.add-food__container');
  const selectedFoodPhoto = $('.add-food__img');


  function hideSearchResults() {
    console.log('yay');
    if(!foodSearchResultsContainer.hasClass('food-search__results--hidden')){
      foodSearchResultsContainer.addClass('food-search__results--hidden');
    }
  }

  function showSearchResults() {
    if(foodSearchResultsContainer.hasClass('food-search__results--hidden')){
      foodSearchResultsContainer.removeClass('food-search__results--hidden');
    }
  }

  addIcon.click(function(){
    if (addIcon.hasClass('add-icon--animation-show')){
      panels.removeClass('fade-in');
      panels.addClass('fade-out');
      addIcon.removeClass('add-icon--animation-show');
      addIcon.addClass('add-icon--animation-hide');
      return;
    }

    panels.removeClass('fade-out');
    panels.addClass('fade-in');
    addIcon.removeClass('add-icon--animation-hide');
    addIcon.addClass('add-icon--animation-show');
  });

  foodSearchInput.keyup(async function(e){
    e.preventDefault();
    // show and hide results
    if (foodSearchInput.val().length <= 1){
      if (e.key == "Backspace" && foodSearchInput.val().length < 1) hideSearchResults();
      else showSearchResults();
    }

    let response = await fetch(`http://localhost:3000/api/searchbar-result/${foodSearchInput.val()}`);
    let data = await response.json();
    if (data.common.length > 0){
      for(let i = 0; i < searchResults.length; i++){
        searchResults[i].children[0].src = data.common[i].photo.thumb;
        searchResults[i].children[1].innerHTML = data.common[i].food_name;
        searchResults[i].dataset.name = data.common[i].food_name;
      }
    }
  });

  searchResults.click(async function(e){
    // get the food name of item clicked
    const foodName = e.currentTarget.getAttribute('data-name');
    // const metric

    let response = await fetch(`http://localhost:3000/api/food-info/${foodName}`);
    let data = await response.json();
    console.log(data.foods[0].photo.highres);
    selectedFoodPhoto[0].src = data.foods[0].photo.highres;
  });


});




