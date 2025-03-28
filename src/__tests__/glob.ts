import { nehonixLogger } from "../logger";

const text = "Hello World";

//Simple log
nehonixLogger(text);

//Log with level
nehonixLogger("info", text);

//Log with level and message
nehonixLogger("error", text);

//Log with level and message and object
nehonixLogger("warn", { text, number: 1 });

//Log with level and message and array
nehonixLogger("debug", [text, text]);

//Log with level and message and error
nehonixLogger("error", new Error("Error message"));

//Log with level and message and error and object
nehonixLogger("warn", { text, number: 1 }, new Error("Error message"));

//logs with options
nehonixLogger(
  {
    logMode: {
      name: "test",
      enable: true,
    },
  },
  text
);
