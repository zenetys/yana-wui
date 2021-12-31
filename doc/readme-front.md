# Network Analyse front end

This project is a front end part of **Network analyse core**

Before start this project you must clone and start the core project.
Follow the istructions [here](readme-back.md) to start your back end.

## Config

In ./public/config.json

Change the property `API_BASE_URL` to your back api url. Here as `http://127.0.0.1:4444`, the default start-up address.

## Install dependencies

`npm install`

## Start the project

`npm run serve`

Access the project by [http://localhost:8080](http://localhost:8080)

## Build for production

`npm run build`

## Features

### Home

![home](images/home.jpg "Home")

Here on the home page, you have all entities presented as cards. Every box equals to an entiy. Click on a card to open the entity's devices inventory.
Searchbar: to search quickly the entity you are looking for.

### Inventory home

#### Navbar

![navbar](images/navbar.jpg "Navbar")

* Search field
* Keep filter button
* Inventory mode checkbox
* Entity select checkbox
* Add to Bookmark button

#### Sidebar

![sidebar](images/sidebar.jpg "Sidebar")

* Menu
* Recent queries
* Bookmark queries

#### Timeline

![timeline](images/timeline.jpg "Timeline")

The timeline represents every date that a nscan is generated (based on your entities directories). Every point represent a database. On click on a point you will load a data that correspond to the point (date).

#### Device Listing

This view is the default one when you click on an entity.

Devices listining comes with some features: Link to another view, copy cell content, device type icon.

In the listing you may have different devices type: Host, Switch. When click on a link in the ip or name column you will redirected to the switch view or host view.

### Switch view

This is a specific view to represents switch information.

### Host view

This is a specific view to represents host information.