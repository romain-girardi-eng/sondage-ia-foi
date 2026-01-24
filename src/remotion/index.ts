import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);

export { RemotionRoot } from "./Root";
export { SurveyResultsVideo } from "./compositions/SurveyResultsVideo";
export { LandingVideo } from "./compositions/LandingVideo";
export * from "./components";
