import { Composition } from "remotion";
import { SurveyResultsVideo, surveyResultsSchema } from "./compositions/SurveyResultsVideo";
import { LandingVideo } from "./compositions/LandingVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SurveyResults"
        component={SurveyResultsVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={surveyResultsSchema}
        defaultProps={{
          title: "IA & Vie Spirituelle",
          subtitle: "Vos Résultats Personnalisés",
          religiosityScore: 3.5,
          aiAdoptionScore: 4.2,
          profileName: "Explorateur Curieux",
          profileEmoji: "🔬",
        }}
      />
      <Composition
        id="LandingVideo"
        component={LandingVideo}
        durationInFrames={840}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
