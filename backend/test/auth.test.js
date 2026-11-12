// These tests exercise routes that don't need a database connection.
const request = require("supertest");
const app = require("../server");

describe("Public pages", () => {
  it("GET / renders the home page", () => request(app).get("/").expect(200).expect(/Login to Marketplace/));
  it("GET /login renders the login form", () => request(app).get("/login").expect(200).expect(/action="\/login"/));
  it("GET /register renders the register form", () => request(app).get("/register").expect(200).expect(/Create Account/));
  it("old /auth/login URL redirects to /login", () => request(app).get("/auth/login").expect(302).expect("Location", "/login"));
  it("serves frontend static assets", () => request(app).get("/js/product-status.js").expect(200));
  it("serves product images from /uploads", () => request(app).get("/uploads/TV.jpg").expect(200));
  it("returns 404 for unknown pages", () => request(app).get("/no-such-page").expect(404));
});

describe("Protected pages redirect to /login when logged out", () => {
  const pages = ["/product-list", "/add-products", "/buyer/homepage", "/buyer/cart", "/buyer/checkout", "/buyer/manage", "/buyer/trackorder"];
  pages.forEach((page) => {
    it(`GET ${page}`, () => request(app).get(page).expect(302).expect("Location", "/login"));
  });

  it("POST /buyer/add-to-cart", () =>
    request(app).post("/buyer/add-to-cart").send({ productId: "x", quantity: 1 }).expect(302).expect("Location", "/login"));
});
