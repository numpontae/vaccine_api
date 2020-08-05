import { ct } from "./ct.routes";
import { register } from "./register.routes"
import { auth } from "./auth.routes"
export class Routes {
  constructor(private app: any) {
    this.app = app;
  }

  setRoutes() {
    const prefix = "/api/v1";
    this.app.use(prefix + "/ct", ct);
    this.app.use(prefix + "/register", register);
    this.app.use(prefix + "/auth", auth);
  }
}
