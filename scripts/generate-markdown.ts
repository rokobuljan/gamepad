import fs from "fs";
import { ChildChild, JSDocs, JSDocsChild } from "./JsdocsTypes";

function generateMarkdownDocs(jsonData: JSDocs) {
    let markdown = `# ${jsonData.name}\n\n`;

    // Function to generate properties table
    function generatePropertiesTable(properties: ChildChild[]) {
        if (!properties || properties.length === 0) return "";

        let table =
            "| Property | Type | Description |\n|----------|------|-------------|\n";
        properties
            .filter((prop) => prop.flags?.isInherited)
            .forEach((prop) => {
                table += `| \`${prop.name}\` | \`${prop.variant}\` | ${
                    prop.comment?.summary?.[0]?.text || "No description"
                } |\n`;
            });
        return table + "\n";
    }

    // Function to generate methods table
    function generateMethodsTable(methods) {
        if (!methods || methods.length === 0) return "";

        let table =
            "| Method | Input | Return | Description |\n|--------|-------|--------|-------------|\n";
        methods
            .filter((method) => method.flags?.isInherited)
            .forEach((method) => {
                const signature = method.signatures?.[0];
                table += `| \`${method.name}\` | ${
                    signature?.parameters?.[0]?.type?.name || "-"
                } | \`${signature?.type?.name || "void"}\` | ${
                    method.comment?.summary?.[0]?.text || "No description"
                } |\n`;
            });
        return table + "\n";
    }

    // Function to generate constructor table
    function generateConstructorTable(constructor) {
        if (!constructor) return "";

        let table =
            "| Parameter | Type | Description |\n|-----------|------|-------------|\n";
        constructor[0].parameters.forEach((param) => {
            table += `| \`${param.name}\` | \`${param.type.name}\` | No description |\n`;
        });
        return table;
    }

    // Find the specific class (Button in this case)
    const buttonClass = jsonData.children.find(
        (child) => child.name === "Button"
    );

    if (buttonClass) {
        markdown += `## ${buttonClass.name} Class\n\n`;

        // Inherited Properties
        markdown += "### Inherited Properties\n\n";
        markdown += generatePropertiesTable(buttonClass.children);

        // Inherited Methods
        markdown += "### Inherited Methods\n\n";
        markdown += generateMethodsTable(buttonClass.children);

        // Constructor
        markdown += "### Constructor\n\n";
        const constructorMethod = buttonClass.children.find(
            (child) => child.name === "constructor"
        );
        // markdown += generateConstructorTable(constructorMethod.signatures);
    }

    return markdown;
}

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync("./docs.json", "utf8"));

// Generate markdown
const markdownContent = generateMarkdownDocs(jsonData);

// Write to file
fs.writeFileSync("gamepad-docs.md", markdownContent);

console.log("Markdown documentation generated successfully!");
