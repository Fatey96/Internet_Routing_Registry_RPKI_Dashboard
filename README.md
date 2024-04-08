# RPKI ROA Monitor

The RPKI ROA Monitor is a cutting-edge web application designed to visualize and monitor the Resource Public Key Infrastructure (RPKI) Route Origin Authorizations (ROAs) across the United States. Leveraging the powerful D3.js for dynamic, interactive visualizations and integrating Leaflet for advanced mapping capabilities, this application provides an intuitive and comprehensive overview of RPKI validation statuses.

## Overview

Built on a Node.js backend with Express and utilizing MongoDB for data persistence, the application's frontend is crafted with D3.js for rendering interactive charts and maps. It supports dark and light modes, adhering to modern UI design principles such as glassmorphism and neumorphism, ensuring a visually appealing experience for users. The application is structured to facilitate easy navigation and interaction with the complex datasets of RPKI validation statuses.

## Features

- **Interactive Maps**: Utilize D3.js and Leaflet to display RPKI validation statuses across the US, with zoom and tooltip functionalities.
- **Dynamic Charts**: Pie and line charts provide detailed insights into RPKI validation statuses over time.
- **Search and Filter**: Explore data by ASN, Prefix, and State through an intuitive search interface.
- **Theme Toggle**: Switch between light and dark modes for user preference compatibility.
- **Responsive Design**: Ensures a seamless experience across various devices and screen sizes.

## Getting started

### Requirements

- Node.js
- MongoDB
- A modern web browser supporting JavaScript and SVG.

### Quickstart

1. Clone the repository to your local machine.
2. Copy `.env.example` to `.env` and configure the MongoDB URL and session secret.
3. Install dependencies with `npm install`.
4. Start the application using `npm start`.
5. Access the dashboard through `http://localhost:3000` in your web browser.

### License

Copyright (c) 2024.