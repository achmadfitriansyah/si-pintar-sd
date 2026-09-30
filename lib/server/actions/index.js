import { authActions } from "./auth";
import { siswaActions } from "./siswa";
import { guruActions } from "./guru";
import { demoActions } from "./demo";

export const actions = { ...authActions, ...siswaActions, ...guruActions, ...demoActions };
