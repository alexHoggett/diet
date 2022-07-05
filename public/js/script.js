'use strict';

$(document).ready(function(){
  const addIcon = $('.add-icon');
  const panels = $('.panel');
  const foodSearchResultsContainer = $('.food-search__results');
  const foodSearchInput = $('.food-search__input');
  const searchResults = $('.food-search__item');
  const addFoodContainer = $('.add-food__container');
  const selectedFoodPhoto = $('.add-food__img');
  const foodItemCals = $('.add-food__cals');
  const foodItemProt = $('.add-food__protein');

  let calPerGram = 0;
  let protPerGram = 0;


  function hideSearchResults() {
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
    // const metric = $('input[name="metric"]:checked').attr('id');

    let response = await fetch(`http://localhost:3000/api/food-info/${foodName}`);
    let data = await response.json();
    selectedFoodPhoto[0].src = data.foods[0].photo.highres;
    foodItemCals.text('0');
    foodItemProt.text('0');
    calPerGram = data.foods[0].nf_calories;
    protPerGram = data.foods[0].nf_protein;
    updateFoodInfo();
  });

  $('.add-food__units input').on('click', updateFoodInfo);
  $('#number').on('input', updateFoodInfo);

  function updateFoodInfo(){
    console.log('fired');
    const metric = $("input[type='radio'][name='metric']:checked")[0].getAttribute('id');
    console.log(metric);
    let cals = 0;
    let protein = 0;
    const quantity = $('#number').val();
    if (metric == 'grams'){
      cals = quantity * calPerGram;
      protein = quantity * protPerGram;
    } else if (metric == 'cup'){
      cals = 128 * quantity * calPerGram;
      protein = 128 * quantity * protPerGram;
    } else if (metric == 'tbsp'){
      cals = 14.79 * quantity * calPerGram;
      protein = 14.79 * quantity * protPerGram;
    } else if (metric == 'tsp'){
      cals = 4.2 * quantity * calPerGram;
      protein = 4.2 * quantity * protPerGram;
    } else if (metric == 'ml'){
      cals = 1 * quantity * calPerGram;
      protein = 1 * quantity * protPerGram;
    }
    foodItemCals.text(cals);
    foodItemProt.text(protein);
  }

  
});




