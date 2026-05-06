import axios from "axios";

export const authService = {
  async login(payload) {
    const response = await axios.post("/api/auth/login", payload);
    return response.data;
  },
};
