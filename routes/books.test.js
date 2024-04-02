const request = require("supertest");
const app = require("../app");
const Book = require("../models/book");
const db = require("../db");

process.env.NODE_ENV = "test";

let book = {
  isbn: "0123456789",
  amazon_url: "http://a.co/test",
  author: "John Doe",
  language: "russian",
  pages: 222,
  publisher: "Springboard",
  title: "How to be a good person",
  year: 2000,
};

beforeEach(async () => {
  await db.query("DELETE FROM books");
  await db.query(
    `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      book.isbn,
      book.amazon_url,
      book.author,
      book.language,
      book.pages,
      book.publisher,
      book.title,
      book.year,
    ]
  );
});

afterAll(async () => {
  await db.end();
});

describe("GET /books", () => {
  test("It should respond with an array of books", async () => {
    const response = await request(app).get("/books");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.books)).toBe(true);
  });
});

describe("GET /books/:isbn", () => {
  test("Gets item by isbn", async () => {
    const resp = await request(app).get(`/books/${book.isbn}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ book });
  });
  test("Responds with 404 for invalid item", async () => {
    const resp = await request(app).get(`/books/lalala`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("POST /books", () => {
  test("It should create a new book", async () => {
    const newBook = {
      isbn: "9876543210",
      amazon_url: "http://a.co/newbook",
      author: "New Book",
      language: "spanish",
      pages: 333,
      publisher: "New Springboard",
      title: "How to be a bad person",
      year: 2001,
    };
    const response = await request(app).post("/books").send(newBook);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ book: newBook });
  });

  test("It should return 400 if book data is invalid", async () => {
    const invalidBook = {
      isbn: "9876543210",
      amazon_url: "http://a.co/newbook",
      author: "New Book",
      language: "spanish",
      pages: 333,
      publisher: "New Springboard",
      title: "How to be a bad person",
    };
    const response = await request(app).post("/books").send(invalidBook);
    expect(response.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", () => {
  test("Update a single book", async () => {
    const res = await request(app).put(`/books/${book.isbn}`).send({
      isbn: "0123456789",
      amazon_url: "http://a.co/test",
      author: "John Doe",
      language: "russian",
      pages: 222,
      publisher: "Springboard",
      title: "Updated: How to be a good person",
      year: 2000,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      book: {
        isbn: "0123456789",
        amazon_url: "http://a.co/test",
        author: "John Doe",
        language: "russian",
        pages: 222,
        publisher: "Springboard",
        title: "Updated: How to be a good person",
        year: 2000,
      },
    });
  });

  test("Responds with 404 for invalid book", async () => {
    const res = await request(app).put(`/books/${book.isbn}`).send({
      isbn: "0123456789",
      amazon_url: true,
      author: "John Doe",
      language: "russian",
      pages: 222,
      publisher: "Springboard",
      title: "Updated: How to be a good person",
      year: 2000,
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /books/:isbn", () => {
  test("Delete a single book", async () => {
    const res = await request(app).delete(`/books/${book.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
});
