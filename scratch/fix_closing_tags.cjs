
const fs = require("fs");

const files = [
  "components/FichaControlNinoSano1Mes.tsx",
  "components/FichaControlNinoSano3Mes.tsx",
  "components/FichaControlNinoSano6Anos.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf-8");

  // Just replace the last 4 </div> with 3 </div>
  let lastClose = content.lastIndexOf("</div>");
  if (lastClose !== -1) {
      content = content.substring(0, lastClose) + content.substring(lastClose + 6);
  }
  
  fs.writeFileSync(file, content, "utf-8");
  console.log("Fixed " + file);
});

