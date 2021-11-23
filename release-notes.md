Prerequisites

JSON-server running on port 3000

Known Issues

1

Data on JSON server updates once a day with data from external API, except on matchdays when data is pulled from external APIs upon each page load.

There is a bug with JSON server which causes it to crash upon receiving multiple delete requests. The page may need to be refreshed for the DELETE and subsequent POST requests to complete. The terminal will show the JSON server restarting after a crash.

Issue previously reported on https://github.com/typicode/json-server/issues/1037

2

404 error when requesting SVG icons for ligue 1 clubs ASSE, OGCN and AS Monaco.

