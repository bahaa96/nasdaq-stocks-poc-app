# Getting Started

first of all you need to clone this repo:

    git clone git@github.com:bahaa96/nasdaq-stocks-poc-app.git

now head to the project directory

    cd nasdaq-stocks-poc-app

Install External Dependencies

    npm install --legacy-peer-deps

now the app is ready to run using the following command

    npm run dev

run unit tests:

    npm test


</br>
</br>

### Architecture Breakdown

For this project I used mainly Clean Architeture with some taste of hexagonal architecture to make code unite more testable

This is a draw of the main Skeleton:

![enter image description here](https://i.ibb.co/R6vWP1p/Screenshot-2024-07-28-at-11-43-03-AM.png)

this is a draw of how layers communicate:

![enter image description here](https://i.ibb.co/zrqw4N8/Screenshot-2024-07-28-at-11-44-29-AM.png)

and here's a details description of each layer:

**Domain/Domain models**: This layer contain interfaces that represent domain entities, and any domain specific logic in the form of pure functions

- Each domain entity in its own file.
- Index file that re-exports all the entities.
- Files outside this layer can only import entities from the index file.
- Any layer can import from this layer, except lib.
- This layer cannot import anything from other layers, as domain specific entities and logic should not depend on anything that’s not domain specific.

**lib**: This layer is for any domain agnostic logic. Think of it like this: it’s like a collection of packages that can be used in any application regardless of the business logic.

- Each function has its own file.
- No index file. As different functions in this layer are independent to each other, it’s meaningless to make an entry point to everything. Other layers can import from this layer through the direct file.
- Any layer can import from this layer.
- This layer cannot import from any other layer, as it contain domain agnostic functions, these functions cannot depend on any domain specific logic or any business logic defined in our app.

**Network**: This layer is for any communication over network, regardless of protocol. If caching, retry, or offline support logic is to be added, it should be added to this layer

- A single file can contain multiple function related to the same entity (the name of the file should be the name of the entity, plural, i.e users.ts).
- Index file that re-exports all the functions from all files.
- Only the UI layer can import from this layer.
- This layer can import from any other layer except the UI layer.

**UI**: Since our app’s logic is either to display data, or get data from the user and send it to the back-end, this layer is basically our business logic and UI layers merged together. And since the global store is tightly coupled with our UI layer - for reactivity - it’s also part of it.

- Our “features” are our pages. Although from a back-end point of view - or even from the user’s - that something like login and forgot password are different use-cases, if we have both scenarios in the same page, then from our POV they’re a single feature.
- Re-usability is prohibited between pages, and each page cannot import anything from other page. For any common logic or UI across pages, they should be duplicated. The rationale behind this is that 1- Multiple parts looking visually identical doesn’t mean they behavior is identical, and 2- Even if the behavior is identical now that doesn’t mean that any future changes should be implemented in all of the places. Duplicating the code give us the freedom of making any requested change to any part, without worrying about the impact of these changes in other places where the change is not required.
- The global store only has getters and setters. It should use any network functions, or contain any business logic, we’ll do that in the pages.
- Every page’s internal structure is up to the implementer. Make as many internal folders and files as necessary as long as they are required, internal, and adheres to our other standards.

> Final note: this is the architecture not the file structure. Other folders can exist for any purpose that is not covered by the architecture. Any integration with 3rd-party services - tracking, logging, etc. - is done via adapters that hide the internal details and just expose functions named after the functionality they provide.
