let headersArr = [];
let plainTextArr = [];

//Call Wikipedia api to get JSON (input else random)
function getDataFromWikiApi(inputURL) {
  const query = { 
    url: inputURL,
    dataType: "JSONP",
    success: function(data) {
      let page = Object.keys(data.query.pages)[0];
      let extractStr = data.query.pages[page].extract;
      let articleTitle = data.query.pages[page].title;
      $('#image-content').empty();
      try {
        if (data.query.pages[page].original.source) {
          let pageImg = data.query.pages[page].original.source;
          renderImage(pageImg);
        }
      } 
      catch (e) {}
      finally {
        renderTitle(articleTitle);
        renderJSON(extractStr);
        parseTextArr(extractStr);
        handleHeaderClick(plainTextArr);
      }
    }
  };
  $.ajax(query);
}

function renderTitle(articleTitle) {
  $('#article-title').text(`${articleTitle}`);
}

function renderImage(pageImg) {
  $('#image-content').html(`
    <img src='${pageImg}' class='pageimg' alt='Photo of ${articleTitle}'>
  `);
}

// Get HTML string
function renderJSON(extractStr) {
  $('#string').html(`
    <p>${extractStr}</p>
  `);
  pushTextHeadings(extractStr);
}

// Add headings to an array
function pushTextHeadings(extractStr) {
  let headers = $('#string').find('h2');
  headersArr = [];
  for (let i = 0; i < headers.length; i++) {
    headersArr.push(headers[i].textContent);
  };
  headersArr.splice(0, 0, 'Introduction');
  // Remove unwanted array values
  headersArr.push('Stop Audio');
  console.log(headersArr);
  renderHeaderLinks(headersArr);
}

// Render heading array as links
function renderHeaderLinks(headersArr) {
  $('.contents-links').empty();
  headersArr.forEach((item, index) => {
    $('.contents-links').append(`
      <button class='header' data='${index}'>${item}</button>
    `)}
  );
}

// Parse text strings
function parseTextArr(extractStr) {
  plainTextArr = [];
  textArr = extractStr.split('<h2>');
  textArr.forEach((item, index) => {
    let charLimit = 1500;
    plainTextArr.push($(item).text().substring(0, charLimit));
  });
  // ??? Don't think any of these methods are working
  plainTextArr.forEach((item, index, array) => {
    array[index].split('.').splice(-1, 1).join('.');
  });
  // ??? Remove same number of strings as headers
  plainTextArr.push('');
  console.log(plainTextArr);
}

// Pass string to Polly on click
// ??? Stop audio on click
function handleHeaderClick() {
  $('.contents-links').on('click', '.header', event => {
    event.preventDefault();
    let index = $(event.target).attr('data');
    let pollyText = plainTextArr[index];
    console.log(pollyText);
    getAudioFromPollyAPI(pollyText);
  });
}

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
  $('.search-form').submit(event => {
    event.preventDefault();
    let inputURL = ``;
    const queryTarget = $(event.currentTarget).find('.search-input');
    if (queryTarget.val()) {
      searchTerm = queryTarget.val();
      inputURL = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchTerm}&prop=extracts|pageimages&piprop=original&exlimit=max&format=json`
      queryTarget.val('');
    }
    else {
      inputURL = `https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts|pageimages&piprop=original&exlimit=max&format=json`
      queryTarget.val('');
    }
      getDataFromWikiApi(inputURL);
  });
}

$(submitSearch);