import { Command } from "../../hooks/useWebSocket";
import { CommandData, commandType, UserAction } from "../../types/app";

interface CommandActionsProps {
  sendCommand: (command: Command) => void;
  onConsoleToggle: (enabled: boolean) => void;
  onEncryptionToggle: (enabled: boolean) => void;
}

type Commands = {
  consoleEnabled: boolean;
  encryptionEnabled: boolean;
};

class CMD {
  private static instance: CMD;
  public userActions: UserAction[] = [];
  public cmd: Commands;
  private sendCommand: (command: Command) => void;

  private onConsoleToggle: (enabled: boolean) => void;
  private onEncryptionToggle: (enabled: boolean) => void;

  constructor(props: CommandActionsProps) {
    this.cmd = {
      consoleEnabled: true,
      encryptionEnabled: false,
    };
    this.sendCommand = props.sendCommand;
    this.onConsoleToggle = props.onConsoleToggle;
    this.onEncryptionToggle = props.onEncryptionToggle;
  }
  static createActionInstance(props: CommandActionsProps) {
    if (!CMD.instance) {
      CMD.instance = new CMD(props);
    }
    return CMD.instance;
  }
  public static toggleActions(type: commandType) {
    switch (type) {
      case "console_toggle":
        CMD.instance.handleConsoleToggle();
        break;
      case "encryption_toggle":
        CMD.instance.handleEncryptionToggle();
    }
  }

  public handleConsoleToggle = () => {
    const newState = !this.cmd.consoleEnabled;
    this.cmd.consoleEnabled = newState;
    this.sendCommand({
      type: "console_toggle",
      data: {
        enabled: newState,
      },
    });
  };

  public handleEncryptionToggle = () => {
    const newState = !this.cmd.encryptionEnabled;
    this.cmd.encryptionEnabled = newState;
    this.onEncryptionToggle(newState);
    this.sendCommand({
      type: "encryption_toggle",
      data: {
        enabled: newState,
      },
    });
  };

  public set setUserActions(actions: UserAction[]) {
    this.userActions = actions;
  }
}
export { CMD as ActionsCommand };
