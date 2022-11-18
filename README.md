[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video) &nbsp; [![badge](https://img.shields.io/github/stars/apivideo/api.video-migration-tool?style=social)](https://github.com/apivideo/api.video-migration-tool) &nbsp; [![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)
![](https://github.com/apivideo/API_OAS_file/blob/master/apivideo_banner.png)
<h1 align="center">api.video migration tool</h1>


[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in your app.

# Table of contents

- [Table of contents](#table-of-contents)
- [Project description](#project-description)
- [Getting started](#getting-started)
  - [Running the tool](#running-the-tool)
- [Adding new providers](#adding-new-providers)

# Project description

The api.video migration tool is an application that allows you to migrate videos stored at different hosting provider to api.video.

# Getting started

## Running the tool

```bash
npm run dev
```

Some video providers requires environment variables to be set. You can set them in a `.env` file at the root of the project.

Required environment variables per provider:
| Provider | Environment variables | Description |
| --- | --- | --- |
| Dropbox | `NEXT_PUBLIC_DROPBOX_CLIENT_ID` | Dropbox application client ID |
| Dropbox | `NEXT_PUBLIC_DROPBOX_REDIRECT_URL` | Dropbox application redirect URL |
| Dropbox | `DROPBOX_CLIENT_SECRET` | Dropbox application client secret |

# Adding new providers

Available providers are listed in the `src/providers.tsx` file. 

You can add a new provider by doing the following:
- adding a new entry in the `src/providers.tsx` file
- `src/components/<provider-name>Login.tsx`: a React component that will be displayed in the "Authentication" step of the tool. This component should handle the authentication process with the provider and send back the provider's access token thanks to the `onAccessTokenChanged` prop method.
- `src/service/providers/<provider-name>ProviderService.ts`: a service class that implements the [AbstractProviderService](src/service/providers/AbstractProviderService.ts) interface. This service will be used to perform the actions against the provider's API (not all the methods have to be implemented, it depends on the provider - by instance, some provider provide directly a link to a downloadable MP4 version of each video, so implementing the `generatePublicMp4()` is not required).