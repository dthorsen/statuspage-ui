# statuspage-ui

> A UI for statuspage.io

[![Travis Build Status](https://travis-ci.org/dthorsen/statuspage-ui.svg?branch=master)](https://travis-ci.org/dthorsen/statuspage-ui) [![Build status](https://ci.appveyor.com/api/projects/status/3uq9xa7efhoddhmp/branch/master?svg=true)](https://ci.appveyor.com/project/dthorsen/statuspage-ui/branch/master)

#### Configuration
You will need to create a configuration file at ~/.statuspage-ui. Here is an example
configuration file.

```
{
  "baseAPIURL": "https://api.statuspage.io/v1/pages/",
  "pageID": "<your_page_id>",
  "token": "<your_api_token>"
}
```

#### Build Setup

``` bash
# set registry
echo "registry=https://artifactory.gannettdigital.com/artifactory/api/npm/cs-node-virtual" >> ~/.npmrc

# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[331f85f](https://github.com/SimulatedGREG/electron-vue/tree/331f85fd556cc0d60a30ad019a44a29baaed49f5) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
