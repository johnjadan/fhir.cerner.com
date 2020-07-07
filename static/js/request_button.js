const statuses = {
  200: '200 OK',
  201: '201 Created',
  202: '202 Accepted',
  204: '204 No Content',
  205: '205 Reset Content',
  301: '301 Moved Permanently',
  302: '302 Found',
  307: '307 Temporary Redirect',
  304: '304 Not Modified',
  400: '400 Bad Request',
  401: '401 Unauthorized',
  403: '403 Forbidden',
  404: '404 Not Found',
  405: '405 Method not allowed',
  409: '409 Conflict',
  422: '422 Unprocessable Entity',
  500: '500 Server Error',
  502: '502 Bad Gateway'
};

/**
 * Displays a loading spinner while the request processes.
 * @param {HTMLElement} responseBody - The <pre> element that the response will be displayed in.
 */
function displayLoadingSpinner(responseBody) {
  let template = document.createElement('template');
  let loadingSpinnerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
  template.innerHTML = loadingSpinnerHTML.trim();

  let loadingSpinner = template.content.firstChild;
  responseBody.appendChild(loadingSpinner);
}

/**
 * Displays a failure message for calls that do not return a 200 or that return an empty bundle.
 * @param {object} xhr - The response object returned from the request.
 * @param {bool} emptyBundle - Whether or not the response returned an empty bundle.
 */
function showRequestFailureMessage(xhr = null, emptyBundle = false) {
  let status = responseDiv.children[0];
  let body = responseDiv.children[1];

  if (!body.children[1].classList.contains('hide')) {
    body.children[1].classList.add('hide');
  }

  status.firstChild.innerText = 'Status: ' + statuses[xhr.status];
  body.firstChild.classList.add('example-failure-message');

  if (emptyBundle) {
    body.firstChild.innerText = 'Unfortunately, this request returned no results. To view what a request containing ' +
                                'results might look like, please view the example response.\n' +
                                `X-Request-Id: ${xhr.getResponseHeader('X-Request-Id')}`;
  }
  else {
    body.firstChild.innerHTML = 'Failed to make this request: If this issue persists, please post to our ' +
                                '<a href="https://groups.google.com/d/forum/cerner-fhir-developers">developer group' +
                                `</a>.\nX-Request-Id: ${xhr.getResponseHeader('X-Request-Id')}`;
  }
}

/**
 * Makes a GET request using the provided URL and accept header associated with the live response tab.
 * If the request fails or returns an empty bundle, an error message is displayed instead of the response.
 * @param {HTMLElement} liveResponseTab - The live response tab for the current example.
 */
function makeRequest(liveResponseTab) {
  let requestURL = liveResponseTab.dataset.url;
  let header = { Accept: liveResponseTab.dataset.header };
  let status = responseDiv.children[0];
  let body = responseDiv.children[1];

  if (body.children.length == 1) {
    displayLoadingSpinner(body);

    fetchData(requestURL, header, true, function(response, xhr) {
      body.children[1].classList.add('hide');

      if (liveResponseTab.dataset.status != xhr.status) {
        showRequestFailureMessage(xhr, false);
      }
      else if (response.resourceType === 'Bundle' && !response.hasOwnProperty('entry')) {
        showRequestFailureMessage(xhr, true);
      }
      else {
        status.firstChild.innerText = 'Status: ' + statuses[xhr.status];
        body.firstChild.innerText += JSON.stringify(response, null, 2);
      }
    }, showRequestFailureMessage);
  }
}

/**
 * Toggles between the example response and the live response.
 * The first time the live response tab is clicked, a GET request is performed for the example.
 * @param {HTMLElement} tabClicked - The tab clicked, either the example response or the live response.
 * @param {number} randomId - The random ID associated with group of responses.
 */
function showResponse(tabClicked, randomId) {
  let tabs = document.getElementById(randomId).children;
  let responses = document.querySelectorAll(`[data-id="${randomId}"]`)[0].children;

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].firstChild.classList.remove('active');
  }

  tabClicked.classList.add('active');

  if (tabClicked.textContent === 'Example Response') {
    responses[0].classList.remove('hide');
    responses[1].classList.add('hide');
  }
  else {
    responses[0].classList.add('hide');
    responses[1].classList.remove('hide');

    window.responseDiv = responses[1];
    makeRequest(tabClicked);
  }
}
