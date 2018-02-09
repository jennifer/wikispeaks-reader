let extractStr = '';
let headersArr = [];
let subheadersArr = [];

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
  pullTextSubheadings(extractStr);
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
  headersArr.splice(-3);
  console.log(headersArr);
  renderHeaderLinks(headersArr);
}

// Add subheadings to an array
function pullTextSubheadings(extractStr) {
  console.log('pullTextHeadings ran');
  let subheaders = $('#string').find('h3');
  console.log(subheaders);
  for (let i = 0; i < subheaders.length; i++) {
    subheadersArr.push(subheaders[i].textContent);
  };
  console.log(subheadersArr);
}

// Create an object with headings as keys

// Add text strings as object values

// Render headings as links
function renderHeaderLinks(headersArr) {
  console.log('renderHeaderLinks ran');
  headersArr.map((item, index) =>
    $('.contents-links').html(`
      <li>${item}</li>
    `)
  );
}

/*
  for (let i = 0; i < headersArr.length; i++) {
    $('.contents-links').html(`
      <li>${headersArr[i]}</li>
    `)};
 */ 

//let article = $(headers[0]).child();
//console.log(article);

// TO DO
// Render a stop button (pass '' string to polly)
// Handle content link click - pass text or '' to polly
// Render & handle disambiguation, errors (post mvp)
// Generate random page when no input is given (post mvp)
// https://en.wikipedia.org/wiki/Special:Random
// ** Pull out any unreadable tags

//Submit parsed content to Polly API
function getAudioFromPollyAPI (text) {
  AWS.config.accessKeyId = config.MY_KEY;
  AWS.config.secretAccessKey = config.SECRET_KEY;
  AWS.config.region = 'us-west-2';
  
  let polly = new AWS.Polly();
  const params = {
    OutputFormat: 'mp3', 
    Text: 'Hello world', 
    TextType: "text", 
    VoiceId: "Raveena"
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
//$(getAudioFromPollyAPI);