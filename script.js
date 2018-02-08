let extractStr = '';
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
      //parseWikiText(extractStr);
      testAPICall(extractStr);
      pullTextHeadings(extractStr);
    }
  };
  $.ajax(query);
}

//test API call
function testAPICall(extractStr) {
  console.log('testAPICall ran');
  $('.extract-results').html(`
    <p>${extractStr}</p>
    `);
}

//Parsing test
function pullTextHeadings(extractStr) {
  console.log('pullTextHeadings ran');
  $('#test').html(extractStr);
  let headers = $('#test').find('h2');
  console.log(headers);
  for (let i = 0; i < headers.length; i++) {
    headersArr.push(headers[i].textContent);
  };
  headersArr.splice(0, 0, 'Introduction');
  headersArr.splice(-3);
  console.log(headersArr);
}
//let article = $(headers[0]).child();
//console.log(article);

//Render & handle disambiguation, errors (post mvp)
//Generate random page when no input is given (post mvp)
//https://en.wikipedia.org/wiki/Special:Random


//Parse Wikipedia JSON to extract and store content sections in an array of objects
//Format text to pass to Polly API
/*
// 1. Grab <h2> as keys, to be displayed as LI in UL 
function pullTextHeadings(extractStr) {
  console.log('pullTextHeadings ran');
  const headings = extractStr.getElementsByTagName('h2')[0];
  console.log(headings);
}
*/
// 2. Add in [0] named Intro (no header in JSON)
// 3. Grab <h3> as subhead keys
// 4. Assign <p> text blocks as values
// ** Ignore See Also, References, External Links
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

// Render a link for each content section

// Render a stop button (pass '' string to polly)

// Handle content link click - pass text or '' to polly

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