function getDataFromWikiApi(inputURL) {
  const query = { 
    url: inputURL,
    dataType: "JSONP",
    success: function(data) {
      let page = Object.keys(data.query.pages)[0];
      let extractStr = data.query.pages[page].extract;
      let articleTitle = data.query.pages[page].title;
      if (data.query.pages[page].original) {
          let pageImg = data.query.pages[page].original.source;
          renderImage(pageImg, articleTitle);
      }
      renderTitle(articleTitle);
      renderJSON(extractStr);
      parseTextArr(extractStr);
      handleHeaderClick(plainTextArr);
    }
  };
  $.ajax(query);
}

function renderTitle(articleTitle) {
  $('.title-wrapper').html(`
    <h2 id='article-title'>${articleTitle}</h2>
    `);
}

function renderImage(pageImg, articleTitle) {
  $('.image-wrapper').append(`
    <img src='${pageImg}' class='pageImg' alt='Photo of ${articleTitle}'>
  `);
}

// Get HTML string for parsing
function renderJSON(extractStr) {
  $('#string').html(`
    <p>${extractStr}</p>
  `);
  pushTextHeadings(extractStr);
}

let headersArr = [];
let headersArrLg = 0;
function pushTextHeadings(extractStr) {
  let headers = $('#string').find('h2');
  headersArr = [];
  for (let i = 0; i < headers.length; i++) {
    headersArr.push(headers[i].textContent);
  };
  let removeHeadersArr = ['See also', 'Notes', 'References', 'External links', 'Further reading', 'Footnotes', 'Notes and references', 'Maps'];
  removeHeadersArr.forEach((item, index) => {
    let index2 = headersArr.indexOf(removeHeadersArr[index]);
    if (index2 > -1) {
      headersArr.splice(index2, 1);
    }
  });
  headersArr.splice(0, 0, 'Introduction');
  headersArrLg = headersArr.length;
  headersArr.push('Stop Audio');
  renderHeaderLinks(headersArr);
}

function renderHeaderLinks(headersArr) {
  $('.content-buttons').append(`
    <form class='contents-form'>
      <fieldset class='contents-links'>
        <legend>Click to listen</legend>
      </fieldset>
    </form>
    `);

  headersArr.forEach((item, index) => {
    $('.contents-links').append(`
      <button class='header-button' data='${index}'>${item}</button>
    `)}
  );
}

// Parse text strings
let plainTextArr = [];
function parseTextArr(extractStr) {
  plainTextArr = [];
  textArr = extractStr.split('<h2>');
  textArr.forEach((item, index) => {
    let charLimit = 1500;
    plainTextArr.push($(item).text().substring(0, charLimit));
  });
    plainTextArr.forEach((item, index, array) => {
    array[index] = array[index].split('.').slice(0, -1).join('.');
  });
    let removeText = plainTextArr.length - headersArrLg;
    plainTextArr.splice(-`${removeText}`, removeText, '');
}

// Pass parsed string to Polly
function handleHeaderClick() {
  $('.contents-links').on('click', '.header-button', event => {
    event.preventDefault();
    let index = $(event.target).attr('data');
    let pollyText = plainTextArr[index];
    getAudioFromPollyAPI(pollyText);
  });
}

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

let submitFunc = function submitSearch() {
    event.preventDefault();
    $('.error-message').empty();
    $('.contents-links').empty();
    $('.content-buttons').empty();
    $('.image-wrapper').empty();
    $('#article-title').empty();
    pollyText = '';
    getAudioFromPollyAPI(pollyText);
    let inputURL = ``;

    const queryTarget = $(event.currentTarget).find('.search-input');
    if (queryTarget.val()) {
      searchTerm = queryTarget.val();
      redirectURL = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${searchTerm}&redirects=`
      queryTarget.val('');
      getTermFromReditect(redirectURL);
    }
    else {
      inputURL = `https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts|pageimages&piprop=original&exlimit=max&format=json`
      queryTarget.val('');
      getDataFromWikiApi(inputURL);
    }
  }

$('.search-form').submit(submitFunc);
$('#random').click(submitFunc);

// Get normalized term from redirect page
function getTermFromReditect(redirectURL) {
  const query = { 
    url: redirectURL,
    dataType: "JSONP",
    success: function(data) {
      let page = Object.keys(data.query.pages)[0];
      if (page == -1) {
        $('.error-message').html('<p class="error">Not found. Check spelling and search again</p>');
        return;
      }
      else {
        let searchTermNorm = data.query.pages[page].title;
        let inputURL = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchTermNorm}&prop=extracts|pageimages&piprop=original&exlimit=max&format=json`
        getDataFromWikiApi(inputURL);
      }
      }
    };
  $.ajax(query);
}
