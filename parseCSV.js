require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");

const inputFile = "freshdesk_tickets.csv";
const outputFile = "tickets.json";

const results = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    results.push({
      external_id: row["Ticket ID"],
      title: row["Subject"],
      description: row["Description"],
      status: row["Status"],
      type: row["Type"],
      priority: row["Priority"],
      created_time: row["Created time"],
      reporter: {
        name: row["Full name"],
        email: row["Email"]
      }
    });
  })
  .on("end", () => {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`CSV → JSON created: ${outputFile}`);
  });
