const http = require('http');

const dogs = [
  {
    dogId: 1,
    name: "Fluffy",
    age: 2
  }
];

let nextDogId = 2;

function getNewDogId() {
  const newDogId = nextDogId;
  nextDogId++;
  return newDogId;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // request is finished assembly the entire request body
    // Parsing the body of the request depending on the Content-Type header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ======================== ROUTE HANDLERS ======================== */

    // GET /dogs
    if (req.method === 'GET' && req.url === '/dogs') {
      // Your code here
      res.write(JSON.stringify(dogs));
      res.end();
      return;
    }

    // GET /dogs/:dogId
    if (req.method === 'GET' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/'); // ['', 'dogs', '1']
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        console.log(typeof dogId);
        // Your code here
        let dog = dogs.find(dog => String(dog.dogId) === dogId);
        console.log('dog = ', dog);
        console.log('json = ', JSON.stringify(dog));
        res.write(JSON.stringify(dog));
        res.end();
        return;
      }      
    }

    // POST /dogs
    if (req.method === 'POST' && req.url === '/dogs') {
      const { name, age } = req.body;
      // Your code here
      const newDogId = getNewDogId()
      let newDog = {
        dogId: newDogId,
        name,
        age
      };
      dogs.push(newDog);
      res.setHeader('Content-type', 'application/json');
      res.write(JSON.stringify(newDog))
      res.end();
      return;

    }

    // PUT or PATCH /dogs/:dogId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        // Your code here
        const { name, age } = req.body;
        console.log('dogId', dogId);
        console.log('dogs', dogs);
        let dog = dogs.find(dog => String(dog.dogId) === dogId);
        console.log('dog = ', dog);
        console.log('json = ', JSON.stringify(dog));
        // updating:
        dog.name = name;
        dog.age = age;
        console.log('updated dog', dog);
        res.write(JSON.stringify(dog));
        res.end();
        return;
      }
    }

    // DELETE /dogs/:dogId
    if (req.method === 'DELETE' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        // Your code here
        let dogIndex = dogs.findIndex(dog => String(dog.dogId) === dogId);
        dogs.splice(dogIndex);
        res.write(JSON.stringify("Dog #"));
        res.write(JSON.stringify(dogIndex + 1));
        res.write(JSON.stringify(" succesfully deleted"));
        res.end();
        return;
      
      }
    }

    // No matching endpoint
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end('Endpoint not found');
  });

});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));