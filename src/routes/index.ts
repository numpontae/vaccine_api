import { ct } from "./ct.routes";
import { registration } from "./registration.routes";
export class Routes {
  constructor(private app: any) {
    this.app = app;
  }

  setRoutes() {
    const prefix = "/api/v1";
    this.app.use(prefix + "/ct", ct);
    this.app.use(prefix + "/registration", registration);
  }
}
