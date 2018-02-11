let headersArr = [];

//Render page

//Call Wikipedia api to get JSON (input else random)
function getDataFromWikiApi(searchTerm) {
  console.log('getDataFromAPI ran');
  const query = { 
    url: `https://en.wikipedia.org/w/api.php?action=query&titles=${searchTerm}&prop=extracts&format=json`,
    dataType: "JSONP",
    success: function(data) {
      let page = Object.keys(data.query.pages)[0];
      extractStr = data.query.pages[page].extract;
      renderJSON(extractStr);
      parseTextArr(extractStr);
    }
  };
  $.ajax(query);
}

//test API call
function renderJSON(extractStr) {
  console.log('testAPICall ran');
  $('#string').html(`
    <p>${extractStr}</p>
    `);
  pullTextHeadings(extractStr);
}

// Add headings to an array
function pullTextHeadings(extractStr) {
  console.log('pullTextHeadings ran');
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

  //headersArr.splice(-3);
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
  console.log(plainTextArr);
  handleHeaderClick(headersArr, plainTextArr);
}

// Render headings as links
// ??? How to assign index nubmer as id?
function renderHeaderLinks(headersArr) {
  console.log('renderHeaderLinks ran');
  headersArr.forEach((item, index) => {
    console.log(item);
    $('.contents-links').append(`
      <li data='${index}'><a href="url">${item}</a></li>
    `)}
  );
}

// Handle click on header links
function handleHeaderClick(headersArr, plainTextArr) {
  console.log('watchSubmit ran')
  $('.contents-links').submit(event => {
    event.preventDefault();
    let index = parseInt($(this).attr('data'));
    console.log(index);
    // When click on headersArr[i], return plainTextArr[i]
    // Return here to test, ultimately pass to Polly.
    // ??? On click, possible to append id='textForSpeech' to the corresponding plainTextArr index?
  });
}


// TO DO
// Wire up polly.js file
// Render a stop button (pass '' string to polly)
// Handle content link click - pass text or '' to polly
// ??? Render & handle input (title case + singular), disambiguation, errorr (library?)
// Generate random page when no input is given
// https://en.wikipedia.org/wiki/Special:Random
// Pull out any unreadable tags


//Submit parsed content to Polly API
function getAudioFromPollyAPI (text) {
  AWS.config.accessKeyId = config.MY_KEY;
  AWS.config.secretAccessKey = config.SECRET_KEY;
  AWS.config.region = 'us-west-2';
  
  let polly = new AWS.Polly();
  const params = {
    OutputFormat: 'mp3', 
    Text: ``, 
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
    const queryTarget = $(event.currentTarget).find('.search-input');
    searchTerm = queryTarget.val();
    queryTarget.val('');
    getDataFromWikiApi(searchTerm/*, parseWikiText*/);
  });
}

$(submitSearch);
$(getAudioFromPollyAPI);