import { testLogger } from "./glob";

testLogger.log("Hello World - test 2");
//Log with level

setInterval(() => {
  testLogger.log("Hello World - test 2", { level: "info" });
  testLogger.log("Hello World - test 2", { level: "error" });
  testLogger.log("Hello World - test 2", { level: "warn" });
  testLogger.log("Hello World - test 2", { level: "debug" });
  testLogger.log("Hello World - test 2", { level: "trace" });
}, 1000);
