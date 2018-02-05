let extractStr = '';
let extractArr = [];
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
      parseWikiText(extractStr);
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

//Render & handle disambiguation, errors (post mvp)
//Generate random page when no input is given (post mvp)
//https://en.wikipedia.org/wiki/Special:Random


//Parse Wikipedia JSON to extract and store content sections in an array of objects
//Format text to pass to Polly API
/*
function parseWikiText(extractStr) {
  console.log('parseWikiText ran');
  //read in JSON here - global variable
  //Span id = contents headers
  //<h2> = headers, <h3> = subheaders
  //Intro = no header
  //Ignore See Also, References, External Links
  let splitArr = extractStr.split('<span');

  function removeHTML(string) {
    let cleanedArr = splitArr.replace(/<[^>]+>/g, '');
    return cleanedArr;
  }
  splitArr.map(function(removeHTML);
  console.log(cleanedArr);
}
*/



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
// Render a stop button - pass '' string to polly

//Handle content link click - pass text or '' to polly


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