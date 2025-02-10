// Function to show the selected page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach((page) => {
      page.classList.add('hidden');
    });
  
    // Show the selected page
    document.getElementById(pageId).classList.remove('hidden');
  }
  