
const fs = require("fs");

const files = [
  "components/FichaControlNinoSano1Mes.tsx",
  "components/FichaControlNinoSano3Mes.tsx",
  "components/FichaControlNinoSano6Anos.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf-8");
  const exportStr = "export default " + file.split("/")[1].replace(".tsx", "") + ";";
  const index = content.indexOf(exportStr);
  if (index !== -1) {
    // Check if there is another exportStr
    const lastIndex = content.lastIndexOf(exportStr);
    if (lastIndex !== index) {
      // It duplicated the file! Keep only the LAST valid one?
      // Wait, let us check which one has the valid layout.
      // Usually, if it duplicated, one part is correct and the other is messed up.
      // Let us just extract the last one.
      content = content.substring(lastIndex - 100000); // Wait, this is risky.
    }
    
    // Instead of guessing, let us just slice at the FIRST exportStr.
    let sliced = content.substring(0, index + exportStr.length) + "\n";
    fs.writeFileSync(file, sliced, "utf-8");
    console.log("Sliced " + file);
  }
});

