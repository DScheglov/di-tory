# di-tory - Express Example

## Installation

```bash
git clone https://github.com/DScheglov/di-tory.git
cd di-tory
npm install
npm run compile
cd examples/express
npm install
```

## Launch

```bash
npm start
```

## Running Requests in VS Code

You can run requests in VS Code using the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

The requests are located in the [./requests.rest](./requests.rest) file.

## Running Requests in Terminal

With Request-Id header:

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: 80567598986527855233" \
  -d '{
    "userName": "admin",
    "password": "password"
  }'
```

Without Request-Id header:

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "admin",
    "password": "password"
  }'
```

### Format JSON Output

With Request-Id header:

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: 80567598986527855233" \
  -d '{
    "userName": "admin",
    "password": "password"
  }' | jq
```

Without Request-Id header:

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "admin",
    "password": "password"
  }' | jq
```

### Install `jq` Utility

Linux:

```bash
sudo apt-get install jq
```

macOS:

```bash
brew install jq
```

Windows:

Windows:

Download the `jq` executable from the [official website](https://stedolan.github.io/jq/download/)
and add it to your system's `PATH`.
