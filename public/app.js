const END_POINT = "http://localhost:3000";

const isProduction = false;
const DATA = [
  {
    AppraisedValue: 300,
    Color: "blue",
    ID: "asset1",
    Owner: "Tomoko",
    Size: 5,
    docType: "asset",
  },
  {
    AppraisedValue: 400,
    Color: "red",
    ID: "asset2",
    Owner: "Brad",
    Size: 5,
    docType: "asset",
  },
  {
    AppraisedValue: 500,
    Color: "green",
    ID: "asset3",
    Owner: "Jin Soo",
    Size: 10,
    docType: "asset",
  },
  {
    AppraisedValue: 600,
    Color: "yellow",
    ID: "asset4",
    Owner: "Max",
    Size: 10,
    docType: "asset",
  },
  {
    AppraisedValue: 700,
    Color: "black",
    ID: "asset5",
    Owner: "Adriana",
    Size: 15,
    docType: "asset",
  },
  {
    AppraisedValue: 800,
    Color: "white",
    ID: "asset6",
    Owner: "Michel",
    Size: 15,
    docType: "asset",
  },
];

// Function Get smart contract
// document.getElementById("get_smart_contract").onclick = async function () {
//   try {
//     const response = await fetch(END_POINT + "/api/network", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const result = await response.json();

//     alert(result.message);
//   } catch (error) {
//     console.error("Get smart contract Error:", error);
//   }
// };

// Function Init ledger
// document.getElementById("init_ledger").onclick = async function () {
//   try {
//     const response = await fetch(END_POINT + "/api/ledger", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const result = await response.json();

//     alert(result.message);
//   } catch (error) {
//     console.error("Init ledger Error:", error);
//   }
// };

// // Function Get all assets
// document.getElementById("get_asset").onclick = async function () {
//   try {
//     if (isProduction) {
//       const response = await fetch(END_POINT + "/api/assets");

//       const assets = await response.json();
//       return assets;
//     } else {
//       console.log(DATA);
//       return DATA;
//     }
//   } catch (error) {
//     console.error("Get all assets Error:", error);
//   }
// };

// // Function Transfer asset
// document.getElementById("transfer_asset").onclick = async function () {
//   try {
//     const id = "asset3";
//     // Body này lấy từ form input nhé
//     const body = JSON.stringify({
//       owner: "Thai",
//     });
//     const response = await fetch(END_POINT + "/api/transfer/" + id, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body,
//     });

//     const result = await response.json();

//     alert(result.message);
//   } catch (error) {
//     console.error("Transfer assets Error:", error);
//   }
// };

// // Function Create a asset
// document.getElementById("create_asset").onclick = async function () {
//   try {
//     // Body này lấy từ form input nhé, trường size với appraisedValue để string
//     const body = JSON.stringify({
//       color: "red",
//       size: "23",
//       owner: "Thai_1",
//       appraisedValue: "30",
//     });
//     const response = await fetch(END_POINT + "/api/assets", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body,
//     });

//     const result = await response.json();

//     alert(result.message);
//   } catch (error) {
//     console.error("Create a asset Error:", error);
//   }
// };

// // Function Find one asset
// document.getElementById("read_asset_by_id").onclick = async function () {
//   try {
//     const id = "asset3";
//     const response = await fetch(END_POINT + "/api/assets/" + id);

//     const asset = await response.json();
//     console.log(asset);
//   } catch (error) {
//     console.error("Find one asset Error:", error);
//   }
// };

// Function Update asset
// document.getElementById("update_asset").onclick = async function () {
//   try {
//     const id = "asset3";
//     const body = JSON.stringify({
//       color: "red",
//       size: "20",
//       owner: "Thanh",
//       appraisedValue: "30",
//     });
//     const response = await fetch(END_POINT + "/api/assets/" + id, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body,
//     });

//     const result = await response.json();

//     alert(result.message);
//   } catch (error) {
//     console.error("Update asset Error:", error);
//   }
// };

document.addEventListener("DOMContentLoaded", () => {
  const DATA = [
    {
      AppraisedValue: 300,
      Color: "blue",
      ID: "asset1",
      Owner: "Tomoko",
      Size: 5,
      docType: "asset",
    },
    {
      AppraisedValue: 400,
      Color: "red",
      ID: "asset2",
      Owner: "Brad",
      Size: 5,
      docType: "asset",
    },
    {
      AppraisedValue: 500,
      Color: "green",
      ID: "asset3",
      Owner: "Jin Soo",
      Size: 10,
      docType: "asset",
    },
    {
      AppraisedValue: 600,
      Color: "yellow",
      ID: "asset4",
      Owner: "Max",
      Size: 10,
      docType: "asset",
    },
    {
      AppraisedValue: 700,
      Color: "black",
      ID: "asset5",
      Owner: "Adriana",
      Size: 15,
      docType: "asset",
    },
    {
      AppraisedValue: 800,
      Color: "white",
      ID: "asset6",
      Owner: "Michel",
      Size: 15,
      docType: "asset",
    },
  ];

  const tableBody = document.querySelector("#listOwner tbody");

  DATA.forEach((item) => {
    const row = document.createElement("tr");

    const appraisedValueCell = document.createElement("td");
    appraisedValueCell.textContent = item.AppraisedValue;
    row.appendChild(appraisedValueCell);

    const colorCell = document.createElement("td");
    colorCell.textContent = item.Color;
    row.appendChild(colorCell);

    const idCell = document.createElement("td");
    idCell.textContent = item.ID;
    row.appendChild(idCell);

    const ownerCell = document.createElement("td");
    ownerCell.textContent = item.Owner;
    row.appendChild(ownerCell);

    const sizeCell = document.createElement("td");
    sizeCell.textContent = item.Size;
    row.appendChild(sizeCell);

    tableBody.appendChild(row);
  });
});
