# Web Photo Resizer

A simple, client-side web application for bulk resizing of photos. All processing is done in your browser, ensuring your photos remain private.

## Features

-   Bulk resize multiple images at once.
-   Set custom maximum width and height for resizing.
-   Adjust JPEG quality to control file size.
-   All processing is done client-side. No images are uploaded to a server.
-   Resized images are zipped for easy download.
-   Live progress tracking.

## Live Demo

You can try the application live on GitHub Pages: [http://warrencountypublicschools.github.io/web-photo-resizer/](http://warrencountypublicschools.github.io/web-photo-resizer/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and npm installed on your machine.

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/Dylan-Howard/web-photo-resizer.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd web-photo-resizer
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

## Usage

To run the application locally, you'll need a simple web server to serve the files. Many tools can do this, for example `npx serve`.

1.  Build the project:
    ```sh
    npm run build
    ```
2.  Serve the `build` directory:
    ```sh
    npx serve build
    ```
3.  Open your browser and navigate to the local server address provided by `serve`.

## Building

To build the project, run the following command. This will compile the TypeScript code and copy the necessary HTML files to the `build` directory.

```sh
npm run build
```

## Deployment

This project is automatically deployed to GitHub Pages whenever changes are pushed to the `master` branch. The deployment workflow is defined in `.github/workflows/deploy.yml`.
