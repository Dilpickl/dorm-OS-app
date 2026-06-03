export class ChecklistAuthError extends Error {
  constructor(message = "Invalid or missing save token") {
    super(message);
    this.name = "ChecklistAuthError";
  }
}
