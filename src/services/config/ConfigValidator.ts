import { NSL_CONFIG } from "../../types/type";
import { WebConfigError, ErrorCode } from "../../types/errors";

interface ValidationRule {
  field: keyof NSL_CONFIG;
  type: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
  validator?: (value: any) => boolean;
  message?: string;
}

export class ConfigValidator {
  private rules: ValidationRule[];

  constructor() {
    this.rules = [
      {
        field: "user",
        type: "object",
        required: true,
        validator: (obj: Object) => Object.keys(obj).length > 0,
        message: "The user is required and cannot be empty",
      },
      {
        field: "app",
        type: "object",
        required: true,
        validator: (value: Object) => Object.keys(value).length > 0,
        message: "The app must be a non-empty object",
      },
      {
        field: "appId",
        type: "string",
        validator: (value: string) => value.length > 0,
        message: "The appId must be a non-empty string",
      },
      {
        field: "console",
        type: "object",
        required: true,
        validator: (value: Object) => Object.keys(value).length > 0,
        message: "The console must be a non-empty object",
      },
    ];
  }

  public validate(config: unknown): NSL_CONFIG {
    if (!this.isObject(config)) {
      throw new WebConfigError(
        "The config must be an object",
        ErrorCode.VALIDATION_ERROR
      );
    }

    const validatedConfig: Partial<NSL_CONFIG> = {};
    const errors: string[] = [];

    for (const rule of this.rules) {
      try {
        this.validateField(config, rule, validatedConfig);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }
    }

    if (errors.length > 0) {
      throw new WebConfigError(
        "Validation of config failed",
        ErrorCode.VALIDATION_ERROR,
        { errors }
      );
    }
    // console.log("validatedConfig: ", validatedConfig);
    return validatedConfig as NSL_CONFIG;
  }

  private validateField(
    config: any,
    rule: ValidationRule,
    validatedConfig: Partial<NSL_CONFIG>
  ): void {
    const value = config[rule.field];

    if (value === undefined) {
      if (rule.required) {
        throw new Error(rule.message || `The field ${rule.field} is required`);
      }
      return;
    }

    if (typeof value !== rule.type) {
      throw new Error(`The field ${rule.field} must be of type ${rule.type}`);
    }

    if (rule.validator && !rule.validator(value)) {
      throw new Error(rule.message || `Validation failed for ${rule.field}`);
    }

    (validatedConfig as any)[rule.field] = value;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  public addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  public clearRules(): void {
    this.rules = [];
  }
}
