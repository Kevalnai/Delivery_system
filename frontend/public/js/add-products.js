// public/js/add-products.js

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("product-form");
    if (!form) {
      console.error("❌ Could not find the form with ID 'product-form'");
      return;
    }
  
    console.log("✅ Add Product script loaded!");
  
    // ✅ Submit Handler
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Stop default form submission
  
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
  
      const formData = new FormData(form);
  
      // ✅ Debug: Check if file is selected
      const fileInput = document.getElementById("image");
      const selectedFile = fileInput.files[0];
      if (!selectedFile) {
        alert("⚠️ Please select an image before submitting.");
        submitButton.disabled = false;
        submitButton.textContent = "Add Product";
        return;
      } else {
        console.log("📸 File selected:", selectedFile.name);
      }
  
      // ✅ Handle checkboxes (condition[])
      formData.delete("condition");
      const checkedConditions = document.querySelectorAll('input[name="condition[]"]:checked');
      if (checkedConditions.length === 0) {
        alert("⚠️ Please select at least one condition.");
        submitButton.disabled = false;
        submitButton.textContent = "Add Product";
        return;
      }
      checkedConditions.forEach(checkbox => {
        formData.append("condition[]", checkbox.value);
      });
  
      // ✅ Debug: Log all form fields before sending
      console.log("📦 FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
  
      // ✅ Submit using fetch
      fetch("/add-products", {
        method: "POST",
        body: formData,
      })
        .then(response => {
          if (!response.ok) throw new Error("Server error");
          return response.json();
        })
        .then(data => {
          console.log("✅ Product added:", data);
  
          const alertDiv = document.createElement("div");
          alertDiv.className = "alert alert-success mt-3";
          alertDiv.textContent = "✅ Product added successfully!";
          document.body.prepend(alertDiv);
  
          setTimeout(() => {
            alertDiv.remove();
            window.location.href = "/product-list";
          }, 2000);
        })
        .catch(error => {
          console.error("❌ Error adding product:", error);
  
          const alertDiv = document.createElement("div");
          alertDiv.className = "alert alert-danger mt-3";
          alertDiv.textContent = "❌ Something went wrong. Please try again.";
          document.body.prepend(alertDiv);
  
          setTimeout(() => alertDiv.remove(), 5000);
        })
        .finally(() => {
          submitButton.disabled = false;
          submitButton.textContent = "Add Product";
        });
    });
  });