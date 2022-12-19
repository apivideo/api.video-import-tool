[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video) &nbsp; [![badge](https://img.shields.io/github/stars/apivideo/api.video-migration-tool?style=social)](https://github.com/apivideo/api.video-migration-tool) &nbsp; [![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)
![](https://github.com/apivideo/API_OAS_file/blob/main/apivideo_banner.png)
<h1 align="center">api.video migration tool</h1>


[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in your app.

# Table of contents

- [Table of contents](#table-of-contents)
- [Project description](#project-description)
- [Supported providers](#supported-providers)
- [Getting started](#getting-started)
  - [Using the deployed version](#using-the-deployed-version)
  - [Running the tool locally](#running-the-tool-locally)
- [Adding new providers](#adding-new-providers)

# Project description

The api.video migration tool is a Next.js application that allows you to easily import your videos hosted at different hosting provider to api.video. 

The tool provides a simple and straightforward interface for completing the migration process, which involves a few steps: 
- First, select the platform from which you want to migrate videos.
- Next, enter your credentials for that platform. 
- Then, select the specific videos you want to import. 
- Finally, run the import and follow its progress.
  
In addition to this core feature, the migration tool also allows users to view a list of all previous migrations and see the status of each one. This can be useful for keeping track of the progress of ongoing migrations or for checking on the status of migrations that have already been completed.

# Supported providers

Currently, the following providers are supported:
- [Vimeo](https://vimeo.com)
- [Dropbox](https://dropbox.com)

Other providers will be added in the future. If you want to add a new provider, you can open a pull request. See [Adding new providers](#adding-new-providers) for more information about how to add a new provider by yourself.

# Getting started

## Using the deployed version

If you simply want to migrate videos without the headache, you can use the deployed version of the tool at [https://import.api.video](https://import.api.video).

## Running the tool locally

To run the migration tool locally, you will need to first clone the project from GitHub. 

Once you have the project files on your local machine, you will need to install the npm dependencies by running the `npm install` command in the terminal. 

This will install all of the necessary packages that the project depends on. After the dependencies are installed, you can start the development server by running the `npm run dev` command. This will start the development server and allow you to access the project in your web browser at `http://localhost:3001`.

Some video providers requires environment variables to be set. You can set them in a `.env` file at the root of the project.

Required environment variables per provider:
| Provider | Environment variables | Description |
| --- | --- | --- |
| **Dropbox** | `NEXT_PUBLIC_DROPBOX_CLIENT_ID` | Dropbox application client ID |
|  | `NEXT_PUBLIC_DROPBOX_REDIRECT_URL` | Dropbox application redirect URL |
|  | `DROPBOX_CLIENT_SECRET` | Dropbox application client secret |

# Adding new providers

Available providers are listed in the `src/providers.tsx` file. 

You can add a new one by doing the following:
- adding a new entry in the `src/providers.tsx` file
- `src/components/<provider-name>Login.tsx`: a React component that will be displayed in the "Authentication" step of the tool. This component should handle the authentication process with the provider and send back the provider's access token thanks to the `onAccessTokenChanged` prop method.
- `src/service/providers/<provider-name>ProviderService.ts`: a service class that implements the [AbstractProviderService](src/service/providers/AbstractProviderService.ts) interface. This service will be used to perform the actions against the provider's API (not all the methods have to be implemented, it depends on the provider - by instance, some provider provide directly a link to a downloadable MP4 version of each video, so implementing the `generatePublicMp4()` is not required).