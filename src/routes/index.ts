import { ct } from "./ct.routes";
import { auth } from "./auth.routes"
import { consent } from "./consent.routes";
import { patient } from "./patient.routes";
export class Routes {
  constructor(private app: any) {
    this.app = app;
  }

  setRoutes() {
    const prefix = "/api/v1";
    this.app.use(prefix + "/auth", auth);
    this.app.use(prefix + "/ct", ct);
    this.app.use(prefix + "/consent", consent);
    this.app.use(prefix + "/patient", patient);
  }
}
