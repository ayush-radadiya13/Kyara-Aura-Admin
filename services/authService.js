export const authService = {
  async login(payload) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      };
    }

    return data;
  },
};
