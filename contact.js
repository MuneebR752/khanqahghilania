import axios from "axios";
function formSubmit() {
  const form = document.querySelector("#contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect form data using FormData API
    const formData = new FormData(form);

    // Create an object with the form data
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    console.log(data);
    // Make an axios.post request with the form data
    axios
      .post("localhost:5000/contact", data)
      .then((response) => {
        console.log(response.data);
        // do something with the response data
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  });
}
