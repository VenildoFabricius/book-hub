
# BookHub - Personal Digital Library Manager

BookHub is a full-stack web application designed to help users manage their personal digital libraries. It allows users to log in, search for books, and organize their collections with ease. Users can track their reading progress, add comments to books, and customize their libraries. The project uses modern web technologies to deliver a secure, dynamic, and user-friendly experience.

## Features

- **User Authentication**
  - Secure login and registration with password encryption.
  - Session management using JSON Web Tokens (JWT).

- **Book Search**
  - Search for books using an external API.
  - Display book details, including title, author, publication year, and cover image.

- **Personal Library Management**
  - Add books to your personal library.
  - Mark books as read and leave comments on them.
  - View and edit comments for each book.

## Technologies Used

- **Frontend**
  - React.js with Next.js for server-side rendering.
  - FontAwesome for icons.
  - React Hot Toast for notifications.

- **Backend**
  - Node.js with custom server actions.
  - JSON-based file storage for user and book data.
  - `bcrypt` for password encryption.
  - `jose` library for JWT handling.

- **API Integration**
  - Google Books API for book search functionality.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VenildoFabricius/book-hub.git
   ```

2. Navigate to the project directory:
   ```bash
   cd book-hub
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     TOKEN=your_randomly_generated_secret
     ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

- Register for an account or log in with existing credentials.
- Use the search bar to find books and add them to your personal library.
- Manage your library by marking books as read and leaving comments.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.
