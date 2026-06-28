import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Read configuration from the generated file or environment.
// In AI Studio, a JSON file is often used or env vars.
// Since the environment sets this up, I'll fetch the config from the generated firebase-applet-config.json
import config from "../../firebase-applet-config.json";

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);
