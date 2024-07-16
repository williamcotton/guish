import { browser, $, $$ } from "@wdio/globals";
import "@testing-library/jest-dom";

describe("Electron Testing", () => {
  it("should create echo and sed modules, update sed module, and verify changes", async () => {
    // Wait for the app to load
    await browser.pause(50);

    // Find the command input and type the command
    const commandInput = await $('textarea[placeholder="Enter command..."]');
    await commandInput.waitForExist({ timeout: 10000 });
    await commandInput.setValue("echo 123 | sed s/1/one/g");

    // Find and click the execute button
    const executeButton = await $("button=Execute");
    await executeButton.waitForClickable({ timeout: 5000 });
    await executeButton.click();

    // Wait for the command to execute and modules to be created
    await browser.pause(20);

    // Find all input elements
    const inputElements = await $$("input");
    console.log(`Number of input elements: ${inputElements.length}`);

    let sedInput;
    for (let i = 0; i < inputElements.length; i++) {
      const inputValue = await inputElements[i].getValue();
      console.log(`Input ${i + 1} value:`, inputValue);
      if (inputValue === "123") {
        console.log("Found echo input");
        expect(inputValue).toBe("123");
      } else if (inputValue === "s/1/one/g") {
        console.log("Found sed input");
        expect(inputValue).toBe("s/1/one/g");
        sedInput = inputElements[i];
      }
    }

    // Verify the initial output
    let output = await $(".bg-black.text-green-400 pre");
    await output.waitForExist({ timeout: 10000 });
    let outputText = await output.getText();
    console.log("Initial output text:", outputText);
    expect(outputText).toBe("one23");

    // Update the sed module
    if (sedInput) {
      await sedInput.setValue("s/2/two/g");
      await browser.pause(20);
    } else {
      throw new Error("Sed input not found");
    }

    // Verify that the prompt interface was updated
    const updatedCommandInput = await commandInput.getValue();
    console.log("Updated command input:", updatedCommandInput);
    expect(updatedCommandInput).toBe("echo 123 | sed s/2/two/g");

    // Click execute again
    await executeButton.click();
    await browser.pause(20);

    // Verify the updated output
    output = await $(".bg-black.text-green-400 pre");
    await output.waitForExist({ timeout: 10000 });
    outputText = await output.getText();
    console.log("Updated output text:", outputText);
    expect(outputText).toBe("1two3");
  });
});
