(() => {
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    if (form)
      form.addEventListener("submit", (e) => {
        console.log(e);
        const alertModalEl = document.getElementById("alertModal");
        const modal = new mdb.Modal(alertModalEl);
        modal.show();
      });
  });
})();
