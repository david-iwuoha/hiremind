const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");
const parsedData = document.getElementById("parsedData");

// Demo parsed resume data
const parsedResume = {
  Name: "John Doe",
  Email: "johndoe@example.com",
  Skills: "React, Node.js, Python, Team Leadership",
  Experience: "5 years in software development",
  Education: "B.Sc. Computer Science — University of Lagos",
  Summary: "Passionate developer experienced in building scalable applications."
};

// Click "browse"
uploadBox.addEventListener("click", () => {
  fileInput.click();
});

// Handle file input
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    uploadStatus.textContent = `Parsing "${file.name}" ...`;

    // Simulate parsing delay
    setTimeout(() => {
      uploadStatus.textContent = "Parsing complete ✅";
      displayParsedData(parsedResume);
    }, 1500);
  }
});

function displayParsedData(data) {
  parsedData.innerHTML = "";
  for (let key in data) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${key}:</strong> ${data[key]}`;
    parsedData.appendChild(li);
  }
}
