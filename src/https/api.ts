import axios from "axios";
export const api = axios.create({
  baseURL: "https://uat-hm-api.tech42.in/api/v1/",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer " +
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1widXNlcklkXCI6XCJjbHo4YndsejkwMDJ3OWN4b2N4cXprd2lrXCJ9IiwiaWF0IjoxNzIyMzM4NTcxLCJleHAiOjE3MjIzODE3NzF9.JF5w9hTKrYYZcq-yCrRQnCTFSsZxoVzpQsBXaT2X0EE",
  },
});
