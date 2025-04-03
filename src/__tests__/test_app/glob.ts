import { NehonixSmartLogger, NSMLogger } from "../../logger";

const text = "Hello World";
// const logger = NehonixSmartLogger.getInstance()
const logger = NehonixSmartLogger.from("./test_app_folder").import(
  "nehonix-config-app with description (4).json"
);

export { logger as testLogger };
