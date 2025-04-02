import { NehonixSmartLogger, NSMLogger } from "../../logger";

const text = "Hello World";
// const logger = NehonixSmartLogger.getInstance()
const logger = NehonixSmartLogger.from("test_folder").import(
  "nehonix.config.json"
);

export { logger as testLogger };
