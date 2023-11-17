const columns = [
  { label: "Ticket", field: "ticket" },
  { label: "NIK", field: "nik" },
  { label: "Name", field: "name" },
  { label: "Date", field: "date" },
  { label: "Status", field: "status" },
  { label: "Action", field: "action" },
];
const asyncTable = new mdb.Datatable(document.getElementById("datatable"), { columns }, { loading: true });

const detailColumns = [
  {
    label: "Code",
    field: "id",
    width: 0,
  },
  { label: "Name", field: "name" },
  { label: "Location", field: "location", width: 0 },
  { label: "Detail", field: "detail" },
];
const detailTable = new mdb.Datatable(
  document.getElementById("datatable_detail"),
  { columns: detailColumns },
  { loading: false, pagination: false, sm: true, striped: false, bordered: false }
);

(async () => {
  const response = await Siduru.get("transfers");
  const data = await response.json();
  asyncTable.update(
    {
      rows: data.result.map((prop) => ({
        ...prop,
        nik: prop._nik === undefined ? prop.nik.toString().toUpperCase() : prop._nik.toString().toUpperCase(),
        name: prop._name === undefined ? prop.name.toString().toUpperCase() : prop._name.toString().toUpperCase(),
        email: prop._email === undefined ? prop.email.toString().toUpperCase() : prop._email.toString().toUpperCase(),
        date: new Date(prop._date).toLocaleString("id-ID"),
        status: prop.status === undefined ? false : true,
        action: `
        <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
          <button data-button-id="${prop.id}" type="button" class="btn btn-primary"><i class="fa-solid pe-none fa-eye"></i></button>
          <button data-button-update="${prop.id}" type="button" class="btn btn-secondary"><i class="fa-solid pe-none fa-check"></i></button>
          <button data-button-delete="${prop.id}" type="button" class="btn btn-danger"><i class="fa-solid pe-none fa-trash"></i></button>
        </div>
        `,
      })),
    },
    { loading: false }
  );
  document.querySelectorAll("[data-button-id]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const response = await Siduru.getById("transfers", e.target.dataset.buttonId);
      const { result } = await response.json();
      const array = result.list.split(",");
      const list = [];
      const asset = data.result.filter((prop) => {
        return prop.id.toString() === e.target.dataset.buttonId.toString();
      });
      const ticket = document.querySelectorAll("#ticket");
      for (let i = 0; i < ticket.length; i++) {
        const element = ticket[i];
        try {
          switch (Object.keys(element.dataset)[0]) {
            case "_date":
              element.textContent = new Date(asset[0][Object.keys(element.dataset)[0]]).toLocaleString("id-ID").toString().toUpperCase();
              break;

            case "update":
              element.textContent = new Date(asset[0][Object.keys(element.dataset)[0]]).toLocaleString("id-ID").toString().toUpperCase();
              break;

            default:
              element.textContent = asset[0][Object.keys(element.dataset)[0]].toString().toUpperCase();
              break;
          }
        } catch (error) {
          console.log(`Ini ${error}`);
        }
      }
      for (let index = 0; index < array.length; index++) {
        const response = await Siduru.getById("assets", array[index]);
        const { result } = await response.json();
        list.push(result);
      }
      //   console.log(list);
      detailTable.update({ rows: list }, { loading: false });
      // document.querySelector("#date-now").textContent = new Date().toLocaleString("id-ID");
    });
  });
  // Update
  document.querySelectorAll("[data-button-update]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const response = await Siduru.getById("transfers", e.target.dataset.buttonUpdate);
      const { result } = await response.json();
      const array = result.list.split(",");
      const list = [];
      const asset = data.result.filter((prop) => {
        return prop.id.toString() === e.target.dataset.buttonUpdate.toString();
      });
      for (let index = 0; index < array.length; index++) {
        const response = await Siduru.getById("assets", array[index]);
        const { result } = await response.json();
        result.status = true;
        list.push(result);
      }
      asset[0].assets = list;
      asset[0].status = true;
      asset[0]._nik = asset[0]._nik === undefined ? asset[0].nik : asset[0]._nik;
      asset[0]._name = asset[0]._name === undefined ? asset[0].name : asset[0]._name;
      asset[0]._email = asset[0]._email === undefined ? asset[0].email : asset[0]._nik;

      const update = await Siduru.update("transfers", asset[0], asset[0].id);
      const payload = await update.json();
      console.log(payload);
    });
  });
  // Delete
  document.querySelectorAll("[data-button-delete]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const update = await Siduru.delete("transfers", e.target.dataset.buttonDelete);
      const payload = await update.json();
      console.log(payload);
    });
  });
  console.log("hide");
})();

document.getElementById("datatable_detail").addEventListener("render.mdb.datatable", (e) => {
  document.querySelectorAll("[data-mdb-field]").forEach((e) => {
    e.classList.add("small");
  });
});