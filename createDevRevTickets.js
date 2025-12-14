const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
require("dotenv").config();

const DEVREV_PAT = process.env.DEVREV_PAT;
const PROD_ID = process.env.PROD_ID;

const freshdeskToDevrevStage = {
  "Open": "Queued",
  "Pending": "Work In Progress",
  "Resolved": "Resolved",
  "Closed": "Resolved",
  "Waiting on Customer": "Awaiting Customer Response",
  "Waiting on Third Party": "Awaiting Development"
};

const stageIdMap = {
  "Queued": "don:core:dvrv-us-1:devo/1ZYIh2rrrr:custom_stage/16",
  "Work In Progress": "don:core:dvrv-us-1:devo/1ZYIh2rrrr:custom_stage/29",
  "Awaiting Development": "don:core:dvrv-us-1:devo/1ZYIh2rrrr:custom_stage/17",
  "In Development": "don:core:dvrv-us-1:devo/1ZYIh2rrrr:custom_stage/12",
  "Awaiting Customer Response": "don:core:dvrv-us-1:devo/1ZYIh2rrrr:custom_stage/4",
  "Resolved": "don:core:dvrv-us-1:devo/1ZYIh2rrrr:custom_stage/3",
};

function getStageId(status) {
  const mappedStage = freshdeskToDevrevStage[status] || "Queued";
  return stageIdMap[mappedStage];
}

async function createTicket(row) {

  try {
    const payload = {
      type: "ticket",
      title: row.Subject || "No title",
      body: row.Description || "No description",
      owned_by: ["don:identity:dvrv-us-1:devo/1ZYIh2rrrr:devu/1"],
      stage: { id: getStageId(row.Status) },
      applies_to_part: PROD_ID || undefined
    };


    const response = await axios.post(
      "https://api.devrev.ai/works.create",
      payload,
      {
        headers: {
          Authorization: `Bearer ${DEVREV_PAT}`,
          "Content-Type": "application/json",
        }
      }
    );

    console.log("✔ Ticket created:", response.data.work.id);

  } catch (err) {
    console.log("❌ Failed:", row.Subject);
    console.log(err.response?.data || err.message);
  }
}

function startImport() {
  console.log("Reading CSV File...");

  fs.createReadStream("freshdesk_tickets.csv")
    .pipe(csv())
    .on("data", (row) => createTicket(row))
    .on("end", () => console.log("🎉 Import Finished!"));
}

startImport();
