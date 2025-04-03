document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".update-status-btn").forEach(button => {
      button.addEventListener("click", function() {
        const productId = this.getAttribute("data-product-id");
        const newStatus = document.getElementById(`status-${productId}`).value;
  
        fetch("/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: productId, status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            document.getElementById(`status-text-${productId}`).innerText = newStatus;
            alert("Status updated successfully!");
          } else {
            alert("Failed to update status");
          }
        })
        .catch(error => console.error("Error updating status:", error));
      });
    });
  });
  