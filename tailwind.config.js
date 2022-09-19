/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
      minWidth: {
        "75%": "75%",
        "90%": "90%",
        "95%": "95%",
      },
      minHeight: {
        "98vh": "98vh",
        "90%": "90%",
      },
      extend: {},
    },
    plugins: [require("@tailwindcss/forms")],
  };