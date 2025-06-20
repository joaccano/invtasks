import * as admin from "firebase-admin";
import * as serviceAccount from "../vitaltrack-app-firebase-adminsdk-kxrkr-b80e71e71e.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
