let headersArr = [];

//Call Wikipedia api to get JSON (input else random)
function getDataFromWikiApi(inputURL) {
  console.log('getDataFromAPI ran');
  const query = { 
    url: inputURL,
    dataType: "JSONP",
    success: function(data) {
      let page = Object.keys(data.query.pages)[0];
      extractStr = data.query.pages[page].extract;
      title = data.query.pages[page].title;
      renderTitle(title);
      renderJSON(extractStr);
      parseTextArr(extractStr);
    }
  };
  $.ajax(query);
}

function renderTitle(title) {
  console.log('renderTitle ran');
  $('.contents').prepend(`
    <h2>${title}</h2>
    `);
}

//Possible to grab h2 text with out injecting html string?
//test API call
function renderJSON(extractStr) {
  console.log('testAPICall ran');
  $('#string').html(`
    <p>${extractStr}</p>
    `);
  pushTextHeadings(extractStr);
}

// Add headings to an array
function pushTextHeadings(extractStr) {
  console.log('pushTextHeadings ran');
  let headers = $('#string').find('h2');
  console.log(headers);
  for (let i = 0; i < headers.length; i++) {
    headersArr.push(headers[i].textContent);
  };
  headersArr.splice(0, 0, 'Introduction');

  // ??? How to remove unwanted values from array? (and same tail end from plainTextArr)
  // ----- attempt to splice unwanted values
  /*
  for(let i = 0; i < headersArr.length; i++) {
    if(headersArr[i] === 'See also' || 'Notes' || 'References' || 'External links' || 'Further reading') {
       headersArr.splice(i, 1);
    }
  }
  */

  // ----- attempt to build a filter function
  /*
  function arrFilter(header) {
    return header !== 'See also' || 'Notes' || 'References' || 'External links' || 'Further reading';
  }
  headersArr.filter(arrFilter);
  */

  // ----- attempt to build a filter function 2
  /*
  headersArr.filter(val => val !== 'See also' || 'Notes' || 'References' || 'External links' || 'Further reading' );
  */

  // splice is a temporary fix - need to remove specific values
  // headersArr.splice(-4);
  // possible to render this after first click?
  headersArr.push('Stop Audio');
  console.log(headersArr);
  renderHeaderLinks(headersArr);
}

// Parse text strings
function parseTextArr(extractStr) {
  console.log('parseTextArr ran');
  let textArr = extractStr.split('<h2>');
  let plainTextArr = [];
  textArr.forEach((item, index) => {
    plainTextArr.push($(item).text());
  });
  // splice is a temporary fix. need to remove same number of values as headersArr above
  // plainTextArr.splice(-4);
  plainTextArr.push('');
  console.log(plainTextArr);
  handleHeaderClick(headersArr, plainTextArr);
}

// Render headings as links
function renderHeaderLinks(headersArr) {
  console.log('renderHeaderLinks ran');
  headersArr.forEach((item, index) => {
    console.log(item);
    $('.contents-links').append(`
      <button class='header' data='${index}'>${item}</button>
    `)}
  );
}

// Handle click on header links
function handleHeaderClick(headersArr, plainTextArr) {
  console.log('handleHeaderClick ran')
  $('.contents-links').on('click', '.header', event => {
    event.preventDefault();
    let index = $(event.target).attr('data');
    let pollyText = plainTextArr[index];
    console.log(pollyText);
    getAudioFromPollyAPI(pollyText);
  });
}

// TO DO
// Pull images
// Wire up polly.js file
// Handle content link click - pass text or '' to polly
// ??? Render & handle input (title case + singular), disambiguation, errorr (library?)
// Generate random page when no input is given
// https://en.wikipedia.org/wiki/Special:Random
// Pull out any unreadable tags


//Submit parsed content to Polly API
function getAudioFromPollyAPI (pollyText) {
  AWS.config.accessKeyId = config.MY_KEY;
  AWS.config.secretAccessKey = config.SECRET_KEY;
  AWS.config.region = 'us-west-2';
  
  let polly = new AWS.Polly();
  const params = {
    OutputFormat: 'mp3', 
    Text: `${pollyText}`, 
    TextType: "text", 
    VoiceId: "Kimberly"
    };
    
    polly.synthesizeSpeech(params, function(err, data) {
      if (err){
      // an error occurred
      console.log(err, err.stack);
      } 
      else {
        let uInt8Array = new Uint8Array(data.AudioStream);
        let arrayBuffer = uInt8Array.buffer;
        let blob = new Blob([arrayBuffer]);

        let audio = $('audio');
        let url = URL.createObjectURL(blob);
        audio[0].src = url;
        audio[0].play(); 
      }
  });
}


//Handle submit search
function submitSearch() {
  console.log('submitSearch ran');
  $('.search-form').submit(event => {
    event.preventDefault();
    let inputURL = ``;
    const queryTarget = $(event.currentTarget).find('.search-input');
    if (queryTarget.val()) {
      searchTerm = queryTarget.val();
      inputURL = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchTerm}&prop=extracts&format=json`
      queryTarget.val('');
    }
    else {
      inputURL = `https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&format=json`
      queryTarget.val('');
    }
      getDataFromWikiApi(inputURL);
  });
}

$(submitSearch);